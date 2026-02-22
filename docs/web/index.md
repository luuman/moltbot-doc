---
summary: "网关 Web 界面：控制界面、绑定模式和安全性"
read_when:
  - 您希望通过 Tailscale 访问网关时
  - 您想要浏览器控制界面和配置编辑时
---
# Web (网关)

网关从与网关 WebSocket 相同的端口提供一个小的 **浏览器控制界面** (Vite + Lit)：

- 默认：`http://<host>:18789/`
- 可选前缀：设置 `gateway.controlUi.basePath` (例如 `/moltbot`)

功能位于 [控制界面](/web/control-ui)。
本页面重点介绍绑定模式、安全性和面向 Web 的界面。

## Webhooks

当 `hooks.enabled=true` 时，网关还会在同一 HTTP 服务器上暴露一个小的 webhook 端点。
参见 [网关配置](/gateway/configuration) → `hooks` 了解认证 + 负载。

## 配置（默认开启）

当存在资源时（`dist/control-ui`），控制界面**默认启用**。
您可以通过配置控制它：

```json5
{
  gateway: {
    controlUi: { enabled: true, basePath: "/moltbot" } // basePath 可选
  }
}
```

## Tailscale 访问

### 集成 Serve（推荐）

让网关保持在环回地址，让 Tailscale Serve 代理它：

```json5
{
  gateway: {
    bind: "loopback",
    tailscale: { mode: "serve" }
  }
}
```

然后启动网关：

```bash
moltbot gateway
```

打开：
- `https://<magicdns>/` (或您配置的 `gateway.controlUi.basePath`)

### 内联网绑定 + 令牌

```json5
{
  gateway: {
    bind: "tailnet",
    controlUi: { enabled: true },
    auth: { mode: "token", token: "your-token" }
  }
}
```

然后启动网关（非环回绑定需要令牌）：

```bash
moltbot gateway
```

打开：
- `http://<tailscale-ip>:18789/` (或您配置的 `gateway.controlUi.basePath`)

### 公共互联网（Funnel）

```json5
{
  gateway: {
    bind: "loopback",
    tailscale: { mode: "funnel" },
    auth: { mode: "password" } // 或 CLAWDBOT_GATEWAY_PASSWORD
  }
}
```

## 安全注意事项

- 默认情况下需要网关认证（令牌/密码或 Tailscale 身份头信息）。
- 非环回绑定仍然**需要**共享令牌/密码（`gateway.auth` 或环境变量）。
- 向导默认生成网关令牌（即使在环回时也是如此）。
- 界面发送 `connect.params.auth.token` 或 `connect.params.auth.password`。
- 使用 Serve 时，当 `gateway.auth.allowTailscale` 为 `true` 时，Tailscale 身份头信息可以满足认证要求
  （不需要令牌/密码）。设置
  `gateway.auth.allowTailscale: false` 以要求明确的凭据。参见
  [Tailscale](/gateway/tailscale) 和 [安全性](/gateway/security)。
- `gateway.tailscale.mode: "funnel"` 需要 `gateway.auth.mode: "password"`（共享密码）。

## 构建界面

网关从 `dist/control-ui` 提供静态文件。使用以下命令构建它们：

```bash
pnpm ui:build # 首次运行时自动安装 UI 依赖项
```
