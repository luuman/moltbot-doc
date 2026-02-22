---
title: Lobster
summary: "Typed workflow runtime for Moltbot with resumable approval gates."
description: Typed workflow runtime for Moltbot — composable pipelines with approval gates.
read_when:
  - You want deterministic multi-step workflows with explicit approvals
  - You need to resume a workflow without re-running earlier steps
---

# Lobster

Lobster 是一个工作流 shell，让 Moltbot 将多步工具序列作为单一、确定性的操作运行，具有显式审批检查点。

## Hook

您的助手可以构建管理自身的工具。要求一个工作流，30 分钟后您就有了一个 CLI 加上作为一次调用运行的管道。Lobster 是缺失的一环：确定性管道、显式审批和可恢复状态。

## 为什么

今天，复杂的工作流需要许多来回的工具调用。每次调用都会消耗令牌，LLM 必须协调每一步。Lobster 将这种协调移到了一个类型化的运行时中：

- **一次调用代替多次**: Moltbot 运行一个 Lobster 工具调用并获得结构化结果。
- **内置审批**: 副作用（发送邮件、发布评论）会使工作流暂停，直到明确批准。
- **可恢复**: 暂停的工作流返回一个令牌；批准并恢复而无需重新运行所有内容。

## 为什么是 DSL 而不是普通程序？

Lobster 故意做得很小。目标不是"一种新语言"，而是可预测的、AI 友好的管道规范，具有一级审批和恢复令牌。

- **内置批准/恢复**: 普通程序可以提示人类，但它不能*暂停和恢复*并带有持久令牌，除非您自己发明那个运行时。
- **确定性 + 可审计性**: 管道是数据，所以它们易于记录、差异比较、重播和审查。
- **AI 的受限表面**: 小语法 + JSON 管道减少了"创造性"代码路径，使验证变得现实。
- **内置安全策略**: 超时、输出上限、沙箱检查和白名单由运行时强制执行，而不是每个脚本。
- **仍可编程**: 每个步骤都可以调用任何 CLI 或脚本。如果您想要 JS/TS，请从代码生成 `.lobster` 文件。

## 工作原理

Moltbot 在**工具模式**下启动本地 `lobster` CLI 并从 stdout 解析 JSON 包封。
如果管道暂停等待审批，工具返回一个 `resumeToken`，以便您稍后继续。

## 模式：小型 CLI + JSON 管道 + 审批

构建说 JSON 的小型命令，然后将它们链接到单个 Lobster 调用中。（下面的示例命令名称 — 替换为您自己的。）

```bash
inbox list --json
inbox categorize --json
inbox apply --json
```

```json
{
  "action": "run",
  "pipeline": "exec --json --shell 'inbox list --json' | exec --stdin json --shell 'inbox categorize --json' | exec --stdin json --shell 'inbox apply --json' | approve --preview-from-stdin --limit 5 --prompt 'Apply changes?'",
  "timeoutMs": 30000
}
```

如果管道请求审批，请使用令牌恢复：

```json
{
  "action": "resume",
  "token": "<resumeToken>",
  "approve": true
}
```

AI 触发工作流；Lobster 执行步骤。审批闸门保持副作用明确和可审计。

示例：将输入项映射到工具调用：

```bash
gog.gmail.search --query 'newer_than:1d' \
  | clawd.invoke --tool message --action send --each --item-key message --args-json '{"provider":"telegram","to":"..."}'
```

## 仅 JSON LLM 步骤 (llm-task)

对于需要**结构化 LLM 步骤**的工作流，启用可选的
`llm-task` 插件工具并从 Lobster 调用它。这保持了工作流
的确定性，同时仍让您使用模型进行分类/摘要/起草。

启用工具：

```json
{
  "plugins": {
    "entries": {
      "llm-task": { "enabled": true }
    }
  },
  "agents": {
    "list": [
      {
        "id": "main",
        "tools": { "allow": ["llm-task"] }
      }
    ]
  }
}
```

在管道中使用它：

```lobster
clawd.invoke --tool llm-task --action json --args-json '{
  "prompt": "Given the input email, return intent and draft.",
  "input": { "subject": "Hello", "body": "Can you help?" },
  "schema": {
    "type": "object",
    "properties": {
      "intent": { "type": "string" },
      "draft": { "type": "string" }
    },
    "required": ["intent", "draft"],
    "additionalProperties": false
  }
}'
```

详情和配置选项请参见 [LLM Task](/tools/llm-task)。

## 工作流文件 (.lobster)

Lobster 可以运行带有 `name`、`args`、`steps`、`env`、`condition` 和 `approval` 字段的 YAML/JSON 工作流文件。在 Moltbot 工具调用中，将 `pipeline` 设置为文件路径。

```yaml
name: inbox-triage
args:
  tag:
    default: "family"
steps:
  - id: collect
    command: inbox list --json
  - id: categorize
    command: inbox categorize --json
    stdin: $collect.stdout
  - id: approve
    command: inbox apply --approve
    stdin: $categorize.stdout
    approval: required
  - id: execute
    command: inbox apply --execute
    stdin: $categorize.stdout
    condition: $approve.approved
```

注意事项：

- `stdin: $step.stdout` 和 `stdin: $step.json` 传递先前步骤的输出。
- `condition` (或 `when`) 可以在 `$step.approved` 上限制步骤。

## 安装 Lobster

在运行 Moltbot 网关的**同一主机**上安装 Lobster CLI（参见 [Lobster 仓库](https://github.com/moltbot/lobster)），并确保 `lobster` 在 `PATH` 中。
如果您想使用自定义二进制文件位置，请在工具调用中传递**绝对**的 `lobsterPath`。

## 启用工具

Lobster 是一个**可选**的插件工具（默认未启用）。

推荐（累加，安全）：

```json
{
  "tools": {
    "alsoAllow": ["lobster"]
  }
}
```

或按代理：

```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "tools": {
          "alsoAllow": ["lobster"]
        }
      }
    ]
  }
}
```

除非您打算在限制性白名单模式下运行，否则避免使用 `tools.allow: ["lobster"]`。

注意：可选插件的白名单是可选的。如果您的白名单只命名了
插件工具（如 `lobster`），Moltbot 保持核心工具启用。要限制核心
工具，请在白名单中包含您想要的核心工具或组。

## 示例：邮件分类

没有 Lobster：
```
用户："检查我的邮件并起草回复"
→ clawd 调用 gmail.list
→ LLM 摘要
→ 用户："起草对 #2 和 #5 的回复"
→ LLM 起草
→ 用户："发送 #2"
→ clawd 调用 gmail.send
（每天重复，没有分类记忆）
```

有了 Lobster：
```json
{
  "action": "run",
  "pipeline": "email.triage --limit 20",
  "timeoutMs": 30000
}
```

返回一个 JSON 包封（截断）：
```json
{
  "ok": true,
  "status": "needs_approval",
  "output": [{ "summary": "5 需要回复，2 需要操作" }],
  "requiresApproval": {
    "type": "approval_request",
    "prompt": "发送 2 个草稿回复？",
    "items": [],
    "resumeToken": "..."
  }
}
```

用户批准 → 恢复：
```json
{
  "action": "resume",
  "token": "<resumeToken>",
  "approve": true
}
```

一个工作流。确定性。安全。

## 工具参数

### `run`

在工具模式下运行管道。

```json
{
  "action": "run",
  "pipeline": "gog.gmail.search --query 'newer_than:1d' | email.triage",
  "cwd": "/path/to/workspace",
  "timeoutMs": 30000,
  "maxStdoutBytes": 512000
}
```

使用参数运行工作流文件：

```json
{
  "action": "run",
  "pipeline": "/path/to/inbox-triage.lobster",
  "argsJson": "{\"tag\":\"family\"}"
}
```

### `resume`

在审批后继续暂停的工作流。

```json
{
  "action": "resume",
  "token": "<resumeToken>",
  "approve": true
}
```

### 可选输入

- `lobsterPath`: Lobster 二进制文件的绝对路径（省略以使用 `PATH`）。
- `cwd`: 管道的工作目录（默认为当前进程工作目录）。
- `timeoutMs`: 如果子进程超过此持续时间则终止（默认：20000）。
- `maxStdoutBytes`: 如果 stdout 超过此大小则终止子进程（默认：512000）。
- `argsJson`: 传递给 `lobster run --args-json` 的 JSON 字符串（仅工作流文件）。

## 输出包封

Lobster 返回一个 JSON 包封，具有三种状态之一：

- `ok` → 成功完成
- `needs_approval` → 暂停；`requiresApproval.resumeToken` 需要恢复
- `cancelled` → 明确拒绝或取消

该工具在 `content`（漂亮 JSON）和 `details`（原始对象）中显示包封。

## 审批

如果存在 `requiresApproval`，请检查提示并决定：

- `approve: true` → 恢复并继续副作用
- `approve: false` → 取消并完成工作流

使用 `approve --preview-from-stdin --limit N` 为审批请求附加 JSON 预览，无需自定义 jq/heredoc 粘合。恢复令牌现在是紧凑的：Lobster 在其状态目录下存储工作流恢复状态并返回一个小令牌键。

## OpenProse

OpenProse 与 Lobster 配合得很好：使用 `/prose` 协调多代理准备，然后运行 Lobster 管道以获得确定性审批。如果 Prose 程序需要 Lobster，请通过 `tools.subagents.tools` 为子代理允许 `lobster` 工具。参见 [OpenProse](/prose)。

## 安全

- **仅本地子进程** — 插件本身没有网络调用。
- **无秘密** — Lobster 不管理 OAuth；它调用执行此操作的 clawd 工具。
- **沙箱感知** — 当工具上下文是沙箱时禁用。
- **加固** — 如果指定了 `lobsterPath`，则必须是绝对路径；强制执行超时和输出上限。

## 故障排除

- **`lobster 子进程超时`** → 增加 `timeoutMs`，或拆分长管道。
- **`lobster 输出超出 maxStdoutBytes`** → 提高 `maxStdoutBytes` 或减少输出大小。
- **`lobster 返回无效 JSON`** → 确保管道在工具模式下运行并只打印 JSON。
- **`lobster 失败 (代码 …)`** → 在终端中运行相同的管道以检查 stderr。

## 了解更多

- [插件](/plugin)
- [插件工具创作](/plugins/agent-tools)

## 案例研究：社区工作流

一个公共示例：一个"第二大脑" CLI + Lobster 管道，管理三个 Markdown 保险库（个人、伙伴、共享）。CLI 为统计、收件箱列表和陈旧扫描发出 JSON；Lobster 将这些命令链接到工作流中，如 `weekly-review`、`inbox-triage`、`memory-consolidation` 和 `shared-task-sync`，每个都有审批闸门。AI 在可用时处理判断（分类），在不可用时回落到确定性规则。

- 线程：https://x.com/plattenschieber/status/2014508656335770033
- 仓库：https://github.com/bloomedai/brain-cli