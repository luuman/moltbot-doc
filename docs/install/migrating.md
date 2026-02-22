---
summary: "将 Moltbot 从一台机器移动（迁移）到另一台"
read_when:
  - 您正在将 Moltbot 移动到新的笔记本电脑/服务器
  - 您想要保留会话、认证和频道登录（WhatsApp 等）
---
# 将 Moltbot 迁移到新机器

本指南将 Moltbot 网关从一台机器迁移到另一台**而无需重新进行入门**。

概念上迁移很简单：

- 复制**状态目录**（`$CLAWDBOT_STATE_DIR`，默认：`~/.clawdbot/`）— 这包括配置、认证、会话和频道状态。
- 复制您的**工作区**（默认为 `~/clawd/`）— 这包括您的代理文件（记忆、提示等）。

但围绕**配置文件**、**权限**和**部分复制**有一些常见的陷阱。

## 开始前（您正在迁移的内容）

### 1) 确定您的状态目录

大多数安装使用默认值：

- **状态目录：** `~/.clawdbot/`

但如果使用以下方式可能会不同：

- `--profile <name>`（通常变为 `~/.clawdbot-<profile>/`）
- `CLAWDBOT_STATE_DIR=/some/path`

如果您不确定，在**旧**机器上运行：

```bash
moltbot status
```

在输出中查找 `CLAWDBOT_STATE_DIR` / 配置文件的提及。如果您运行多个网关，请对每个配置文件重复。

### 2) 确定您的工作区

常见默认值：

- `~/clawd/`（推荐工作区）
- 您创建的自定义文件夹

您的工作区是 `MEMORY.md`、`USER.md` 和 `memory/*.md` 等文件所在的位置。

### 3) 了解您将保留什么

如果您复制**两者**状态目录和工作区，您将保留：

- 网关配置（`moltbot.json`）
- 认证配置文件 / API 密钥 / OAuth 令牌
- 会话历史 + 代理状态
- 频道状态（例如 WhatsApp 登录/会话）
- 您的工作区文件（记忆、技能笔记等）

如果您**仅**复制工作区（例如，通过 Git），您**不会**保留：

- 会话
- 凭据
- 频道登录

这些存储在 `$CLAWDBOT_STATE_DIR` 下。

## 迁移步骤（推荐）

### 步骤 0 — 创建备份（旧机器）

在**旧**机器上，首先停止网关，以便文件不会在复制过程中更改：

```bash
moltbot gateway stop
```

（可选但推荐）归档状态目录和工作区：

```bash
# 如果您使用配置文件或自定义位置，请调整路径
cd ~
tar -czf moltbot-state.tgz .clawdbot

tar -czf clawd-workspace.tgz clawd
```

如果您有多个配置文件/状态目录（例如 `~/.clawdbot-main`、`~/.clawdbot-work`），请归档每一个。

### 步骤 1 — 在新机器上安装 Moltbot

在**新**机器上，安装 CLI（以及需要的 Node）：

- 参见：[安装](/install)

在此阶段，如果入门创建了新的 `~/.clawdbot/` 是可以的 — 您将在下一步中覆盖它。

### 步骤 2 — 将状态目录 + 工作区复制到新机器

复制**两者**：

- `$CLAWDBOT_STATE_DIR`（默认 `~/.clawdbot/`）
- 您的工作区（默认 `~/clawd/`）

常见方法：

- `scp` 传输压缩包并解压
- 通过 SSH `rsync -a`
- 外部驱动器

复制后，确保：

- 包含了隐藏目录（例如 `.clawdbot/`）
- 文件所有权对运行网关的用户是正确的

### 步骤 3 — 运行 Doctor（迁移 + 服务修复）

在**新**机器上：

```bash
moltbot doctor
```

Doctor 是"安全无聊"的命令。它修复服务，应用配置迁移，并警告不匹配。

然后：

```bash
moltbot gateway restart
moltbot status
```

## 常见陷阱（及如何避免）

### 陷阱：配置文件 / 状态目录不匹配

如果您使用配置文件（或 `CLAWDBOT_STATE_DIR`）运行旧网关，而新网关使用不同的配置文件，您将看到如下症状：

- 配置更改不起作用
- 频道丢失 / 登出
- 会话历史为空

修复：使用您迁移的**相同**配置文件/状态目录运行网关/服务，然后重新运行：

```bash
moltbot doctor
```

### 陷阱：仅复制 `moltbot.json`

`moltbot.json` 是不够的。许多提供商在以下位置存储状态：

- `$CLAWDBOT_STATE_DIR/credentials/`
- `$CLAWDBOT_STATE_DIR/agents/<agentId>/...`

始终迁移整个 `$CLAWDBOT_STATE_DIR` 文件夹。

### 陷阱：权限 / 所有权

如果您以 root 身份复制或更改了用户，网关可能无法读取凭据/会话。

修复：确保状态目录 + 工作区归运行网关的用户所有。

### 陷阱：在远程/本地模式之间迁移

- 如果您的 UI（WebUI/TUI）指向**远程**网关，远程主机拥有会话存储 + 工作区。
- 迁移您的笔记本电脑不会移动远程网关的状态。

如果您处于远程模式，请迁移**网关主机**。

### 陷阱：备份中的密钥

`$CLAWDBOT_STATE_DIR` 包含密钥（API 密钥、OAuth 令牌、WhatsApp 凭据）。将备份视为生产密钥：

- 加密存储
- 避免通过不安全渠道共享
- 如果怀疑泄露，请轮换密钥

## 验证清单

在新机器上确认：

- `moltbot status` 显示网关正在运行
- 您的频道仍已连接（例如 WhatsApp 不需要重新配对）
- 仪表板打开并显示现有会话
- 您的工作区文件（记忆、配置）存在

## 相关

- [Doctor](/gateway/doctor)
- [网关故障排除](/gateway/troubleshooting)
- [Moltbot 将其数据存储在哪里？](/help/faq#where-does-moltbot-store-its-data)