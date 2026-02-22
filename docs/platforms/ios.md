---
summary: "iOS node app: connect to the Gateway, pairing, canvas, and troubleshooting"
read_when:
  - Pairing or reconnecting the iOS node
  - Running the iOS app from source
  - Debugging gateway discovery or canvas commands
---
# iOS 应用 (节点)

可用性: 内部预览。iOS 应用尚未公开分发。

## 它的功能

- 通过 WebSocket 连接到网关 (局域网或尾网)。
- 暴露节点功能: Canvas、屏幕快照、相机捕捉、位置、通话模式、语音唤醒。
- 接收 `node.invoke` 命令并报告节点状态事件。

## 要求

- 在另一台设备上运行的网关 (macOS、Linux 或通过 WSL2 的 Windows)。
- 网络路径:
  - 通过 Bonjour 的同一局域网，**或**
  - 通过单播 DNS-SD (`moltbot.internal.`) 的尾网，**或**
  - 手动主机/端口 (备用)。

## 快速开始 (配对 + 连接)

1) 启动网关:

```bash
moltbot gateway --port 18789
```

2) 在 iOS 应用中，打开设置并选择一个发现的网关 (或启用手动主机并输入主机/端口)。

3) 在网关主机上批准配对请求:

```bash
moltbot nodes pending
moltbot nodes approve <requestId>
```

4) 验证连接:

```bash
moltbot nodes status
moltbot gateway call node.list --params "{}"
```

## 发现路径

### Bonjour (局域网)

网关在 `local.` 上广播 `_moltbot._tcp`。iOS 应用自动列出这些。

### 尾网 (跨网络)

如果 mDNS 被阻止，请使用单播 DNS-SD 区域 (推荐域名: `moltbot.internal.`) 和 Tailscale 分割 DNS。
请参阅 [Bonjour](/gateway/bonjour) 的 CoreDNS 示例。

### 手动主机/端口

在设置中，启用**手动主机**并输入网关主机 + 端口 (默认 `18789`)。

## Canvas + A2UI

iOS 节点渲染 WKWebView canvas。使用 `node.invoke` 来驱动它:

```bash
moltbot nodes invoke --node "iOS Node" --command canvas.navigate --params '{"url":"http://<gateway-host>:18793/__moltbot__/canvas/"}'
```

说明:
- 网关 canvas 主机提供 `/__moltbot__/canvas/` 和 `/__moltbot__/a2ui/`。
- 当宣传 canvas 主机 URL 时，iOS 节点在连接时自动导航到 A2UI。
- 使用 `canvas.navigate` 和 `{"url":""}` 返回内置脚手架。

### Canvas eval / snapshot

```bash
moltbot nodes invoke --node "iOS Node" --command canvas.eval --params '{"javaScript":"(() => { const {ctx} = window.__moltbot; ctx.clearRect(0,0,innerWidth,innerHeight); ctx.lineWidth=6; ctx.strokeStyle=\"#ff2d55\"; ctx.beginPath(); ctx.moveTo(40,40); ctx.lineTo(innerWidth-40, innerHeight-40); ctx.stroke(); return \"ok\"; })()"}'
```

```bash
moltbot nodes invoke --node "iOS Node" --command canvas.snapshot --params '{"maxWidth":900,"format":"jpeg"}'
```

## 语音唤醒 + 通话模式

- 语音唤醒和通话模式可在设置中使用。
- iOS 可能会暂停后台音频；当应用未激活时，将语音功能视为尽力而为。

## 常见错误

- `NODE_BACKGROUND_UNAVAILABLE`: 将 iOS 应用带到前台 (canvas/相机/屏幕命令需要它)。
- `A2UI_HOST_NOT_CONFIGURED`: 网关未宣传 canvas 主机 URL；检查 [网关配置](/gateway/configuration) 中的 `canvasHost`。
- 配对提示从未出现: 运行 `moltbot nodes pending` 并手动批准。
- 重新安装后重新连接失败: Keychain 配对令牌已清除；重新配对节点。

## 相关文档

- [配对](/gateway/pairing)
- [发现](/gateway/discovery)
- [Bonjour](/gateway/bonjour)