---
summary: "基于浏览器的网关控制界面（聊天、节点、配置）"
read_when:
  - 您想从浏览器操作网关时
  - 您想在没有 SSH 隧道的情况下访问内联网时
---
# 控制界面（浏览器）

控制界面是由网关提供的小型 **Vite + Lit** 单页应用程序：

- 默认：`http://<host>:18789/`
- 可选前缀：设置 `gateway.controlUi.basePath`（例如 `/moltbot`）

它在同一端口**直接与网关 WebSocket 对话**。

## 快速打开（本地）

如果网关在同台计算机上运行，请打开：

- http://127.0.0.1:18789/（或 http://localhost:18789/）

如果页面加载失败，请先启动网关：`moltbot gateway`。

认证在 WebSocket 握手期间通过以下方式提供：
- `connect.params.auth.token`
- `connect.params.auth.password`
仪表板设置面板允许您存储令牌；密码不会被持久化。
入门向导默认生成网关令牌，因此首次连接时请在此处粘贴。

## 它能做什么（目前）
- 通过网关 WS 与模型聊天（`chat.history`、`chat.send`、`chat.abort`、`chat.inject`）
- 流式传输工具调用 + 聊天中的实时工具输出卡片（代理事件）
- 通道：WhatsApp/Telegram/Discord/Slack + 插件通道（Mattermost 等）状态 + QR 登录 + 每通道配置（`channels.status`、`web.login.*`、`config.patch`）
- 实例：在线列表 + 刷新（`system-presence`）
- 会话：列表 + 每会话思考/详细覆盖（`sessions.list`、`sessions.patch`）
- Cron 作业：列表/添加/运行/启用/禁用 + 运行历史（`cron.*`）
- 技能：状态、启用/禁用、安装、API 密钥更新（`skills.*`）
- 节点：列表 + 功能（`node.list`）
- Exec 批准：编辑网关或节点白名单 + `exec host=gateway/node` 的询问策略（`exec.approvals.*`）
- 配置：查看/编辑 `~/.clawdbot/moltbot.json`（`config.get`、`config.set`）
- 配置：应用 + 重启并验证（`config.apply`）并唤醒最后一个活动会话
- 配置写入包括基础哈希保护以防止覆盖并发编辑
- 配置架构 + 表单渲染（`config.schema`，包括插件 + 通道架构）；原始 JSON 编辑器仍可用
- 调试：状态/健康/模型快照 + 事件日志 + 手动 RPC 调用（`status`、`health`、`models.list`）
- 日志：带有过滤/导出的网关文件日志实时跟踪（`logs.tail`）
- 更新：运行包/git 更新 + 重启（`update.run`）并附带重启报告

## 聊天行为

- `chat.send` 是**非阻塞的**：它立即确认 `{ runId, status: "started" }` 并通过 `chat` 事件流式传输响应。
- 使用相同的 `idempotencyKey` 重新发送会在运行时返回 `{ status: "in_flight" }`，完成后返回 `{ status: "ok" }`。
- `chat.inject` 将助手注释追加到会话记录并广播 `chat` 事件以进行仅限 UI 的更新（无代理运行，无通道传递）。
- 停止：
  - 点击**停止**（调用 `chat.abort`）
  - 输入 `/stop`（或 `stop|esc|abort|wait|exit|interrupt`）以带外中止
  - `chat.abort` 支持 `{ sessionKey }`（无 `runId`）以中止该会话的所有活跃运行

## 内联网访问（推荐）

### 集成 Tailscale Serve（首选）

让网关保持在环回地址，让 Tailscale Serve 使用 HTTPS 代理它：

```bash
moltbot gateway --tailscale serve
```

打开：
- `https://<magicdns>/`（或您配置的 `gateway.controlUi.basePath`）

默认情况下，当 `gateway.auth.allowTailscale` 为 `true` 时，Serve 请求可以通过 Tailscale 身份头信息
（`tailscale-user-login`）进行身份验证。Moltbot
通过使用 `tailscale whois` 解析 `x-forwarded-for` 地址并与头信息匹配来验证身份，
并且仅在接受具有 Tailscale 的 `x-forwarded-*` 头信息的环回请求时才接受这些信息。如果
即使对于 Serve 流量也想要求令牌/密码，请设置
`gateway.auth.allowTailscale: false`（或强制 `gateway.auth.mode: "password"`）。

### 绑定到内联网 + 令牌

```bash
moltbot gateway --bind tailnet --token "$(openssl rand -hex 32)"
```

然后打开：
- `http://<tailscale-ip>:18789/`（或您配置的 `gateway.controlUi.basePath`）

将令牌粘贴到 UI 设置中（作为 `connect.params.auth.token` 发送）。

## 不安全的 HTTP

如果通过普通 HTTP（`http://<lan-ip>` 或 `http://<tailscale-ip>`）打开仪表板，
浏览器在**非安全上下文**中运行并阻止 WebCrypto。默认情况下，
Moltbot **阻止**没有设备身份的控制界面连接。

**推荐修复方案：** 使用 HTTPS（Tailscale Serve）或在本地打开 UI：
- `https://<magicdns>/`（Serve）
- `http://127.0.0.1:18789/`（在网关主机上）

**降级示例（仅 HTTP 上的令牌）：**

```json5
{
  gateway: {
    controlUi: { allowInsecureAuth: true },
    bind: "tailnet",
    auth: { mode: "token", token: "replace-me" }
  }
}
```

这会禁用控制界面的设备身份 + 配对（即使在 HTTPS 上）。仅在您信任网络时使用。

有关 HTTPS 设置指南，请参见 [Tailscale](/gateway/tailscale)。

## 构建 UI

网关从 `dist/control-ui` 提供静态文件。使用以下命令构建它们：

```bash
pnpm ui:build # 首次运行时自动安装 UI 依赖项
```

可选的绝对基础（当您想要固定资产 URL 时）：

```bash
CLAWDBOT_CONTROL_UI_BASE_PATH=/moltbot/ pnpm ui:build
```

用于本地开发（独立的开发服务器）：

```bash
pnpm ui:dev # 首次运行时自动安装 UI 依赖项
```

然后将 UI 指向您的网关 WS URL（例如 `ws://127.0.0.1:18789`）。

## 调试/测试：开发服务器 + 远程网关

控制界面是静态文件；WebSocket 目标是可配置的，可以
与 HTTP 来源不同。当您想要本地 Vite 开发服务器
但网关在其他地方运行时，这很方便。

1) 启动 UI 开发服务器：`pnpm ui:dev`
2) 打开类似这样的 URL：

```text
http://localhost:5173/?gatewayUrl=ws://<gateway-host>:18789
```

可选的一次性认证（如需要）：

```text
http://localhost:5173/?gatewayUrl=wss://<gateway-host>:18789&token=<gateway-token>
```

注意：
- `gatewayUrl` 在加载后存储在 localStorage 中并从 URL 中移除。
- `token` 存储在 localStorage 中；`password` 仅保留在内存中。
- 当网关位于 TLS 后面时（Tailscale Serve、HTTPS 代理等）使用 `wss://`。

远程访问设置详情：[远程访问](/gateway/remote)。