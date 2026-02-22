---
summary: "Run Moltbot in a sandboxed macOS VM (local or hosted) when you need isolation or iMessage"
read_when:
  - You want Moltbot isolated from your main macOS environment
  - You want iMessage integration (BlueBubbles) in a sandbox
  - You want a resettable macOS environment you can clone
  - You want to compare local vs hosted macOS VM options
---

# Moltbot 上的 macOS VM (沙盒)

## 推荐默认值 (大多数用户)

- **小型 Linux VPS** 用于始终在线的网关和低成本。请参阅 [VPS 托管](/vps)。
- **专用硬件** (Mac mini 或 Linux 盒子) 如果您想要完全控制和用于浏览器自动化的**住宅 IP**。许多网站屏蔽数据中心 IP，因此本地浏览通常效果更好。
- **混合:** 将网关保留在便宜的 VPS 上，并在需要浏览器/UI 自动化时将您的 Mac 连接为**节点**。请参阅 [节点](/nodes) 和 [网关远程](/gateway/remote)。

当您特别需要仅 macOS 功能 (iMessage/BlueBubbles) 或希望与日常 Mac 严格隔离时，请使用 macOS VM。

## macOS VM 选项

### 在您的 Apple Silicon Mac 上的本地 VM (Lume)

使用 [Lume](https://cua.ai/docs/lume) 在您现有的 Apple Silicon Mac 上的沙盒 macOS VM 中运行 Moltbot。

这为您提供了:
- 隔离的完整 macOS 环境 (您的主机保持清洁)
- 通过 BlueBubbles 支持 iMessage (在 Linux/Windows 上不可能)
- 通过克隆 VM 即时重置
- 无额外硬件或云成本

### 托管 Mac 提供商 (云)

如果您希望在云端使用 macOS，托管 Mac 提供商也可以工作:
- [MacStadium](https://www.macstadium.com/) (托管 Mac)
- 其他托管 Mac 供应商也可以工作；遵循他们的 VM + SSH 文档

一旦您对 macOS VM 有 SSH 访问权限，请继续下面的第 6 步。

---

## 快速路径 (Lume，经验丰富的用户)

1. 安装 Lume
2. `lume create moltbot --os macos --ipsw latest`
3. 完成设置助手，启用远程登录 (SSH)
4. `lume run moltbot --no-display`
5. SSH 登录，安装 Moltbot，配置通道
6. 完成

---

## 您需要什么 (Lume)

- Apple Silicon Mac (M1/M2/M3/M4)
- 主机上的 macOS Sequoia 或更高版本
- 每个 VM 约 60 GB 可用磁盘空间
- 约 20 分钟

---

## 1) 安装 Lume

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/trycua/cua/main/libs/lume/scripts/install.sh)"
```

如果 `~/.local/bin` 不在您的 PATH 中:

```bash
echo 'export PATH="$PATH:$HOME/.local/bin"' >> ~/.zshrc && source ~/.zshrc
```

验证:

```bash
lume --version
```

文档: [Lume 安装](https://cua.ai/docs/lume/guide/getting-started/installation)

---

## 2) 创建 macOS VM

```bash
lume create moltbot --os macos --ipsw latest
```

这将下载 macOS 并创建 VM。VNC 窗口会自动打开。

注意: 下载可能需要一段时间，具体取决于您的连接。

---

## 3) 完成设置助手

在 VNC 窗口中:
1. 选择语言和地区
2. 跳过 Apple ID (或者如果您稍后想要 iMessage，请登录)
3. 创建用户帐户 (记住用户名和密码)
4. 跳过所有可选功能

设置完成后，启用 SSH:
1. 打开系统设置 → 通用 → 共享
2. 启用"远程登录"

---

## 4) 获取 VM 的 IP 地址

```bash
lume get moltbot
```

查找 IP 地址 (通常是 `192.168.64.x`)。

---

## 5) SSH 到 VM

```bash
ssh youruser@192.168.64.X
```

将 `youruser` 替换为您创建的帐户，并将 IP 替换为您的 VM 的 IP。

---

## 6) 安装 Moltbot

在 VM 内部:

```bash
npm install -g moltbot@latest
moltbot onboard --install-daemon
```

按照入门提示设置您的模型提供商 (Anthropic、OpenAI 等)。

---

## 7) 配置通道

编辑配置文件:

```bash
nano ~/.clawdbot/moltbot.json
```

添加您的通道:

```json
{
  "channels": {
    "whatsapp": {
      "dmPolicy": "allowlist",
      "allowFrom": ["+15551234567"]
    },
    "telegram": {
      "botToken": "YOUR_BOT_TOKEN"
    }
  }
}
```

然后登录 WhatsApp (扫描 QR):

```bash
moltbot channels login
```

---

## 8) 以无头模式运行 VM

停止 VM 并在无显示器的情况下重新启动:

```bash
lume stop moltbot
lume run moltbot --no-display
```

VM 在后台运行。Moltbot 的守护进程保持网关运行。

检查状态:

```bash
ssh youruser@192.168.64.X "moltbot status"
```

---

## 额外功能: iMessage 集成

这是在 macOS 上运行的杀手级功能。使用 [BlueBubbles](https://bluebubbles.app) 将 iMessage 添加到 Moltbot。

在 VM 内部:

1. 从 bluebubbles.app 下载 BlueBubbles
2. 使用您的 Apple ID 登录
3. 启用 Web API 并设置密码
4. 将 BlueBubbles webhook 指向您的网关 (示例: `https://your-gateway-host:3000/bluebubbles-webhook?password=<password>`)

添加到您的 Moltbot 配置:

```json
{
  "channels": {
    "bluebubbles": {
      "serverUrl": "http://localhost:1234",
      "password": "your-api-password",
      "webhookPath": "/bluebubbles-webhook"
    }
  }
}
```

重新启动网关。现在您的代理可以发送和接收 iMessage。

完整设置详情: [BlueBubbles 通道](/channels/bluebubbles)

---

## 保存黄金镜像

在进一步自定义之前，快照您的干净状态:

```bash
lume stop moltbot
lume clone moltbot moltbot-golden
```

随时重置:

```bash
lume stop moltbot && lume delete moltbot
lume clone moltbot-golden moltbot
lume run moltbot --no-display
```

---

## 24/7 运行

通过以下方式保持 VM 运行:
- 将您的 Mac 插入电源
- 在系统设置 → 能源节约器中禁用睡眠
- 如有必要使用 `caffeinate`

对于真正的始终在线，请考虑专用 Mac mini 或小型 VPS。请参阅 [VPS 托管](/vps)。

---

## 故障排除

| 问题 | 解决方案 |
|---------|----------|
| 无法 SSH 到 VM | 检查 VM 系统设置中是否启用了"远程登录" |
| VM IP 不显示 | 等待 VM 完全启动，再次运行 `lume get moltbot` |
| Lume 命令未找到 | 将 `~/.local/bin` 添加到您的 PATH |
| WhatsApp QR 无法扫描 | 确保您在运行 `moltbot channels login` 时登录到 VM (而不是主机) |

---

## 相关文档

- [VPS 托管](/vps)
- [节点](/nodes)
- [网关远程](/gateway/remote)
- [BlueBubbles 通道](/channels/bluebubbles)
- [Lume 快速入门](https://cua.ai/docs/lume/guide/getting-started/quickstart)
- [Lume CLI 参考](https://cua.ai/docs/lume/reference/cli-reference)
- [无人值守 VM 设置](https://cua.ai/docs/lume/guide/fundamentals/unattended-setup) (高级)
- [Docker 沙盒](/install/docker) (替代隔离方法)