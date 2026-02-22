---
summary: "Moltbot 的可选 Docker 化设置和入门"
read_when:
  - 您想要容器化的网关而不是本地安装
  - 您正在验证 Docker 流程
---

# Docker（可选）

Docker 是**可选的**。只有当您想要容器化网关或验证 Docker 流程时才使用它。

## Docker 适合我吗？

- **是**：您想要一个隔离的、可丢弃的网关环境，或在没有本地安装的主机上运行 Moltbot。
- **否**：您在自己的机器上运行，只想获得最快的开发循环。请使用正常的安装流程。
- **沙箱说明**：代理沙箱也使用 Docker，但它**不要求**整个网关在 Docker 中运行。参见 [沙箱](/gateway/sandboxing)。

本指南涵盖：
- 容器化网关（Docker 中的完整 Moltbot）
- 每会话代理沙箱（主机网关 + Docker 隔离的代理工具）

沙箱详情：[沙箱](/gateway/sandboxing)

## 要求

- Docker Desktop（或 Docker Engine）+ Docker Compose v2
- 足够的磁盘空间用于镜像 + 日志

## 容器化网关（Docker Compose）

### 快速开始（推荐）

从仓库根目录：

```bash
./docker-setup.sh
```

此脚本：
- 构建网关镜像
- 运行入门向导
- 打印可选的提供者设置提示
- 通过 Docker Compose 启动网关
- 生成网关令牌并写入 `.env`

可选环境变量：
- `CLAWDBOT_DOCKER_APT_PACKAGES` — 在构建期间安装额外的 apt 包
- `CLAWDBOT_EXTRA_MOUNTS` — 添加额外的主机绑定挂载
- `CLAWDBOT_HOME_VOLUME` — 在命名卷中持久化 `/home/node`

完成后：
- 在浏览器中打开 `http://127.0.0.1:18789/`。
- 将令牌粘贴到控制 UI 中（设置 → 令牌）。

它在主机上写入配置/工作区：
- `~/.clawdbot/`
- `~/clawd`

在 VPS 上运行？参见 [Hetzner（Docker VPS）](/platforms/hetzner)。

### 手动流程（compose）

```bash
docker build -t moltbot:local -f Dockerfile .
docker compose run --rm moltbot-cli onboard
docker compose up -d moltbot-gateway
```

### 额外挂载（可选）

如果您想将额外的主机目录挂载到容器中，请在运行 `docker-setup.sh` 之前设置
`CLAWDBOT_EXTRA_MOUNTS`。这接受逗号分隔的 Docker 绑定挂载列表，并通过生成 `docker-compose.extra.yml` 将它们应用到
`moltbot-gateway` 和 `moltbot-cli`。

示例：

```bash
export CLAWDBOT_EXTRA_MOUNTS="$HOME/.codex:/home/node/.codex:ro,$HOME/github:/home/node/github:rw"
./docker-setup.sh
```

说明：
- 路径必须在 macOS/Windows 上与 Docker Desktop 共享。
- 如果您编辑 `CLAWDBOT_EXTRA_MOUNTS`，请重新运行 `docker-setup.sh` 以重新生成
  额外的 compose 文件。
- `docker-compose.extra.yml` 是生成的。不要手动编辑它。

### 持久化整个容器主目录（可选）

如果您希望 `/home/node` 在容器重建后持久化，请通过 `CLAWDBOT_HOME_VOLUME` 设置命名
卷。这将创建一个 Docker 卷并将其挂载到
`/home/node`，同时保留标准的配置/工作区绑定挂载。在这里使用命名卷（而不是绑定路径）；对于绑定挂载，请使用
`CLAWDBOT_EXTRA_MOUNTS`。

示例：

```bash
export CLAWDBOT_HOME_VOLUME="moltbot_home"
./docker-setup.sh
```

您可以将其与额外挂载结合：

```bash
export CLAWDBOT_HOME_VOLUME="moltbot_home"
export CLAWDBOT_EXTRA_MOUNTS="$HOME/.codex:/home/node/.codex:ro,$HOME/github:/home/node/github:rw"
./docker-setup.sh
```

说明：
- 如果您更改 `CLAWDBOT_HOME_VOLUME`，请重新运行 `docker-setup.sh` 以重新生成
  额外的 compose 文件。
- 命名卷在使用 `docker volume rm <name>` 删除之前会一直存在。

### 安装额外 apt 包（可选）

如果您需要在镜像中使用系统包（例如，构建工具或媒体
库），请在运行 `docker-setup.sh` 之前设置 `CLAWDBOT_DOCKER_APT_PACKAGES`。
这将在镜像构建期间安装包，因此即使
容器被删除也会持久化。

示例：

```bash
export CLAWDBOT_DOCKER_APT_PACKAGES="ffmpeg build-essential"
./docker-setup.sh
```

说明：
- 这接受空格分隔的 apt 包名列表。
- 如果您更改 `CLAWDBOT_DOCKER_APT_PACKAGES`，请重新运行 `docker-setup.sh` 以重新构建
  镜像。

### 更快的重建（推荐）

为了加速重建，请按顺序排列您的 Dockerfile 以便依赖层被缓存。
这可以避免在锁文件未更改时重新运行 `pnpm install`：

```dockerfile
FROM node:22-bookworm

# 安装 Bun（构建脚本必需）
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

RUN corepack enable

WORKDIR /app

# 缓存依赖项，除非包元数据更改
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY ui/package.json ./ui/package.json
COPY scripts ./scripts

RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build
RUN pnpm ui:install
RUN pnpm ui:build

ENV NODE_ENV=production

CMD ["node","dist/index.js"]
```

### 通道设置（可选）

使用 CLI 容器配置通道，然后在需要时重启网关。

WhatsApp（QR）：
```bash
docker compose run --rm moltbot-cli channels login
```

Telegram（机器人令牌）：
```bash
docker compose run --rm moltbot-cli channels add --channel telegram --token "<token>"
```

Discord（机器人令牌）：
```bash
docker compose run --rm moltbot-cli channels add --channel discord --token "<token>"
```

文档：[WhatsApp](/channels/whatsapp)，[Telegram](/channels/telegram)，[Discord](/channels/discord)

### 健康检查

```bash
docker compose exec moltbot-gateway node dist/index.js health --token "$CLAWDBOT_GATEWAY_TOKEN"
```

### E2E 烟雾测试（Docker）

```bash
scripts/e2e/onboard-docker.sh
```

### QR 导入烟雾测试（Docker）

```bash
pnpm test:docker:qr
```

### 说明

- 网关绑定默认为 `lan` 以供容器使用。
- 网关容器是会话的真实来源（`~/.clawdbot/agents/<agentId>/sessions/`）。

## 代理沙箱（主机网关 + Docker 工具）

深入探讨：[沙箱](/gateway/sandboxing)

### 它的作用

当启用 `agents.defaults.sandbox` 时，**非主会话**在 Docker 容器内运行工具。网关留在您的主机上，但工具执行被隔离：
- 范围：默认为 `"agent"`（每个代理一个容器 + 工作区）
- 范围：`"session"` 用于每会话隔离
- 每范围工作区文件夹挂载在 `/workspace`
- 可选的代理工作区访问（`agents.defaults.sandbox.workspaceAccess`）
- 允许/拒绝工具策略（拒绝优先）
- 传入媒体被复制到活动沙箱工作区（`media/inbound/*`）以便工具可以读取它（使用 `workspaceAccess: "rw"` 时，这会落在代理工作区中）

警告：`scope: "shared"` 禁用跨会话隔离。所有会话共享
一个容器和一个工作区。

### 每代理沙箱配置（多代理）

如果您使用多代理路由，每个代理都可以覆盖沙箱 + 工具设置：
`agents.list[].sandbox` 和 `agents.list[].tools`（加上 `agents.list[].tools.sandbox.tools`）。这允许您在一个网关中运行
混合访问级别：
- 完全访问（个人代理）
- 只读工具 + 只读工作区（家庭/工作代理）
- 无文件系统/shell 工具（公共代理）

参见 [多代理沙箱和工具](/multi-agent-sandbox-tools) 了解示例、
优先级和故障排除。

### 默认行为

- 镜像：`moltbot-sandbox:bookworm-slim`
- 每个代理一个容器
- 代理工作区访问：`workspaceAccess: "none"`（默认）使用 `~/.clawdbot/sandboxes`
  - `"ro"` 将沙箱工作区保留在 `/workspace` 并将代理工作区以只读方式挂载在 `/agent`（禁用 `write`/`edit`/`apply_patch`）
  - `"rw"` 将代理工作区以读写方式挂载在 `/workspace`
- 自动清理：空闲 > 24小时 OR 年龄 > 7天
- 网络：默认为 `"none"`（如果您需要出口流量，请明确选择）
- 默认允许：`exec`, `process`, `read`, `write`, `edit`, `sessions_list`, `sessions_history`, `sessions_send`, `sessions_spawn`, `session_status`
- 默认拒绝：`browser`, `canvas`, `nodes`, `cron`, `discord`, `gateway`

### 启用沙箱

如果您计划在 `setupCommand` 中安装包，请注意：
- 默认 `docker.network` 为 `"none"`（无出口流量）。
- `readOnlyRoot: true` 阻止包安装。
- `user` 必须为 root 以使用 `apt-get`（省略 `user` 或设置 `user: "0:0"`）。
当 `setupCommand`（或 docker 配置）更改时，Moltbot 会自动重建容器
除非容器**最近使用过**（约 5 分钟内）。热容器
记录一个警告，其中包含确切的 `moltbot sandbox recreate ...` 命令。

```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "non-main", // off | non-main | all
        scope: "agent", // session | agent | shared (agent is default)
        workspaceAccess: "none", // none | ro | rw
        workspaceRoot: "~/.clawdbot/sandboxes",
        docker: {
          image: "moltbot-sandbox:bookworm-slim",
          workdir: "/workspace",
          readOnlyRoot: true,
          tmpfs: ["/tmp", "/var/tmp", "/run"],
          network: "none",
          user: "1000:1000",
          capDrop: ["ALL"],
          env: { LANG: "C.UTF-8" },
          setupCommand: "apt-get update && apt-get install -y git curl jq",
          pidsLimit: 256,
          memory: "1g",
          memorySwap: "2g",
          cpus: 1,
          ulimits: {
            nofile: { soft: 1024, hard: 2048 },
            nproc: 256
          },
          seccompProfile: "/path/to/seccomp.json",
          apparmorProfile: "moltbot-sandbox",
          dns: ["1.1.1.1", "8.8.8.8"],
          extraHosts: ["internal.service:10.0.0.5"]
        },
        prune: {
          idleHours: 24, // 0 disables idle pruning
          maxAgeDays: 7  // 0 disables max-age pruning
        }
      }
    }
  },
  tools: {
    sandbox: {
      tools: {
        allow: ["exec", "process", "read", "write", "edit", "sessions_list", "sessions_history", "sessions_send", "sessions_spawn", "session_status"],
        deny: ["browser", "canvas", "nodes", "cron", "discord", "gateway"]
      }
    }
  }
}
```

加固旋钮位于 `agents.defaults.sandbox.docker` 下：
`network`, `user`, `pidsLimit`, `memory`, `memorySwap`, `cpus`, `ulimits`,
`seccompProfile`, `apparmorProfile`, `dns`, `extraHosts`。

多代理：通过 `agents.list[].sandbox.{docker,browser,prune}.*` 覆盖 `agents.defaults.sandbox.{docker,browser,prune}.*` 每个代理
（当 `agents.defaults.sandbox.scope` / `agents.list[].sandbox.scope` 为 `"shared"` 时被忽略）。

### 构建默认沙箱镜像

```bash
scripts/sandbox-setup.sh
```

这使用 `Dockerfile.sandbox` 构建 `moltbot-sandbox:bookworm-slim`。

### 沙箱通用镜像（可选）
如果您想要带有通用构建工具（Node, Go, Rust 等）的沙箱镜像，请构建通用镜像：

```bash
scripts/sandbox-common-setup.sh
```

这构建 `moltbot-sandbox-common:bookworm-slim`。要使用它：

```json5
{
  agents: { defaults: { sandbox: { docker: { image: "moltbot-sandbox-common:bookworm-slim" } } } }
}
```

### 沙箱浏览器镜像

要在沙箱内运行浏览器工具，请构建浏览器镜像：

```bash
scripts/sandbox-browser-setup.sh
```

这使用
`Dockerfile.sandbox-browser` 构建 `moltbot-sandbox-browser:bookworm-slim`。容器运行启用 CDP 的 Chromium 和
可选的 noVNC 观察器（通过 Xvfb 的有头模式）。

说明：
- 有头模式（Xvfb）比无头模式减少机器人阻挡。
- 仍可通过设置 `agents.defaults.sandbox.browser.headless=true` 使用无头模式。
- 不需要完整桌面环境（GNOME）；Xvfb 提供显示。

使用配置：

```json5
{
  agents: {
    defaults: {
      sandbox: {
        browser: { enabled: true }
      }
    }
  }
}
```

自定义浏览器镜像：

```json5
{
  agents: {
    defaults: {
      sandbox: { browser: { image: "my-moltbot-browser" } }
    }
  }
}
```

启用后，代理接收：
- 沙箱浏览器控制 URL（用于 `browser` 工具）
- noVNC URL（如果启用且 headless=false）

记住：如果您使用工具白名单，请添加 `browser`（并从
拒绝列表中删除）否则工具仍然被阻止。
修剪规则（`agents.defaults.sandbox.prune`）也适用于浏览器容器。

### 自定义沙箱镜像

构建您自己的镜像并将其指向配置：

```bash
docker build -t my-moltbot-sbx -f Dockerfile.sandbox .
```

```json5
{
  agents: {
    defaults: {
      sandbox: { docker: { image: "my-moltbot-sbx" } }
    }
  }
}
```

### 工具策略（允许/拒绝）

- `deny` 优于 `allow`。
- 如果 `allow` 为空：所有工具（除了拒绝的）都可用。
- 如果 `allow` 非空：只有 `allow` 中的工具可用（减去拒绝的）。

### 修剪策略

两个旋钮：
- `prune.idleHours`：移除 X 小时内未使用的容器（0 = 禁用）
- `prune.maxAgeDays`：移除超过 X 天的容器（0 = 禁用）

示例：
- 保持忙碌会话但限制生命周期：
  `idleHours: 24`, `maxAgeDays: 7`
- 永不修剪：
  `idleHours: 0`, `maxAgeDays: 0`

### 安全说明

- 硬隔离仅适用于**工具**（exec/read/write/edit/apply_patch）。
- 主机专用工具如 browser/camera/canvas 默认被阻止。
- 在沙箱中允许 `browser` **破坏隔离**（浏览器在主机上运行）。

## 故障排除

- 镜像缺失：使用 [`scripts/sandbox-setup.sh`](https://github.com/moltbot/moltbot/blob/main/scripts/sandbox-setup.sh) 构建或设置 `agents.defaults.sandbox.docker.image`。
- 容器未运行：它将根据需要按会话自动创建。
- 沙箱中的权限错误：将 `docker.user` 设置为您
  挂载的工作区所有权匹配的 UID:GID（或 chown 工作区文件夹）。
- 自定义工具未找到：Moltbot 使用 `sh -lc`（登录 shell）运行命令，这
  源自 `/etc/profile` 并可能重置 PATH。设置 `docker.env.PATH` 以预置您的
  自定义工具路径（例如，`/custom/bin:/usr/local/share/npm-global/bin`），或在您的 Dockerfile 中
  在 `/etc/profile.d/` 下添加脚本。