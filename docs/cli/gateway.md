---
summary: "Moltbot 网关 CLI (`moltbot gateway`) — 运行、查询和发现网关"
read_when:
  - 从 CLI 运行网关（开发或服务器）
  - 调试网关认证、绑定模式和连接性
  - 通过 Bonjour（局域网 + tailnet）发现网关
---

# 网关 CLI

网关是 Moltbot 的 WebSocket 服务器（通道、节点、会话、钩子）。

本页中的子命令位于 `moltbot gateway …` 下。

相关文档：
- [/gateway/bonjour](/gateway/bonjour)
- [/gateway/discovery](/gateway/discovery)
- [/gateway/configuration](/gateway/configuration)

## 运行网关

运行本地网关进程：

```bash
moltbot gateway
```

前台别名：

```bash
moltbot gateway run
```

注意事项：
- 默认情况下，除非在 `~/.clawdbot/moltbot.json` 中设置了 `gateway.mode=local`，否则网关拒绝启动。对于临时/开发运行，请使用 `--allow-unconfigured`。
- 在没有认证的情况下绑定到回环之外被阻止（安全护栏）。
- `SIGUSR1` 在授权时触发进程内重启（启用 `commands.restart` 或使用网关工具/配置应用/更新）。
- `SIGINT`/`SIGTERM` 处理程序停止网关进程，但它们不会恢复任何自定义终端状态。如果您用 TUI 或原始模式输入包装 CLI，请在退出前恢复终端。

### 选项

- `--port <port>`: WebSocket 端口（默认来自配置/env；通常为 `18789`）。
- `--bind <loopback|lan|tailnet|auto|custom>`: 监听器绑定模式。
- `--auth <token|password>`: 认证模式覆盖。
- `--token <token>`: 令牌覆盖（也为进程设置 `CLAWDBOT_GATEWAY_TOKEN`）。
- `--password <password>`: 密码覆盖（也为进程设置 `CLAWDBOT_GATEWAY_PASSWORD`）。
- `--tailscale <off|serve|funnel>`: 通过 Tailscale 暴露网关。
- `--tailscale-reset-on-exit`: 关闭时重置 Tailscale serve/funnel 配置。
- `--allow-unconfigured`: 允许在配置中没有 `gateway.mode=local` 时启动网关。
- `--dev`: 如果缺少，则创建开发配置 + 工作空间（跳过 BOOTSTRAP.md）。
- `--reset`: 重置开发配置 + 凭据 + 会话 + 工作空间（需要 `--dev`）。
- `--force`: 启动前杀死选定端口上的任何现有监听器。
- `--verbose`: 详细日志。
- `--claude-cli-logs`: 仅在控制台显示 claude-cli 日志（并启用其标准输出/标准错误）。
- `--ws-log <auto|full|compact>`: websocket 日志样式（默认 `auto`）。
- `--compact`: `--ws-log compact` 的别名。
- `--raw-stream`: 将原始模型流事件记录到 jsonl。
- `--raw-stream-path <path>`: 原始流 jsonl 路径。

## 查询正在运行的网关

所有查询命令都使用 WebSocket RPC。

输出模式：
- 默认：人类可读（TTY 中着色）。
- `--json`: 机器可读 JSON（无样式/旋转器）。
- `--no-color`（或 `NO_COLOR=1`）：禁用 ANSI，同时保持人类布局。

共享选项（在支持的情况下）：
- `--url <url>`: 网关 WebSocket URL。
- `--token <token>`: 网关令牌。
- `--password <password>`: 网关密码。
- `--timeout <ms>`: 超时/预算（因命令而异）。
- `--expect-final`: 等待"最终"响应（智能体调用）。

### `gateway health`

```bash
moltbot gateway health --url ws://127.0.0.1:18789
```

### `gateway status`

`gateway status` 显示网关服务（launchd/systemd/schtasks）加上可选的 RPC 探测。

```bash
moltbot gateway status
moltbot gateway status --json
```

选项：
- `--url <url>`: 覆盖探测 URL。
- `--token <token>`: 探测的令牌认证。
- `--password <password>`: 探测的密码认证。
- `--timeout <ms>`: 探测超时（默认 `10000`）。
- `--no-probe`: 跳过 RPC 探测（仅服务视图）。
- `--deep`: 也扫描系统级服务。

### `gateway probe`

`gateway probe` 是"调试一切"命令。它总是探测：
- 您配置的远程网关（如果设置），以及
- 本地主机（回环）**即使配置了远程**。

如果可以访问多个网关，它会打印所有网关。当您使用隔离配置文件/端口时（例如，救援机器人），支持多个网关，但大多数安装仍然运行单个网关。

```bash
moltbot gateway probe
moltbot gateway probe --json
```

#### 通过 SSH 远程（Mac 应用对等）

macOS 应用"通过 SSH 远程"模式使用本地端口转发，因此远程网关（可能仅绑定到回环）在 `ws://127.0.0.1:<port>` 变得可访问。

CLI 等效：

```bash
moltbot gateway probe --ssh user@gateway-host
```

选项：
- `--ssh <target>`: `user@host` 或 `user@host:port`（端口默认为 `22`）。
- `--ssh-identity <path>`: 身份文件。
- `--ssh-auto`: 选择第一个发现的网关主机作为 SSH 目标（仅 LAN/WAB）。

配置（可选，用作默认值）：
- `gateway.remote.sshTarget`
- `gateway.remote.sshIdentity`

### `gateway call <method>`

低级 RPC 助手。

```bash
moltbot gateway call status
moltbot gateway call logs.tail --params '{"sinceMs": 60000}'
```

## 管理网关服务

```bash
moltbot gateway install
moltbot gateway start
moltbot gateway stop
moltbot gateway restart
moltbot gateway uninstall
```

注意事项：
- `gateway install` 支持 `--port`、`--runtime`、`--token`、`--force`、`--json`。
- 生命周期命令接受 `--json` 用于脚本。

## 发现网关（Bonjour）

`gateway discover` 扫描网关信标（`_moltbot-gw._tcp`）。

- 多播 DNS-SD：`local.`
- 单播 DNS-SD（广域 Bonjour）：`moltbot.internal.`（需要拆分 DNS + DNS 服务器；参见 [/gateway/bonjour](/gateway/bonjour)）

只有启用了 Bonjour 发现的网关（默认）才广告信标。

广域发现记录包括（TXT）：
- `role`（网关角色提示）
- `transport`（传输提示，例如 `gateway`）
- `gatewayPort`（WebSocket 端口，通常为 `18789`）
- `sshPort`（SSH 端口；如果不存在，默认为 `22`）
- `tailnetDns`（MagicDNS 主机名，可用时）
- `gatewayTls` / `gatewayTlsSha256`（TLS 启用 + 证书指纹）
- `cliPath`（远程安装的可选提示）

### `gateway discover`

```bash
moltbot gateway discover
```

选项：
- `--timeout <ms>`: 每个命令超时（浏览/解析）；默认 `2000`。
- `--json`: 机器可读输出（也禁用样式/旋转器）。

示例：

```bash
moltbot gateway discover --timeout 4000
moltbot gateway discover --json | jq '.beacons[].wsUrl'
```