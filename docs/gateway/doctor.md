---
summary: "Doctor 命令：健康检查、配置迁移和修复步骤"
read_when:
  - 添加或修改 doctor 迁移时
  - 引入破坏性配置更改时
---
# Doctor

`moltbot doctor` 是 Moltbot 的修复 + 迁移工具。它修复陈旧的
配置/状态，检查健康状况，并提供可操作的修复步骤。

## 快速开始

```bash
moltbot doctor
```

### 无头/自动化

```bash
moltbot doctor --yes
```

无需提示即可接受默认值（包括重启/服务/沙盒修复步骤，适当时）。

```bash
moltbot doctor --repair
```

无需提示即可应用推荐的修复（在安全的地方进行修复 + 重启）。

```bash
moltbot doctor --repair --force
```

也应用激进修复（覆盖自定义监督程序配置）。

```bash
moltbot doctor --non-interactive
```

无提示运行，仅应用安全迁移（配置规范化 + 磁盘上状态移动）。跳过需要人工确认的重启/服务/沙盒操作。
检测到时，遗留状态迁移会自动运行。

```bash
moltbot doctor --deep
```

扫描系统服务以查找额外的网关安装（launchd/systemd/schtasks）。

如果你想在写入之前查看更改，请先打开配置文件：

```bash
cat ~/.clawdbot/moltbot.json
```

## 功能（摘要）
- 可选的预飞行更新（git 安装，仅交互式）。
- UI 协议新鲜度检查（当协议架构较新时重新构建控制 UI）。
- 健康检查 + 重启提示。
- 技能状态摘要（符合条件/缺失/被阻止）。
- 遗留值的配置规范化。
- OpenCode Zen 提供商覆盖警告（`models.providers.opencode`）。
- 遗留磁盘状态迁移（会话/代理目录/WhatsApp 认证）。
- 状态完整性和权限检查（会话、转录、状态目录）。
- 配置文件权限检查（chmod 600）在本地运行时。
- 模型认证健康：检查 OAuth 过期，可以刷新即将过期的令牌，并报告认证配置冷却/禁用状态。
- 额外工作空间目录检测（`~/moltbot`）。
- 启用沙盒时的沙盒镜像修复。
- 遗留服务迁移和额外网关检测。
- 网关运行时检查（服务已安装但未运行；缓存的 launchd 标签）。
- 通道状态警告（从运行中的网关探测）。
- 监督程序配置审核（launchd/systemd/schtasks）可选修复。
- 网关运行时最佳实践检查（Node 与 Bun，版本管理器路径）。
- 网关端口冲突诊断（默认 `18789`）。
- 对开放 DM 策略的安全警告。
- 未设置 `gateway.auth.token` 时的网关认证警告（本地模式；提供令牌生成）。
- Linux 上的 systemd linger 检查。
- 源码安装检查（pnpm 工作区不匹配，缺少 UI 资产，缺少 tsx 二进制文件）。
- 写入更新的配置 + 向导元数据。

## 详细行为和理由

### 0) 可选更新（git 安装）
如果这是 git 检出并且 doctor 正在交互式运行，它会在运行 doctor 之前
提供更新（fetch/rebase/build）。

### 1) 配置规范化
如果配置包含遗留值形状（例如 `messages.ackReaction`
没有频道特定的覆盖），doctor 会将它们规范化为当前
架构。

### 2) 遗留配置键迁移
当配置包含已弃用的键时，其他命令拒绝运行并要求
你运行 `moltbot doctor`。

Doctor 将：
- 解释找到的遗留键。
- 显示它应用的迁移。
- 用更新的架构重写 `~/.clawdbot/moltbot.json`。

网关还会在检测到遗留配置格式时在启动时自动运行 doctor 迁移，
因此陈旧配置在无需手动干预的情况下得到修复。

当前迁移：
- `routing.allowFrom` → `channels.whatsapp.allowFrom`
- `routing.groupChat.requireMention` → `channels.whatsapp/telegram/imessage.groups."*".requireMention`
- `routing.groupChat.historyLimit` → `messages.groupChat.historyLimit`
- `routing.groupChat.mentionPatterns` → `messages.groupChat.mentionPatterns`
- `routing.queue` → `messages.queue`
- `routing.bindings` → 顶级 `bindings`
- `routing.agents`/`routing.defaultAgentId` → `agents.list` + `agents.list[].default`
- `routing.agentToAgent` → `tools.agentToAgent`
- `routing.transcribeAudio` → `tools.media.audio.models`
- `bindings[].match.accountID` → `bindings[].match.accountId`
- `identity` → `agents.list[].identity`
- `agent.*` → `agents.defaults` + `tools.*`（工具/提升/执行/沙盒/子代理）
- `agent.model`/`allowedModels`/`modelAliases`/`modelFallbacks`/`imageModelFallbacks`
  → `agents.defaults.models` + `agents.defaults.model.primary/fallbacks` + `agents.defaults.imageModel.primary/fallbacks`

### 2b) OpenCode Zen 提供商覆盖
如果你手动添加了 `models.providers.opencode`（或 `opencode-zen`），它
会覆盖来自 `@mariozechner/pi-ai` 的内置 OpenCode Zen 目录。这可以
强制每个模型使用单个 API 或将成本归零。Doctor 发出警告，以便你可以
移除覆盖并恢复每模型 API 路由 + 成本。

### 3) 遗留状态迁移（磁盘布局）
Doctor 可以将较旧的磁盘上布局迁移到当前结构：
- 会话存储 + 转录：
  - 从 `~/.clawdbot/sessions/` 到 `~/.clawdbot/agents/<agentId>/sessions/`
- 代理目录：
  - 从 `~/.clawdbot/agent/` 到 `~/.clawdbot/agents/<agentId>/agent/`
- WhatsApp 认证状态（Baileys）：
  - 从遗留 `~/.clawdbot/credentials/*.json`（除了 `oauth.json`）
  - 到 `~/.clawdbot/credentials/whatsapp/<accountId>/...`（默认账户 ID：`default`）

这些迁移是尽力而为且幂等的；doctor 会在备份遗留文件夹时发出警告。
网关/CLI 还会在启动时自动迁移遗留会话 + 代理目录，因此历史/认证/模型会
进入每代理路径，无需手动运行 doctor。WhatsApp 认证特意仅通过 `moltbot doctor` 迁移。

### 4) 状态完整性检查（会话持久性、路由和安全）
状态目录是操作的核心。如果它消失，你会丢失
会话、凭据、日志和配置（除非你在其他地方有备份）。

Doctor 检查：
- **状态目录缺失**：警告灾难性状态丢失，提示重新创建
  目录，并提醒你它无法恢复丢失的数据。
- **状态目录权限**：验证可写性；提供修复权限的选项
  （当检测到所有者/组不匹配时发出 `chown` 提示）。
- **会话目录缺失**：`sessions/` 和会话存储目录是
  持久化历史和避免 `ENOENT` 崩溃所必需的。
- **转录不匹配**：当最近的会话条目缺少
  转录文件时发出警告。
- **主会话"1 行 JSONL"**：当主转录只有一行时标记
  （历史没有累积）。
- **多个状态目录**：当多个 `~/.clawdbot` 文件夹存在于
  家目录中或 `CLAWDBOT_STATE_DIR` 指向其他位置时发出警告（历史可以在
  安装之间分割）。
- **远程模式提醒**：如果 `gateway.mode=remote`，doctor 提醒你在
  远程主机上运行（状态在那里）。
- **配置文件权限**：当 `~/.clawdbot/moltbot.json` 可被
  组/世界读取时发出警告并提供收紧到 `600` 的选项。

### 5) 模型认证健康（OAuth 过期）
Doctor 检查认证存储中的 OAuth 配置文件，当令牌
即将过期/已过期时发出警告，并在安全时可以刷新它们。如果 Anthropic Claude Code
配置文件已过时，它建议运行 `claude setup-token`（或粘贴 setup-token）。
刷新提示仅在交互式运行时（TTY）出现；`--non-interactive`
跳过刷新尝试。

Doctor 还报告由于以下原因暂时不可用的认证配置文件：
- 短期冷却时间（速率限制/超时/认证失败）
- 较长的禁用时间（计费/信用失败）

### 6) 钩子模型验证
如果设置了 `hooks.gmail.model`，doctor 会根据
目录和白名单验证模型引用，当它无法解析或不允许时发出警告。

### 7) 沙盒镜像修复
启用沙盒时，doctor 检查 Docker 镜像，如果当前镜像缺失，提供构建或
切换到遗留名称的选项。

### 8) 网关服务迁移和清理提示
Doctor 检测遗留网关服务（launchd/systemd/schtasks）并
提供删除它们并使用当前网关端口安装 Moltbot 服务的选项。
它还可以扫描额外的类似网关服务并打印清理提示。
配置文件命名的 Moltbot 网关服务被视为一级公民，不会
标记为"额外"。

### 9) 安全警告
Doctor 在提供商对 DM 开放而没有白名单时发出警告，或
当策略以危险方式配置时。

### 10) systemd linger（Linux）
如果作为 systemd 用户服务运行，doctor 确保启用 lingering，以便
网关在注销后保持活动。

### 11) 技能状态
Doctor 为当前工作空间打印合格/缺失/被阻止技能的快速摘要。

### 12) 网关认证检查（本地令牌）
Doctor 在本地网关上缺少 `gateway.auth` 时发出警告并提供
生成令牌的选项。使用 `moltbot doctor --generate-gateway-token` 在自动化中强制
创建令牌。

### 13) 网关健康检查 + 重启
Doctor 运行健康检查，当看起来
不健康时提供重启网关的选项。

### 14) 通道状态警告
如果网关健康，doctor 运行通道状态探测并报告
带有建议修复的警告。

### 15) 监督程序配置审核 + 修复
Doctor 检查安装的监督程序配置（launchd/systemd/schtasks）以查找
缺失或过时的默认值（例如，systemd 网络在线依赖关系和
重启延迟）。当它发现不匹配时，它建议更新并可以
将服务文件/任务重写为当前默认值。

注意事项：
- `moltbot doctor` 在重写监督程序配置之前提示。
- `moltbot doctor --yes` 接受默认修复提示。
- `moltbot doctor --repair` 无需提示即可应用推荐的修复。
- `moltbot doctor --repair --force` 覆盖自定义监督程序配置。
- 你总是可以通过 `moltbot gateway install --force` 强制完全重写。

### 16) 网关运行时 + 端口诊断
Doctor 检查服务运行时（PID，上次退出状态）并发出警告，当
服务已安装但实际未运行时。它还检查网关端口上的端口冲突
（默认 `18789`）并报告可能的原因（网关已运行，
SSH 隧道）。

### 17) 网关运行时最佳实践
Doctor 在网关服务在 Bun 或版本管理的 Node 路径上运行时发出警告
（`nvm`、`fnm`、`volta`、`asdf` 等）。WhatsApp + Telegram 通道需要 Node，
版本管理器路径在升级后可能会中断，因为服务不会
加载你的 shell 初始化。Doctor 在可用时提供迁移到系统 Node 安装的选项
（Homebrew/apt/choco）。

### 18) 配置写入 + 向导元数据
Doctor 持久化任何配置更改并加盖向导元数据以记录
doctor 运行。

### 19) 工作空间提示（备份 + 记忆系统）
Doctor 在缺失时建议工作空间记忆系统，如果工作空间
尚未在 git 下，打印备份提示。

参见 [/concepts/agent-workspace](/concepts/agent-workspace) 获取关于
工作空间结构和 git 备份的完整指南（推荐私有 GitHub 或 GitLab）。
