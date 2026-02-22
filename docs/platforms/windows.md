---
summary: "Windows (WSL2) 支持 + 伴侣应用状态"
read_when:
  - 在 Windows 上安装 Moltbot
  - 查找 Windows 伴侣应用状态
---
# Windows (WSL2)

推荐在 Windows 上**通过 WSL2** 使用 Moltbot（推荐 Ubuntu）。CLI + 网关在 Linux 内运行，这样可以保持运行时的一致性，并使工具更加兼容（Node/Bun/pnpm、Linux 二进制文件、技能）。原生 Windows 安装未经测试且更成问题。

计划中的原生 Windows 伴侣应用。

## 安装 (WSL2)
- [入门指南](/start/getting-started) (在 WSL 内使用)
- [安装和更新](/install/updating)
- 官方 WSL2 指南 (Microsoft): https://learn.microsoft.com/windows/wsl/install

## 网关
- [网关操作手册](/gateway)
- [配置](/gateway/configuration)

## 网关服务安装 (CLI)

在 WSL2 内：

```
moltbot onboard --install-daemon
```

或者：

```
moltbot gateway install
```

或者：

```
moltbot configure
```

提示时选择**网关服务**。

修复/迁移：

```
moltbot doctor
```

## 高级：通过 LAN 暴露 WSL 服务 (portproxy)

WSL 有自己的虚拟网络。如果另一台机器需要访问**在 WSL 内**运行的服务（SSH、本地 TTS 服务器或网关），您必须将 Windows 端口转发到当前的 WSL IP。WSL IP 在重启后会更改，因此您可能需要刷新转发规则。

示例 (PowerShell **以管理员身份**):

```powershell
$Distro = "Ubuntu-24.04"
$ListenPort = 2222
$TargetPort = 22

$WslIp = (wsl -d $Distro -- hostname -I).Trim().Split(" ")[0]
if (-not $WslIp) { throw "WSL IP not found." }

netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=$ListenPort `
  connectaddress=$WslIp connectport=$TargetPort
```

允许端口通过 Windows 防火墙（一次性）：

```powershell
New-NetFirewallRule -DisplayName "WSL SSH $ListenPort" -Direction Inbound `
  -Protocol TCP -LocalPort $ListenPort -Action Allow
```

WSL 重启后刷新 portproxy：

```powershell
netsh interface portproxy delete v4tov4 listenport=$ListenPort listenaddress=0.0.0.0 | Out-Null
netsh interface portproxy add v4tov4 listenport=$ListenPort listenaddress=0.0.0.0 `
  connectaddress=$WslIp connectport=$TargetPort | Out-Null
```

注意事项：
- 来自另一台机器的 SSH 指向**Windows 主机 IP**（示例：`ssh user@windows-host -p 2222`）。
- 远程节点必须指向**可达的**网关 URL（不是 `127.0.0.1`）；使用
  `moltbot status --all` 确认。
- 使用 `listenaddress=0.0.0.0` 用于 LAN 访问；`127.0.0.1` 仅保持本地。
- 如果您希望这自动执行，请注册一个计划任务在登录时运行刷新步骤。

## 逐步 WSL2 安装

### 1) 安装 WSL2 + Ubuntu

打开 PowerShell (管理员):

```powershell
wsl --install
# 或明确选择发行版：
wsl --list --online
wsl --install -d Ubuntu-24.04
```

如果 Windows 要求，请重启。

### 2) 启用 systemd（网关安装必需）

在您的 WSL 终端中：

```bash
sudo tee /etc/wsl.conf >/dev/null <<'EOF'
[boot]
systemd=true
EOF
```

然后从 PowerShell：

```powershell
wsl --shutdown
```

重新打开 Ubuntu，然后验证：

```bash
systemctl --user status
```

### 3) 安装 Moltbot（在 WSL 内）

在 WSL 内按照 Linux 入门流程：

```bash
git clone https://github.com/moltbot/moltbot.git
cd moltbot
pnpm install
pnpm ui:build # 首次运行时自动安装 UI 依赖
pnpm build
moltbot onboard
```

完整指南：[入门指南](/start/getting-started)

## Windows 伴侣应用

我们还没有 Windows 伴侣应用。如果您希望通过贡献使其成为现实，欢迎贡献。