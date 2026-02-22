---
summary: "Linux 支持 + 伴侣应用状态"
read_when:
  - 查找 Linux 伴侣应用状态
  - 规划平台覆盖范围或贡献
---
# Linux 应用

网关在 Linux 上完全支持。**Node 是推荐的运行时**。
不推荐在网关中使用 Bun（WhatsApp/Telegram bug）。

原生 Linux 伴侣应用正在计划中。如果您想帮助构建一个，欢迎贡献。

## 初学者快速路径（VPS）

1) 安装 Node 22+
2) `npm i -g moltbot@latest`
3) `moltbot onboard --install-daemon`
4) 从您的笔记本电脑: `ssh -N -L 18789:127.0.0.1:18789 <user>@<host>`
5) 打开 `http://127.0.0.1:18789/` 并粘贴您的令牌

逐步 VPS 指南: [exe.dev](/platforms/exe-dev)

## 安装
- [入门指南](/start/getting-started)
- [安装和更新](/install/updating)
- 可选流程: [Bun (实验性)](/install/bun), [Nix](/install/nix), [Docker](/install/docker)

## 网关
- [网关操作手册](/gateway)
- [配置](/gateway/configuration)

## 网关服务安装（CLI）

使用以下之一：

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

## 系统控制（systemd 用户单元）
Moltbot 默认安装一个 systemd **用户** 服务。对于共享或始终在线的服务器，
请使用**系统**服务。完整的单元示例和指导位于 [网关操作手册](/gateway) 中。

最小设置：

创建 `~/.config/systemd/user/moltbot-gateway[-<profile>].service`：

```
[Unit]
Description=Moltbot 网关（配置文件：<profile>，v<version>）
After=network-online.target
Wants=network-online.target

[Service]
ExecStart=/usr/local/bin/moltbot gateway --port 18789
Restart=always
RestartSec=5

[Install]
WantedBy=default.target
```

启用它：

```
systemctl --user enable --now moltbot-gateway[-<profile>].service
```