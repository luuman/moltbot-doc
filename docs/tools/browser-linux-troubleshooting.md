---
summary: "修复 Linux 上 Moltbot 浏览器控制的 Chrome/Brave/Edge/Chromium CDP 启动问题"
read_when: "Linux 上浏览器控制失败，尤其是 snap Chromium"
---

# 浏览器故障排除（Linux）

## 问题："Failed to start Chrome CDP on port 18800"

Moltbot 的浏览器控制服务器无法启动 Chrome/Brave/Edge/Chromium，并出现错误：
```
{"error":"Error: Failed to start Chrome CDP on port 18800 for profile \"clawd\"."}
```

### 根本原因

在 Ubuntu（和许多 Linux 发行版）上，默认的 Chromium 安装是 **snap 包**。Snap 的 AppArmor 限制干扰了 Moltbot 生成和监视浏览器进程的方式。

`apt install chromium` 命令安装一个重定向到 snap 的存根包：
```
Note, selecting 'chromium-browser' instead of 'chromium'
chromium-browser is already the newest version (2:1snap1-0ubuntu2).
```

这不是真正的浏览器 — 它只是一个包装器。

### 解决方案 1：安装 Google Chrome（推荐）

安装官方 Google Chrome `.deb` 包，它不受 snap 限制：

```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
sudo apt --fix-broken install -y  # 如果有依赖错误
```

然后更新您的 Moltbot 配置（`~/.clawdbot/moltbot.json`）：

```json
{
  "browser": {
    "enabled": true,
    "executablePath": "/usr/bin/google-chrome-stable",
    "headless": true,
    "noSandbox": true
  }
}
```

### 解决方案 2：使用 Snap Chromium 的仅附加模式

如果您必须使用 snap Chromium，请配置 Moltbot 以附加到手动启动的浏览器：

1. 更新配置：
```json
{
  "browser": {
    "enabled": true,
    "attachOnly": true,
    "headless": true,
    "noSandbox": true
  }
}
```

2. 手动启动 Chromium：
```bash
chromium-browser --headless --no-sandbox --disable-gpu \
  --remote-debugging-port=18800 \
  --user-data-dir=$HOME/.clawdbot/browser/clawd/user-data \
  about:blank &
```

3. 可选地创建一个 systemd 用户服务以自动启动 Chrome：
```ini
# ~/.config/systemd/user/clawd-browser.service
[Unit]
Description=Clawd Browser (Chrome CDP)
After=network.target

[Service]
ExecStart=/snap/bin/chromium --headless --no-sandbox --disable-gpu --remote-debugging-port=18800 --user-data-dir=%h/.clawdbot/browser/clawd/user-data about:blank
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
```

启用：`systemctl --user enable --now clawd-browser.service`

### 验证浏览器是否正常工作

检查状态：
```bash
curl -s http://127.0.0.1:18791/ | jq '{running, pid, chosenBrowser}'
```

测试浏览：
```bash
curl -s -X POST http://127.0.0.1:18791/start
curl -s http://127.0.0.1:18791/tabs
```

### 配置参考

| 选项 | 描述 | 默认值 |
|--------|-------------|---------|
| `browser.enabled` | 启用浏览器控制 | `true` |
| `browser.executablePath` | Chromium 系列浏览器二进制文件路径（Chrome/Brave/Edge/Chromium） | 自动检测（优先默认浏览器，当基于 Chromium 时） |
| `browser.headless` | 无 GUI 运行 | `false` |
| `browser.noSandbox` | 添加 `--no-sandbox` 标志（某些 Linux 设置需要） | `false` |
| `browser.attachOnly` | 不启动浏览器，仅附加到现有浏览器 | `false` |
| `browser.cdpPort` | Chrome DevTools Protocol 端口 | `18800` |

### 问题："Chrome extension relay is running, but no tab is connected"

您正在使用 `chrome` 配置文件（扩展中继）。它期望 Moltbot
浏览器扩展附加到一个活动标签页。

修复选项：
1. **使用托管浏览器：** `moltbot browser start --browser-profile clawd`
   （或设置 `browser.defaultProfile: "clawd"`）。
2. **使用扩展中继：** 安装扩展，打开标签页，然后点击
   Moltbot 扩展图标以附加它。

注意事项：
- `chrome` 配置文件尽可能使用您的 **系统默认 Chromium 浏览器**。
- 本地 `clawd` 配置文件自动分配 `cdpPort`/`cdpUrl`；仅对远程 CDP 设置这些。