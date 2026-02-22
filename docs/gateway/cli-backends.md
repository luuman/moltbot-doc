---
summary: "CLI 后端：通过本地 AI CLIs 实现纯文本备用方案"
read_when:
  - API 提供商失败时需要可靠的备用方案
  - 您正在运行 Claude Code CLI 或其他本地 AI CLIs 并希望重用它们
  - 您需要一个纯文本、无工具的路径但仍支持会话和图像
---
# CLI 后端（备用运行时）

当 API 提供商宕机、限速或暂时行为异常时，Moltbot 可以将 **本地 AI CLIs** 作为 **纯文本备用** 运行。这是有意保守的设计：

- **工具被禁用**（无工具调用）。
- **文本输入 → 文本输出**（可靠）。
- **支持会话**（因此后续对话保持连贯）。
- **图像可以传递**（如果 CLI 接受图像路径）。

这是设计为 **安全网** 而非主要路径。当您想要"始终工作"的文本响应而不依赖外部 API 时使用它。

## 初学者友好快速入门

您可以 **无需任何配置** 使用 Claude Code CLI（Moltbot 内置了默认设置）：

```bash
moltbot agent --message "hi" --model claude-cli/opus-4.5
```

Codex CLI 也可以开箱即用：

```bash
moltbot agent --message "hi" --model codex-cli/gpt-5.2-codex
```

如果您的网关在 launchd/systemd 下运行且 PATH 最小，请仅添加
命令路径：

```json5
{
  agents: {
    defaults: {
      cliBackends: {
        "claude-cli": {
          command: "/opt/homebrew/bin/claude"
        }
      }
    }
  }
}
```

就是这样。除了 CLI 本身外，无需密钥，无需额外的认证配置。

## 作为备用方案使用

将 CLI 后端添加到您的备用列表中，以便仅在主模型失败时运行：

```json5
{
  agents: {
    defaults: {
      model: {
        primary: "anthropic/claude-opus-4-5",
        fallbacks: [
          "claude-cli/opus-4.5"
        ]
      },
      models: {
        "anthropic/claude-opus-4-5": { alias: "Opus" },
        "claude-cli/opus-4.5": {}
      }
    }
  }
}
```

注意事项：
- 如果您使用 `agents.defaults.models`（允许列表），必须包含 `claude-cli/...`。
- 如果主提供商失败（认证、速率限制、超时），Moltbot 将
  尝试下一个 CLI 后端。

## 配置概述

所有 CLI 后端位于：

```
agents.defaults.cliBackends
```

每个条目由 **提供商 ID**（例如 `claude-cli`、`my-cli`）键控。
提供商 ID 成为您模型引用的左侧：

```
<provider>/<model>
```

### 示例配置

```json5
{
  agents: {
    defaults: {
      cliBackends: {
        "claude-cli": {
          command: "/opt/homebrew/bin/claude"
        },
        "my-cli": {
          command: "my-cli",
          args: ["--json"],
          output: "json",
          input: "arg",
          modelArg: "--model",
          modelAliases: {
            "claude-opus-4-5": "opus",
            "claude-sonnet-4-5": "sonnet"
          },
          sessionArg: "--session",
          sessionMode: "existing",
          sessionIdFields: ["session_id", "conversation_id"],
          systemPromptArg: "--system",
          systemPromptWhen: "first",
          imageArg: "--image",
          imageMode: "repeat",
          serialize: true
        }
      }
    }
  }
}
```

## 工作原理

1) **根据提供商前缀**（`claude-cli/...`）选择后端。
2) **构建系统提示** 使用相同的 Moltbot 提示 + 工作区上下文。
3) **执行 CLI** 使用会话 ID（如果支持）以便历史记录保持一致。
4) **解析输出**（JSON 或纯文本）并返回最终文本。
5) **持久化会话 ID** 按后端，因此后续对话重用相同的 CLI 会话。

## 会话

- 如果 CLI 支持会话，设置 `sessionArg`（例如 `--session-id`）或
  `sessionArgs`（占位符 `{sessionId}`）当 ID 需要插入
  多个标志时。
- 如果 CLI 使用具有不同标志的 **恢复子命令**，设置
  `resumeArgs`（恢复时替换 `args`）并可选地设置 `resumeOutput`
  （用于非 JSON 恢复）。
- `sessionMode`：
  - `always`：总是发送会话 ID（如果没有存储则为新 UUID）。
  - `existing`：仅在之前存储过会话 ID 时发送。
  - `none`：从不发送会话 ID。

## 图像（传递）

如果您的 CLI 接受图像路径，设置 `imageArg`：

```json5
imageArg: "--image",
imageMode: "repeat"
```

Moltbot 将把 base64 图像写入临时文件。如果设置了 `imageArg`，那些
路径将作为 CLI 参数传递。如果缺少 `imageArg`，Moltbot 会附加
文件路径到提示中（路径注入），这对于从普通路径自动
加载本地文件的 CLIs 来说已经足够（Claude Code CLI 行为）。

## 输入 / 输出

- `output: "json"`（默认）尝试解析 JSON 并提取文本 + 会话 ID。
- `output: "jsonl"` 解析 JSONL 流（Codex CLI `--json`）并提取
  最后的代理消息以及存在时的 `thread_id`。
- `output: "text"` 将标准输出视为最终响应。

输入模式：
- `input: "arg"`（默认）将提示作为最后一个 CLI 参数传递。
- `input: "stdin"` 通过 stdin 发送提示。
- 如果提示很长且设置了 `maxPromptArgChars`，则使用 stdin。

## 默认值（内置）

Moltbot 为 `claude-cli` 提供了默认设置：

- `command: "claude"`
- `args: ["-p", "--output-format", "json", "--dangerously-skip-permissions"]`
- `resumeArgs: ["-p", "--output-format", "json", "--dangerously-skip-permissions", "--resume", "{sessionId}"]`
- `modelArg: "--model"`
- `systemPromptArg: "--append-system-prompt"`
- `sessionArg: "--session-id"`
- `systemPromptWhen: "first"`
- `sessionMode: "always"`

Moltbot 还为 `codex-cli` 提供了默认设置：

- `command: "codex"`
- `args: ["exec","--json","--color","never","--sandbox","read-only","--skip-git-repo-check"]`
- `resumeArgs: ["exec","resume","{sessionId}","--color","never","--sandbox","read-only","--skip-git-repo-check"]`
- `output: "jsonl"`
- `resumeOutput: "text"`
- `modelArg: "--model"`
- `imageArg: "--image"`
- `sessionMode: "existing"`

仅在需要时覆盖（常见：绝对 `command` 路径）。

## 限制

- **无 Moltbot 工具**（CLI 后端永远不会接收工具调用）。一些 CLIs
  可能仍会运行自己的代理工具。
- **无流式传输**（CLI 输出被收集然后返回）。
- **结构化输出** 取决于 CLI 的 JSON 格式。
- **Codex CLI 会话** 通过文本输出恢复（无 JSONL），这比
  初始 `--json` 运行的结构化程度更低。Moltbot 会话仍然正常
  工作。

## 故障排除

- **找不到 CLI**：将 `command` 设置为完整路径。
- **错误的模型名称**：使用 `modelAliases` 映射 `provider/model` → CLI 模型。
- **无会话连续性**：确保设置了 `sessionArg` 且 `sessionMode` 不是
  `none`（Codex CLI 目前无法使用 JSON 输出恢复）。
- **忽略图像**：设置 `imageArg`（并验证 CLI 支持文件路径）。