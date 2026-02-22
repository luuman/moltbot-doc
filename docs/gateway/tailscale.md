---
summary: "集成 Tailscale Serve/Funnel 用于网关控制面板"
read_when:
  - 在本地主机之外暴露网关控制界面
  - 自动化尾网或公共仪表板访问
---
# Tailscale（网关控制面板）

Moltbot 可以为网关控制面板和 WebSocket 端口自动配置 Tailscale **Serve**（尾网）或 **Funnel**（公开）。这使得网关保持绑定到环回地址，而 Tailscale 提供 HTTPS、路由以及（对于 Serve 的）身份头信息。

## 模式

- `serve`：仅通过 `tailscale serve` 进行尾网服务。网关保持在 `127.0.0.1`。
- `funnel`：通过 `tailscale funnel` 进行公共 HTTPS 访问。Moltbot 需要共享密码。
- `off`：默认（无 Tailscale 自动化）。

## 认证

设置 `gateway.auth.mode` 来控制握手：

- `token`（当设置了 `CLAWDBOT_GATEWAY_TOKEN` 时为默认值）
- `password`（通过 `CLAWDBOT_GATEWAY_PASSWORD` 或配置的共享密钥）

当 `tailscale.mode = "serve"` 且 `gateway.auth.allowTailscale` 为 `true` 时，
有效的 Serve 代理请求可以通过 Tailscale 身份头信息（`tailscale-user-login`）
进行认证，而无需提供令牌/密码。Moltbot 通过本地 Tailscale 守护进程（`tailscale whois`）
解析 `x-forwarded-for` 地址并与头信息匹配来验证身份，然后才接受它。
Moltbot 仅在请求从环回地址到达且带有 Tailscale 的 `x-forwarded-for`、`x-forwarded-proto` 和 `x-forwarded-host`
头信息时，才将其视为 Serve 请求。
要要求明确的凭据，请设置 `gateway.auth.allowTailscale: false` 或
强制使用 `gateway.auth.mode: "password"`。

## 配置示例

### 仅尾网（Serve）

```json5
{
  gateway: {
    bind: "loopback",
    tailscale: { mode: "serve" }
  }
}
```

打开：`https://<magicdns>/`（或您配置的 `gateway.controlUi.basePath`）

### 仅尾网（绑定到尾网 IP）

当您希望网关直接监听尾网 IP（无 Serve/Funnel）时使用此方法。

```json5
{
  gateway: {
    bind: "tailnet",
    auth: { mode: "token", token: "your-token" }
  }
}
```

从另一个尾网设备连接：
- 控制界面：`http://<tailscale-ip>:18789/`
- WebSocket：`ws://<tailscale-ip>:18789`

注意：在此模式下，环回地址（`http://127.0.0.1:18789`）将**无法**工作。

### 公共互联网（Funnel + 共享密码）

```json5
{
  gateway: {
    bind: "loopback",
    tailscale: { mode: "funnel" },
    auth: { mode: "password", password: "replace-me" }
  }
}
```

优先使用 `CLAWDBOT_GATEWAY_PASSWORD` 而不是将密码提交到磁盘。

## CLI 示例

```bash
moltbot gateway --tailscale serve
moltbot gateway --tailscale funnel --auth password
```

## 注意事项

- Tailscale Serve/Funnel 需要安装并登录 `tailscale` CLI。
- 除非认证模式为 `password`，否则 `tailscale.mode: "funnel"` 拒绝启动，以避免公开暴露。
- 如果您希望 Moltbot 在关闭时撤销 `tailscale serve`
  或 `tailscale funnel` 配置，请设置 `gateway.tailscale.resetOnExit`。
- `gateway.bind: "tailnet"` 是直接尾网绑定（无 HTTPS，无 Serve/Funnel）。
- `gateway.bind: "auto"` 优先使用环回；如果只想要尾网，请使用 `tailnet`。
- Serve/Funnel 仅暴露 **网关控制界面 + WS**。节点通过
  相同的网关 WS 端点连接，因此 Serve 可用于节点访问。

## 浏览器控制（远程网关 + 本地浏览器）

如果您在一台机器上运行网关但希望在另一台机器上驱动浏览器，
请在浏览器机器上运行 **节点主机** 并使两者保持在同一尾网中。
网关将代理浏览器操作到节点；不需要单独的控制服务器或 Serve URL。

避免使用 Funnel 进行浏览器控制；将节点配对视为操作员访问。

## Tailscale 前提条件 + 限制

- Serve 需要为您的尾网启用 HTTPS；如果缺失，CLI 会提示。
- Serve 注入 Tailscale 身份头信息；Funnel 不注入。
- Funnel 需要 Tailscale v1.38.3+、MagicDNS、HTTPS 启用和一个 funnel 节点属性。
- Funnel 仅支持通过 TLS 的端口 `443`、`8443` 和 `10000`。
- macOS 上的 Funnel 需要开源 Tailscale 应用变体。

## 了解更多

- Tailscale Serve 概述：https://tailscale.com/kb/1312/serve
- `tailscale serve` 命令：https://tailscale.com/kb/1242/tailscale-serve
- Tailscale Funnel 概述：https://tailscale.com/kb/1223/tailscale-funnel
- `tailscale funnel` 命令：https://tailscale.com/kb/1311/tailscale-funnel