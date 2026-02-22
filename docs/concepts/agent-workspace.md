---
summary: "代理工作区：位置、布局和备份策略"
read_when:
  - 您需要解释代理工作区或其文件布局时
  - 您想要备份或迁移代理工作区时
---
# 代理工作区

工作区是代理的家。它是用于
文件工具和工作区上下文的唯一工作目录。保持私密并将其视为内存。

这与 `~/.clawdbot/` 分开，后者存储配置、凭证和
会话。

**重要：** 工作区是 **默认 cwd**，而不是硬沙盒。工具
相对于工作区解析相对路径，但绝对路径仍可到达
主机上的其他位置，除非启用了沙盒。如果需要隔离，请使用
[`agents.defaults.sandbox`](/gateway/sandboxing)（和/或每代理沙盒配置）。
当启用沙盒且 `workspaceAccess` 不是 `"rw"` 时，工具在
`~/.clawdbot/sandboxes` 下的沙盒工作区中运行，而不是您的主机工作区。

## 默认位置

- 默认：`~/clawd`
- 如果设置了 `CLAWDBOT_PROFILE` 且不是 `"default"`，默认变为
  `~/clawd-<profile>`。
- 在 `~/.clawdbot/moltbot.json` 中覆盖：

```json5
{
  agent: {
    workspace: "~/clawd"
  }
}
```

`moltbot onboard`、`moltbot configure` 或 `moltbot setup` 将创建
工作区并在缺失时播种引导文件。

如果您自己管理工作区文件，您可以禁用引导
文件创建：

```json5
{ agent: { skipBootstrap: true } }
```

## 额外工作区文件夹

较旧的安装可能创建了 `~/moltbot`。保留多个工作区
目录会导致混淆的认证或状态漂移，因为一次
只能有一个工作区处于活动状态。

**建议：** 保留单个活动工作区。如果您不再使用
额外文件夹，请归档或将它们移动到废纸篓（例如 `trash ~/moltbot`）。
如果您有意保留多个工作区，请确保
`agents.defaults.workspace` 指向活动的那个。

`moltbot doctor` 在检测到额外工作区目录时发出警告。

## 工作区文件映射（每个文件的含义）

这些是 Moltbot 期望在工作区内部的标准文件：

- `AGENTS.md`
  - 代理的操作说明及其应如何使用内存。
  - 在每个会话开始时加载。
  - 是规则、优先级和"如何行为"细节的好地方。

- `SOUL.md`
  - 个性、语气和边界。
  - 每个会话都加载。

- `USER.md`
  - 用户是谁以及如何称呼他们。
  - 每个会话都加载。

- `IDENTITY.md`
  - 代理的名称、风格和表情符号。
  - 在引导仪式期间创建/更新。

- `TOOLS.md`
  - 关于本地工具和约定的注释。
  - 不控制工具可用性；它只是指导。

- `HEARTBEAT.md`
  - 心跳运行的可选小型清单。
  - 保持简短以避免 token 消耗。

- `BOOT.md`
  - 在网关重启时执行的可选启动清单，当启用内部钩子时。
  - 保持简短；使用消息工具进行出站发送。

- `BOOTSTRAP.md`
  - 一次性首次运行仪式。
  - 仅为全新工作区创建。
  - 在仪式完成后删除它。

- `memory/YYYY-MM-DD.md`
  - 每日内存日志（每天一个文件）。
  - 建议在会话开始时阅读今天 + 昨天。

- `MEMORY.md`（可选）
  - 精选的长期内存。
  - 仅在主、私人会话中加载（不共享/群组上下文）。

参见 [内存](/concepts/memory) 了解工作流程和自动内存刷新。

- `skills/`（可选）
  - 工作区特定技能。
  - 在名称冲突时覆盖托管/捆绑技能。

- `canvas/`（可选）
  - 节点显示的画布 UI 文件（例如 `canvas/index.html`）。

如果任何引导文件缺失，Moltbot 将注入"缺失文件"标记到
会话中并继续。大型引导文件在注入时被截断；
使用 `agents.defaults.bootstrapMaxChars` 调整限制（默认：20000）。
`moltbot setup` 可以在不覆盖现有
文件的情况下重新创建缺失的默认值。

## 工作区中没有的内容

这些位于 `~/.clawdbot/` 下，不应提交到工作区仓库：

- `~/.clawdbot/moltbot.json`（配置）
- `~/.clawdbot/credentials/`（OAuth 令牌、API 密钥）
- `~/.clawdbot/agents/<agentId>/sessions/`（会话记录 + 元数据）
- `~/.clawdbot/skills/`（托管技能）

如果您需要迁移会话或配置，请分别复制它们并将其
排除在版本控制之外。

## Git 备份（推荐，私有）

将工作区视为私有内存。将其放入 **私有** git 仓库，以便
备份和恢复。

在运行网关的机器上运行这些步骤（那是
工作区所在的位置）。

### 1) 初始化仓库

如果安装了 git，新工作区会自动初始化。如果这个
工作区还不是仓库，请运行：

```bash
cd ~/clawd
git init
git add AGENTS.md SOUL.md TOOLS.md IDENTITY.md USER.md HEARTBEAT.md memory/
git commit -m "Add agent workspace"
```

### 2) 添加私有远程（初学者友好选项）

选项 A：GitHub 网页界面

1. 在 GitHub 上创建一个新的 **私有** 仓库。
2. 不要用 README 初始化（避免合并冲突）。
3. 复制 HTTPS 远程 URL。
4. 添加远程并推送：

```bash
git branch -M main
git remote add origin <https-url>
git push -u origin main
```

选项 B：GitHub CLI (`gh`)

```bash
gh auth login
gh repo create clawd-workspace --private --source . --remote origin --push
```

选项 C：GitLab 网页界面

1. 在 GitLab 上创建一个新的 **私有** 仓库。
2. 不要用 README 初始化（避免合并冲突）。
3. 复制 HTTPS 远程 URL。
4. 添加远程并推送：

```bash
git branch -M main
git remote add origin <https-url>
git push -u origin main
```

### 3) 持续更新

```bash
git status
git add .
git commit -m "Update memory"
git push
```

## 不要提交秘密

即使在私有仓库中，也要避免在工作区中存储秘密：

- API 密钥、OAuth 令牌、密码或私有凭证。
- `~/.clawdbot/` 下的任何内容。
- 聊天或敏感附件的原始转储。

如果您必须存储敏感引用，请使用占位符并将真正的
秘密保存在其他地方（密码管理器、环境变量或 `~/.clawdbot/`）。

建议的 `.gitignore` 入门：

```gitignore
.DS_Store
.env
**/*.key
**/*.pem
**/secrets*
```

## 将工作区移动到新机器

1. 将仓库克隆到所需路径（默认 `~/clawd`）。
2. 在 `~/.clawdbot/moltbot.json` 中将 `agents.defaults.workspace` 设置为此路径。
3. 运行 `moltbot setup --workspace <path>` 以播种任何缺失的文件。
4. 如果您需要会话，请从
   旧机器单独复制 `~/.clawdbot/agents/<agentId>/sessions/`。

## 高级说明

- 多代理路由可以为每个代理使用不同工作区。参见
  [通道路由](/concepts/channel-routing) 了解路由配置。
- 如果启用了 `agents.defaults.sandbox`，非主会话可以在 `agents.defaults.sandbox.workspaceRoot` 下使用每会话沙盒
  工作区。