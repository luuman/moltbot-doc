---
summary: "Run Moltbot Gateway on exe.dev (VM + HTTPS proxy) for remote access"
read_when:
  - You want a cheap always-on Linux host for the Gateway
  - You want remote Control UI access without running your own VPS
---

# exe.dev

目标: Moltbot Gateway 在 exe.dev VM 上运行，可通过以下方式从您的笔记本电脑访问: `https://<vm-name>.exe.xyz`

本页面假设 exe.dev 的默认 **exeuntu** 镜像。如果您选择了不同的发行版，请相应映射包。

## 初学者快速路径

1) [https://exe.new/moltbot](https://exe.new/moltbot)
2) 根据需要填写您的认证密钥/令牌
3) 点击 VM 旁边的"Agent"，然后等待...
4) ???
5) 成功

## 您需要什么

- exe.dev 账户
- `ssh exe.dev` 访问 [exe.dev](https://exe.dev) 虚拟机的权限 (可选)


## 使用 Shelley 自动安装

Shelley，[exe.dev](https://exe.dev) 的代理，可以使用我们的提示立即安装 Moltbot。
使用的提示如下:

```
在此 VM 上设置 Moltbot (https://docs.molt.bot/install)。对 moltbot 入门使用非交互式和接受风险标志。根据需要添加提供的认证或令牌。配置 nginx 从前默认端口 18789 转发到默认启用的站点配置的根位置，确保启用 WebSocket 支持。配对通过 "moltbot devices list" 和 "moltbot device approve <request id>" 完成。确保仪表板显示 Moltbot 的健康状态正常。exe.dev 为我们处理从端口 8000 到端口 80/443 和 HTTPS 的转发，所以最终"可访问"的应该是 <vm-name>.exe.xyz，不需要指定端口。
```

## 手动安装

## 1) 创建 VM

从您的设备:

```bash
ssh exe.dev new 
```

然后连接:

```bash
ssh <vm-name>.exe.xyz
```

提示: 保持此 VM **有状态**。Moltbot 在 `~/.clawdbot/` 和 `~/clawd/` 下存储状态。

## 2) 安装先决条件 (在 VM 上)

```bash
sudo apt-get update
sudo apt-get install -y git curl jq ca-certificates openssl
```

## 3) 安装 Moltbot

运行 Moltbot 安装脚本:

```bash
curl -fsSL https://molt.bot/install.sh | bash
```

## 4) 设置 nginx 代理 Moltbot 到端口 8000

使用以下内容编辑 `/etc/nginx/sites-enabled/default`

```
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    listen 8000;
    listen [::]:8000;

    server_name _;

    location / {
        proxy_pass http://127.0.0.1:18789;
        proxy_http_version 1.1;

        # WebSocket 支持
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 标准代理头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 长连接的超时设置
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

## 5) 访问 Moltbot 并授予权限

访问 `https://<vm-name>.exe.xyz/?token=YOUR-TOKEN-FROM-TERMINAL`。使用 `moltbot devices list` 和 `moltbot device approve` 批准设备。如有疑问，请从浏览器使用 Shelley！

## 远程访问

远程访问由 [exe.dev](https://exe.dev) 的认证处理。
默认情况下，来自端口 8000 的 HTTP 流量被转发到 `https://<vm-name>.exe.xyz` 并使用电子邮件认证。

## 更新

```bash
npm i -g moltbot@latest
moltbot doctor
moltbot gateway restart
moltbot health
```

指南: [更新](/install/updating)