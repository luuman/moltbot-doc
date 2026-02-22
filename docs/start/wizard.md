---
summary: "CLI 入门向导：引导设置网关、工作区、频道和技能"
read_when:
  - 运行或配置入门向导时
  - 设置新机器时
---

# 入门向导 (CLI)

入门向导是在 macOS、Linux 或 Windows（通过 WSL2；强烈推荐）上设置 Moltbot 的**推荐**方式。
它在一个引导流程中配置本地网关或远程网关连接，以及频道、技能和工作区默认值。

主要入口点：

```bash
moltbot onboard
```

最快首次聊天：打开控制界面（无需设置频道）。运行
`moltbot dashboard` 并在浏览器中聊天。文档：[仪表板](/web/dashboard)。

后续重新配置：

```bash
moltbot configure
```

建议：设置 Brave Search API 密钥，以便代理可以使用 `web_search`
（`web_fetch` 可以在没有密钥的情况下工作）。最简单的路径：`moltbot configure --section web`
这将存储 `tools.web.search.apiKey`。文档：[网络工具](/tools/web)。

## 快速启动 vs 高级

向导以**快速启动**（默认）与**高级**（完全控制）开始。

**快速启动**保持默认值：
- 本地网关（回环）
- 工作区默认值（或现有工作区）
- 网关端口 **18789**
- 网关认证 **令牌**（自动生成，即使在回环上）
- Tailscale 暴露 **关闭**
- Telegram + WhatsApp 私信默认为 **白名单**（系统会提示您输入电话号码）

**高级**暴露每个步骤（模式、工作区、网关、频道、守护进程、技能）。

## 向导的作用

**本地模式（默认）** 引导您完成以下步骤：
  - 模型/认证（OpenAI Code (Codex) 订阅 OAuth、Anthropic API 密钥（推荐）或设置令牌（粘贴），以及 MiniMax/GLM/Moonshot/AI 网关选项）
- 工作区位置 + 引导文件
- 网关设置（端口/绑定/认证/尾标）
- 提供商（Telegram、WhatsApp、Discord、Google Chat、Mattermost（插件）、Signal）
- 守护进程安装（LaunchAgent / systemd 用户单元）
- 健康检查
- 技能（推荐）

**远程模式** 仅配置本地客户端以连接到其他地方的网关。
它**不会**在远程主机上安装或更改任何内容。

要添加更多隔离代理（单独的工作区 + 会话 + 认证），请使用：

```bash
moltbot agents add <name>
```

提示：`--json` **不**意味着非交互模式。脚本请使用 `--non-interactive`（和 `--workspace`）。

## 流程详情（本地）

1) **现有配置检测**
   - 如果 `~/.clawdbot/moltbot.json` 存在，请选择 **保留 / 修改 / 重置**。
   - 重新运行向导**不会**清除任何内容，除非您明确选择 **重置**
     （或传递 `--reset`）。
   - 如果配置无效或包含旧键，向导会停止并要求
     您运行 `moltbot doctor` 然后继续。
   - 重置使用 `trash`（从不使用 `rm`）并提供范围：
     - 仅配置
     - 配置 + 凭据 + 会话
     - 完全重置（也删除工作区）

2) **模型/认证**
   - **Anthropic API 密钥（推荐）**：如果存在则使用 `ANTHROPIC_API_KEY` 或提示输入密钥，然后保存以供守护进程使用。
   - **Anthropic OAuth（Claude Code CLI）**：在 macOS 上，向导检查钥匙串项目 "Claude Code-credentials"（选择"始终允许"，以便 launchd 启动不会阻塞）；在 Linux/Windows 上，如果存在则重用 `~/.claude/.credentials.json`。
   - **Anthropic 令牌（粘贴设置令牌）**：在任何机器上运行 `claude setup-token`，然后粘贴令牌（您可以命名它；空白 = 默认）。
   - **OpenAI Code（Codex）订阅（Codex CLI）**：如果 `~/.codex/auth.json` 存在，向导可以重用它。
   - **OpenAI Code（Codex）订阅（OAuth）**：浏览器流程；粘贴 `code#state`。
     - 当模型未设置或为 `openai/*` 时，将 `agents.defaults.model` 设置为 `openai-codex/gpt-5.2`。
   - **OpenAI API 密钥**：如果存在则使用 `OPENAI_API_KEY` 或提示输入密钥，然后保存到 `~/.clawdbot/.env` 以便 launchd 可以读取它。
   - **OpenCode Zen（多模型代理）**：提示输入 `OPENCODE_API_KEY`（或 `OPENCODE_ZEN_API_KEY`，在 https://opencode.ai/auth 获取）。
   - **API 密钥**：为您存储密钥。
   - **Vercel AI 网关（多模型代理）**：提示输入 `AI_GATEWAY_API_KEY`。
   - 更多详情：[Vercel AI 网关](/providers/vercel-ai-gateway)
   - **MiniMax M2.1**：自动写入配置。
   - 更多详情：[MiniMax](/providers/minimax)
   - **Synthetic（与 Anthropic 兼容）**：提示输入 `SYNTHETIC_API_KEY`。
   - 更多详情：[Synthetic](/providers/synthetic)
   - **Moonshot（Kimi K2）**：自动写入配置。
   - **Kimi Code**：自动写入配置。
   - 更多详情：[Moonshot AI（Kimi + Kimi Code）](/providers/moonshot)
   - **跳过**：尚未配置认证。
   - 从检测到的选项中选择默认模型（或手动输入提供商/模型）。
   - 向导运行模型检查，如果配置的模型未知或缺少认证，则发出警告。
  - OAuth 凭据位于 `~/.clawdbot/credentials/oauth.json`；认证配置文件位于 `~/.clawdbot/agents/<agentId>/agent/auth-profiles.json`（API 密钥 + OAuth）。
   - 更多详情：[/concepts/oauth](/concepts/oauth)

3) **工作区**
   - 默认 `~/clawd`（可配置）。
   - 提供代理引导仪式所需的工件文件。
   - 完整工作区布局 + 备份指南：[代理工作区](/concepts/agent-workspace)

4) **网关**
   - 端口、绑定、认证模式、tailscale 暴露。
   - 认证建议：即使是回环也保持**令牌**，以便本地 WS 客户端必须进行身份验证。
   - 仅当您完全信任每个本地进程时才禁用认证。
   - 非回环绑定仍需要认证。

5) **频道**
  - WhatsApp：可选 QR 登录。
  - Telegram：机器人令牌。
  - Discord：机器人令牌。
  - Google Chat：服务账户 JSON + webhook 受众。
  - Mattermost（插件）：机器人令牌 + 基础 URL。
   - Signal：可选 `signal-cli` 安装 + 账户配置。
   - iMessage：本地 `imsg` CLI 路径 + 数据库访问。
  - 私信安全：默认是配对。第一条私信发送代码；通过 `moltbot pairing approve <channel> <code>` 批准或使用白名单。

6) **守护进程安装**
   - macOS：LaunchAgent
     - 需要登录用户会话；对于无头服务器，请使用自定义 LaunchDaemon（未附带）。
   - Linux（和通过 WSL2 的 Windows）：systemd 用户单元
     - 向导尝试通过 `loginctl enable-linger <user>` 启用持久化，以便网关在注销后保持运行。
     - 可能提示 sudo（写入 `/var/lib/systemd/linger`）；它首先尝试不使用 sudo。
   - **运行时选择：** Node（推荐；WhatsApp/Telegram 必需）。Bun **不推荐**。

7) **健康检查**
   - 启动网关（如需要）并运行 `moltbot health`。
   - 提示：`moltbot status --deep` 将网关健康探测添加到状态输出中（需要可访问的网关）。

8) **技能（推荐）**
   - 读取可用技能并检查要求。
   - 让您选择节点管理器：**npm / pnpm**（不推荐 bun）。
   - 安装可选依赖项（一些在 macOS 上使用 Homebrew）。

9) **完成**
   - 总结 + 下一步，包括用于额外功能的 iOS/Android/macOS 应用。
  - 如果未检测到 GUI，向导打印 SSH 端口转发说明以代替打开浏览器。
  - 如果控制界面资源缺失，向导尝试构建它们；备用方案是 `pnpm ui:build`（自动安装 UI 依赖项）。

## 远程模式

远程模式配置本地客户端以连接到其他地方的网关。

您将设置：
- 远程网关 URL（`ws://...`）
- 如果远程网关需要认证，则设置令牌（推荐）

注意事项：
- 不执行远程安装或守护进程更改。
- 如果网关仅为回环，请使用 SSH 隧道或尾网。
- 发现提示：
  - macOS：Bonjour（`dns-sd`）
  - Linux：Avahi（`avahi-browse`）

## 添加另一个代理

使用 `moltbot agents add <name>` 创建具有自己工作区、会话和认证配置文件的独立代理。
不带 `--workspace` 运行会启动向导。

它设置的内容：
- `agents.list[].name`
- `agents.list[].workspace`
- `agents.list[].agentDir`

注意事项：
- 默认工作区遵循 `~/clawd-<agentId>`。
- 添加 `bindings` 以路由传入消息（向导可以做到这一点）。
- 非交互标志：`--model`、`--agent-dir`、`--bind`、`--non-interactive`。

## 非交互模式

使用 `--non-interactive` 自动化或脚本化入门：

```bash
moltbot onboard --non-interactive \
  --mode local \
  --auth-choice apiKey \
  --anthropic-api-key "$ANTHROPIC_API_KEY" \
  --gateway-port 18789 \
  --gateway-bind loopback \
  --install-daemon \
  --daemon-runtime node \
  --skip-skills
```

添加 `--json` 以获得机器可读摘要。

Gemini 示例：

```bash
moltbot onboard --non-interactive \
  --mode local \
  --auth-choice gemini-api-key \
  --gemini-api-key "$GEMINI_API_KEY" \
  --gateway-port 18789 \
  --gateway-bind loopback
```

Z.AI 示例：

```bash
moltbot onboard --non-interactive \
  --mode local \
  --auth-choice zai-api-key \
  --zai-api-key "$ZAI_API_KEY" \
  --gateway-port 18789 \
  --gateway-bind loopback
```

Vercel AI 网关示例：

```bash
moltbot onboard --non-interactive \
  --mode local \
  --auth-choice ai-gateway-api-key \
  --ai-gateway-api-key "$AI_GATEWAY_API_KEY" \
  --gateway-port 18789 \
  --gateway-bind loopback
```

Moonshot 示例：

```bash
moltbot onboard --non-interactive \
  --mode local \
  --auth-choice moonshot-api-key \
  --moonshot-api-key "$MOONSHOT_API_KEY" \
  --gateway-port 18789 \
  --gateway-bind loopback
```

Synthetic 示例：

```bash
moltbot onboard --non-interactive \
  --mode local \
  --auth-choice synthetic-api-key \
  --synthetic-api-key "$SYNTHETIC_API_KEY" \
  --gateway-port 18789 \
  --gateway-bind loopback
```

OpenCode Zen 示例：

```bash
moltbot onboard --non-interactive \
  --mode local \
  --auth-choice opencode-zen \
  --opencode-zen-api-key "$OPENCODE_API_KEY" \
  --gateway-port 18789 \
  --gateway-bind loopback
```

添加代理（非交互）示例：

```bash
moltbot agents add work \
  --workspace ~/clawd-work \
  --model openai/gpt-5.2 \
  --bind whatsapp:biz \
  --non-interactive \
  --json
```

## 网关向导 RPC

网关通过 RPC 暴露向导流程（`wizard.start`、`wizard.next`、`wizard.cancel`、`wizard.status`）。
客户端（macOS 应用、控制界面）可以在不重新实现入门逻辑的情况下渲染步骤。

## Signal 设置 (signal-cli)

向导可以从 GitHub 发布版安装 `signal-cli`：
- 下载适当的发布资源。
- 存储在 `~/.clawdbot/tools/signal-cli/<version>/` 下。
- 将 `channels.signal.cliPath` 写入您的配置。

注意事项：
- JVM 构建需要 **Java 21**。
- 在可用时使用原生构建。
- Windows 使用 WSL2；signal-cli 安装遵循 WSL 内部的 Linux 流程。

## 向导写入的内容

`~/.clawdbot/moltbot.json` 中的典型字段：
- `agents.defaults.workspace`
- `agents.defaults.model` / `models.providers`（如果选择了 Minimax）
- `gateway.*`（模式、绑定、认证、tailscale）
- `channels.telegram.botToken`、`channels.discord.token`、`channels.signal.*`、`channels.imessage.*`
- 频道白名单（Slack/Discord/Matrix/Microsoft Teams）当您在提示期间选择加入时（名称在可能的情况下解析为 ID）。
- `skills.install.nodeManager`
- `wizard.lastRunAt`
- `wizard.lastRunVersion`
- `wizard.lastRunCommit`
- `wizard.lastRunCommand`
- `wizard.lastRunMode`

`moltbot agents add` 写入 `agents.list[]` 和可选的 `bindings`。

WhatsApp 凭据位于 `~/.clawdbot/credentials/whatsapp/<accountId>/` 下。
会话存储在 `~/.clawdbot/agents/<agentId>/sessions/` 下。

某些频道作为插件交付。当您在入门过程中选择一个时，向导
将在配置之前提示安装它（npm 或本地路径）。

## 相关文档

- macOS 应用入门：[入门](/start/onboarding)
- 配置参考：[网关配置](/gateway/configuration)
- 提供商：[WhatsApp](/channels/whatsapp)、[Telegram](/channels/telegram)、[Discord](/channels/discord)、[Google Chat](/channels/googlechat)、[Signal](/channels/signal)、[iMessage](/channels/imessage)
- 技能：[技能](/tools/skills)、[技能配置](/tools/skills-config)
