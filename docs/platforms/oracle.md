---
summary: "在 Oracle Cloud 上运行 Moltbot（始终免费 ARM）"
read_when:
  - 在 Oracle Cloud 上设置 Moltbot
  - 寻找 Moltbot 的低成本 VPS 托管
  - 希望在小型服务器上 24/7 运行 Moltbot
---

# 在 Oracle Cloud 上运行 Moltbot (OCI)

## 目标

在 Oracle Cloud 的**始终免费**ARM 层上运行持久的 Moltbot 网关。

Oracle 的免费层非常适合 Moltbot（特别是如果您已经有 OCI 账户），但它有一些权衡：

- ARM 架构（大多数东西都能工作，但有些二进制文件可能是仅 x86）
- 容量和注册可能不稳定

## 成本比较 (2026)

| 提供商 | 计划 | 规格 | 价格/月 | 注释 |
|----------|------|-------|----------|-------|
| Oracle Cloud | 始终免费 ARM | 最多 4 个 OCPU，24GB RAM | $0 | ARM，容量有限 |
| Hetzner | CX22 | 2 vCPU，4GB RAM | ~ $4 | 最便宜的付费选项 |
| DigitalOcean | 基础版 | 1 vCPU，1GB RAM | $6 | 简单 UI，好文档 |
| Vultr | 云计算 | 1 vCPU，1GB RAM | $6 | 许多地点 |
| Linode | Nanode | 1 vCPU，1GB RAM | $5 | 现在是 Akamai 的一部分 |

---

## 先决条件

- Oracle Cloud 账户 ([注册](https://www.oracle.com/cloud/free/)) — 如果遇到问题请参见 [社区注册指南](https://gist.github.com/rssnyder/51e3cfedd730e7dd5f4a816143b25dbd)
- Tailscale 账户（免费在 [tailscale.com](https://tailscale.com))
- ~30 分钟

## 1) 创建 OCI 实例

1. 登录 [Oracle Cloud 控制台](https://cloud.oracle.com/)
2. 导航到 **Compute → Instances → Create Instance**
3. 配置：
   - **名称：** `moltbot`
   - **镜像：** Ubuntu 24.04 (aarch64)
   - **形状：** `VM.Standard.A1.Flex` (Ampere ARM)
   - **OCPUs：** 2 (或最多 4)
   - **内存：** 12 GB (或最多 24 GB)
   - **启动卷：** 50 GB (最多 200 GB 免费)
   - **SSH 密钥：** 添加您的公钥
4. 点击 **创建**
5. 记下公共 IP 地址

**提示：** 如果实例创建失败显示"容量不足"，请尝试不同的可用性域或稍后重试。免费层级容量有限。

## 2) 连接和更新

```bash
# 通过公共 IP 连接
ssh ubuntu@YOUR_PUBLIC_IP

# 更新系统
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential
```

**注意：** `build-essential` 对于某些依赖项的 ARM 编译是必需的。

## 3) 配置用户和主机名

```bash
# 设置主机名
sudo hostnamectl set-hostname moltbot

# 为 ubuntu 用户设置密码
sudo passwd ubuntu

# 启用持久化（在注销后保持用户服务运行）
sudo loginctl enable-linger ubuntu
```

## 4) 安装 Tailscale

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --ssh --hostname=moltbot
```

这启用了 Tailscale SSH，因此您可以从您的尾网上的任何设备通过 `ssh moltbot` 连接——不需要公共 IP。

验证：
```bash
tailscale status
```

**从现在开始，通过 Tailscale 连接：** `ssh ubuntu@moltbot` (或使用 Tailscale IP)。

## 5) 安装 Moltbot

```bash
curl -fsSL https://molt.bot/install.sh | bash
source ~/.bashrc
```

当提示"How do you want to hatch your bot?"时，选择**"稍后再做"**。

> 注意：如果您遇到 ARM 原生构建问题，请在使用 Homebrew 之前先从系统包开始（例如 `sudo apt install -y build-essential`)。

## 6) 配置网关（回环 + 令牌认证）并启用 Tailscale Serve

默认使用令牌认证。它很可靠，避免了需要任何"不安全认证"控制界面标志。

```bash
# 在 VM 上保持网关私有
moltbot config set gateway.bind loopback

# 为网关 + 控制界面要求认证
moltbot config set gateway.auth.mode token
moltbot doctor --generate-gateway-token

# 通过 Tailscale Serve 暴露（HTTPS + 尾网访问）
moltbot config set gateway.tailscale.mode serve
moltbot config set gateway.trustedProxies '["127.0.0.1"]'

systemctl --user restart moltbot-gateway
```

## 7) 验证

```bash
# 检查版本
moltbot --version

# 检查守护进程状态
systemctl --user status moltbot-gateway

# 检查 Tailscale Serve
tailscale serve status

# 测试本地响应
curl http://localhost:18789
```

## 8) 锁定 VCN 安全

现在一切正常工作，锁定 VCN 以阻止除 Tailscale 以外的所有流量。OCI 的虚拟云网络在网络边缘充当防火墙——流量在到达您的实例之前被阻止。

1. 在 OCI 控制台中转到 **Networking → Virtual Cloud Networks**
2. 点击您的 VCN → **Security Lists** → 默认安全列表
3. **删除** 除以下之外的所有入口规则：
   - `0.0.0.0/0 UDP 41641` (Tailscale)
4. 保持默认出口规则（允许所有出站）

这在网络边缘阻止端口 22 上的 SSH、HTTP、HTTPS 和所有其他内容。从现在开始，您只能通过 Tailscale 连接。

---

## 访问控制界面

从您的 Tailscale 网络上的任何设备：

```
https://moltbot.<tailnet-name>.ts.net/
```

将 `<tailnet-name>` 替换为您的尾网名称（在 `tailscale status` 中可见）。

不需要 SSH 隧道。Tailscale 提供：
- HTTPS 加密（自动证书）
- 通过 Tailscale 身份进行身份验证
- 从您的尾网上的任何设备访问（笔记本电脑、手机等）

---

## 安全：VCN + Tailscale（推荐基线）

在 VCN 锁定（仅开放 UDP 41641）且网关绑定到回环的情况下，您获得了强大的深度防御：公共流量在网络边缘被阻止，管理员访问通过您的尾网发生。

这种设置通常消除了*需要*额外的基于主机的防火墙规则来纯粹阻止互联网范围的 SSH 暴力破解的需求——但您仍应保持操作系统更新，运行 `moltbot security audit`，并验证您没有意外地在公共接口上监听。

### 已经受到保护的内容

| 传统步骤 | 是否需要? | 原因 |
|------------------|---------|-----|
| UFW 防火墙 | 否 | VCN 在流量到达实例之前阻止 |
| fail2ban | 否 | 如果端口 22 在 VCN 被阻止，则没有暴力破解 |
| sshd 硬化 | 否 | Tailscale SSH 不使用 sshd |
| 禁用 root 登录 | 否 | Tailscale 使用 Tailscale 身份，而非系统用户 |
| 仅 SSH 密钥认证 | 否 | Tailscale 通过您的尾网进行身份验证 |
| IPv6 硬化 | 通常不需要 | 取决于您的 VCN/子网设置；验证实际分配/暴露的内容 |

### 仍推荐

- **凭证权限：** `chmod 700 ~/.clawdbot`
- **安全审计：** `moltbot security audit`
- **系统更新：** 定期 `sudo apt update && sudo apt upgrade`
- **监控 Tailscale：** 在 [Tailscale 管理控制台](https://login.tailscale.com/admin) 中审查设备

### 验证安全态势

```bash
# 确认没有公共端口监听
sudo ss -tlnp | grep -v '127.0.0.1\|::1'

# 验证 Tailscale SSH 激活
tailscale status | grep -q 'offers: ssh' && echo "Tailscale SSH active"

# 可选：完全禁用 sshd
sudo systemctl disable --now ssh
```

---

## 后备：SSH 隧道

如果 Tailscale Serve 不工作，请使用 SSH 隧道：

```bash
# 从您的本地机器（通过 Tailscale）
ssh -L 18789:127.0.0.1:18789 ubuntu@moltbot
```

然后打开 `http://localhost:18789`。

---

## 故障排除

### 实例创建失败（"容量不足"）
免费层级 ARM 实例很受欢迎。尝试：
- 不同的可用性域
- 在非高峰时段重试（清晨）
- 选择形状时使用"始终免费"过滤器

### Tailscale 无法连接
```bash
# 检查状态
sudo tailscale status

# 重新认证
sudo tailscale up --ssh --hostname=moltbot --reset
```

### 网关无法启动
```bash
moltbot gateway status
moltbot doctor --non-interactive
journalctl --user -u moltbot-gateway -n 50
```

### 无法访问控制界面
```bash
# 验证 Tailscale Serve 正在运行
tailscale serve status

# 检查网关正在监听
curl http://localhost:127.0.0.1:18789

# 如需要重启
systemctl --user restart moltbot-gateway
```

### ARM 二进制问题
某些工具可能没有 ARM 版本。检查：
```bash
uname -m  # 应显示 aarch64
```

大多数 npm 包都可以正常工作。对于二进制文件，请查找 `linux-arm64` 或 `aarch64` 版本。

---

## 持久性

所有状态存储在：
- `~/.clawdbot/` — 配置、凭据、会话数据
- `~/clawd/` — 工作区 (SOUL.md, memory, artifacts)

定期备份：
```bash
tar -czvf moltbot-backup.tar.gz ~/.clawdbot ~/clawd
```

---

## 参见

- [网关远程访问](/gateway/remote) — 其他远程访问模式
- [Tailscale 集成](/gateway/tailscale) — 完整 Tailscale 文档
- [网关配置](/gateway/configuration) — 所有配置选项
- [DigitalOcean 指南](/platforms/digitalocean) — 如果您想要付费 + 更容易注册
- [Hetzner 指南](/platforms/hetzner) — 基于 Docker 的替代方案