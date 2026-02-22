---
summary: "WhatsApp 群组消息处理的行为和配置（提及模式在各个界面共享）"
read_when:
  - 更改群组消息规则或提及功能时
---
# 群组消息（WhatsApp 网页频道）

目标：让 Clawd 加入 WhatsApp 群组，仅在被提及的时候唤醒，并将该线程与个人 DM 会话分开。

注意：`agents.list[].groupChat.mentionPatterns` 现在也被 Telegram/Discord/Slack/iMessage 使用；本文档重点关注 WhatsApp 特定行为。对于多代理设置，请为每个代理设置 `agents.list[].groupChat.mentionPatterns`（或使用 `messages.groupChat.mentionPatterns` 作为全局备用）。

## 已实现的功能（2025-12-03）
- 激活模式：`mention`（默认）或 `always`。`mention` 需要被提及（通过 `mentionedJids` 的真实 WhatsApp @ 提及、正则表达式模式或文本中任何位置的机器人 E.164）。`always` 在每条消息上唤醒代理，但它只应在能够添加有意义的价值时才回复；否则返回静默令牌 `NO_REPLY`。可以在配置中设置默认值（`channels.whatsapp.groups`），并通过 `/activation` 每个群组覆盖。当设置了 `channels.whatsapp.groups` 时，它也充当群组白名单（包括 `"*"` 以允许所有）。
- 群组策略：`channels.whatsapp.groupPolicy` 控制是否接受群组消息（`open|disabled|allowlist`）。`allowlist` 使用 `channels.whatsapp.groupAllowFrom`（备用：显式 `channels.whatsapp.allowFrom`）。默认是 `allowlist`（阻止直到您添加发件人）。
- 每群组会话：会话键看起来像 `agent:<agentId>:whatsapp:group:<jid>`，因此像 `/verbose on` 或 `/think high` 这样的命令（作为独立消息发送）范围限定在该群组；个人 DM 状态不受影响。群组线程跳过心跳。
- 上下文注入：**仅待处理**的群组消息（默认 50 条）*未*触发运行的会在 `[Chat messages since your last reply - for context]` 下添加前缀，触发行在 `[Current message - respond to this]` 下。已经在会话中的消息不会重新注入。
- 发送者显示：每个群组批次现在以 `[from: Sender Name (+E164)]` 结尾，这样 Pi 知道谁在说话。
- 临时/一次查看：我们在提取文本/提及之前解开这些，所以其中的提及仍然会触发。
- 群组系统提示：在群组会话的第一个回合（以及每当 `/activation` 更改模式时），我们向系统提示中注入一段简短的文字，如 `You are replying inside the WhatsApp group "<subject>". Group members: Alice (+44...), Bob (+43...), … Activation: trigger-only … Address the specific sender noted in the message context.` 如果元数据不可用，我们仍然告诉代理这是一个群组聊天。

## 配置示例（WhatsApp）
在 `~/.clawdbot/moltbot.json` 中添加 `groupChat` 块，以便即使 WhatsApp 在文本主体中去除视觉 `@`，显示名称提及也能工作：

```json5
{
  channels: {
    whatsapp: {
      groups: {
        "*": { requireMention: true }
      }
    }
  },
  agents: {
    list: [
      {
        id: "main",
        groupChat: {
          historyLimit: 50,
          mentionPatterns: [
            "@?moltbot",
            "\\+?15555550123"
          ]
        }
      }
    ]
  }
}
```

注意事项：
- 正则表达式是大小写不敏感的；它们涵盖像 `@moltbot` 这样的显示名称提及以及带或不带 `+`/空格的原始数字。
- 当有人点击联系人时，WhatsApp 仍会通过 `mentionedJids` 发送标准提及，所以数字备用很少需要，但是一个有用的保障。

### 激活命令（仅所有者）

使用群组聊天命令：
- `/activation mention`
- `/activation always`

只有所有者号码（来自 `channels.whatsapp.allowFrom`，或未设置时机器人的自己的 E.164）可以更改此设置。在群组中发送 `/status` 作为独立消息以查看当前激活模式。

## 如何使用
1) 将您的 WhatsApp 账户（运行 Moltbot 的那个）添加到群组。
2) 说 `@moltbot …`（或包含号码）。只有白名单发送者可以触发它，除非您设置 `groupPolicy: "open"`。
3) 代理提示将包括最近的群组上下文以及结尾的 `[from: …]` 标记，以便它可以回复正确的人。
4) 会话级指令（`/verbose on`、`/think high`、`/new` 或 `/reset`、`/compact`）仅应用于该群组的会话；将它们作为独立消息发送，以便它们注册。您的个人 DM 会话保持独立。

## 测试/验证
- 手动冒烟测试：
  - 在群组中发送 `@clawd` 提及并确认回复引用了发送者姓名。
  - 发送第二个提及并验证历史块已包含然后在下一个回合清除。
- 检查网关日志（使用 `--verbose` 运行）以查看显示 `from: <groupJid>` 和 `[from: …]` 后缀的 `inbound web message` 条目。

## 已知注意事项
- 心跳故意为群组跳过，以避免嘈杂的广播。
- 回声抑制使用组合批字符串；如果您发送两次相同的文本而不提及，只有第一次会得到回复。
- 会话存储条目将以 `agent:<agentId>:whatsapp:group:<jid>` 形式出现在会话存储中（默认在 `~/.clawdbot/agents/<agentId>/sessions/sessions.json` 中）；缺少条目只是意味着该群组尚未触发运行。
- 群组中的打字指示器遵循 `agents.defaults.typingMode`（默认：未提及情况下为 `message`）。