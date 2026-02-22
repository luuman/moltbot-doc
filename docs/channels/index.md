---
summary: "Moltbot 可以连接的消息平台"
read_when:
  - 您想为 Moltbot 选择聊天通道
  - 您需要支持的消息平台的快速概述
---
# 聊天通道

Moltbot 可以在您已经使用的任何聊天应用中与您交谈。每个通道通过网关连接。
文本在各处都受支持；媒体和反应因通道而异。

## 支持的通道

- [WhatsApp](/channels/whatsapp) — 最受欢迎的；使用 Baileys 并需要 QR 配对。
- [Telegram](/channels/telegram) — 通过 grammY 的 Bot API；支持群组。
- [Discord](/channels/discord) — Discord Bot API + Gateway；支持服务器、频道和私信。
- [Slack](/channels/slack) — Bolt SDK；工作区应用。
- [Google Chat](/channels/googlechat) — 通过 HTTP webhook 的 Google Chat API 应用。
- [Mattermost](/channels/mattermost) — Bot API + WebSocket；频道、群组、私信（插件，单独安装）。
- [Signal](/channels/signal) — signal-cli；注重隐私。
- [BlueBubbles](/channels/bluebubbles) — **推荐用于 iMessage**；使用 BlueBubbles macOS 服务器 REST API，支持全部功能（编辑、撤回、效果、反应、群组管理 — 目前在 macOS 26 Tahoe 上编辑功能已损坏）。
- [iMessage](/channels/imessage) — 仅 macOS；通过 imsg 的原生集成（传统，新设置请考虑 BlueBubbles）。
- [Microsoft Teams](/channels/msteams) — Bot Framework；企业支持（插件，单独安装）。
- [LINE](/channels/line) — LINE Messaging API 机器人（插件，单独安装）。
- [Nextcloud Talk](/channels/nextcloud-talk) — 通过 Nextcloud Talk 的自托管聊天（插件，单独安装）。
- [Matrix](/channels/matrix) — Matrix 协议（插件，单独安装）。
- [Nostr](/channels/nostr) — 通过 NIP-04 的去中心化私信（插件，单独安装）。
- [Tlon](/channels/tlon) — 基于 Urbit 的消息应用（插件，单独安装）。
- [Twitch](/channels/twitch) — 通过 IRC 连接的 Twitch 聊天（插件，单独安装）。
- [Zalo](/channels/zalo) — Zalo Bot API；越南流行的聊天应用（插件，单独安装）。
- [Zalo Personal](/channels/zalouser) — 通过 QR 登录的 Zalo 个人账户（插件，单独安装）。
- [WebChat](/web/webchat) — 通过 WebSocket 的网关 WebChat UI。

## 注意事项

- 通道可以同时运行；配置多个，Moltbot 将按聊天路由。
- 最快的设置通常是 **Telegram**（简单机器人令牌）。WhatsApp 需要 QR 配对并
  在磁盘上存储更多状态。
- 群组行为因通道而异；参见 [群组](/concepts/groups)。
- 为安全起见，执行私信配对和允许列表；参见 [安全](/gateway/security)。
- Telegram 内部：[grammY 笔记](/channels/grammy)。
- 故障排除：[通道故障排除](/channels/troubleshooting)。
- 模型提供商分别记录；参见 [模型提供商](/providers/models)。