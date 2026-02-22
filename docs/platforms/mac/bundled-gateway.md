---
summary: "macOS 上的网关运行时（外部 launchd 服务）"
read_when:
  - 打包 Moltbot.app
  - 调试 macOS 网关 launchd 服务
  - 为 macOS 安装网关 CLI
---

# macOS 上的网关（外部 launchd）

Moltbot.app 不再捆绑 Node/Bun 或网关运行时。macOS 应用期望**外部**的 `moltbot` CLI 安装，不会作为子进程生成网关，
并管理一个每用户 launchd 服务以保持网关运行（或者如果已有运行的本地网关，则附加到现有的网关）。

## 安装 CLI（本地模式必需）

您需要在 Mac 上安装 Node 22+，然后全局安装 `moltbot`：

```bash
npm install -g moltbot@<version>
```

macOS 应用的**安装 CLI** 按钮通过 npm/pnpm 运行相同的流程（不推荐在网关运行时使用 bun）。

## Launchd（网关作为 LaunchAgent）

标签：
- `bot.molt.gateway`（或 `bot.molt.<profile>`；遗留的 `com.clawdbot.*` 可能仍然存在）

Plist 位置（每用户）：
- `~/Library/LaunchAgents/bot.molt.gateway.plist`
  （或 `~/Library/LaunchAgents/bot.molt.<profile>.plist`）

管理器：
- macOS 应用在本地模式下拥有 LaunchAgent 安装/更新。
- CLI 也可以安装它：`moltbot gateway install`。

行为：
- "Moltbot Active" 启用/禁用 LaunchAgent。
- 应用退出**不会**停止网关（launchd 保持其运行）。
- 如果在配置的端口上已有网关运行，应用会附加到它而不是启动新的网关。

日志记录：
- launchd stdout/err: `/tmp/moltbot/moltbot-gateway.log`

## 版本兼容性

macOS 应用检查网关版本与其自身版本。如果它们不兼容，请更新全局 CLI 以匹配应用版本。

## 基本检查

```bash
moltbot --version

CLAWDBOT_SKIP_CHANNELS=1 \
CLAWDBOT_SKIP_CANVAS_HOST=1 \
moltbot gateway --port 18999 --bind loopback
```

然后：

```bash
moltbot gateway call health --url ws://127.0.0.1:18999 --timeout 3000
```