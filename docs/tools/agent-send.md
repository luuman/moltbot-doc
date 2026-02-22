---
summary: "直接 `moltbot agent` CLI 运行（可选传送）"
read_when:
  - 添加或修改代理 CLI 入口点
---
# `moltbot agent`（直接代理运行）

`moltbot agent` 运行单个代理回合，而不需要入站聊天消息。
默认情况下它通过**网关**；添加 `--local` 以强制在当前机器上运行嵌入的
运行时。

## 行为

- 必需：`--message <text>`
- 会话选择：
  - `--to <dest>` 派生会话键（群组/频道目标保持隔离；直接聊天折叠到 `main`），**或**
  - `--session-id <id>` 通过 ID 重用现有会话，**或**
  - `--agent <id>` 直接定位配置的代理（使用该代理的 `main` 会话键）
- 运行与正常入站回复相同的嵌入代理运行时。
- 思考/详细标志持久化到会话存储中。
- 输出：
  - 默认：打印回复文本（加上 `MEDIA:<url>` 行）
  - `--json`：打印结构化负载 + 元数据
- 使用 `--deliver` + `--channel` 可选传送回频道（目标格式匹配 `moltbot message --target`）。
- 使用 `--reply-channel`/`--reply-to`/`--reply-account` 覆盖传送而不更改会话。

如果网关无法访问，CLI **回退**到嵌入的本地运行。

## 示例

```bash
moltbot agent --to +15555550123 --message "status update"
moltbot agent --agent ops --message "Summarize logs"
moltbot agent --session-id 1234 --message "Summarize inbox" --thinking medium
moltbot agent --to +15555550123 --message "Trace logs" --verbose on --json
moltbot agent --to +15555550123 --message "Summon reply" --deliver
moltbot agent --agent ops --message "Generate report" --deliver --reply-channel slack --reply-to "#reports"
```

## 标志

- `--local`: 本地运行（需要在 shell 中设置模型提供商 API 密钥）
- `--deliver`: 将回复发送到选择的频道
- `--channel`: 传送频道（`whatsapp|telegram|discord|googlechat|slack|signal|imessage`，默认：`whatsapp`）
- `--reply-to`: 传送目标覆盖
- `--reply-channel`: 传送频道覆盖
- `--reply-account`: 传送账户 ID 覆盖
- `--thinking <off|minimal|low|medium|high|xhigh>`: 持久化思考级别（仅 GPT-5.2 + Codex 模型）
- `--verbose <on|full|off>`: 持久化详细级别
- `--timeout <seconds>`: 覆盖代理超时
- `--json`: 输出结构化 JSON
