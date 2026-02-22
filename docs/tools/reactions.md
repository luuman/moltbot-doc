---
summary: "跨频道共享的反应语义"
read_when:
  - 在任何频道中处理反应
---
# 反应工具

跨频道的共享反应语义：

- 添加反应时需要 `emoji`。
- 当支持时，`emoji=""` 移除机器人的反应。
- 当支持时，`remove: true` 移除指定的表情符号（需要 `emoji`）。

频道说明：

- **Discord/Slack**：空的 `emoji` 移除机器人在消息上的所有反应；`remove: true` 仅移除那个表情符号。
- **Google Chat**：空的 `emoji` 移除应用程序在消息上的反应；`remove: true` 仅移除那个表情符号。
- **Telegram**：空的 `emoji` 移除机器人的反应；`remove: true` 也移除反应，但仍需要非空的 `emoji` 以进行工具验证。
- **WhatsApp**：空的 `emoji` 移除机器人反应；`remove: true` 映射到空表情符号（仍需要 `emoji`）。
- **Signal**：当启用 `channels.signal.reactionNotifications` 时，入站反应通知发出系统事件。