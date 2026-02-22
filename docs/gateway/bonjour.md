---
summary: "Bonjour/mDNS 发现 + 调试（网关信标、客户端和常见故障模式）"
read_when:
  - 调试 macOS/iOS 上的 Bonjour 发现问题
  - 更改 mDNS 服务类型、TXT 记录或发现用户体验
---
# Bonjour / mDNS 发现

Moltbot 使用 Bonjour (mDNS / DNS‑SD) 作为 **仅局域网的便利方式** 来发现
活动网关（WebSocket 端点）。这是尽力而为的，**不会** 替代基于 SSH 或
Tailnet 的连接。

## 通过 Tailscale 的广域 Bonjour（单播 DNS‑SD）

如果节点和网关在不同的网络上，多播 mDNS 不会跨越
边界。您可以通过切换到通过 Tailscale 的 **单播 DNS‑SD**
（"广域 Bonjour"）来保持相同的发现用户体验。

高级步骤：

1) 在网关主机上运行 DNS 服务器（可通过 Tailnet 访问）。
2) 在专用区域下发布 `_moltbot-gw._tcp` 的 DNS‑SD 记录
   （示例：`moltbot.internal.`）。
3) 配置 Tailscale **分段 DNS**，使 `moltbot.internal` 通过该
   DNS 服务器为客户端（包括 iOS）解析。

Moltbot 在这种模式下标准化使用 `moltbot.internal.`。iOS/Android 节点
自动浏览 `local.` 和 `moltbot.internal.`。

### 网关配置（推荐）

```json5
{
  gateway: { bind: "tailnet" }, // 仅 tailnet（推荐）
  discovery: { wideArea: { enabled: true } } // 启用 moltbot.internal DNS-SD 发布
}
```

### 一次性 DNS 服务器设置（网关主机）

```bash
moltbot dns setup --apply
```

这将安装 CoreDNS 并配置它：
- 仅在网关的 Tailscale 接口上监听端口 53
- 从 `~/.clawdbot/dns/moltbot.internal.db` 服务 `moltbot.internal.`

从连接到 tailnet 的机器上验证：

```bash
dns-sd -B _moltbot-gw._tcp moltbot.internal.
dig @<TAILNET_IPV4> -p 53 _moltbot-gw._tcp.clawdbot.internal PTR +short
```

### Tailscale DNS 设置

在 Tailscale 管理控制台中：

- 添加指向网关 tailnet IP 的域名服务器（UDP/TCP 53）。
- 添加分段 DNS，使域名 `moltbot.internal` 使用该域名服务器。

一旦客户端接受 tailnet DNS，iOS 节点就可以在 `moltbot.internal.` 中浏览
`_moltbot-gw._tcp` 而无需多播。

### 网关监听器安全性（推荐）

网关 WS 端口（默认 `18789`）默认绑定到环回地址。对于 LAN/tailnet
访问，明确绑定并保持认证启用。

对于仅 tailnet 设置：
- 在 `~/.clawdbot/moltbot.json` 中设置 `gateway.bind: "tailnet"`。
- 重启网关（或重启 macOS 菜单栏应用）。

## 什么进行广播

只有网关广播 `_moltbot-gw._tcp`。

## 服务类型

- `_moltbot-gw._tcp` — 网关传输信标（由 macOS/iOS/Android 节点使用）。

## TXT 键（非秘密提示）

网关广播小型非秘密提示以使 UI 流程更方便：

- `role=gateway`
- `displayName=<友好名称>`
- `lanHost=<主机名>.local`
- `gatewayPort=<端口>`（网关 WS + HTTP）
- `gatewayTls=1`（仅在启用 TLS 时）
- `gatewayTlsSha256=<sha256>`（仅在启用 TLS 且指纹可用时）
- `canvasPort=<端口>`（仅在启用画布主机时；默认 `18793`）
- `sshPort=<端口>`（未覆盖时默认为 22）
- `transport=gateway`
- `cliPath=<路径>`（可选；可运行 `moltbot` 入口点的绝对路径）
- `tailnetDns=<magicdns>`（可用时的可选提示）

## 在 macOS 上调试

有用的内置工具：

- 浏览实例：
  ```bash
  dns-sd -B _moltbot-gw._tcp local.
  ```
- 解析一个实例（替换 `<instance>`）：
  ```bash
  dns-sd -L "<instance>" _moltbot-gw._tcp local.
  ```

如果浏览工作但解析失败，通常会遇到 LAN 策略或
mDNS 解析器问题。

## 在网关日志中调试

网关写入滚动日志文件（在启动时打印为
`gateway log file: ...`）。查找 `bonjour:` 行，特别是：

- `bonjour: advertise failed ...`
- `bonjour: ... name conflict resolved` / `hostname conflict resolved`
- `bonjour: watchdog detected non-announced service ...`

## 在 iOS 节点上调试

iOS 节点使用 `NWBrowser` 来发现 `_moltbot-gw._tcp`。

要捕获日志：
- 设置 → 网关 → 高级 → **发现调试日志**
- 设置 → 网关 → 高级 → **发现日志** → 复现 → **复制**

日志包括浏览器状态转换和结果集更改。

## 常见故障模式

- **Bonjour 不跨网络**：使用 Tailnet 或 SSH。
- **多播被阻止**：某些 Wi‑Fi 网络禁用 mDNS。
- **睡眠 / 接口波动**：macOS 可能暂时丢弃 mDNS 结果；重试。
- **浏览工作但解析失败**：保持机器名称简单（避免表情符号或
  标点符号），然后重启网关。服务实例名称来自
  主机名，因此过于复杂的名称可能会混淆某些解析器。

## 转义的实例名称 (`\032`)

Bonjour/DNS‑SD 经常将服务实例名称中的字节转义为十进制 `\DDD`
序列（例如空格变成 `\032`）。

- 这在协议级别是正常的。
- UI 应解码以显示（iOS 使用 `BonjourEscapes.decode`）。

## 禁用 / 配置

- `CLAWDBOT_DISABLE_BONJOUR=1` 禁用广播。
- `~/.clawdbot/moltbot.json` 中的 `gateway.bind` 控制网关绑定模式。
- `CLAWDBOT_SSH_PORT` 覆盖在 TXT 中广播的 SSH 端口。
- `CLAWDBOT_TAILNET_DNS` 在 TXT 中发布 MagicDNS 提示。
- `CLAWDBOT_CLI_PATH` 覆盖广播的 CLI 路径。

## 相关文档

- 发现策略和传输选择：[发现](/gateway/discovery)
- 节点配对 + 批准：[网关配对](/gateway/pairing)
