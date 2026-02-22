---
summary: "环回 WebChat 静态主机和网关 WS 用于聊天界面"
read_when:
  - 调试或配置 WebChat 访问时
---
# WebChat (网关 WebSocket 界面)


状态：macOS/iOS SwiftUI 聊天界面直接连接到网关 WebSocket。

## 它是什么
- 网关的原生聊天界面（无嵌入式浏览器和本地静态服务器）。
- 使用与其他频道相同的会话和路由规则。
- 确定性路由：回复总是返回到 WebChat。

## 快速开始
1) 启动网关。
2) 打开 WebChat 界面（macOS/iOS 应用）或控制界面聊天标签。
3) 确保已配置网关认证（默认需要，即使在环回时）。

## 工作原理（行为）
- 界面连接到网关 WebSocket 并使用 `chat.history`、`chat.send` 和 `chat.inject`。
- `chat.inject` 直接将助手注释附加到对话记录并广播到界面（无代理运行）。
- 历史记录始终从网关获取（无本地文件监控）。
- 如果网关无法访问，WebChat 是只读的。

## 远程使用
- 远程模式通过 SSH/Tailscale 隧道传输网关 WebSocket。
- 您不需要运行单独的 WebChat 服务器。

## 配置参考（WebChat）
完整配置：[配置](/gateway/configuration)

频道选项：
- 无专用的 `webchat.*` 块。WebChat 使用网关端点 + 下面的认证设置。

相关全局选项：
- `gateway.port`、`gateway.bind`：WebSocket 主机/端口。
- `gateway.auth.mode`、`gateway.auth.token`、`gateway.auth.password`：WebSocket 认证。
- `gateway.remote.url`、`gateway.remote.token`、`gateway.remote.password`：远程网关目标。
- `session.*`：会话存储和主键默认值。
