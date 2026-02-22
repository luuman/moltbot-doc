---
summary: "代理运行时（嵌入式 p-mono）、工作区合约和会话引导"
read_when:
  - 更改代理运行时、工作区引导或会话行为时
---
# 代理运行时 🤖

Moltbot 运行一个单一的嵌入式代理运行时，该运行时派生自 **p-mono**。

## 工作区（必需）

Moltbot 使用单个代理工作区目录 (`agents.defaults.workspace`) 作为代理的 **唯一** 工作目录 (`cwd`)，用于工具和上下文。

推荐：如果缺少，请使用 `moltbot setup` 创建 `~/.clawdbot/moltbot.json` 并初始化工作区文件。

完整的工作区布局 + 备份指南：[代理工作区](/concepts/agent-workspace)

如果启用了 `agents.defaults.sandbox`，非主会话可以用 `agents.defaults.sandbox.workspaceRoot` 下的每会话工作区覆盖此设置（参见 [网关配置](/gateway/configuration)）。

## 引导文件（注入）

在 `agents.defaults.workspace` 内部，Moltbot 期望这些用户可编辑的文件：
- `AGENTS.md` — 操作说明 + "记忆"
- `SOUL.md` — 个性、边界、语调
- `TOOLS.md` — 用户维护的工具注释（例如 `imsg`, `sag`, 约定）
- `BOOTSTRAP.md` — 一次性首次运行仪式（完成后删除）
- `IDENTITY.md` — 代理名称/风格/表情符号
- `USER.md` — 用户资料 + 首选称呼

在新会话的第一个回合中，Moltbot 将这些文件的内容直接注入到代理上下文中。

空白文件将被跳过。大文件会被修剪和截断，并带有标记，以便保持提示简洁（读取文件以获取全部内容）。

如果文件缺失，Moltbot 会注入一个"缺失文件"标记行（并且 `moltbot setup` 会创建一个安全的默认模板）。

`BOOTSTRAP.md` 仅在 **全新工作区** 中创建（不存在其他引导文件）。如果您在完成仪式后删除它，在后续重启时不应重新创建。

要完全禁用引导文件创建（对于预填充的工作区），请设置：

```json5
{ agent: { skipBootstrap: true } }
```

## 内置工具

核心工具（read/exec/edit/write 和相关系统工具）始终可用，
受工具策略约束。`apply_patch` 是可选的，由
`tools.exec.applyPatch` 控制。`TOOLS.md` 不控制哪些工具存在；它是
关于 *您* 如何使用它们的指导。

## 技能

Moltbot 从三个位置加载技能（在名称冲突时工作区优先）：
- 捆绑（随安装包一起提供）
- 托管/本地：`~/.clawdbot/skills`
- 工作区：`<workspace>/skills`

技能可以通过配置/环境变量进行限制（参见 [网关配置](/gateway/configuration) 中的 `skills`）。

## p-mono 集成

Moltbot 重用 p-mono 代码库的部分组件（模型/工具），但 **会话管理、发现和工具连接由 Moltbot 负责**。

- 无 p-coding 代理运行时。
- 不咨询 `~/.pi/agent` 或 `<workspace>/.pi` 设置。

## 会话

会话记录存储为 JSONL 格式：
- `~/.clawdbot/agents/<agentId>/sessions/<SessionId>.jsonl`

会话 ID 是稳定的，由 Moltbot 选择。
旧版 Pi/Tau 会话文件夹 **不** 会被读取。

## 流式传输时的转向

当队列模式为 `steer` 时，传入消息被注入当前运行。
队列在 **每次工具调用之后** 检查；如果存在排队的消息，
则跳过当前助手消息的剩余工具调用（错误工具结果为"由于排队的用户消息而跳过"），然后在下一个助手响应之前注入排队的用户消息。

当队列模式为 `followup` 或 `collect` 时，传入消息在当前回合结束前被保留，然后使用排队的有效载荷开始新的代理回合。参见 [队列](/concepts/queue) 了解模式 + 去抖/容量行为。

块流式传输在完成的助手块完成后立即发送；它默认是 **关闭的** (`agents.defaults.blockStreamingDefault: "off"`)。
通过 `agents.defaults.blockStreamingBreak` 调整边界（`text_end` 与 `message_end`；默认为 text_end）。
使用 `agents.defaults.blockStreamingChunk` 控制软块分块（默认为 800-1200 字符；优先段落换行，然后是换行符；句子最后）。
合并流式块与 `agents.defaults.blockStreamingCoalesce` 减少单行垃圾信息（发送前基于空闲时间合并）。非 Telegram 通道需要显式 `*.blockStreaming: true` 来启用块回复。
详细工具摘要在工具启动时发出（无去抖）；当可用时，通过代理事件控制 UI 流式传输工具输出。
更多详情：[流式传输 + 分块](/concepts/streaming)。

## 模型引用

配置中的模型引用（例如 `agents.defaults.model` 和 `agents.defaults.models`）通过拆分 **第一个** `/` 来解析。

- 配置模型时使用 `provider/model`。
- 如果模型 ID 本身包含 `/`（OpenRouter 风格），请包含提供程序前缀（示例：`openrouter/moonshotai/kimi-k2`）。
- 如果省略提供程序，Moltbot 将输入视为别名或 **默认提供程序** 的模型（仅在模型 ID 中没有 `/` 时有效）。

## 配置（最小）

至少设置：
- `agents.defaults.workspace`
- `channels.whatsapp.allowFrom`（强烈推荐）

---

*下一节：[群聊](/concepts/group-messages)* 🦞