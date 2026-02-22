---
summary: "`moltbot browser` 的 CLI 参考（配置文件、标签页、操作、扩展中继）"
read_when:
  - 您使用 `moltbot browser` 并希望获得常见任务的示例
  - 您希望通过节点主机控制另一台机器上运行的浏览器
  - 您想使用 Chrome 扩展中继（通过工具栏按钮附加/分离）
---

# `moltbot browser`

管理 Moltbot 的浏览器控制服务器并运行浏览器操作（标签页、快照、截图、导航、点击、输入）。

相关：
- 浏览器工具 + API: [浏览器工具](/tools/browser)
- Chrome 扩展中继: [Chrome 扩展](/tools/chrome-extension)

## 常用标志

- `--url <gatewayWsUrl>`: 网关 WebSocket URL（默认为配置）。
- `--token <token>`: 网关令牌（如果需要）。
- `--timeout <ms>`: 请求超时（毫秒）。
- `--browser-profile <name>`: 选择浏览器配置文件（来自配置的默认值）。
- `--json`: 机器可读输出（在支持的情况下）。

## 快速开始（本地）

```bash
moltbot browser --browser-profile chrome tabs
moltbot browser --browser-profile clawd start
moltbot browser --browser-profile clawd open https://example.com
moltbot browser --browser-profile clawd snapshot
```

## 配置文件

配置文件是命名的浏览器路由配置。实际上：
- `clawd`: 启动/附加到专用的 Moltbot 管理的 Chrome 实例（隔离的用户数据目录）。
- `chrome`: 通过 Chrome 扩展中继控制您现有的 Chrome 标签页。

```bash
moltbot browser profiles
moltbot browser create-profile --name work --color "#FF5A36"
moltbot browser delete-profile --name work
```

使用特定配置文件：

```bash
moltbot browser --browser-profile work tabs
```

## 标签页

```bash
moltbot browser tabs
moltbot browser open https://docs.molt.bot
moltbot browser focus <targetId>
moltbot browser close <targetId>
```

## 快照 / 截图 / 操作

快照：

```bash
moltbot browser snapshot
```

截图：

```bash
moltbot browser screenshot
```

导航/点击/输入（基于引用的 UI 自动化）：

```bash
moltbot browser navigate https://example.com
moltbot browser click <ref>
moltbot browser type <ref> "hello"
```

## Chrome 扩展中继（通过工具栏按钮附加）

此模式允许智能体控制您手动附加的现有 Chrome 标签页（不会自动附加）。

将未打包的扩展安装到稳定路径：

```bash
moltbot browser extension install
moltbot browser extension path
```

然后 Chrome → `chrome://extensions` → 启用"开发者模式" → "加载已解压的扩展程序" → 选择打印的文件夹。

完整指南: [Chrome 扩展](/tools/chrome-extension)

## 远程浏览器控制（节点主机代理）

如果网关在与浏览器不同的机器上运行，请在具有 Chrome/Brave/Edge/Chromium 的机器上运行**节点主机**。网关将把浏览器操作代理到该节点（不需要单独的浏览器控制服务器）。

使用 `gateway.nodes.browser.mode` 来控制自动路由，使用 `gateway.nodes.browser.node` 来固定特定节点（如果有多个连接）。

安全性 + 远程设置: [浏览器工具](/tools/browser), [远程访问](/gateway/remote), [Tailscale](/gateway/tailscale), [安全性](/gateway/security)
