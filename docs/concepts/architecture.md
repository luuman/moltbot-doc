---
summary: "WebSocket 网关架构、组件和客户端流程"
read_when:
  - 处理网关协议、客户端或传输时
---
# 网关架构

最后更新：2026-01-22

## 概述

- 单个长期运行的 **网关** 拥有所有消息表面（通过 Baileys 的 WhatsApp、
  通过 grammY 的 Telegram、Slack、Discord、Signal、iMessage、WebChat）。
- 控制平面客户端（macOS 应用、CLI、网页 UI、自动化）通过 **WebSocket** 连接到
  配置的绑定主机上的网关（默认为 `127.0.0.1:18789`）。
- **节点**（macOS/iOS/Android/无头）也通过 **WebSocket** 连接，但
  声明带有显式功能/命令的 `role: node`。
- 每个主机一个网关；这是唯一打开 WhatsApp 会话的地方。
- **画布主机**（默认 `18793`）提供代理可编辑的 HTML 和 A2UI。

## 组件和流程

### 网关（守护进程）
- 维护提供商连接。
- 暴露类型化的 WS API（请求、响应、服务器推送事件）。
- 根据 JSON Schema 验证入站帧。
- 发出 `agent`、`chat`、`presence`、`health`、`heartbeat`、`cron` 等事件。

### 客户端（mac 应用 / CLI / 网页管理）
- 每个客户端一个 WS 连接。
- 发送请求（`health`、`status`、`send`、`agent`、`system-presence`）。
- 订阅事件（`tick`、`agent`、`presence`、`shutdown`）。

### 节点（macOS / iOS / Android / 无头）
- 以 `role: node` 连接到 **相同的 WS 服务器**。
- 在 `connect` 中提供设备身份；配对是 **基于设备的**（角色 `node`）和
  批准存储在设备配对存储中。
- 暴露 `canvas.*`、`camera.*`、`screen.record`、`location.get` 等命令。

协议详情：
- [网关协议](/gateway/protocol)

### WebChat
- 静态 UI，使用网关 WS API 进行聊天历史和发送。
- 在远程设置中，通过与其他客户端相同的 SSH/Tailscale 隧道连接。

## 连接生命周期（单个客户端）

```
客户端                      网关
  |                          |
  |---- req:connect -------->|
  |<------ res (ok) ---------|   （或 res 错误 + 关闭）
  |   （payload=hello-ok 携带快照：在线状态 + 健康状况）
  |                          |
  |<------ event:presence ---|
  |<------ event:tick -------|
  |                          |
  |------- req:agent ------->|
  |<------ res:agent --------|   （确认：{runId,status:"accepted"}）
  |<------ event:agent ------|   （流式传输）
  |<------ res:agent --------|   （最终：{runId,status,summary}）
  |                          |
```

## 线路协议（摘要）

- 传输：WebSocket，带有 JSON 载荷的文本帧。
- 第一帧 **必须** 是 `connect`。
- 握手后：
  - 请求：`{type:"req", id, method, params}` → `{type:"res", id, ok, payload|error}`
  - 事件：`{type:"event", event, payload, seq?, stateVersion?}`
- 如果设置了 `CLAWDBOT_GATEWAY_TOKEN`（或 `--token`），`connect.params.auth.token`
  必须匹配，否则套接字关闭。
- 幂等性密钥对于产生副作用的方法（`send`、`agent`）是必需的，
  以便安全重试；服务器保留短期去重缓存。
- 节点必须在 `connect` 中包含 `role: "node"` 加上功能/命令/权限。

## 配对 + 本地信任

- 所有 WS 客户端（操作员 + 节点）在 `connect` 时包含 **设备身份**。
- 新设备 ID 需要配对批准；网关为后续连接发出 **设备令牌**。
- **本地** 连接（回环或网关主机自己的 tailnet 地址）可以
  自动批准以保持同主机用户体验流畅。
- **非本地** 连接必须签署 `connect.challenge` 随机数并需要
  显式批准。
- 网关认证（`gateway.auth.*`）仍然适用于 **所有** 连接，无论是本地还是
  远程。

详情：[网关协议](/gateway/protocol)，[配对](/start/pairing)，
[安全](/gateway/security)。

## 协议类型和代码生成

- TypeBox 模式定义协议。
- 从这些模式生成 JSON Schema。
- 从 JSON Schema 生成 Swift 模型。

## 远程访问

- 首选：Tailscale 或 VPN。
- 替代方案：SSH 隧道
  ```bash
  ssh -N -L 18789:127.0.0.1:18789 user@host
  ```
- 相同的握手 + 认证令牌通过隧道应用。
- TLS + 可选固定可以在远程设置中为 WS 启用。

## 操作快照

- 启动：`moltbot gateway`（前台，日志输出到 stdout）。
- 健康状况：通过 WS 的 `health`（也包含在 `hello-ok` 中）。
- 监督：launchd/systemd 用于自动重启。

## 不变式

- 每个主机恰好一个网关控制单个 Baileys 会话。
- 握手是强制性的；任何非 JSON 或非 connect 的第一帧都会硬关闭。
- 事件不会重播；客户端必须在间隔时刷新。