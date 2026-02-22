---
summary: "流式传输 + 分块行为（块回复、草稿流式传输、限制）"
read_when:
  - 解释流式传输或分块如何在通道上工作时
  - 更改块流式传输或通道分块行为时
  - 调试重复/早期块回复或草稿流式传输时
---
# 流式传输 + 分块

Moltbot 有两个独立的"流式传输"层：
- **块流式传输（通道）：** 在助手编写时发出已完成的 **块**。这些是正常的通道消息（不是 token 增量）。
- **类似 token 的流式传输（仅 Telegram）：** 在生成时用部分文本更新 **草稿气泡**；最终消息在末尾发送。

目前没有真正的 token 流式传输到外部通道消息。Telegram 草稿流式传输是唯一的部分流式传输表面。

## 块流式传输（通道消息）

块流式传输在助手输出可用时以粗块发送。

```
模型输出
  └─ text_delta/events
       ├─ (blockStreamingBreak=text_end)
       │    └─ 分块器在缓冲区增长时发出块
       └─ (blockStreamingBreak=message_end)
            └─ 分块器在消息结束时刷新
                   └─ 通道发送（块回复）
```
图例：
- `text_delta/events`：模型流式传输事件（对于非流式传输模型可能是稀疏的）。
- `chunker`：应用最小/最大界限 + 断点偏好的 `EmbeddedBlockChunker`。
- `channel send`：实际出站消息（块回复）。

**控制：**
- `agents.defaults.blockStreamingDefault`：`"on"`/`"off"`（默认关闭）。
- 通道覆盖：`*.blockStreaming`（和每个账户变体）强制每个通道为 `"on"`/`"off"`。
- `agents.defaults.blockStreamingBreak`：`"text_end"` 或 `"message_end"`。
- `agents.defaults.blockStreamingChunk`：`{ minChars, maxChars, breakPreference? }`。
- `agents.defaults.blockStreamingCoalesce`：`{ minChars?, maxChars?, idleMs? }`（发送前合并流式传输块）。
- 通道硬限制：`*.textChunkLimit`（例如，`channels.whatsapp.textChunkLimit`）。
- 通道分块模式：`*.chunkMode`（`length` 默认，`newline` 在长度分块之前按空行（段落边界）分割）。
- Discord 软限制：`channels.discord.maxLinesPerMessage`（默认 17）分割高回复以避免 UI 裁剪。

**边界语义：**
- `text_end`：分块器发出时立即流式传输块；在每个 `text_end` 时刷新。
- `message_end`：等待助手消息完成，然后刷新缓冲输出。

`message_end` 仍在缓冲文本超过 `maxChars` 时使用分块器，因此它可以在末尾发出多个块。

## 分块算法（高低界限）

块分块由 `EmbeddedBlockChunker` 实现：
- **低界限：** 直到缓冲区 >= `minChars`（除非强制）才发出。
- **高界限：** 在 `maxChars` 之前优选分割；如果强制，在 `maxChars` 处分割。
- **断点偏好：** `paragraph` → `newline` → `sentence` → `whitespace` → 硬断点。
- **代码围栏：** 永远不在围栏内分割；在 `maxChars` 强制时，关闭 + 重新打开围栏以保持 Markdown 有效性。

`maxChars` 被限制为通道 `textChunkLimit`，因此您不能超过每个通道的限制。

## 合并（合并流式传输块）

启用块流式传输时，Moltbot 可以在发送前 **合并连续的块片段**
。这减少了"单行垃圾邮件"，同时仍提供
渐进输出。

- 合并在刷新前等待 **空闲间隙**（`idleMs`）。
- 缓冲区受 `maxChars` 限制，如果超过它将刷新。
- `minChars` 防止微小片段在足够文本累积之前发送
  （最终刷新总是发送剩余文本）。
- 连接器来自 `blockStreamingChunk.breakPreference`
  （`paragraph` → `\n\n`，`newline` → `\n`，`sentence` → 空格）。
- 通过 `*.blockStreamingCoalesce` 可用通道覆盖（包括每个账户配置）。
- 除非覆盖，Signal/Slack/Discord 的默认合并 `minChars` 提升到 1500。

## 块之间的类似人类的节奏

启用块流式传输时，您可以在
块回复之间添加 **随机暂停**（在第一个块之后）。这使多气泡回复感觉
更自然。

- 配置：`agents.defaults.humanDelay`（通过 `agents.list[].humanDelay` 每个代理覆盖）。
- 模式：`off`（默认），`natural`（800–2500ms），`custom`（`minMs`/`maxMs`）。
- 仅适用于 **块回复**，不适用于最终回复或工具摘要。

## "流式传输块或所有内容"

这映射到：
- **流式传输块：** `blockStreamingDefault: "on"` + `blockStreamingBreak: "text_end"`（边走边发）。非 Telegram 通道还需要 `*.blockStreaming: true`。
- **在末尾流式传输所有内容：** `blockStreamingBreak: "message_end"`（刷新一次，如果非常长可能发出多个块）。
- **无块流式传输：** `blockStreamingDefault: "off"`（仅最终回复）。

**通道说明：** 对于非 Telegram 通道，块流式传输 **关闭除非**
`*.blockStreaming` 明确设置为 `true`。Telegram 可以流式传输草稿
（`channels.telegram.streamMode`）而无需块回复。

配置位置提醒：`blockStreaming*` 默认位于
`agents.defaults` 下，而不是根配置。

## Telegram 草稿流式传输（类似 token）

Telegram 是唯一具有草稿流式传输的通道：
- 在 **带话题的私人聊天** 中使用 Bot API `sendMessageDraft`。
- `channels.telegram.streamMode: "partial" | "block" | "off"`。
  - `partial`：用最新流式传输文本更新草稿。
  - `block`：用块化块更新草稿（相同块规则）。
  - `off`：无草稿流式传输。
- 草稿块配置（仅用于 `streamMode: "block"`）：`channels.telegram.draftChunk`（默认：`minChars: 200`，`maxChars: 800`）。
- 草稿流式传输与块流式传输分开；块回复默认关闭，仅在非 Telegram 通道上启用 `*.blockStreaming: true` 时启用。
- 最终回复仍然是正常消息。
- `/reasoning stream` 将推理写入草稿气泡（仅 Telegram）。

当草稿流式传输活跃时，Moltbot 为该回复禁用块流式传输以避免双重流式传输。

```
Telegram（私人 + 话题）
  └─ sendMessageDraft（草稿气泡）
       ├─ streamMode=partial → 更新最新文本
       └─ streamMode=block   → 分块器更新草稿
  └─ 最终回复 → 正常消息
```
图例：
- `sendMessageDraft`：Telegram 草稿气泡（不是真实消息）。
- `final reply`：正常 Telegram 消息发送。