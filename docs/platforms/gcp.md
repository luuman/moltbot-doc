---
summary: "在 GCP Compute Engine VM (Docker) 上 24/7 运行 Moltbot 网关，具有持久状态"
read_when:
  - 您希望在 GCP 上 24/7 运行 Moltbot
  - 您希望在自己的 VM 上运行生产级、持续在线的网关
  - 您希望完全控制持久性、二进制文件和重启行为
---

# 在 GCP Compute Engine 上运行 Moltbot (Docker, 生产 VPS 指南)

## 目标

在使用 Docker 的 GCP Compute Engine VM 上运行持久的 Moltbot 网关，具有持久状态、内置二进制文件和安全的重启行为。

如果您想要"每月 ~$5-12 的 24/7 Moltbot"，这是在 Google Cloud 上的可靠设置。
定价因机器类型和地区而异；选择适合您工作负载的最小 VM，如果遇到 OOM（内存不足）则升级。

## 我们在做什么（简单术语）？

- 创建 GCP 项目并启用计费
- 创建 Compute Engine VM
- 安装 Docker（隔离的应用运行时）
- 在 Docker 中启动 Moltbot 网关
- 在主机上持久化 `~/.clawdbot` + `~/clawd`（在重启/重建后保留）
- 通过 SSH 隧道从您的笔记本电脑访问控制界面

网关可以通过以下方式访问：
- 从您的笔记本电脑进行 SSH 端口转发
- 直接端口暴露（如果您自己管理防火墙和令牌）

本指南在 GCP Compute Engine 上使用 Debian。
Ubuntu 也可以工作；相应映射包。
有关通用 Docker 流程，请参见 [Docker](/install/docker)。

---

## 快速路径（经验丰富的运维人员）

1) 创建 GCP 项目 + 启用 Compute Engine API
2) 创建 Compute Engine VM (e2-small, Debian 12, 20GB)
3) SSH 进入 VM
4) 安装 Docker
5) 克隆 Moltbot 仓库
6) 创建持久主机目录
7) 配置 `.env` 和 `docker-compose.yml`
8) 内置所需二进制文件，构建并启动

---

## 您需要什么

- GCP 账户（e2-micro 有免费套餐资格）
- 已安装 gcloud CLI（或使用 Cloud Console）
- 从您的笔记本电脑 SSH 访问
- 对 SSH + 复制/粘贴 的基本熟悉
- ~20-30 分钟
- Docker 和 Docker Compose
- 模型认证凭据
- 可选的提供商凭据
  - WhatsApp QR
  - Telegram 机器人令牌
  - Gmail OAuth

---

## 1) 安装 gcloud CLI（或使用控制台）

**选项 A: gcloud CLI**（推荐用于自动化）

从 https://cloud.google.com/sdk/docs/install 安装

初始化并认证：

```bash
gcloud init
gcloud auth login
```

**选项 B: Cloud Console**

所有步骤都可以通过网络 UI 在 https://console.cloud.google.com 完成

---

## 2) 创建 GCP 项目

**CLI:**

```bash
gcloud projects create my-moltbot-project --name="Moltbot Gateway"
gcloud config set project my-moltbot-project
```

在 https://console.cloud.google.com/billing 启用计费（Compute Engine 所需）。

启用 Compute Engine API：

```bash
gcloud services enable compute.googleapis.com
```

**控制台:**

1. 进入 IAM & Admin > Create Project
2. 命名并创建
3. 为项目启用计费
4. 导航到 APIs & Services > Enable APIs > 搜索 "Compute Engine API" > Enable

---

## 3) 创建 VM

**机器类型:**

| 类型 | 规格 | 成本 | 注释 |
|------|-------|------|-------|
| e2-small | 2 vCPU, 2GB RAM | ~$12/月 | 推荐 |
| e2-micro | 2 vCPU (共享), 1GB RAM | 免费套餐资格 | 负载下可能出现 OOM |

**CLI:**

```bash
gcloud compute instances create moltbot-gateway \
  --zone=us-central1-a \
  --machine-type=e2-small \
  --boot-disk-size=20GB \
  --image-family=debian-12 \
  --image-project=debian-cloud
```

**控制台:**

1. 进入 Compute Engine > VM instances > Create instance
2. 名称: `moltbot-gateway`
3. 区域: `us-central1`, 区域: `us-central1-a`
4. 机器类型: `e2-small`
5. 启动磁盘: Debian 12, 20GB
6. 创建

---

## 4) SSH 进入 VM

**CLI:**

```bash
gcloud compute ssh moltbot-gateway --zone=us-central1-a
```

**控制台:**

在 Compute Engine 仪表板中点击 VM 旁边的 "SSH" 按钮。

注意：SSH 密钥传播可能在 VM 创建后需要 1-2 分钟。如果连接被拒绝，请等待并重试。

---

## 5) 安装 Docker（在 VM 上）

```bash
sudo apt-get update
sudo apt-get install -y git curl ca-certificates
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```

注销并重新登录以使组更改生效：

```bash
exit
```

然后重新 SSH：

```bash
gcloud compute ssh moltbot-gateway --zone=us-central1-a
```

验证：

```bash
docker --version
docker compose version
```

---

## 6) 克隆 Moltbot 仓库

```bash
git clone https://github.com/moltbot/moltbot.git
cd moltbot
```

本指南假设您将构建自定义镜像以保证二进制文件持久性。

---

## 7) 创建持久主机目录

Docker 容器是临时的。
所有长期状态必须存在于主机上。

```bash
mkdir -p ~/.clawdbot
mkdir -p ~/clawd
```

---

## 8) 配置环境变量

在仓库根目录创建 `.env`。

```bash
CLAWDBOT_IMAGE=moltbot:latest
CLAWDBOT_GATEWAY_TOKEN=change-me-now
CLAWDBOT_GATEWAY_BIND=lan
CLAWDBOT_GATEWAY_PORT=18789

CLAWDBOT_CONFIG_DIR=/home/$USER/.clawdbot
CLAWDBOT_WORKSPACE_DIR=/home/$USER/clawd

GOG_KEYRING_PASSWORD=change-me-now
XDG_CONFIG_HOME=/home/node/.clawdbot
```

生成强密钥：

```bash
openssl rand -hex 32
```

**不要提交此文件。**

---

## 9) Docker Compose 配置

创建或更新 `docker-compose.yml`。

```yaml
services:
  moltbot-gateway:
    image: ${CLAWDBOT_IMAGE}
    build: .
    restart: unless-stopped
    env_file:
      - .env
    environment:
      - HOME=/home/node
      - NODE_ENV=production
      - TERM=xterm-256color
      - CLAWDBOT_GATEWAY_BIND=${CLAWDBOT_GATEWAY_BIND}
      - CLAWDBOT_GATEWAY_PORT=${CLAWDBOT_GATEWAY_PORT}
      - CLAWDBOT_GATEWAY_TOKEN=${CLAWDBOT_GATEWAY_TOKEN}
      - GOG_KEYRING_PASSWORD=${GOG_KEYRING_PASSWORD}
      - XDG_CONFIG_HOME=${XDG_CONFIG_HOME}
      - PATH=/home/linuxbrew/.linuxbrew/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
    volumes:
      - ${CLAWDBOT_CONFIG_DIR}:/home/node/.clawdbot
      - ${CLAWDBOT_WORKSPACE_DIR}:/home/node/clawd
    ports:
      # 推荐：在 VM 上保持网关仅回环；通过 SSH 隧道访问。
      # 要公开暴露它，请删除 `127.0.0.1:` 前缀并相应配置防火墙。
      - "127.0.0.1:${CLAWDBOT_GATEWAY_PORT}:18789"

      # 可选：仅当您针对此 VM 运行 iOS/Android 节点并需要 Canvas 主机时。
      # 如果您公开暴露此端口，请阅读 /gateway/security 并相应配置防火墙。
      # - "18793:18793"
    command:
      [
        "node",
        "dist/index.js",
        "gateway",
        "--bind",
        "${CLAWDBOT_GATEWAY_BIND}",
        "--port",
        "${CLAWDBOT_GATEWAY_PORT}"
      ]
```

---

## 10) 将所需二进制文件内置到镜像中（关键）

在运行的容器内安装二进制文件是一个陷阱.
在运行时安装的任何内容都会在重启时丢失.

技能所需的所有外部二进制文件必须在镜像构建时安装.

下面的示例仅显示三个常见二进制文件:
- `gog` 用于 Gmail 访问
- `goplaces` 用于 Google Places
- `wacli` 用于 WhatsApp

这些只是示例，不是完整列表.
您可以使用相同模式安装任意数量的二进制文件.

如果您以后添加依赖额外二进制文件的新技能，则必须:
1. 更新 Dockerfile
2. 重新构建镜像
3. 重启容器

**示例 Dockerfile**

```dockerfile
FROM node:22-bookworm

RUN apt-get update && apt-get install -y socat && rm -rf /var/lib/apt/lists/*

# 示例二进制文件 1: Gmail CLI
RUN curl -L https://github.com/steipete/gog/releases/latest/download/gog_Linux_x86_64.tar.gz \
  | tar -xz -C /usr/local/bin && chmod +x /usr/local/bin/gog

# 示例二进制文件 2: Google Places CLI
RUN curl -L https://github.com/steipete/goplaces/releases/latest/download/goplaces_Linux_x86_64.tar.gz \
  | tar -xz -C /usr/local/bin && chmod +x /usr/local/bin/goplaces

# 示例二进制文件 3: WhatsApp CLI
RUN curl -L https://github.com/steipete/wacli/releases/latest/download/wacli_Linux_x86_64.tar.gz \
  | tar -xz -C /usr/local/bin && chmod +x /usr/local/bin/wacli

# 使用相同模式在下方添加更多二进制文件

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY ui/package.json ./ui/package.json
COPY scripts ./scripts

RUN corepack enable
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build
RUN pnpm ui:install
RUN pnpm ui:build

ENV NODE_ENV=production

CMD ["node","dist/index.js"]
```

---

## 11) 构建和启动

```bash
docker compose build
docker compose up -d moltbot-gateway
```

验证二进制文件：

```bash
docker compose exec moltbot-gateway which gog
docker compose exec moltbot-gateway which goplaces
docker compose exec moltbot-gateway which wacli
```

预期输出：

```
/usr/local/bin/gog
/usr/local/bin/goplaces
/usr/local/bin/wacli
```

---

## 12) 验证网关

```bash
docker compose logs -f moltbot-gateway
```

成功：

```
[gateway] listening on ws://0.0.0.0:18789
```

---

## 13) 从您的笔记本电脑访问

创建 SSH 隧道以转发网关端口：

```bash
gcloud compute ssh moltbot-gateway --zone=us-central1-a -- -L 18789:127.0.0.1:18789
```

在您的浏览器中打开：

`http://127.0.0.1:18789/`

粘贴您的网关令牌。

---

## 什么是持久化的（真相来源）

Moltbot 在 Docker 中运行，但 Docker 不是真相来源.
所有长期状态必须在重启、重建和重新启动后保留.

| 组件 | 位置 | 持久化机制 | 注释 |
|---|---|---|---|
| 网关配置 | `/home/node/.clawdbot/` | 主机卷挂载 | 包括 `moltbot.json`，令牌 |
| 模型认证配置 | `/home/node/.clawdbot/` | 主机卷挂载 | OAuth 令牌，API 密钥 |
| 技能配置 | `/home/node/.clawdbot/skills/` | 主机卷挂载 | 技能级别的状态 |
| 代理工作区 | `/home/node/clawd/` | 主机卷挂载 | 代码和代理工件 |
| WhatsApp 会话 | `/home/node/.clawdbot/` | 主机卷挂载 | 保留 QR 登录 |
| Gmail 密钥环 | `/home/node/.clawdbot/` | 主机卷 + 密码 | 需要 `GOG_KEYRING_PASSWORD` |
| 外部二进制文件 | `/usr/local/bin/` | Docker 镜像 | 必须在构建时内置 |
| Node 运行时 | 容器文件系统 | Docker 镜像 | 每次镜像构建时重新构建 |
| OS 包 | 容器文件系统 | Docker 镜像 | 不要在运行时安装 |
| Docker 容器 | 临时 | 可重启 | 安全销毁 |

---

## 更新

在 VM 上更新 Moltbot：

```bash
cd ~/moltbot
git pull
docker compose build
docker compose up -d
```

---

## 故障排除

**SSH 连接被拒绝**

SSH 密钥传播可能在 VM 创建后需要 1-2 分钟。等待并重试。

**OS Login 问题**

检查您的 OS Login 配置文件：

```bash
gcloud compute os-login describe-profile
```

确保您的账户具有所需的 IAM 权限（Compute OS Login 或 Compute OS Admin Login）。

**内存不足 (OOM)**

如果使用 e2-micro 并遇到 OOM，请升级到 e2-small 或 e2-medium：

```bash
# 首先停止 VM
gcloud compute instances stop moltbot-gateway --zone=us-central1-a

# 更改机器类型
gcloud compute instances set-machine-type moltbot-gateway \
  --zone=us-central1-a \
  --machine-type=e2-small

# 启动 VM
gcloud compute instances start moltbot-gateway --zone=us-central1-a
```

---

## 服务账户（安全最佳实践）

对于个人使用，您的默认用户账户工作良好。

对于自动化或 CI/CD 流水线，请创建具有最少权限的专用服务账户：

1. 创建服务账户：
   ```bash
   gcloud iam service-accounts create moltbot-deploy \
     --display-name="Moltbot 部署"
   ```

2. 授予 Compute Instance Admin 角色（或更窄的自定义角色）：
   ```bash
   gcloud projects add-iam-policy-binding my-moltbot-project \
     --member="serviceAccount:moltbot-deploy@my-moltbot-project.iam.gserviceaccount.com" \
     --role="roles/compute.instanceAdmin.v1"
   ```

避免为自动化使用 Owner 角色。使用最小权限原则。

请参见 https://cloud.google.com/iam/docs/understanding-roles 了解 IAM 角色详细信息。

---

## 下一步

- 设置消息通道：[Channels](/channels)
- 将本地设备配对为节点：[Nodes](/nodes)
- 配置网关：[网关配置](/gateway/configuration)