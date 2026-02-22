---
summary: "mac 应用如何嵌入网关 WebChat 以及如何调试它"
read_when:
  - 调试 mac WebChat 视图或回环端口
---
# WebChat (macOS 应用)

macOS 菜单栏应用将 WebChat UI 作为一个原生 SwiftUI 视图嵌入。它连接到网关并默认选择代理的**主会话**（带有会话切换器用于其他会话）。

- **本地模式**：直接连接到本地网关 WebSocket。
- **远程模式**：通过 SSH 转发网关控制端口并使用该隧道作为数据平面。

## 启动和调试

- 手动：Lobster 菜单 → "打开聊天"。
- 用于测试的自动打开：
  ```bash
  dist/Moltbot.app/Contents/MacOS/Moltbot --webchat
  ```
- 日志：`./scripts/clawlog.sh`（子系统 `bot.molt`，类别 `WebChatSwiftUI`）。

## 连接方式

- 数据平面：网关 WS 方法 `chat.history`、`chat.send`、`chat.abort`、
  `chat.inject` 和事件 `chat`、`agent`、`presence`、`tick`、`health`。
- 会话：默认为主会话（`main`，或范围为全局时为 `global`）。UI 可以在会话间切换。
- 入门设置使用专用会话以保持首次运行设置分离。

## 安全表面

- 远程模式仅通过 SSH 转发网关 WebSocket 控制端口。

## 已知限制

- UI 针对聊天会话进行了优化（不是完整的浏览器沙箱）。