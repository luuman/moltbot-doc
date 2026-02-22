---
summary: "Moltbot macOS companion app (menu bar + gateway broker)"
read_when:
  - Implementing macOS app features
  - Changing gateway lifecycle or node bridging on macOS
---
# Moltbot macOS 伴侣 (菜单栏 + 网关代理)

macOS 应用是 Moltbot 的**菜单栏伴侣**。它拥有权限，
管理/连接到本地网关(启动项或手动)，并将 macOS 功能
作为节点暴露给代理。

## 它的功能

- 在菜单栏中显示原生通知和状态。
- 拥有 TCC 提示 (通知、辅助功能、屏幕录制、麦克风、
  语音识别、自动化/AppleScript)。
- 运行或连接到网关(本地或远程)。
- 暴露仅 macOS 的工具 (Canvas、相机、屏幕录制、`system.run`)。
- 在**远程**模式下启动本地节点主机服务(启动项)，并在**本地**模式下停止它。
- 可选地托管**PeekabooBridge**用于 UI 自动化。
- 根据请求通过 npm/pnpm 安装全局 CLI (`moltbot`)(不推荐在网关运行时使用 bun)。

## 本地与远程模式

- **本地**(默认): 如果存在，应用连接到正在运行的本地网关；
  否则它通过 `moltbot gateway install` 启用启动项服务。
- **远程**: 应用通过 SSH/Tailscale 连接到网关，从不启动
  本地进程。
  应用启动本地**节点主机服务**，以便远程网关可以访问此 Mac。
应用不会将网关作为子进程生成。

## Launchd 控制

应用管理一个标记为 `bot.molt.gateway` 的每用户 LaunchAgent
(或使用 `--profile`/`CLAWDBOT_PROFILE` 时为 `bot.molt.<profile>`；遗留的 `com.clawdbot.*` 仍会卸载)。

```bash
launchctl kickstart -k gui/$UID/bot.molt.gateway
launchctl bootout gui/$UID/bot.molt.gateway
```

运行命名配置文件时将标签替换为 `bot.molt.<profile>`。

如果 LaunchAgent 未安装，请从应用启用它或运行
`moltbot gateway install`。

## 节点功能 (mac)

macOS 应用将自己呈现为一个节点。常用命令:

- Canvas: `canvas.present`, `canvas.navigate`, `canvas.eval`, `canvas.snapshot`, `canvas.a2ui.*`
- 相机: `camera.snap`, `camera.clip`
- 屏幕: `screen.record`
- 系统: `system.run`, `system.notify`

节点报告一个 `permissions` 映射，以便代理可以决定什么是允许的。

节点服务 + 应用 IPC:
- 当无头节点主机服务运行时(远程模式)，它作为节点连接到网关 WS。
- `system.run` 通过本地 Unix 套接字在 macOS 应用(UI/TCC 上下文)中执行；提示 + 输出保留在应用内。

图表 (SCI):
```
网关 -> 节点服务 (WS)
                 |  IPC (UDS + 令牌 + HMAC + TTL)
                 v
             Mac 应用 (UI + TCC + system.run)
```

## 执行批准 (system.run)

`system.run` 由 macOS 应用中的**执行批准**控制(设置 → 执行批准)。
安全 + 询问 + 白名单存储在 Mac 本地:

```
~/.clawdbot/exec-approvals.json
```

示例:

```json
{
  "version": 1,
  "defaults": {
    "security": "deny",
    "ask": "on-miss"
  },
  "agents": {
    "main": {
      "security": "allowlist",
      "ask": "on-miss",
      "allowlist": [
        { "pattern": "/opt/homebrew/bin/rg" }
      ]
    }
  }
}
```

说明:
- `allowlist` 条目是解析二进制文件路径的 glob 模式。
- 在提示中选择"始终允许"将该命令添加到白名单。
- `system.run` 环境覆盖被过滤(丢弃 `PATH`, `DYLD_*`, `LD_*`, `NODE_OPTIONS`, `PYTHON*`, `PERL*`, `RUBYOPT`)然后与应用的环境合并。

## 深度链接

应用注册 `moltbot://` URL 方案用于本地操作。

### `moltbot://agent`

触发网关 `agent` 请求。

```bash
open 'moltbot://agent?message=Hello%20from%20deep%20link'
```

查询参数:
- `message` (必需)
- `sessionKey` (可选)
- `thinking` (可选)
- `deliver` / `to` / `channel` (可选)
- `timeoutSeconds` (可选)
- `key` (可选无人值守模式密钥)

安全性:
- 没有 `key`，应用提示确认。
- 有有效的 `key`，运行是无人值守的(用于个人自动化)。

## 入门流程 (典型)

1) 安装并启动**Moltbot.app**。
2) 完成权限检查表(TCC 提示)。
3) 确保**本地**模式处于活动状态并且网关正在运行。
4) 如果您想要终端访问，请安装 CLI。

## 构建和开发工作流 (原生)

- `cd apps/macos && swift build`
- `swift run Moltbot` (或 Xcode)
- 打包应用: `scripts/package-mac-app.sh`

## 调试网关连接 (macOS CLI)

使用调试 CLI 来执行 macOS 应用使用的相同网关 WebSocket 握手和发现
逻辑，而无需启动应用。

```bash
cd apps/macos
swift run moltbot-mac connect --json
swift run moltbot-mac discover --timeout 3000 --json
```

连接选项:
- `--url <ws://host:port>`: 覆盖配置
- `--mode <local|remote>`: 从配置解析(默认: 配置或本地)
- `--probe`: 强制新的健康探测
- `--timeout <ms>`: 请求超时(默认: `15000`)
- `--json`: 用于差异比较的结构化输出

发现选项:
- `--include-local`: 包含会被过滤为"本地"的网关
- `--timeout <ms>`: 整体发现窗口(默认: `2000`)
- `--json`: 用于差异比较的结构化输出

提示: 与 `moltbot gateway discover --json` 进行比较，以查看
macOS 应用的发现管道(NWBrowser + tailnet DNS‑SD 回退)是否与
Node CLI 基于 `dns-sd` 的发现不同。

## 远程连接管道 (SSH 隧道)

当 macOS 应用在**远程**模式下运行时，它打开一个 SSH 隧道，
以便本地 UI 组件可以像在 localhost 上一样与远程网关通信。

### 控制隧道 (网关 WebSocket 端口)
- **目的:** 健康检查、状态、网络聊天、配置和其他控制平面调用。
- **本地端口:** 网关端口(默认 `18789`)，始终稳定。
- **远程端口:** 远程主机上的相同网关端口。
- **行为:** 无随机本地端口；应用重用现有的健康隧道
  或在需要时重新启动它。
- **SSH 形状:** `ssh -N -L <local>:127.0.0.1:<remote>` 与 BatchMode +
  ExitOnForwardFailure + keepalive 选项。
- **IP 报告:** SSH 隧道使用回环，所以网关将看到节点
  IP 为 `127.0.0.1`。如果您希望出现真实的客户端
  IP，请使用**直连(ws/wss)** 传输(参见 [macOS 远程访问](/platforms/mac/remote))。

有关设置步骤，请参见 [macOS 远程访问](/platforms/mac/remote)。有关协议
详情，请参见 [网关协议](/gateway/protocol)。

## 相关文档

- [网关操作手册](/gateway)
- [网关 (macOS)](/platforms/mac/bundled-gateway)
- [macOS 权限](/platforms/mac/permissions)
- [Canvas](/platforms/mac/canvas)