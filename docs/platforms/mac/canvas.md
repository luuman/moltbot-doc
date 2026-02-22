---
summary: "通过 WKWebView + 自定义 URL 方案嵌入的代理控制画布面板"
read_when:
  - 实现 macOS Canvas 面板
  - 为视觉工作区添加代理控制
  - 调试 WKWebView canvas 加载
---
# Canvas (macOS 应用)

macOS 应用使用 `WKWebView` 嵌入代理控制的**Canvas 面板**。这是一个用于 HTML/CSS/JS、A2UI 和小型交互式 UI 界面的轻量级视觉工作区。

## Canvas 的位置

Canvas 状态存储在应用程序支持目录下：

- `~/Library/Application Support/Moltbot/canvas/<session>/...`

Canvas 面板通过**自定义 URL 方案**提供这些文件：

- `moltbot-canvas://<session>/<path>`

示例：
- `moltbot-canvas://main/` → `<canvasRoot>/main/index.html`
- `moltbot-canvas://main/assets/app.css` → `<canvasRoot>/main/assets/app.css`
- `moltbot-canvas://main/widgets/todo/` → `<canvasRoot>/main/widgets/todo/index.html`

如果根目录下没有 `index.html`，应用会显示**内置脚手架页面**。

## 面板行为

- 无边框、可调整大小的面板，锚定在菜单栏附近（或鼠标光标）。
- 每个会话记住大小/位置。
- 当本地 canvas 文件更改时自动重新加载。
- 一次只显示一个 Canvas 面板（会话根据需要切换）。

Canvas 可以从设置 → **允许 Canvas** 禁用。禁用时，canvas 节点命令返回 `CANVAS_DISABLED`。

## 代理 API 表面

Canvas 通过**网关 WebSocket** 暴露，因此代理可以：

- 显示/隐藏面板
- 导航到路径或 URL
- 评估 JavaScript
- 捕获快照图像

CLI 示例：

```bash
moltbot nodes canvas present --node <id>
moltbot nodes canvas navigate --node <id> --url "/"
moltbot nodes canvas eval --node <id> --js "document.title"
moltbot nodes canvas snapshot --node <id>
```

注意事项：
- `canvas.navigate` 接受**本地 canvas 路径**、`http(s)` URL 和 `file://` URL。
- 如果您传递 `"/"`，Canvas 会显示本地脚手架或 `index.html`。

## Canvas 中的 A2UI

A2UI 由网关 Canvas 主机托管并在 Canvas 面板内渲染。当网关广告 Canvas 主机时，macOS 应用在首次打开时自动导航到 A2UI 主机页面。

默认 A2UI 主机 URL：

```
http://<gateway-host>:18793/__moltbot__/a2ui/
```

### A2UI 命令 (v0.8)

Canvas 当前接受**A2UI v0.8** 服务器→客户端消息：

- `beginRendering`
- `surfaceUpdate`
- `dataModelUpdate`
- `deleteSurface`

`createSurface` (v0.9) 不受支持。

CLI 示例：

```bash
cat > /tmp/a2ui-v0.8.jsonl <<'EOFA2'
{"surfaceUpdate":{"surfaceId":"main","components":[{"id":"root","component":{"Column":{"children":{"explicitList":["title","content"]}}}},{"id":"title","component":{"Text":{"text":{"literalString":"Canvas (A2UI v0.8)"},"usageHint":"h1"}}},{"id":"content","component":{"Text":{"text":{"literalString":"If you can read this, A2UI push works."},"usageHint":"body"}}}]}}
{"beginRendering":{"surfaceId":"main","root":"root"}}
EOFA2

moltbot nodes canvas a2ui push --jsonl /tmp/a2ui-v0.8.jsonl --node <id>
```

快速测试：

```bash
moltbot nodes canvas a2ui push --node <id> --text "Hello from AUI"
```

## 从 Canvas 触发代理运行

Canvas 可以通过深度链接触发新的代理运行：

- `moltbot://agent?...`

示例（在 JS 中）：

```js
window.location.href = "moltbot://agent?message=Review%20this%20design";
```

应用会提示确认，除非提供了有效的密钥。

## 安全说明

- Canvas 方案阻止目录遍历；文件必须位于会话根目录下。
- 本地 Canvas 内容使用自定义方案（不需要回环服务器）。
- 外部 `http(s)` URL 仅在显式导航时允许。