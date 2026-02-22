---
title: 出站会话镜像重构（问题 #1520）
description: 跟踪出站会话镜像重构说明、决策、测试和待办事项。
---

# 出站会话镜像重构（问题 #1520）

## 状态
- 正在进行中。
- 核心 + 插件通道路由已更新以支持出站镜像。
- 网关发送现在在省略 sessionKey 时推导目标会话。

## 上下文
出站发送被镜像到*当前*代理会话（工具会话键）而不是目标通道会话。入站路由使用通道/对等会话键，因此出站响应落在错误的会话中，首次联系目标通常缺少会话条目。

## 目标
- 将出站消息镜像到目标通道会话键。
- 在缺失时创建出站会话条目。
- 保持线程/主题范围与入站会话键对齐。
- 涵盖核心通道和捆绑扩展。

## 实现摘要
- 新的出站会话路由助手：
  - `src/infra/outbound/outbound-session.ts`
  - `resolveOutboundSessionRoute` 使用 `buildAgentSessionKey`（dmScope + identityLinks）构建目标 sessionKey。
  - `ensureOutboundSessionEntry` 通过 `recordSessionMetaFromInbound` 写入最小 `MsgContext`。
- `runMessageAction`（发送）推导目标 sessionKey 并将其传递给 `executeSendAction` 进行镜像。
- `message-tool` 不再直接镜像；它仅从当前会话键解析 agentId。
- 插件发送路径使用派生的 sessionKey 通过 `appendAssistantMessageToSessionTranscript` 进行镜像。
- 网关发送在未提供会话键时（默认代理）推导目标会话键，并确保会话条目。

## 线程/主题处理
- Slack: replyTo/threadId -> `resolveThreadSessionKeys`（后缀）。
- Discord: threadId/replyTo -> `resolveThreadSessionKeys` 与 `useSuffix=false` 匹配入站（线程通道 id 已经限定会话）。
- Telegram: 主题 ID 映射到 `chatId:topic:<id>` 通过 `buildTelegramGroupPeerId`。

## 涵盖的扩展
- Matrix、MS Teams、Mattermost、BlueBubbles、Nextcloud Talk、Zalo、Zalo Personal、Nostr、Tlon。
- 注释：
  - Mattermost 目标现在剥离 `@` 以进行 DM 会话键路由。
  - Zalo Personal 对 1:1 目标使用 DM 对等类型（仅当存在 `group:` 时才是群组）。
  - BlueBubbles 群组目标剥离 `chat_*` 前缀以匹配入站会话键。
  - Slack 自动线程镜像不区分大小写地匹配通道 id。
  - 网关发送在镜像前将提供的会话键转换为小写。

## 决策
- **网关发送会话推导**：如果提供了 `sessionKey`，则使用它。如果省略，则从目标 + 默认代理推导 sessionKey 并在那里镜像。
- **会话条目创建**：始终使用 `recordSessionMetaFromInbound` 与 `Provider/From/To/ChatType/AccountId/Originating*` 对齐入站格式。
- **目标标准化**：出站路由在可用时使用解析的目标（后 `resolveChannelTarget`）。
- **会话键大小写**：在写入和迁移期间将会话键规范化为小写。

## 添加/更新的测试
- `src/infra/outbound/outbound-session.test.ts`
  - Slack 线程会话键。
  - Telegram 主题会话键。
  - 与 Discord 的 dmScope identityLinks。
- `src/agents/tools/message-tool.test.ts`
  - 从会话键推导 agentId（不传递 sessionKey）。
- `src/gateway/server-methods/send.test.ts`
  - 在省略时推导会话键并创建会话条目。

## 待办项目/后续工作
- Voice-call 插件使用自定义 `voice:<phone>` 会话键。出站映射在此处未标准化；如果 message-tool 应该支持语音通话发送，请添加显式映射。
- 确认是否有外部插件使用超出捆绑集的标准外 `From/To` 格式。

## 修改的文件
- `src/infra/outbound/outbound-session.ts`
- `src/infra/outbound/outbound-send-service.ts`
- `src/infra/outbound/message-action-runner.ts`
- `src/agents/tools/message-tool.ts`
- `src/gateway/server-methods/send.ts`
- 测试在：
  - `src/infra/outbound/outbound-session.test.ts`
  - `src/agents/tools/message-tool.test.ts`
  - `src/gateway/server-methods/send.test.ts`
