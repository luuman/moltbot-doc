---
summary: "设置指南：在保持最新版本的同时定制您的 Moltbot 设置"
read_when:
  - 设置新机器时
  - 您想要"最新 + 最好"的功能而不破坏个人设置
---

# 设置

最后更新：2026-01-01

## 概述
- **定制存在于仓库之外：** `~/clawd`（工作区）+ `~/.clawdbot/moltbot.json`（配置）。
- **稳定工作流：** 安装 macOS 应用；让其运行捆绑的网关。
- **前沿工作流：** 通过 `pnpm gateway:watch` 自己运行网关，然后让 macOS 应用以本地模式连接。

## 先决条件（从源码）
- Node `>=22`
- `pnpm`
- Docker（可选；仅用于容器化设置/e2e — 见 [Docker](/install/docker))

## 定制策略（这样更新不会造成问题）

如果您想要"100% 适合我" *并且* 易于更新，请将您的自定义内容保存在：

- **配置：** `~/.clawdbot/moltbot.json`（类似 JSON/JSON5）
- **工作区：** `~/clawd`（技能、提示、记忆；使其成为私有 git 仓库）

引导一次：

```bash
moltbot setup
```

在仓库内部，使用本地 CLI 入口：

```bash
moltbot setup
```

如果您还没有全局安装，请通过 `pnpm moltbot setup` 运行。

## 稳定工作流（先用 macOS 应用）

1) 安装 + 启动 **Moltbot.app**（菜单栏）。
2) 完成入职/权限清单（TCC 提示）。
3) 确保网关为**本地**且正在运行（应用管理它）。
4) 链接界面（示例：WhatsApp）：

```bash
moltbot channels login
```

5) 健康检查：

```bash
moltbot health
```

如果您的构建中没有入职功能：
- 运行 `moltbot setup`，然后 `moltbot channels login`，然后手动启动网关（`moltbot gateway`）。

## 前沿工作流（终端中的网关）

目标：开发 TypeScript 网关，获得热重载，保持 macOS 应用 UI 连接。

### 0) （可选）也从源码运行 macOS 应用

如果您也希望 macOS 应用处于前沿：

```bash
./scripts/restart-mac.sh
```

### 1) 启动开发网关

```bash
pnpm install
pnpm gateway:watch
```

`gateway:watch` 以监视模式运行网关并在 TypeScript 更改时重新加载。

### 2) 让 macOS 应用指向您正在运行的网关

在 **Moltbot.app** 中：

- 连接模式：**本地**
应用将连接到配置端口上正在运行的网关。

### 3) 验证

- 应用内网关状态应显示为 **"使用现有网关 …"**
- 或通过 CLI：

```bash
moltbot health
```

### 常见错误
- **错误端口：** 网关 WS 默认为 `ws://127.0.0.1:18789`；保持应用 + CLI 在同一端口上。
- **状态存储位置：**
  - 凭据：`~/.clawdbot/credentials/`
  - 会话：`~/.clawdbot/agents/<agentId>/sessions/`
  - 日志：`/tmp/moltbot/`

## 凭据存储映射

调试身份验证或决定备份什么时使用此映射：

- **WhatsApp**：`~/.clawdbot/credentials/whatsapp/<accountId>/creds.json`
- **Telegram 机器人令牌**：配置/环境变量或 `channels.telegram.tokenFile`
- **Discord 机器人令牌**：配置/环境变量（令牌文件尚不支持）
- **Slack 令牌**：配置/环境变量（`channels.slack.*`）
- **配对白名单**：`~/.clawdbot/credentials/<channel>-allowFrom.json`
- **模型认证配置文件**：`~/.clawdbot/agents/<agentId>/agent/auth-profiles.json`
- **旧版 OAuth 导入**：`~/.clawdbot/credentials/oauth.json`
更多详情：[安全性](/gateway/security#credential-storage-map)。

## 更新（不破坏您的设置）

- 将 `~/clawd` 和 `~/.clawdbot/` 作为"您的东西"；不要将个人提示/配置放入 `moltbot` 仓库。
- 更新源码：`git pull` + `pnpm install`（当锁文件更改时）+ 继续使用 `pnpm gateway:watch`。

## Linux（systemd 用户服务）

Linux 安装使用 systemd **用户** 服务。默认情况下，systemd 在注销/空闲时停止用户
服务，这会终止网关。入职过程会尝试为您启用持久化（可能提示 sudo）。如果仍然关闭，请运行：

```bash
sudo loginctl enable-linger $USER
```

对于始终在线或多用户服务器，请考虑使用**系统**服务而不是
用户服务（不需要持久化）。有关 systemd 注释，请参见 [网关操作手册](/gateway)。

## 相关文档

- [网关操作手册](/gateway)（标志、监督、端口）
- [网关配置](/gateway/configuration)（配置架构 + 示例）
- [Discord](/channels/discord) 和 [Telegram](/channels/telegram)（回复标签 + replyToMode 设置）
- [Moltbot 助手设置](/start/clawd)
- [macOS 应用](/platforms/macos)（网关生命周期）
