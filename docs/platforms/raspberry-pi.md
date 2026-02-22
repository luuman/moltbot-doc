---
summary: "树莓派上的 Moltbot（经济实惠的自托管设置）"
read_when:
  - 在树莓派上设置 Moltbot
  - 在 ARM 设备上运行 Moltbot
  - 构建便宜的 24/7 运行的个人 AI
---

# 树莓派上的 Moltbot

## 目标

在树莓派上运行一个持久的、始终在线的 Moltbot 网关，**~$35-80** 一次性成本（无月费）。

非常适合：
- 24/7 个人 AI 助手
- 家庭自动化中心
- 低功耗、始终可用的 Telegram/WhatsApp 机器人

## 硬件要求

| Pi 型号 | RAM | 是否可用? | 注释 |
|----------|-----|--------|-------|
| **Pi 5** | 4GB/8GB | ✅ 最佳 | 最快，推荐 |
| **Pi 4** | 4GB | ✅ 良好 | 大多数用户的理想选择 |
| **Pi 4** | 2GB | ✅ 可以 | 可用，添加交换空间 |
| **Pi 4** | 1GB | ⚠️ 紧张 | 可能需要交换空间，最小配置 |
| **Pi 3B+** | 1GB | ⚠️ 慢 | 可用但缓慢 |
| **Pi Zero 2 W** | 512MB | ❌ | 不推荐 |

**最低规格：** 1GB RAM, 1 核, 500MB 磁盘
**推荐：** 2GB+ RAM, 64 位操作系统, 16GB+ SD 卡（或 USB SSD）

## 您需要什么

- 树莓派 4 或 5（推荐 2GB+）
- MicroSD 卡（16GB+）或 USB SSD（更好性能）
- 电源适配器（推荐官方 Pi 电源适配器）
- 网络连接（以太网或 WiFi）
- ~30 分钟

## 1) 刷入操作系统

使用 **Raspberry Pi OS Lite (64 位)** — 无桌面，适合无头服务器。

1. 下载 [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
2. 选择操作系统: **Raspberry Pi OS Lite (64 位)**
3. 点击齿轮图标 (⚙️) 预配置:
   - 设置主机名: `gateway-host`
   - 启用 SSH
   - 设置用户名/密码
   - 配置 WiFi（如果不使用以太网）
4. 刷入到您的 SD 卡 / USB 驱动器
5. 插入并启动 Pi

## 2) 通过 SSH 连接

```bash
ssh user@gateway-host
# 或使用 IP 地址
ssh user@192.168.x.x
```

## 3) 系统设置

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基本包
sudo apt install -y git curl build-essential

# 设置时区（对 cron/提醒很重要）
sudo timedatectl set-timezone America/Chicago  # 改为您所在的时区
```

## 4) 安装 Node.js 22 (ARM64)

```bash
# 通过 NodeSource 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 验证
node --version  # 应显示 v22.x.x
npm --version
```

## 5) 添加交换空间（对 2GB 或更少内存很重要）

交换空间防止内存不足崩溃：

```bash
# 创建 2GB 交换文件
sudo fallocate -l 2GB /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 永久化
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 优化低内存（减少交换倾向）
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## 6) 安装 Moltbot

### 选项 A: 标准安装（推荐）

```bash
curl -fsSL https://molt.bot/install.sh | bash
```

### 选项 B: 可修改安装（用于调试）

```bash
git clone https://github.com/moltbot/moltbot.git
cd moltbot
npm install
npm run build
npm link
```

可修改安装让您直接访问日志和代码 — 有助于调试 ARM 特定问题。

## 7) 运行入门向导

```bash
moltbot onboard --install-daemon
```

跟随向导：
1. **网关模式：** 本地
2. **认证：** API 密钥推荐（OAuth 在无头 Pi 上可能不稳定）
3. **频道：** Telegram 是最容易开始的
4. **守护进程：** 是（systemd）

## 8) 验证安装

```bash
# 检查状态
moltbot status

# 检查服务
sudo systemctl status moltbot

# 查看日志
journalctl -u moltbot -f
```

## 9) 访问仪表板

由于 Pi 是无头的，使用 SSH 隧道：

```bash
# 从您的笔记本电脑/桌面
ssh -L 18789:localhost:18789 user@gateway-host

# 然后在浏览器中打开
open http://localhost:18789
```

或使用 Tailscale 进行始终访问：

```bash
# 在 Pi 上
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# 更新配置
moltbot config set gateway.bind tailnet
sudo systemctl restart moltbot
```

---

## 性能优化

### 使用 USB SSD（巨大改进）

SD 卡很慢且易磨损。USB SSD 大大提高性能：

```bash
# 检查是否从 USB 启动
lsblk
```

参见 [Pi USB 启动指南](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html#usb-mass-storage-boot) 了解设置。

### 减少内存使用

```bash
# 禁用 GPU 内存分配（无头）
echo 'gpu_mem=16' | sudo tee -a /boot/config.txt

# 如不需要，禁用蓝牙
sudo systemctl disable bluetooth
```

### 监控资源

```bash
# 检查内存
free -h

# 检查 CPU 温度
vcgencmd measure_temp

# 实时监控
htop
```

---

## ARM 特定说明

### 二进制兼容性

大多数 Moltbot 功能在 ARM64 上工作，但某些外部二进制文件可能需要 ARM 构建：

| 工具 | ARM64 状态 | 注释 |
|------|--------------|-------|
| Node.js | ✅ | 工作很好 |
| WhatsApp (Baileys) | ✅ | 纯 JS，无问题 |
| Telegram | ✅ | 纯 JS，无问题 |
| gog (Gmail CLI) | ⚠️ | 检查是否有 ARM 版本 |
| Chromium (浏览器) | ✅ | `sudo apt install chromium-browser` |

如果技能失败，检查其二进制文件是否有 ARM 构建。许多 Go/Rust 工具有；有些没有。

### 32 位 vs 64 位

**始终使用 64 位操作系统。** Node.js 和许多现代工具需要它。检查：

```bash
uname -m
# 应显示: aarch64 (64 位) 而不是 armv7l (32 位)
```

---

## 推荐的模型设置

由于 Pi 只是网关（模型在云端运行），使用基于 API 的模型：

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-20250514",
        "fallbacks": ["openai/gpt-4o-mini"]
      }
    }
  }
}
```

**不要尝试在 Pi 上运行本地 LLM** — 即使小模型也太慢。让 Claude/GPT 做繁重的工作。

---

## 开机自启

入门向导已设置此功能，但要验证：

```bash
# 检查服务是否已启用
sudo systemctl is-enabled moltbot

# 如未启用则启用
sudo systemctl enable moltbot

# 开机启动
sudo systemctl start moltbot
```

---

## 故障排除

### 内存不足 (OOM)

```bash
# 检查内存
free -h

# 添加更多交换空间（参见第 5 步）
# 或减少在 Pi 上运行的服务
```

### 性能缓慢

- 使用 USB SSD 而不是 SD 卡
- 禁用未使用的服务: `sudo systemctl disable cups bluetooth avahi-daemon`
- 检查 CPU 降频: `vcgencmd get_throttled`（应返回 `0x0`）

### 服务无法启动

```bash
# 检查日志
journalctl -u moltbot --no-pager -n 100

# 常见修复：重新构建
cd ~/moltbot  # 如果使用可修改安装
npm run build
sudo systemctl restart moltbot
```

### ARM 二进制问题

如果技能失败并显示"exec format error"：
1. 检查二进制文件是否有 ARM64 构建
2. 尝试从源代码构建
3. 或使用支持 ARM 的 Docker 容器

### WiFi 断开

对于使用 WiFi 的无头 Pi：

```bash
# 禁用 WiFi 功率管理
sudo iwconfig wlan0 power off

# 永久化
echo 'wireless-power off' | sudo tee -a /etc/network/interfaces
```

---

## 成本对比

| 设置 | 一次性成本 | 月成本 | 注释 |
|-------|---------------|--------------|-------|
| **Pi 4 (2GB)** | ~$45 | $0 | + 电力 (~$5/年) |
| **Pi 4 (4GB)** | ~$55 | $0 | 推荐 |
| **Pi 5 (4GB)** | ~$60 | $0 | 最佳性能 |
| **Pi 5 (8GB)** | ~$80 | $0 | 性能过剩但面向未来 |
| DigitalOcean | $0 | $6/月 | $72/年 |
| Hetzner | $0 | €3.79/月 | ~$50/年 |

**盈亏平衡：** Pi 在 ~6-12 个月内相比云 VPS 支付成本。

---

## 参见

- [Linux 指南](/platforms/linux) — 通用 Linux 设置
- [DigitalOcean 指南](/platforms/digitalocean) — 云替代方案
- [Hetzner 指南](/platforms/hetzner) — Docker 设置
- [Tailscale](/gateway/tailscale) — 远程访问
- [节点](/nodes) — 将您的笔记本电脑/手机与 Pi 网关配对