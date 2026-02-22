---
summary: "关于 Moltbot 设置、配置和使用的常见问题解答"
---
# 常见问题解答

快速答案以及针对实际设置的深入故障排除（本地开发、VPS、多代理、OAuth/API 密钥、模型故障转移）。有关运行时诊断，请参阅[故障排除](/gateway/troubleshooting)。有关完整配置参考，请参阅[配置](/gateway/configuration)。

## 目录

- [快速入门和首次运行设置](#快速入门和首次运行设置)
  - [我卡住了，最快摆脱困境的方法是什么？](#我卡住了最快摆脱困境的方法是什么)
  - [推荐的 Moltbot 安装和设置方式是什么？](#推荐的-moltbot-安装和设置方式是什么)
  - [如何在入职后打开仪表板？](#如何在入职后打开仪表板)
  - [如何在本地主机与远程之间验证仪表板（令牌）？](#如何在本地主机与远程之间验证仪表板令牌)
  - [我需要什么运行时环境？](#我需要什么运行时环境)
  - [它能在树莓派上运行吗？](#它能在树莓派上运行吗)
  - [树莓派安装有什么提示？](#树莓派安装有什么提示)
  - [它卡在"唤醒我的朋友" / 入职无法孵化。现在怎么办？](#它卡在唤醒我的朋友--入职无法孵化现在怎么办)
  - [可以在不重新进行入职的情况下将我的设置迁移到新机器（Mac mini）吗？](#可以在不重新进行入职的情况下将我的设置迁移到新机器mac-mini吗)
  - [我在哪里可以看到最新版本的新功能？](#我在哪里可以看到最新版本的新功能)
  - [我无法访问 docs.molt.bot（SSL 错误）。现在怎么办？](#我无法访问-docsmoltbotssl-错误现在怎么办)
  - [稳定版和测试版有什么区别？](#稳定版和测试版有什么区别)
- [如何安装测试版，测试版和开发版有什么区别？](#如何安装测试版和开发版有什么区别)
  - [我如何尝试最新的组件？](#我如何尝试最新的组件)
  - [安装和入职通常需要多长时间？](#安装和入职通常需要多长时间)
  - [安装程序卡住了？我如何获得更多信息？](#安装程序卡住了我如何获得更多反馈)
  - [Windows 安装显示找不到 git 或 moltbot 未被识别](#windows-安装显示找不到-git-或-moltbot-未被识别)
  - [文档没有回答我的问题 - 我如何得到更好的答案？](#文档没有回答我的问题--我如何得到更好的答案)
  - [如何在 Linux 上安装 Moltbot？](#如何在-linux-上安装-moltbot)
  - [如何在 VPS 上安装 Moltbot？](#如何在-vps-上安装-moltbot)
  - [云/VPS 安装指南在哪里？](#云vps-安装指南在哪里)
  - [我可以要求 Clawd 自动更新吗？](#我可以要求-clawd-自动更新吗)
  - [入职向导实际上做什么？](#入职向导实际上做什么)
  - [我需要 Claude 或 OpenAI 订阅才能运行这个吗？](#我需要-claude-或-openai-订阅才能运行这个吗)
  - [我可以在没有 API 密钥的情况下使用 Claude Max 订阅](#我可以在没有-api-密钥的情况下使用-claude-max-订阅)
  - [Anthropic "setup-token" 认证是如何工作的？](#anthropic-setuptoken-认证是如何工作的)
  - [我在哪里可以找到 Anthropic setup-token？](#我在哪里可以找到-anthropic-setup-token)
  - [你们支持 Claude 订阅认证（Claude Code OAuth）吗？](#你们支持-claude-订阅认证claude-code-oauth吗)
  - [为什么我看到来自 Anthropic 的 `HTTP 429: rate_limit_error`？](#为什么我看到来自-anthropic-的-http-429-ratelimiterror)
  - [是否支持 AWS Bedrock？](#是否支持-aws-bedrock)
  - [Codex 认证是如何工作的？](#codex-认证是如何工作的)
  - [你们支持 OpenAI 订阅认证（Codex OAuth）吗？](#你们支持-openai-订阅认证codex-oauth吗)
  - [我如何设置 Gemini CLI OAuth](#我如何设置-gemini-cli-oauth)
  - [本地模型适合随意聊天吗？](#本地模型适合随意聊天吗)
  - [我如何将托管模型流量保持在特定区域？](#我如何将托管模型流量保持在特定区域)
  - [我必须购买 Mac Mini 才能安装这个吗？](#我必须购买-mac-mini-才能安装这个吗)
  - [我需要 Mac mini 来支持 iMessage 吗？](#我需要-mac-mini-来支持-imessage-吗)
  - [如果我购买 Mac mini 来运行 Moltbot，我可以将其连接到我的 MacBook Pro 吗？](#如果我购买-mac-mini-来运行-moltbot我可以将其连接到我的-macbook-pro-吗)
  - [我可以使用 Bun 吗？](#我可以使用-bun-吗)
  - [Telegram：`allowFrom` 中应该放什么？](#telegramallowfrom-中应该放什么)
  - [多个人可以使用一个 WhatsApp 号码和不同的 Moltbots 吗？](#多个人可以使用一个-whatsapp-号码和不同的-moltbots-吗)
  - [我可以运行一个"快速聊天"代理和一个"用于编码的 Opus"代理吗？](#我可以运行一个快速聊天代理和一个用于编码的-opus-代理吗)
  - [Homebrew 在 Linux 上有效吗？](#homebrew-在-linux-上有效吗)
  - [可修改（git）安装和 npm 安装有什么区别？](#可修改git-安装和-npm-安装有什么区别)
  - [以后我可以在 npm 和 git 安装之间切换吗？](#以后我可以在-npm-和-git-安装之间切换吗)
  - [我应该在我的笔记本电脑还是 VPS 上运行网关？](#我应该在我的笔记本电脑还是-vps-上运行网关)
  - [在专用机器上运行 Moltbot 有多重要？](#在专用机器上运行-moltbot-有多重要)
  - [最低 VPS 要求和推荐的操作系统是什么？](#最低-vps-要求和推荐的操作系统是什么)
  - [我可以在虚拟机中运行 Moltbot 吗，有什么要求](#我可以在虚拟机中运行-moltbot-吗有什么要求)
- [什么是 Moltbot？](#什么是-moltbot)
  - [用一段话描述 Moltbot 是什么？](#用一段话描述-moltbot-是什么)
  - [价值主张是什么？](#价值主张是什么)
  - [我刚设置好，我应该先做什么](#我刚设置好我应该先做什么)
  - [Moltbot 的五大日常用例是什么](#moltbot-的五大日常用例是什么)
  - [Moltbot 能帮助 SaaS 的潜在客户开发推广广告和博客吗](#moltbot-能帮助-saas-的潜在客户开发推广广告和博客吗)
  - [与 Claude Code 相比，Web 开发的优势是什么？](#与-claude-code-相比web-开发的优势是什么)
- [技能和自动化](#技能和自动化)
  - [如何自定义技能而不让仓库变脏？](#如何自定义技能而不让仓库变脏)
  - [我可以从自定义文件夹加载技能吗？](#我可以从自定义文件夹加载技能吗)
  - [我如何为不同任务使用不同的模型？](#我如何为不同任务使用不同的模型)
  - [机器人在做繁重工作时会冻结。我如何卸载它？](#机器人在做繁重工作时会冻结我如何卸载它)
  - [Cron 或提醒不会触发。我应该检查什么？](#cron-或提醒不会触发我应该检查什么)
  - [如何在 Linux 上安装技能？](#如何在-linux-上安装技能)
  - [Moltbot 可以按计划或在后台持续运行任务吗？](#moltbot-可以按计划或在后台持续运行任务吗)
  - [我可以在 Linux 上运行仅 Apple/macOS 技能吗？](#我可以在-linux-上运行仅-applemacos-技能吗)
  - [你们有 Notion 或 HeyGen 集成吗？](#你们有-notion-或-heygen-集成吗)
  - [我如何安装 Chrome 扩展程序以接管浏览器？](#我如何安装-chrome-扩展程序以接管浏览器)
- [沙箱和内存](#沙箱和内存)
  - [有专门的沙箱文档吗？](#有专门的沙箱文档吗)
  - [如何将主机文件夹绑定到沙箱中？](#如何将主机文件夹绑定到沙箱中)
  - [内存是如何工作的？](#内存是如何工作的)
  - [内存总是在忘记事情。我如何让它记住？](#内存总是在忘记事情我如何让它记住)
  - [内存会永久保留吗？限制是什么？](#内存会永久保留吗限制是什么)
  - [语义内存搜索需要 OpenAI API 密钥吗？](#语义内存搜索需要-openai-api-密钥吗)
- [事物在磁盘上的存储位置](#事物在磁盘上的存储位置)
  - [与 Moltbot 一起使用的所有数据都保存在本地吗？](#与-moltbot-一起使用的所有数据都保存在本地吗)
  - [Moltbot 将数据存储在哪里？](#moltbot-将数据存储在哪里)
  - [AGENTS.md / SOUL.md / USER.md / MEMORY.md 应该放在哪里？](#agentsmd-soulmd-usermd-memorymd-应该放在哪里)
  - [推荐的备份策略是什么？](#推荐的备份策略是什么)
  - [我如何完全卸载 Moltbot？](#我如何完全卸载-moltbot)
  - [代理可以在工作区外工作吗？](#代理可以在工作区外工作吗)
  - [我在远程模式 - 会话存储在哪里？](#我在远程模式--会话存储在哪里)
- [配置基础](#配置基础)
  - [配置格式是什么？它在哪里？](#配置格式是什么它在哪里)
  - [我设置了 `gateway.bind: "lan"`（或 `"tailnet"`），现在没有任何监听 / UI 显示未授权](#我设置了-gatewaybind-lan-或-tailnet现在没有任何监听--ui-显示未授权)
  - [为什么我现在在本地主机上需要令牌？](#为什么我现在在本地主机上需要令牌)
  - [更改配置后是否必须重启？](#更改配置后是否必须重启)
  - [我如何启用网络搜索（和网络获取）？](#我如何启用网络搜索和网络获取)
  - [config.apply 清除了我的配置。我如何恢复并避免这种情况？](#configapply-清除了我的配置我如何恢复并避免这种情况)
  - [我如何跨设备运行中央网关和专业工作者？](#我如何跨设备运行中央网关和专业工作者)
  - [Moltbot 浏览器可以无头运行吗？](#moltbot-浏览器可以无头运行吗)
  - [我如何使用 Brave 进行浏览器控制？](#我如何使用-brave-进行浏览器控制)
- [远程网关 + 节点](#远程网关--节点)
  - [命令如何在 Telegram、网关和节点之间传播？](#命令如何在-telegram网关和节点之间传播)
  - [如果网关托管在远程，我的代理如何访问我的计算机？](#如果网关托管在远程我的代理如何访问我的计算机)
  - [Tailscale 已连接但我没有收到回复。现在怎么办？](#tailscale-已连接但我没有收到回复现在怎么办)
  - [两个 Moltbots 可以相互通信吗（本地 + VPS）？](#两个-moltbots-可以相互通信吗本地--vps)
  - [多个代理是否需要单独的 VPS](#多个代理是否需要单独的-vps)
  - [使用我个人笔记本电脑上的节点而不是从 VPS 进行 SSH 是否有好处？](#使用我个人笔记本电脑上的节点而不是从-vps-进行-ssh-是否有好处)
  - [节点运行网关服务吗？](#节点运行网关服务吗)
  - [是否有应用配置的 API / RPC 方式？](#是否有应用配置的-api--rpc-方式y-config)
  - [What's a minimal "sane" config for a first install?](#whats-a-minimal-sane-config-for-a-first-install)
  - [How do I set up Tailscale on a VPS and connect from my Mac?](#how-do-i-set-up-tailscale-on-a-vps-and-connect-from-my-mac)
  - [How do I connect a Mac node to a remote Gateway (Tailscale Serve)?](#how-do-i-connect-a-mac-node-to-a-remote-gateway-tailscale-serve)
  - [Should I install on a second laptop or just add a node?](#should-i-install-on-a-second-laptop-or-just-add-a-node)
- [Env vars and .env loading](#env-vars-and-env-loading)
  - [How does Moltbot load environment variables?](#how-does-moltbot-load-environment-variables)
  - ["I started the Gateway via the service and my env vars disappeared." What now?](#i-started-the-gateway-via-the-service-and-my-env-vars-disappeared-what-now)
  - [I set `COPILOT_GITHUB_TOKEN`, but models status shows "Shell env: off." Why?](#i-set-copilotgithubtoken-but-models-status-shows-shell-env-off-why)
- [Sessions & multiple chats](#sessions-multiple-chats)
  - [How do I start a fresh conversation?](#how-do-i-start-a-fresh-conversation)
  - [Do sessions reset automatically if I never send `/new`?](#do-sessions-reset-automatically-if-i-never-send-new)
  - [Is there a way to make a team of Moltbots one CEO and many agents](#is-there-a-way-to-make-a-team-of-moltbots-one-ceo-and-many-agents)
  - [Why did context get truncated mid-task? How do I prevent it?](#why-did-context-get-truncated-midtask-how-do-i-prevent-it)
  - [How do I completely reset Moltbot but keep it installed?](#how-do-i-completely-reset-moltbot-but-keep-it-installed)
  - [I'm getting "context too large" errors - how do I reset or compact?](#im-getting-context-too-large-errors-how-do-i-reset-or-compact)
  - [Why am I seeing "LLM request rejected: messages.N.content.X.tool_use.input: Field required"?](#why-am-i-seeing-llm-request-rejected-messagesncontentxtooluseinput-field-required)
  - [Why am I getting heartbeat messages every 30 minutes?](#why-am-i-getting-heartbeat-messages-every-30-minutes)
  - [Do I need to add a "bot account" to a WhatsApp group?](#do-i-need-to-add-a-bot-account-to-a-whatsapp-group)
  - [How do I get the JID of a WhatsApp group?](#how-do-i-get-the-jid-of-a-whatsapp-group)
  - [Why doesn't Moltbot reply in a group?](#why-doesnt-moltbot-reply-in-a-group)
  - [Do groups/threads share context with DMs?](#do-groupsthreads-share-context-with-dms)
  - [How many workspaces and agents can I create?](#how-many-workspaces-and-agents-can-i-create)
  - [Can I run multiple bots or chats at the same time (Slack), and how should I set that up?](#can-i-run-multiple-bots-or-chats-at-the-same-time-slack-and-how-should-i-set-that-up)
- [Models: defaults, selection, aliases, switching](#models-defaults-selection-aliases-switching)
  - [What is the "default model"?](#what-is-the-default-model)
  - [What model do you recommend?](#what-model-do-you-recommend)
  - [How do I switch models without wiping my config?](#how-do-i-switch-models-without-wiping-my-config)
  - [Can I use self-hosted models (llama.cpp, vLLM, Ollama)?](#can-i-use-selfhosted-models-llamacpp-vllm-ollama)
  - [What do Clawd, Flawd, and Krill use for models?](#what-do-clawd-flawd-and-krill-use-for-models)
  - [How do I switch models on the fly (without restarting)?](#how-do-i-switch-models-on-the-fly-without-restarting)
  - [Can I use GPT 5.2 for daily tasks and Codex 5.2 for coding](#can-i-use-gpt-52-for-daily-tasks-and-codex-52-for-coding)
  - [Why do I see "Model … is not allowed" and then no reply?](#why-do-i-see-model-is-not-allowed-and-then-no-reply)
  - [Why do I see "Unknown model: minimax/MiniMax-M2.1"?](#why-do-i-see-unknown-model-minimaxminimaxm21)
  - [Can I use MiniMax as my default and OpenAI for complex tasks?](#can-i-use-minimax-as-my-default-and-openai-for-complex-tasks)
  - [Are opus / sonnet / gpt built-in shortcuts?](#are-opus-sonnet-gpt-builtin-shortcuts)
  - [How do I define/override model shortcuts (aliases)?](#how-do-i-defineoverride-model shortcuts-aliases)
  - [How do I add models from other providers like OpenRouter or Z.AI?](#how-do-i-add-models-from-other-providers-like-openrouter-or-zai)
- [Model failover and "All models failed"](#model-failover-and-all-models-failed)
  - [How does failover work?](#how-does-failover-work)
  - [What does this error mean?](#what-does-this-error-mean)
  - [Fix checklist for `No credentials found for profile "anthropic:default"`](#fix-checklist-for-no-credentials-found-for-profile-anthropicdefault)
  - [Why did it also try Google Gemini and fail?](#why-did-it-also-try-google-gemini-and-fail)
- [Auth profiles: what they are and how to manage them](#auth-profiles-what-they-are-and-how-to-manage-them)
  - [What is an auth profile?](#what-is-an-auth-profile)
  - [What are typical profile IDs?](#what-are-typical-profile-ids)
  - [Can I control which auth profile is tried first?](#can-i-control-which-auth-profile-is-tried-first)
  - [OAuth vs API key: what's the difference?](#oauth-vs-api-key-whats-the-difference)
- [Gateway: ports, "already running", and remote mode](#gateway-ports-already-running-and-remote-mode)
  - [What port does the Gateway use?](#what-port-does-the-gateway-use)
  - [Why does `moltbot gateway status` say `Runtime: running` but `RPC probe: failed`?](#why-does-moltbot-gateway-status-say-runtime-running-but-rpc-probe-failed)
  - [Why does `moltbot gateway status` show `Config (cli)` and `Config (service)` different?](#why-does-moltbot-gateway-status-show-config-cli-and-config-service-different)
  - [What does "another gateway instance is already listening" mean?](#what-does-another-gateway-instance-is-already-listening-mean)
  - [How do I run Moltbot in remote mode (client connects to a Gateway elsewhere)?](#how-do-i-run-moltbot-in-remote-mode-client-connects-to-a-gateway-elsewhere)
  - [The Control UI says "unauthorized" (or keeps reconnecting). What now?](#the-control-ui-says-unauthorized-or-keeps-reconnecting-what-now)
  - [I set `gateway.bind: "tailnet"` but it can't bind / nothing listens](#i-set-gatewaybind-tailnet-but-it-cant-bind-nothing-listens)
  - [Can I run multiple Gateways on the same host?](#can-i-run-multiple-gateways-on-the-same-host)
  - [What does "invalid handshake" / code 1008 mean?](#what-does-invalid-handshake-code-1008-mean)
- [Logging and debugging](#logging-and-debugging)
  - [Where are logs?](#where-are-logs)
  - [How do I start/stop/restart the Gateway service?](#how-do-i-startstoprestart-the-gateway-service)
  - [I closed my terminal on Windows - how do I restart Moltbot?](#i-closed-my-terminal-on-windows-how-do-i-restart-moltbot)
  - [The Gateway is up but replies never arrive. What should I check?](#the-gateway-is-up-but-replies-never-arrive-what-should-i-check)
  - ["Disconnected from gateway: no reason" - what now?](#disconnected-from-gateway-no-reason-what-now)
  - [Telegram setMyCommands fails with network errors. What should I check?](#telegram-setmycommands-fails-with-network-errors-what-should-i-check)
  - [TUI shows no output. What should I check?](#tui-shows-no-output-what-should-i-check)
  - [How do I completely stop then start the Gateway?](#how-do-i-completely-stop-then-start-the-gateway)
  - [ELI5: `moltbot gateway restart` vs `moltbot gateway`](#eli5-moltbot-gateway-restart-vs-moltbot-gateway)
  - [What's the fastest way to get more details when something fails?](#whats-the-fastest-way-to-get-more-details-when-something-fails)
- [Media & attachments](#media-attachments)
  - [My skill generated an image/PDF, but nothing was sent](#my-skill-generated-an-imagepdf-but-nothing-was-sent)
- [Security and access control](#security-and-access-control)
  - [Is it safe to expose Moltbot to inbound DMs?](#is-it-safe-to-expose-moltbot-to-inbound-dms)
  - [Is prompt injection only a concern for public bots?](#is-prompt-injection-only-a-concern-for-public-bots)
  - [Should my bot have its own email GitHub account or phone number](#should-my-bot-have-its-own-email-github-account-or-phone-number)
  - [Can I give it autonomy over my text messages and is that safe](#can-i-give-it-autonomy-over-my-text-messages-and-is-that-safe)
  - [Can I use cheaper models for personal assistant tasks?](#can-i-use-cheaper-models-for-personal-assistant-tasks)
  - [I ran `/start` in Telegram but didn't get a pairing code](#i-ran-start-in-telegram-but-didnt-get-a-pairing-code)
  - [WhatsApp: will it message my contacts? How does pairing work?](#whatsapp-will-it-message-my-contacts-how-does-pairing-work)
- [Chat commands, aborting tasks, and "it won't stop"](#chat-commands-aborting-tasks-and-it-wont-stop)
  - [How do I stop internal system messages from showing in chat](#how-do-i-stop-internal-system-messages-from-showing-in-chat)
  - [How do I stop/cancel a running task?](#how-do-i-stopcancel-a-running-task)
  - [How do I send a Discord message from Telegram? ("Cross-context messaging denied")](#how-do-i-send-a-discord-message-from-telegram-crosscontext-messaging-denied)
  - [Why does it feel like the bot "ignores" rapid-fire messages?](#why-does-it-feel-like-the-bot-ignores-rapidfire-messages)

## First 60 seconds if something's broken

1) **Quick status (first check)**
   ```bash
   moltbot status
   ```
   Fast local summary: OS + update, gateway/service reachability, agents/sessions, provider config + runtime issues (when gateway is reachable).

2) **Pasteable report (safe to share)**
   ```bash
   moltbot status --all
   ```
   Read-only diagnosis with log tail (tokens redacted).

3) **Daemon + port state**
   ```bash
   moltbot gateway status
   ```
   Shows supervisor runtime vs RPC reachability, the probe target URL, and which config the service likely used.

4) **Deep probes**
   ```bash
   moltbot status --deep
   ```
   Runs gateway health checks + provider probes (requires a reachable gateway). See [Health](/gateway/health).

5) **Tail the latest log**
   ```bash
   moltbot logs --follow
   ```
   If RPC is down, fall back to:
   ```bash
   tail -f "$(ls -t /tmp/moltbot/moltbot-*.log | head -1)"
   ```
   File logs are separate from service logs; see [Logging](/logging) and [Troubleshooting](/gateway/troubleshooting).

6) **Run the doctor (repairs)**
   ```bash
   moltbot doctor
   ```
   Repairs/migrates config/state + runs health checks. See [Doctor](/gateway/doctor).

7) **Gateway snapshot**
   ```bash
   moltbot health --json
   moltbot health --verbose   # shows the target URL + config path on errors
   ```
   Asks the running gateway for a full snapshot (WS-only). See [Health](/gateway/health).

## Quick start and first-run setup

### Im stuck whats the fastest way to get unstuck

Use a local AI agent that can **see your machine**. That is far more effective than asking
in Discord, because most "I'm stuck" cases are **local config or environment issues** that
remote helpers cannot inspect.

- **Claude Code**: https://www.anthropic.com/claude-code/
- **OpenAI Codex**: https://openai.com/codex/

These tools can read the repo, run commands, inspect logs, and help fix your machine-level
setup (PATH, services, permissions, auth files). Give them the **full source checkout** via
the hackable (git) install:

```bash
curl -fsSL https://molt.bot/install.sh | bash -s -- --install-method git
```

This installs Moltbot **from a git checkout**, so the agent can read the code + docs and
reason about the exact version you are running. You can always switch back to stable later
by re-running the installer without `--install-method git`.

Tip: ask the agent to **plan and supervise** the fix (step-by-step), then execute only the
necessary commands. That keeps changes small and easier to audit.

If you discover a real bug or fix, please file a GitHub issue or send a PR:
https://github.com/moltbot/moltbot/issues
https://github.com/moltbot/moltbot/pulls

Start with these commands (share outputs when asking for help):

```bash
moltbot status
moltbot models status
moltbot doctor
```

What they do:
- `moltbot status`: quick snapshot of gateway/agent health + basic config.
- `moltbot models status`: checks provider auth + model availability.
- `moltbot doctor`: validates and repairs common config/state issues.

Other useful CLI checks: `moltbot status --all`, `moltbot logs --follow`,
`moltbot gateway status`, `moltbot health --verbose`.

Quick debug loop: [First 60 seconds if something's broken](#first-60-seconds-if-somethings-broken).
Install docs: [Install](/install), [Installer flags](/install/installer), [Updating](/install/updating).

### Whats the recommended way to install and set up Moltbot

The repo recommends running from source and using the onboarding wizard:

```bash
curl -fsSL https://molt.bot/install.sh | bash
moltbot onboard --install-daemon
```

The wizard can also build UI assets automatically. After onboarding, you typically run the Gateway on port **18789**.

From source (contributors/dev):

```bash
git clone https://github.com/moltbot/moltbot.git
cd moltbot
pnpm install
pnpm build
pnpm ui:build # auto-installs UI deps on first run
moltbot onboard
```

If you don't have a global install yet, run it via `pnpm moltbot onboard`.

### How do I open the dashboard after onboarding

The wizard now opens your browser with a tokenized dashboard URL right after onboarding and also prints the full link (with token) in the summary. Keep that tab open; if it didn't launch, copy/paste the printed URL on the same machine. Tokens stay local to your host-nothing is fetched from the browser.

### How do I authenticate the dashboard token on localhost vs remote

**Localhost (same machine):**
- Open `http://127.0.0.1:18789/`.
- If it asks for auth, run `moltbot dashboard` and use the tokenized link (`?token=...`).
- The token is the same value as `gateway.auth.token` (or `CLAWDBOT_GATEWAY_TOKEN`) and is stored by the UI after first load.

**Not on localhost:**
- **Tailscale Serve** (recommended): keep bind loopback, run `moltbot gateway --tailscale serve`, open `https://<magicdns>/`. If `gateway.auth.allowTailscale` is `true`, identity headers satisfy auth (no token).
- **Tailnet bind**: run `moltbot gateway --bind tailnet --token "<token>"`, open `http://<tailscale-ip>:18789/`, paste token in dashboard settings.
- **SSH tunnel**: `ssh -N -L 18789:127.0.0.1:18789 user@host` then open `http://127.0.0.1:18789/?token=...` from `moltbot dashboard`.

See [Dashboard](/web/dashboard) and [Web surfaces](/web) for bind modes and auth details.

### What runtime do I need

Node **>= 22** is required. `pnpm` is recommended. Bun is **not recommended** for the Gateway.

### Does it run on Raspberry Pi

Yes. The Gateway is lightweight - docs list **512MB-1GB RAM**, **1 core**, and about **500MB**
disk as enough for personal use, and note that a **Raspberry Pi 4 can run it**.

If you want extra headroom (logs, media, other services), **2GB is recommended**, but it's
not a hard minimum.

Tip: a small Pi/VPS can host the Gateway, and you can pair **nodes** on your laptop/phone for
local screen/camera/canvas or command execution. See [Nodes](/nodes).

### Any tips for Raspberry Pi installs

Short version: it works, but expect rough edges.

- Use a **64-bit** OS and keep Node >= 22.
- Prefer the **hackable (git) install** so you can see logs and update fast.
- Start without channels/skills, then add them one by one.
- If you hit weird binary issues, it is usually an **ARM compatibility** problem.

Docs: [Linux](/platforms/linux), [Install](/install).

### It is stuck on wake up my friend onboarding will not hatch What now

That screen depends on the Gateway being reachable and authenticated. The TUI also sends
"Wake up, my friend!" automatically on first hatch. If you see that line with **no reply**
and tokens stay at 0, the agent never ran.

1) Restart the Gateway:
```bash
moltbot gateway restart
```
2) Check status + auth:
```bash
moltbot status
moltbot models status
moltbot logs --follow
```
3) If it still hangs, run:
```bash
moltbot doctor
```

If the Gateway is remote, ensure the tunnel/Tailscale connection is up and that the UI
is pointed at the right Gateway. See [Remote access](/gateway/remote).

### Can I migrate my setup to a new machine Mac mini without redoing onboarding

Yes. Copy the **state directory** and **workspace**, then run Doctor once. This
keeps your bot "exactly the same" (memory, session history, auth, and channel
state) as long as you copy **both** locations:

1) Install Moltbot on the new machine.
2) Copy `$CLAWDBOT_STATE_DIR` (default: `~/.clawdbot`) from the old machine.
3) Copy your workspace (default: `~/clawd`).
4) Run `moltbot doctor` and restart the Gateway service.

That preserves config, auth profiles, WhatsApp creds, sessions, and memory. If you're in
remote mode, remember the gateway host owns the session store and workspace.

**Important:** if you only commit/push your workspace to GitHub, you're backing
up **memory + bootstrap files**, but **not** session history or auth. Those live
under `~/.clawdbot/` (for example `~/.clawdbot/agents/<agentId>/sessions/`).

Related: [Migrating](/install/migrating), [Where things live on disk](/help/faq#where-does-moltbot-store-its-data),
[Agent workspace](/concepts/agent-workspace), [Doctor](/gateway/doctor),
[Remote mode](/gateway/remote).

### Where do I see whats new in the latest version

Check the GitHub changelog:
https://github.com/moltbot/moltbot/blob/main/CHANGELOG.md

Newest entries are at the top. If the top section is marked **Unreleased**, the next dated
section is the latest shipped version. Entries are grouped by **Highlights**, **Changes**, and
**Fixes** (plus docs/other sections when needed).

### I cant access docsmoltbot SSL error What now

Some Comcast/Xfinity connections incorrectly block `docs.molt.bot` via Xfinity
Advanced Security. Disable it or allowlist `docs.molt.bot`, then retry. More
detail: [Troubleshooting](/help/troubleshooting#docsmoltbot-shows-an-ssl-error-comcastxfinity).
Please help us unblock it by reporting here: https://spa.xfinity.com/check_url_status.

If you still can't reach the site, the docs are mirrored on GitHub:
https://github.com/moltbot/moltbot/tree/main/docs

### Whats the difference between stable and beta

**Stable** and **beta** are **npm dist-tags**, not separate code lines:
- `latest` = stable
- `beta` = early build for testing

We ship builds to **beta**, test them, and once a build is solid we **promote
that same version to `latest`**. That's why beta and stable can point at the
**same version**.

See what changed:
https://github.com/moltbot/moltbot/blob/main/CHANGELOG.md

### How do I install the beta version and whats the difference between beta and dev

**Beta** is the npm dist-tag `beta` (may match `latest`).
**Dev** is the moving head of `main` (git); when published, it uses the npm dist-tag `dev`.

One-liners (macOS/Linux):

```bash
curl -fsSL --proto '=https' --tlsv1.2 https://molt.bot/install.sh | bash -s -- --beta
```

```bash
curl -fsSL --proto '=https' --tlsv1.2 https://molt.bot/install.sh | bash -s -- --install-method git
```

Windows installer (PowerShell):
https://molt.bot/install.ps1

More detail: [Development channels](/install/development-channels) and [Installer flags](/install/installer).

### How long does install and onboarding usually take

Rough guide:
- **Install:** 2-5 minutes
- **Onboarding:** 5-15 minutes depending on how many channels/models you configure

If it hangs, use [Installer stuck](/help/faq#installer-stuck-how-do-i-get-more-feedback)
and the fast debug loop in [Im stuck](/help/faq#im-stuck--whats-the-fastest-way-to-get-unstuck).

### How do I try the latest bits

Two options:

1) **Dev channel (git checkout):**
```bash
moltbot update --channel dev
```
This switches to the `main` branch and updates from source.

2) **Hackable install (from the installer site):**
```bash
curl -fsSL https://molt.bot/install.sh | bash -s -- --install-method git
```
That gives you a local repo you can edit, then update via git.

If you prefer a clean clone manually, use:
```bash
git clone https://github.com/moltbot/moltbot.git
cd moltbot
pnpm install
pnpm build
```

Docs: [Update](/cli/update), [Development channels](/install/development-channels),
[Install](/install).

### Installer stuck How do I get more feedback

Re-run the installer with **verbose output**:

```bash
curl -fsSL https://molt.bot/install.sh | bash -s -- --verbose
```

Beta install with verbose:

```bash
curl -fsSL https://molt.bot/install.sh | bash -s -- --beta --verbose
```

For a hackable (git) install:

```bash
curl -fsSL https://molt.bot/install.sh | bash -s -- --install-method git --verbose
```

More options: [Installer flags](/install/installer).

### Windows install says git not found or moltbot not recognized

Two common Windows issues:

**1) npm error spawn git / git not found**
- Install **Git for Windows** and make sure `git` is on your PATH.
- Close and reopen PowerShell, then re-run the installer.

**2) moltbot is not recognized after install**
- Your npm global bin folder is not on PATH.
- Check the path:
  ```powershell
  npm config get prefix
  ```
- Ensure `<prefix>\\bin` is on PATH (on most systems it is `%AppData%\\npm`).
- Close and reopen PowerShell after updating PATH.

If you want the smoothest Windows setup, use **WSL2** instead of native Windows.
Docs: [Windows](/platforms/windows).

### The docs didnt answer my question how do I get a better answer

Use the **hackable (git) install** so you have the full source and docs locally, then ask
your bot (or Claude/Codex) *from that folder* so it can read the repo and answer precisely.

```bash
curl -fsSL https://molt.bot/install.sh | bash -s -- --install-method git
```

More detail: [Install](/install) and [Installer flags](/install/installer).

### How do I install Moltbot on Linux

Short answer: follow the Linux guide, then run the onboarding wizard.

- Linux quick path + service install: [Linux](/platforms/linux).
- Full walkthrough: [Getting Started](/start/getting-started).
- Installer + updates: [Install & updates](/install/updating).

### How do I install Moltbot on a VPS

Any Linux VPS works. Install on the server, then use SSH/Tailscale to reach the Gateway.

Guides: [exe.dev](/platforms/exe-dev), [Hetzner](/platforms/hetzner), [Fly.io](/platforms/fly).
Remote access: [Gateway remote](/gateway/remote).

### Where are the cloudVPS install guides

We keep a **hosting hub** with the common providers. Pick one and follow the guide:

- [VPS hosting](/vps) (all providers in one place)
- [Fly.io](/platforms/fly)
- [Hetzner](/platforms/hetzner)
- [exe.dev](/platforms/exe-dev)

How it works in the cloud: the **Gateway runs on the server**, and you access it
from your laptop/phone via the Control UI (or Tailscale/SSH). Your state + workspace
live on the server, so treat the host as the source of truth and back it up.

You can pair **nodes** (Mac/iOS/Android/headless) to that cloud Gateway to access
local screen/camera/canvas or run commands on your laptop while keeping the
Gateway in the cloud.

Hub: [Platforms](/platforms). Remote access: [Gateway remote](/gateway/remote).
Nodes: [Nodes](/nodes), [Nodes CLI](/cli/nodes).

### Can I ask Clawd to update itself

Short answer: **possible, not recommended**. The update flow can restart the
Gateway (which drops the active session), may need a clean git checkout, and
can prompt for confirmation. Safer: run updates from a shell as the operator.

Use the CLI:

```bash
moltbot update
moltbot update status
moltbot update --channel stable|beta|dev
moltbot update --tag <dist-tag|version>
moltbot update --no-restart
```

If you must automate from an agent:

```bash
moltbot update --yes --no-restart
moltbot gateway restart
```

Docs: [Update](/cli/update), [Updating](/install/updating).

### What does the onboarding wizard actually do

`moltbot onboard` is the recommended setup path. In **local mode** it walks you through:

- **Model/auth setup** (Anthropic **setup-token** recommended for Claude subscriptions, OpenAI Codex OAuth supported, API keys optional, LM Studio local models supported)
- **Workspace** location + bootstrap files
- **Gateway settings** (bind/port/auth/tailscale)
- **Providers** (WhatsApp, Telegram, Discord, Mattermost (plugin), Signal, iMessage)
- **Daemon install** (LaunchAgent on macOS; systemd user unit on Linux/WSL2)
- **Health checks** and **skills** selection

It also warns if your configured model is unknown or missing auth.

### Do I need a Claude or OpenAI subscription to run this

No. You can run Moltbot with **API keys** (Anthropic/OpenAI/others) or with
**local-only models** so your data stays on your device. Subscriptions (Claude
Pro/Max or OpenAI Codex) are optional ways to authenticate those providers.

Docs: [Anthropic](/providers/anthropic), [OpenAI](/providers/openai),
[Local models](/gateway/local-models), [Models](/concepts/models).

### Can I use Claude Max subscription without an API key

Yes. You can authenticate with a **setup-token**
instead of an API key. This is the subscription path.

Claude Pro/Max subscriptions **do not include an API key**, so this is the
correct approach for subscription accounts. Important: you must verify with
Anthropic that this usage is allowed under their subscription policy and terms.
If you want the most explicit, supported path, use an Anthropic API key.

### How does Anthropic setuptoken auth work

`claude setup-token` generates a **token string** via the Claude Code CLI (it is not available in the web console). You can run it on **any machine**. Choose **Anthropic token (paste setup-token)** in the wizard or paste it with `moltbot models auth paste-token --provider anthropic`. The token is stored as an auth profile for the **anthropic** provider and used like an API key (no auto-refresh). More detail: [OAuth](/concepts/oauth).

### Where do I find an Anthropic setuptoken

It is **not** in the Anthropic Console. The setup-token is generated by the **Claude Code CLI** on **any machine**:

```bash
claude setup-token
```

Copy the token it prints, then choose **Anthropic token (paste setup-token)** in the wizard. If you want to run it on the gateway host, use `moltbot models auth setup-token --provider anthropic`. If you ran `claude setup-token` elsewhere, paste it on the gateway host with `moltbot models auth paste-token --provider anthropic`. See [Anthropic](/providers/anthropic).

### Do you support Claude subscription auth (Claude Pro/Max)

Yes - via **setup-token**. Moltbot no longer reuses Claude Code CLI OAuth tokens; use a setup-token or an Anthropic API key. Generate the token anywhere and paste it on the gateway host. See [Anthropic](/providers/anthropic) and [OAuth](/concepts/oauth).

Note: Claude subscription access is governed by Anthropic's terms. For production or multi-user workloads, API keys are usually the safer choice.

### Why am I seeing HTTP 429 ratelimiterror from Anthropic

That means your **Anthropic quota/rate limit** is exhausted for the current window. If you
use a **Claude subscription** (setup-token or Claude Code OAuth), wait for the window to
reset or upgrade your plan. If you use an **Anthropic API key**, check the Anthropic Console
for usage/billing and raise limits as needed.

Tip: set a **fallback model** so Moltbot can keep replying while a provider is rate-limited.
See [Models](/cli/models) and [OAuth](/concepts/oauth).

### Is AWS Bedrock supported

Yes - via pi-ai's **Amazon Bedrock (Converse)** provider with **manual config**. You must supply AWS credentials/region on the gateway host and add a Bedrock provider entry in your models config. See [Amazon Bedrock](/bedrock) and [Model providers](/providers/models). If you prefer a managed key flow, an OpenAI-compatible proxy in front of Bedrock is still a valid option.

### How does Codex auth work

Moltbot supports **OpenAI Code (Codex)** via OAuth (ChatGPT sign-in). The wizard can run the OAuth flow and will set the default model to `openai-codex/gpt-5.2` when appropriate. See [Model providers](/concepts/model-providers) and [Wizard](/start/wizard).

### Do you support OpenAI subscription auth Codex OAuth

Yes. Moltbot fully supports **OpenAI Code (Codex) subscription OAuth**. The onboarding wizard
can run the OAuth flow for you.

See [OAuth](/concepts/oauth), [Model providers](/concepts/model-providers), and [Wizard](/start/wizard).

### How do I set up Gemini CLI OAuth

Gemini CLI uses a **plugin auth flow**, not a client id or secret in `moltbot.json`.

Steps:
1) Enable the plugin: `moltbot plugins enable google-gemini-cli-auth`
2) Login: `moltbot models auth login --provider google-gemini-cli --set-default`

This stores OAuth tokens in auth profiles on the gateway host. Details: [Model providers](/concepts/model-providers).

### Is a local model OK for casual chats

Usually no. Moltbot needs large context + strong safety; small cards truncate and leak. If you must, run the **largest** MiniMax M2.1 build you can locally (LM Studio) and see [/gateway/local-models](/gateway/local-models). Smaller/quantized models increase prompt-injection risk - see [Security](/gateway/security).

### How do I keep hosted model traffic in a specific region

Pick region-pinned endpoints. OpenRouter exposes US-hosted options for MiniMax, Kimi, and GLM; choose the US-hosted variant to keep data in-region. You can still list Anthropic/OpenAI alongside these by using `models.mode: "merge"` so fallbacks stay available while respecting the regioned provider you select.

### Do I have to buy a Mac Mini to install this

No. Moltbot runs on macOS or Linux (Windows via WSL2). A Mac mini is optional - some people
buy one as an always-on host, but a small VPS, home server, or Raspberry Pi-class box works too.

You only need a Mac **for macOS-only tools**. For iMessage, you can keep the Gateway on Linux
and run `imsg` on any Mac over SSH by pointing `channels.imessage.cliPath` at an SSH wrapper.
If you want other macOS-only tools, run the Gateway on a Mac or pair a macOS node.

Docs: [iMessage](/channels/imessage), [Nodes](/nodes), [Mac remote mode](/platforms/mac/remote).

### Do I need a Mac mini for iMessage support

You need **some macOS device** signed into Messages. It does **not** have to be a Mac mini -
any Mac works. Moltbot's iMessage integrations run on macOS (BlueBubbles or `imsg`), while
the Gateway can run elsewhere.

Common setups:
- Run the Gateway on Linux/VPS, and point `channels.imessage.cliPath` at an SSH wrapper that
  runs `imsg` on the Mac.
- Run everything on the Mac if you want the simplest single-machine setup.

Docs: [iMessage](/channels/imessage), [BlueBubbles](/channels/bluebubbles),
[Mac remote mode](/platforms/mac/remote).

### If I buy a Mac mini to run Moltbot can I connect it to my MacBook Pro

Yes. The **Mac mini can run the Gateway**, and your MacBook Pro can connect as a
**node** (companion device). Nodes don't run the Gateway - they provide extra
capabilities like screen/camera/canvas and `system.run` on that device.

Common pattern:
- Gateway on the Mac mini (always-on).
- MacBook Pro runs the macOS app or a node host and pairs to the Gateway.
- Use `moltbot nodes status` / `moltbot nodes list` to see it.

Docs: [Nodes](/nodes), [Nodes CLI](/cli/nodes).

### Can I use Bun

Bun is **not recommended**. We see runtime bugs, especially with WhatsApp and Telegram.
Use **Node** for stable gateways.

If you still want to experiment with Bun, do it on a non-production gateway
without WhatsApp/Telegram.

### Telegram what goes in allowFrom

`channels.telegram.allowFrom` is **the human sender's Telegram user ID** (numeric, recommended) or `@username`. It is not the bot username.

Safer (no third-party bot):
- DM your bot, then run `moltbot logs --follow` and read `from.id`.

Official Bot API:
- DM your bot, then call `https://api.telegram.org/bot<bot_token>/getUpdates` and read `message.from.id`.

Third-party (less private):
- DM `@userinfobot` or `@getidsbot`.

See [/channels/telegram](/channels/telegram#access-control-dms--groups).

### Can multiple people use one WhatsApp number with different Moltbots

Yes, via **multi-agent routing**. Bind each sender's WhatsApp **DM** (peer `kind: "dm"`, sender E.164 like `+15551234567`) to a different `agentId`, so each person gets their own workspace and session store. Replies still come from the **same WhatsApp account**, and DM access control (`channels.whatsapp.dmPolicy` / `channels.whatsapp.allowFrom`) is global per WhatsApp account. See [Multi-Agent Routing](/concepts/multi-agent) and [WhatsApp](/channels/whatsapp).

### Can I run a fast chat agent and an Opus for coding agent

Yes. Use multi-agent routing: give each agent its own default model, then bind inbound routes (provider account or specific peers) to each agent. Example config lives in [Multi-Agent Routing](/concepts/multi-agent). See also [Models](/concepts/models) and [Configuration](/gateway/configuration).

### Does Homebrew work on Linux

Yes. Homebrew supports Linux (Linuxbrew). Quick setup:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> ~/.profile
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
brew install <formula>
```

If you run Moltbot via systemd, ensure the service PATH includes `/home/linuxbrew/.linuxbrew/bin` (or your brew prefix) so `brew`-installed tools resolve in non-login shells.
Recent builds also prepend common user bin dirs on Linux systemd services (for example `~/.local/bin`, `~/.npm-global/bin`, `~/.local/share/pnpm`, `~/.bun/bin`) and honor `PNPM_HOME`, `NPM_CONFIG_PREFIX`, `BUN_INSTALL`, `VOLTA_HOME`, `ASDF_DATA_DIR`, `NVM_DIR`, and `FNM_DIR` when set.

### Whats the difference between the hackable git install and npm install

- **Hackable (git) install:** full source checkout, editable, best for contributors.
  You run builds locally and can patch code/docs.
- **npm install:** global CLI install, no repo, best for "just run it."
  Updates come from npm dist-tags.

Docs: [Getting started](/start/getting-started), [Updating](/install/updating).

### Can I switch between npm and git installs later

Yes. Install the other flavor, then run Doctor so the gateway service points at the new entrypoint.
This **does not delete your data** - it only changes the Moltbot code install. Your state
(`~/.clawdbot`) and workspace (`~/clawd`) stay untouched.

From npm → git:

```bash
git clone https://github.com/moltbot/moltbot.git
cd moltbot
pnpm install
pnpm build
moltbot doctor
moltbot gateway restart
```

From git → npm:

```bash
npm install -g moltbot@latest
moltbot doctor
moltbot gateway restart
```

Doctor detects a gateway service entrypoint mismatch and offers to rewrite the service config to match the current install (use `--repair` in automation).

Backup tips: see [Backup strategy](/help/faq#whats-the-recommended-backup-strategy).

### Should I run the Gateway on my laptop or a VPS

Short answer: **if you want 24/7 reliability, use a VPS**. If you want the
lowest friction and you're okay with sleep/restarts, run it locally.

**Laptop (local Gateway)**
- **Pros:** no server cost, direct access to local files, live browser window.
- **Cons:** sleep/network drops = disconnects, OS updates/reboots interrupt, must stay awake.

**VPS / cloud**
- **Pros:** always-on, stable network, no laptop sleep issues, easier to keep running.
- **Cons:** often run headless (use screenshots), remote file access only, you must SSH for updates.

**Moltbot-specific note:** WhatsApp/Telegram/Slack/Mattermost (plugin)/Discord all work fine from a VPS. The only real trade-off is **headless browser** vs a visible window. See [Browser](/tools/browser).

**Recommended default:** VPS if you had gateway disconnects before. Local is great when you're actively using the Mac and want local file access or UI automation with a visible browser.

### How important is it to run Moltbot on a dedicated machine

Not required, but **recommended for reliability and isolation**.

- **Dedicated host (VPS/Mac mini/Pi):** always-on, fewer sleep/reboot interruptions, cleaner permissions, easier to keep running.
- **Shared laptop/desktop:** totally fine for testing and active use, but expect pauses when the machine sleeps or updates.

If you want the best of both worlds, keep the Gateway on a dedicated host and pair your laptop as a **node** for local screen/camera/exec tools. See [Nodes](/nodes).
For security guidance, read [Security](/gateway/security).

### What are the minimum VPS requirements and recommended OS

Moltbot is lightweight. For a basic Gateway + one chat channel:

- **Absolute minimum:** 1 vCPU, 1GB RAM, ~500MB disk.
- **Recommended:** 1-2 vCPU, 2GB RAM or more for headroom (logs, media, multiple channels). Node tools and browser automation can be resource hungry.

OS: use **Ubuntu LTS** (or any modern Debian/Ubuntu). The Linux install path is best tested there.

Docs: [Linux](/platforms/linux), [VPS hosting](/vps).

### Can I run Moltbot in a VM and what are the requirements

Yes. Treat a VM the same as a VPS: it needs to be always on, reachable, and have enough
RAM for the Gateway and any channels you enable.

Baseline guidance:
- **Absolute minimum:** 1 vCPU, 1GB RAM.
- **Recommended:** 2GB RAM or more if you run multiple channels, browser automation, or media tools.
- **OS:** Ubuntu LTS or another modern Debian/Ubuntu.

If you are on Windows, **WSL2 is the easiest VM style setup** and has the best tooling
compatibility. See [Windows](/platforms/windows), [VPS hosting](/vps).
If you are running macOS in a VM, see [macOS VM](/platforms/macos-vm).

## What is Moltbot?

### What is Moltbot in one paragraph

Moltbot is a personal AI assistant you run on your own devices. It replies on the messaging surfaces you already use (WhatsApp, Telegram, Slack, Mattermost (plugin), Discord, Google Chat, Signal, iMessage, WebChat) and can also do voice + a live Canvas on supported platforms. The **Gateway** is the always-on control plane; the assistant is the product.

### Whats the value proposition

Moltbot is not "just a Claude wrapper." It's a **local-first control plane** that lets you run a
capable assistant on **your own hardware**, reachable from the chat apps you already use, with
stateful sessions, memory, and tools - without handing control of your workflows to a hosted
SaaS.

Highlights:
- **Your devices, your data:** run the Gateway wherever you want (Mac, Linux, VPS) and keep the
  workspace + session history local.
- **Real channels, not a web sandbox:** WhatsApp/Telegram/Slack/Discord/Signal/iMessage/etc,
  plus mobile voice and Canvas on supported platforms.
- **Model-agnostic:** use Anthropic, OpenAI, MiniMax, OpenRouter, etc., with per-agent routing
  and failover.
- **Local-only option:** run local models so **all data can stay on your device** if you want.
- **Multi-agent routing:** separate agents per channel, account, or task, each with its own
  workspace and defaults.
- **Open source and hackable:** inspect, extend, and self-host without vendor lock-in.

Docs: [Gateway](/gateway), [Channels](/channels), [Multi-agent](/concepts/multi-agent),
[Memory](/concepts/memory).

### I just set it up what should I do first

Good first projects:
- Build a website (WordPress, Shopify, or a simple static site).
- Prototype a mobile app (outline, screens, API plan).
- Organize files and folders (cleanup, naming, tagging).
- Connect Gmail and automate summaries or follow ups.

It can handle large tasks, but it works best when you split them into phases and
use sub agents for parallel work.

### What are the top five everyday use cases for Moltbot

Everyday wins usually look like:
- **Personal briefings:** summaries of inbox, calendar, and news you care about.
- **Research and drafting:** quick research, summaries, and first drafts for emails or docs.
- **Reminders and follow ups:** cron or heartbeat driven nudges and checklists.
- **Browser automation:** filling forms, collecting data, and repeating web tasks.
- **Cross device coordination:** send a task from your phone, let the Gateway run it on a server, and get the result back in chat.

### Can Moltbot help with lead gen outreach ads and blogs for a SaaS


[Showing lines 1-926 of 2727 (50.0KB limit). Use offset=927 to continue]