---
summary: "每个通道的路由规则（WhatsApp、Telegram、Discord、Slack）和共享上下文"
read_when:
  - 更改通道路由或收件箱行为时
---
# 通道和路由

Moltbot 将回复 **路由回消息来源的通道**。模型不选择通道；
路由是确定性的，由主机配置控制。

## 关键术语

- **通道**：`whatsapp`、`telegram`、`discord`、`slack`、`signal`、`imessage`、`webchat`。
- **账户ID**：每个通道的账户实例（在支持时）。
- **代理ID**：隔离的工作区 + 会话存储（"大脑"）。
- **会话密钥**：用于存储上下文和控制并发的桶密钥。

## 会话密钥形状（示例）

直接消息合并到代理的 **主** 会话：

- `agent:<agentId>:<mainKey>`（默认：`agent:main:main`）

群组和通道在每个通道中保持隔离：

- 群组：`agent:<agentId>:<channel>:group:<id>`
- 通道/房间：`agent:<agentId>:<channel>:channel:<id>`

线程：

- Slack/Discord 线程将 `:thread:<threadId>` 附加到基础密钥。
- Telegram 论坛主题在群组密钥中嵌入 `:topic:<topicId>`。

示例：

- `agent:main:telegram:group:-1001234567890:topic:42`
- `agent:main:discord:channel:123456:thread:987654`

## 路由规则（如何选择代理）

路由为每个入站消息选择 **一个代理**：

1. **精确对等匹配**（`bindings` 带 `peer.kind` + `peer.id`）。
2. **公会匹配**（Discord）通过 `guildId`。
3. **团队匹配**（Slack）通过 `teamId`。
4. **账户匹配**（通道上的 `accountId`）。
5. **通道匹配**（该通道上的任何账户）。
6. **默认代理**（`agents.list[].default`，否则是第一个列表条目，默认为 `main`）。

匹配的代理决定使用哪个工作区和会话存储。

## 广播组（运行多个代理）

广播组让您为同一个对等方运行 **多个代理**，**当 Moltbot 通常会回复时**（例如：在 WhatsApp 群组中，在提及/激活门控之后）。

配置：

```json5
{
  broadcast: {
    strategy: "parallel",
    "120363403215116621@g.us": ["alfred", "baerbel"],
    "+15555550123": ["support", "logger"]
  }
}
```

参见：[广播组](/broadcast-groups)。

## 配置概述

- `agents.list`：命名代理定义（工作区、模型等）。
- `bindings`：将入站通道/账户/对等方映射到代理。

示例：

```json5
{
  agents: {
    list: [
      { id: "support", name: "Support", workspace: "~/clawd-support" }
    ]
  },
  bindings: [
    { match: { channel: "slack", teamId: "T123" }, agentId: "support" },
    { match: { channel: "telegram", peer: { kind: "group", id: "-100123" } }, agentId: "support" }
  ]
}
```

## 会话存储

会话存储位于状态目录下（默认 `~/.clawdbot`）：

- `~/.clawdbot/agents/<agentId>/sessions/sessions.json`
- JSONL 记录与存储相邻

您可以通过 `session.store` 和 `{agentId}` 模板覆盖存储路径。

## WebChat 行为

WebChat 附加到 **选定的代理** 并默认为代理的主
会话。正因为如此，WebChat 让您在一个地方看到该
代理的跨通道上下文。

## 回复上下文

入站回复包括：
- `ReplyToId`、`ReplyToBody` 和 `ReplyToSender`（在可用时）。
- 引用上下文作为 `[Replying to ...]` 块附加到 `Body`。

这在通道间是一致的。