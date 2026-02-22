---
summary: "通过 grammY 集成 Telegram Bot API 及设置说明"
read_when:
  - 处理 Telegram 或 grammY 途径
---
# grammY 集成（Telegram Bot API）


# 为什么选择 grammY
- TS 优先的 Bot API 客户端，内置长轮询 + webhook 帮助程序、中间件、错误处理、速率限制器。
- 比手动编写 fetch + FormData 更干净的媒体帮助程序；支持所有 Bot API 方法。
- 可扩展：通过自定义 fetch、会话中间件（可选）、类型安全上下文的代理支持。

# 我们发布的功能
- **单一客户端路径：** 基于 fetch 的实现出移除；grammY 现在是唯一的 Telegram 客户端（发送 + 网关），默认启用 grammY 限流器。
- **网关：** `monitorTelegramProvider` 构建一个 grammY `Bot`，连接提及/允许列表门控，通过 `getFile`/`download` 进行媒体下载，并使用 `sendMessage/sendPhoto/sendVideo/sendAudio/sendDocument` 发送回复。支持通过 `webhookCallback` 的长轮询或 webhook。
- **代理：** 可选的 `channels.telegram.proxy` 通过 grammY 的 `client.baseFetch` 使用 `undici.ProxyAgent`。
- **Webhook 支持：** `webhook-set.ts` 包装 `setWebhook/deleteWebhook`；`webhook.ts` 托管带有健康检查 + 优雅关闭的回调。当设置 `channels.telegram.webhookUrl` 时网关启用 webhook 模式（否则使用长轮询）。
- **会话：** 直接聊天合并到代理主会话（`agent:<agentId>:<mainKey>`）；群组使用 `agent:<agentId>:telegram:group:<chatId>`；回复路由回同一频道。
- **配置旋钮：** `channels.telegram.botToken`、`channels.telegram.dmPolicy`、`channels.telegram.groups`（允许列表 + 提及默认值）、`channels.telegram.allowFrom`、`channels.telegram.groupAllowFrom`、`channels.telegram.groupPolicy`、`channels.telegram.mediaMaxMb`、`channels.telegram.linkPreview`、`channels.telegram.proxy`、`channels.telegram.webhookSecret`、`channels.telegram.webhookUrl`。
- **草稿流式传输：** 可选的 `channels.telegram.streamMode` 在私有话题聊天中使用 `sendMessageDraft`（Bot API 9.3+）。这与通道块流式传输分开。
- **测试：** grammY 模拟涵盖 DM + 群组提及门控和出站发送；更多媒体/webhook 固定装置仍然欢迎。

待解决的问题
- 如果遇到 Bot API 429s，可选 grammY 插件（限流器）。
- 添加更多结构化媒体测试（贴纸、语音笔记）。
- 使 webhook 监听端口可配置（当前固定为 8787，除非通过网关连接）。