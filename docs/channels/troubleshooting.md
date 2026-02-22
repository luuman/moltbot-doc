---
summary: "特定通道的故障排除快捷方法（Discord/Telegram/WhatsApp）"
read_when:
  - 通道连接但消息无法流动
  - 调查通道错误配置（意图、权限、隐私模式）
---
# 通道故障排除

从以下命令开始：

```bash
moltbot doctor
moltbot channels status --probe
```

`channels status --probe` 在能够检测到常见通道错误配置时打印警告，并包括一些小的实时检查（凭证、某些权限/成员资格）。

## 通道
- Discord: [/channels/discord#troubleshooting](/channels/discord#troubleshooting)
- Telegram: [/channels/telegram#troubleshooting](/channels/telegram#troubleshooting)
- WhatsApp: [/channels/whatsapp#troubleshooting-quick](/channels/whatsapp#troubleshooting-quick)

## Telegram 快速修复
- 日志显示 `HttpError: Network request for 'sendMessage' failed` 或 `sendChatAction` → 检查 IPv6 DNS。如果 `api.telegram.org` 首先解析为 IPv6 且主机缺少 IPv6 出口，则强制使用 IPv4 或启用 IPv6。参见 [/channels/telegram#troubleshooting](/channels/telegram#troubleshooting)。
- 日志显示 `setMyCommands failed` → 检查出站 HTTPS 和对 `api.telegram.org` 的 DNS 可达性（在受限的 VPS 或代理上很常见）。