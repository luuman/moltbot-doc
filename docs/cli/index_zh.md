---
summary: "Moltbot CLI 参考，包含 `moltbot` 命令、子命令和选项"
read_when:
  - 添加或修改 CLI 命令或选项
  - 记录新的命令界面
---

# CLI 参考

本页面描述当前的 CLI 行为。如果命令发生变化，请更新本文档。

## 命令页面

- [`setup`](/cli/setup)
- [`onboard`](/cli/onboard)
- [`configure`](/cli/configure)
- [`config`](/cli/config)
- [`doctor`](/cli/doctor)
- [`dashboard`](/cli/dashboard)
- [`reset`](/cli/reset)
- [`uninstall`](/cli/uninstall)
- [`update`](/cli/update)
- [`message`](/cli/message)
- [`agent`](/cli/agent)
- [`agents`](/cli/agents)
- [`acp`](/cli/acp)
- [`status`](/cli/status)
- [`health`](/cli/health)
- [`sessions`](/cli/sessions)
- [`gateway`](/cli/gateway)
- [`logs`](/cli/logs)
- [`system`](/cli/system)
- [`models`](/cli/models)
- [`memory`](/cli/memory)
- [`nodes`](/cli/nodes)
- [`devices`](/cli/devices)
- [`node`](/cli/node)
- [`approvals`](/cli/approvals)
- [`sandbox`](/cli/sandbox)
- [`tui`](/cli/tui)
- [`browser`](/cli/browser)
- [`cron`](/cli/cron)
- [`dns`](/cli/dns)
- [`docs`](/cli/docs)
- [`hooks`](/cli/hooks)
- [`webhooks`](/cli/webhooks)
- [`pairing`](/cli/pairing)
- [`plugins`](/cli/plugins) (插件命令)
- [`channels`](/cli/channels)
- [`security`](/cli/security)
- [`skills`](/cli/skills)
- [`voicecall`](/cli/voicecall) (插件；如果安装)

## 全局标志

- `--dev`: 将状态隔离在 `~/.clawdbot-dev` 下并移动默认端口。
- `--profile <name>`: 将状态隔离在 `~/.clawdbot-<name>` 下。
- `--no-color`: 禁用 ANSI 颜色。
- `--update`: `moltbot update` 的简写（仅源码安装）。
- `-V`, `--version`, `-v`: 打印版本并退出。

## 输出样式

- ANSI 颜色和进度指示器仅在 TTY 会话中渲染。
- OSC-8 超链接在支持的终端中渲染为可点击链接；否则我们回退到纯 URL。
- `--json`（和 `--plain` 在支持的地方）禁用样式以获得干净输出。
- `--no-color` 禁用 ANSI 样式；也尊重 `NO_COLOR=1`。
- 长时间运行的命令显示进度指示器（在支持时为 OSC 9;4）。

## 颜色方案

Moltbot 为 CLI 输出使用龙虾配色方案。

- `accent` (#FF5A2D): 标题、标签、主要高亮。
- `accentBright` (#FF7A3D): 命令名称、强调。
- `accentDim` (#D14A22): 次要高亮文本。
- `info` (#FF8A5B): 信息值。
- `success` (#2FBF71): 成功状态。
- `warn` (#FFB020): 警告、回退、注意。
- `error` (#E23D2D): 错误、失败。
- `muted` (#8B7F77): 弱化、元数据。

配色方案真实来源：`src/terminal/palette.ts`（又称"龙虾缝"）。

## 命令树

```
moltbot [--dev] [--profile <name>] <command>
  setup
  onboard
  configure
  config
    get
    set
    unset
  doctor
  security
    audit
  reset
  uninstall
  update
  channels
    list
    status
    logs
    add
    remove
    login
    logout
  skills
    list
    info
    check
  plugins
    list
    info
    install
    enable
    disable
    doctor
  memory
    status
    index
    search
  message
  agent
  agents
    list
    add
    delete
  acp
  status
  health
  sessions
  gateway
    call
    health
    status
    probe
    discover
    install
    uninstall
    start
    stop
    restart
    run
  logs
  system
    event
    heartbeat last|enable|disable
    presence
  models
    list
    status
    set
    set-image
    aliases list|add|remove
    fallbacks list|add|remove|clear
    image-fallbacks list|add|remove|clear
    scan
    auth add|setup-token|paste-token
    auth order get|set|clear
  sandbox
    list
    recreate
    explain
  cron
    status
    list
    add
    edit
    rm
    enable
    disable
    runs
    run
  nodes
  devices
  node
    run
    status
    install
    uninstall
    start
    stop
    restart
  approvals
    get
    set
    allowlist add|remove
  browser
    status
    start
    stop
    reset-profile
    tabs
    open
    focus
    close
    profiles
    create-profile
    delete-profile
    screenshot
    snapshot
    navigate
    resize
    click
    type
    press
    hover
    drag
    select
    upload
    fill
    dialog
    wait
    evaluate
    console
    pdf
  hooks
    list
    info
    check
    enable
    disable
    install
    update
  webhooks
    gmail setup|run
  pairing
    list
    approve
  docs
  dns
    setup
  tui
```

注意：插件可以添加额外的顶级命令（例如 `moltbot voicecall`）。

## 安全性

- `moltbot security audit` — 审计配置 + 本地状态的常见安全漏洞。
- `moltbot security audit --deep` — 尽力而为的实时网关探测。
- `moltbot security audit --fix` — 加强安全默认值并修改状态/配置权限。

## 插件

管理扩展及其配置：

- `moltbot plugins list` — 发现插件（使用 `--json` 获取机器输出）。
- `moltbot plugins info <id>` — 显示插件详情。
- `moltbot plugins install <path|.tgz|npm-spec>` — 安装插件（或向 `plugins.load.paths` 添加插件路径）。
- `moltbot plugins enable <id>` / `disable <id>` — 切换 `plugins.entries.<id>.enabled`。
- `moltbot plugins doctor` — 报告插件加载错误。

大多数插件更改需要网关重启。参见 [/plugin](/plugin)。

## 记忆

在 `MEMORY.md` + `memory/*.md` 上进行向量搜索：

- `moltbot memory status` — 显示索引统计。
- `moltbot memory index` — 重新索引记忆文件。
- `moltbot memory search "<query>"` — 在记忆上进行语义搜索。

## 聊天斜杠命令

聊天消息支持 `/...` 命令（文本和原生）。参见 [/tools/slash-commands](/tools/slash-commands)。

亮点：
- `/status` 用于快速诊断。
- `/config` 用于持久化配置更改。
- `/debug` 用于运行时配置覆盖（内存，而非磁盘；需要 `commands.debug: true`）。

## 设置 + 入门

### `setup`
初始化配置 + 工作空间。

选项：
- `--workspace <dir>`: 代理工作空间路径（默认 `~/clawd`）。
- `--wizard`: 运行入门向导。
- `--non-interactive`: 无提示运行向导。
- `--mode <local|remote>`: 向导模式。
- `--remote-url <url>`: 远程网关 URL。
- `--remote-token <token>`: 远程网关令牌。

当任何向导标志存在时自动运行向导（`--non-interactive`, `--mode`, `--remote-url`, `--remote-token`）。

### `onboard`
交互式向导来设置网关、工作空间和技能。

选项：
- `--workspace <dir>`
- `--reset` （在向导之前重置配置 + 凭据 + 会话 + 工作空间）
- `--non-interactive`
- `--mode <local|remote>`
- `--flow <quickstart|advanced|manual>` （manual 是 advanced 的别名）
- `--auth-choice <setup-token|token|chutes|openai-codex|openai-api-key|openrouter-api-key|ai-gateway-api-key|moonshot-api-key|kimi-code-api-key|synthetic-api-key|venice-api-key|gemini-api-key|zai-api-key|apiKey|minimax-api|minimax-api-lightning|opencode-zen|skip>`
- `--token-provider <id>` （非交互式；与 `--auth-choice token` 一起使用）
- `--token <token>` （非交互式；与 `--auth-choice token` 一起使用）
- `--token-profile-id <id>` （非交互式；默认：`<provider>:manual`）
- `--token-expires-in <duration>` （非交互式；例如 `365d`, `12h`）
- `--anthropic-api-key <key>`
- `--openai-api-key <key>`
- `--openrouter-api-key <key>`
- `--ai-gateway-api-key <key>`
- `--moonshot-api-key <key>`
- `--kimi-code-api-key <key>`
- `--gemini-api-key <key>`
- `--zai-api-key <key>`
- `--minimax-api-key <key>`
- `--opencode-zen-api-key <key>`
- `--gateway-port <port>`
- `--gateway-bind <loopback|lan|tailnet|auto|custom>`
- `--gateway-auth <token|password>`
- `--gateway-token <token>`
- `--gateway-password <password>`
- `--remote-url <url>`
- `--remote-token <token>`
- `--tailscale <off|serve|funnel>`
- `--tailscale-reset-on-exit`
- `--install-daemon`
- `--no-install-daemon` （别名：`--skip-daemon`）
- `--daemon-runtime <node|bun>`
- `--skip-channels`
- `--skip-skills`
- `--skip-health`
- `--skip-ui`
- `--node-manager <npm|pnpm|bun>` （推荐 pnpm；不推荐 bun 用于网关运行时）
- `--json`

### `configure`
交互式配置向导（模型、通道、技能、网关）。

### `config`
非交互式配置助手（get/set/unset）。运行不带子命令的 `moltbot config` 
启动向导。

子命令：
- `config get <path>`: 打印配置值（点/括号路径）。
- `config set <path> <value>`: 设置值（JSON5 或原始字符串）。
- `config unset <path>`: 移除值。

### `doctor`
健康检查 + 快速修复（配置 + 网关 + 旧服务）。

选项：
- `--no-workspace-suggestions`: 禁用工作区记忆提示。
- `--yes`: 不提示接受默认值（无头模式）。
- `--non-interactive`: 跳过提示；仅应用安全迁移。
- `--deep`: 扫描系统服务以查找额外网关安装。

## 通道助手

### `channels`
管理聊天通道账户（WhatsApp/Telegram/Discord/Google Chat/Slack/Mattermost（插件）/Signal/iMessage/MS Teams）。

子命令：
- `channels list`: 显示配置的通道和认证配置文件。
- `channels status`: 检查网关可达性和通道健康状况（`--probe` 运行额外检查；使用 `moltbot health` 或 `moltbot status --deep` 进行网关健康探测）。
- 提示：`channels status` 在检测到常见错误配置时打印警告并提供建议修复（然后指向 `moltbot doctor`）。
- `channels logs`: 显示来自网关日志文件的最近通道日志。
- `channels add`: 不传标志时为向导式设置；标志切换到非交互模式。
- `channels remove`: 默认禁用；传递 `--delete` 以不提示移除配置条目。
- `channels login`: 交互式通道登录（仅 WhatsApp Web）。
- `channels logout`: 登出通道会话（如果支持）。

常用选项：
- `--channel <name>`: `whatsapp|telegram|discord|googlechat|slack|mattermost|signal|imessage|msteams`
- `--account <id>`: 通道账户 ID（默认 `default`）
- `--name <label>`: 账户的显示名称

`channels login` 选项：
- `--channel <channel>` （默认 `whatsapp`；支持 `whatsapp`/`web`）
- `--account <id>`
- `--verbose`

`channels logout` 选项：
- `--channel <channel>` （默认 `whatsapp`）
- `--account <id>`

`channels list` 选项：
- `--no-usage`: 跳过模型提供商使用量/配额快照（仅 OAuth/API 支持）。
- `--json`: 输出 JSON（包含使用量，除非设置了 `--no-usage`）。

`channels logs` 选项：
- `--channel <name|all>` （默认 `all`）
- `--lines <n>` （默认 `200`）
- `--json`

更多细节：[/concepts/oauth](/concepts/oauth)

示例：
```bash
moltbot channels add --channel telegram --account alerts --name "Alerts Bot" --token $TELEGRAM_BOT_TOKEN
moltbot channels add --channel discord --account work --name "Work Bot" --token $DISCORD_BOT_TOKEN
moltbot channels remove --channel discord --account work --delete
moltbot channels status --probe
moltbot status --deep
```

### `skills`
列出和检查可用技能及就绪信息。

子命令：
- `skills list`: 列出技能（没有子命令时的默认值）。
- `skills info <name>`: 显示一个技能的详情。
- `skills check`: 就绪与缺失需求的摘要。

选项：
- `--eligible`: 仅显示就绪技能。
- `--json`: 输出 JSON（无样式）。
- `-v`, `--verbose`: 包含缺失需求详情。

提示：使用 `npx clawdhub` 搜索、安装和同步技能。

### `pairing`
跨通道批准私信配对请求。

子命令：
- `pairing list <channel> [--json]`
- `pairing approve <channel> <code> [--notify]`

### `webhooks gmail`
Gmail Pub/Sub 钩子设置 + 运行器。参见 [/automation/gmail-pubsub](/automation/gmail-pubsub)。

子命令：
- `webhooks gmail setup` （需要 `--account <email>`；支持 `--project`, `--topic`, `--subscription`, `--label`, `--hook-url`, `--hook-token`, `--push-token`, `--bind`, `--port`, `--path`, `--include-body`, `--max-bytes`, `--renew-minutes`, `--tailscale`, `--tailscale-path`, `--tailscale-target`, `--push-endpoint`, `--json`）
- `webhooks gmail run` （相同标志的运行时覆盖）

### `dns setup`
广域发现 DNS 助手（CoreDNS + Tailscale）。参见 [/gateway/discovery](/gateway/discovery)。

选项：
- `--apply`: 安装/更新 CoreDNS 配置（需要 sudo；仅 macOS）。

## 消息传递 + 代理

### `message`
统一传出消息 + 通道操作。

参见：[/cli/message](/cli/message)

子命令：
- `message send|poll|react|reactions|read|edit|delete|pin|unpin|pins|permissions|search|timeout|kick|ban`
- `message thread <create|list|reply>`
- `message emoji <list|upload>`
- `message sticker <send|upload>`
- `message role <info|add|remove>`
- `message channel <info|list>`
- `message member info`
- `message voice status`
- `message event <list|create>`

示例：
- `moltbot message send --target +15555550123 --message "Hi"`
- `moltbot message poll --channel discord --target channel:123 --poll-question "Snack?" --poll-option Pizza --poll-option Sushi`

### `agent`
通过网关运行一个代理回合（或 `--local` 嵌入式）。

必需：
- `--message <text>`

选项：
- `--to <dest>` （用于会话键和可选传递）
- `--session-id <id>`
- `--thinking <off|minimal|low|medium|high|xhigh>` （仅 GPT-5.2 + Codex 模型）
- `--verbose <on|full|off>`
- `--channel <whatsapp|telegram|discord|slack|mattermost|signal|imessage|msteams>`
- `--local`
- `--deliver`
- `--json`
- `--timeout <seconds>`

### `agents`
管理隔离代理（工作空间 + 认证 + 路由）。

#### `agents list`
列出配置的代理。

选项：
- `--json`
- `--bindings`

#### `agents add [name]`
添加一个新的隔离代理。运行指导向导，除非传递了标志（或 `--non-interactive`）；非交互模式下需要 `--workspace`。

选项：
- `--workspace <dir>`
- `--model <id>`
- `--agent-dir <dir>`
- `--bind <channel[:accountId]>` （可重复）
- `--non-interactive`
- `--json`

绑定规范使用 `channel[:accountId]`。当 WhatsApp 的 `accountId` 被省略时，使用默认账户 ID。

#### `agents delete <id>`
删除代理并清理其工作空间 + 状态。

选项：
- `--force`
- `--json`

### `acp`
运行连接 IDE 到网关的 ACP 桥接器。

完整选项和示例参见 [`acp`](/cli/acp)。

### `status`
显示链接会话健康状况和最近接收者。

选项：
- `--json`
- `--all` （完整诊断；只读，可粘贴）
- `--deep` （探测通道）
- `--usage` （显示模型提供商使用量/配额）
- `--timeout <ms>`
- `--verbose`
- `--debug` （`--verbose` 的别名）

注释：
- 概述包括网关 + 节点主机服务状态（当可用时）。

### 使用量跟踪
当 OAuth/API 凭据可用时，Moltbot 可以显示提供商使用量/配额。

界面：
- `/status` （在可用时添加简短的提供商使用量行）
- `moltbot status --usage` （打印完整的提供商分解）
- macOS 菜单栏（上下文下的使用量部分）

注释：
- 数据直接来自提供商使用量端点（无估算）。
- 提供商：Anthropic、GitHub Copilot、OpenAI Codex OAuth，以及启用这些提供商插件时的 Gemini CLI/Antigravity。
- 如果不存在匹配的凭据，则隐藏使用量。
- 详情：参见 [使用量跟踪](/concepts/usage-tracking)。

### `health`
从运行中的网关获取健康状况。

选项：
- `--json`
- `--timeout <ms>`
- `--verbose`

### `sessions`
列出存储的对话会话。

选项：
- `--json`
- `--verbose`
- `--store <path>`
- `--active <minutes>`

## 重置 / 卸载

### `reset`
重置本地配置/状态（保留 CLI 安装）。

选项：
- `--scope <config|config+creds+sessions|full>`
- `--yes`
- `--non-interactive`
- `--dry-run`

注释：
- `--non-interactive` 需要 `--scope` 和 `--yes`。

### `uninstall`
卸载网关服务 + 本地数据（CLI 保留）。

选项：
- `--service`
- `--state`
- `--workspace`
- `--app`
- `--all`
- `--yes`
- `--non-interactive`
- `--dry-run`

注释：
- `--non-interactive` 需要 `--yes` 和显式范围（或 `--all`）。

## 网关

### `gateway`
运行 WebSocket 网关。

选项：
- `--port <port>`
- `--bind <loopback|tailnet|lan|auto|custom>`
- `--token <token>`
- `--auth <token|password>`
- `--password <password>`
- `--tailscale <off|serve|funnel>`
- `--tailscale-reset-on-exit`
- `--allow-unconfigured`
- `--dev`
- `--reset` （重置开发配置 + 凭据 + 会话 + 工作空间）
- `--force` （杀死端口上的现有监听器）
- `--verbose`
- `--claude-cli-logs`
- `--ws-log <auto|full|compact>`
- `--compact` （`--ws-log compact` 的别名）
- `--raw-stream`
- `--raw-stream-path <path>`

### `gateway service`
管理网关服务（launchd/systemd/schtasks）。

子命令：
- `gateway status` （默认探测网关 RPC）
- `gateway install` （服务安装）
- `gateway uninstall`
- `gateway start`
- `gateway stop`
- `gateway restart`

注释：
- `gateway status` 默认使用服务解析的端口/配置探测网关 RPC（使用 `--url/--token/--password` 覆盖）。
- `gateway status` 支持 `--no-probe`、`--deep` 和 `--json` 用于脚本。
- `gateway status` 在检测到时也会显示旧或额外网关服务（`--deep` 添加系统级扫描）。按配置文件命名的 Moltbot 服务被视为一级公民，不会标记为"额外"。
- `gateway status` 打印 CLI 使用的配置路径与服务可能使用的配置路径（服务环境），加上解析的探测目标 URL。
- `gateway install|uninstall|start|stop|restart` 支持 `--json` 用于脚本（默认输出保持人性化）。
- `gateway install` 默认为 Node 运行时；**不推荐** bun（WhatsApp/Telegram bug）。
- `gateway install` 选项：`--port`、`--runtime`、`--token`、`--force`、`--json`。

### `logs`
通过 RPC 跟踪网关文件日志。

注释：
- TTY 会话呈现彩色、结构化视图；非 TTY 回退到纯文本。
- `--json` 发出换行符分隔的 JSON（每行一个日志事件）。

示例：
```bash
moltbot logs --follow
moltbot logs --limit 200
moltbot logs --plain
moltbot logs --json
moltbot logs --no-color
```

### `gateway <subcommand>`
网关 CLI 助手（RPC 子命令使用 `--url`、`--token`、`--password`、`--timeout`、`--expect-final`）。

子命令：
- `gateway call <method> [--params <json>]`
- `gateway health`
- `gateway status`
- `gateway probe`
- `gateway discover`
- `gateway install|uninstall|start|stop|restart`
- `gateway run`

常用 RPC：
- `config.apply` （验证 + 写入配置 + 重启 + 唤醒）
- `config.patch` （合并部分更新 + 重启 + 唤醒）
- `update.run` （运行更新 + 重启 + 唤醒）

提示：直接调用 `config.set`/`config.apply`/`config.patch` 时，如果配置已存在，
从 `config.get` 传递 `baseHash`。

## 模型

关于回退行为和扫描策略，参见 [/concepts/models](/concepts/models)。

首选 Anthropic 认证（setup-token）：

```bash
claude setup-token
moltbot models auth setup-token --provider anthropic
moltbot models status
```

### `models` （根）
`moltbot models` 是 `models status` 的别名。

根选项：
- `--status-json` （`models status --json` 的别名）
- `--status-plain` （`models status --plain` 的别名）

### `models list`
选项：
- `--all`
- `--local`
- `--provider <name>`
- `--json`
- `--plain`

### `models status`
选项：
- `--json`
- `--plain`
- `--check` （退出 1=过期/缺失，2=即将到期）
- `--probe` （配置认证配置文件的实时探测）
- `--probe-provider <name>`
- `--probe-profile <id>` （重复或逗号分隔）
- `--probe-timeout <ms>`
- `--probe-concurrency <n>`
- `--probe-max-tokens <n>`

始终包含认证概述和认证存储中配置文件的 OAuth 过期状态。
`--probe` 运行实时请求（可能消耗令牌并触发速率限制）。

### `models set <model>`
设置 `agents.defaults.model.primary`。

### `models set-image <model>`
设置 `agents.defaults.imageModel.primary`。

### `models aliases list|add|remove`
选项：
- `list`: `--json`, `--plain`
- `add <alias> <model>`
- `remove <alias>`

### `models fallbacks list|add|remove|clear`
选项：
- `list`: `--json`, `--plain`
- `add <model>`
- `remove <model>`
- `clear`

### `models image-fallbacks list|add|remove|clear`
选项：
- `list`: `--json`, `--plain`
- `add <model>`
- `remove <model>`
- `clear`

### `models scan`
选项：
- `--min-params <b>`
- `--max-age-days <days>`
- `--provider <name>`
- `--max-candidates <n>`
- `--timeout <ms>`
- `--concurrency <n>`
- `--no-probe`
- `--yes`
- `--no-input`
- `--set-default`
- `--set-image`
- `--json`

### `models auth add|setup-token|paste-token`
选项：
- `add`: 交互式认证助手
- `setup-token`: `--provider <name>` （默认 `anthropic`），`--yes`
- `paste-token`: `--provider <name>`，`--profile-id <id>`，`--expires-in <duration>`

### `models auth order get|set|clear`
选项：
- `get`: `--provider <name>`，`--agent <id>`，`--json`
- `set`: `--provider <name>`，`--agent <id>`，`<profileIds...>`
- `clear`: `--provider <name>`，`--agent <id>`

## 系统

### `system event`
排队系统事件并可选触发心跳（网关 RPC）。

必需：
- `--text <text>`

选项：
- `--mode <now|next-heartbeat>`
- `--json`
- `--url`, `--token`, `--timeout`, `--expect-final`

### `system heartbeat last|enable|disable`
心跳控制（网关 RPC）。

选项：
- `--json`
- `--url`, `--token`, `--timeout`, `--expect-final`

### `system presence`
列出系统存在条目（网关 RPC）。

选项：
- `--json`
- `--url`, `--token`, `--timeout`, `--expect-final`

## Cron
管理计划作业（网关 RPC）。参见 [/automation/cron-jobs](/automation/cron-jobs)。

子命令：
- `cron status [--json]`
- `cron list [--all] [--json]` （默认表格输出；使用 `--json` 获取原始数据）
- `cron add` （别名：`create`；需要 `--name` 和 `--at` | `--every` | `--cron` 中的恰好一个，以及 `--system-event` | `--message` 中的恰好一个负载）
- `cron edit <id>` （修补字段）
- `cron rm <id>` （别名：`remove`, `delete`）
- `cron enable <id>`
- `cron disable <id>`
- `cron runs --id <id> [--limit <n>]`
- `cron run <id> [--force]`

所有 `cron` 命令接受 `--url`, `--token`, `--timeout`, `--expect-final`。

## 节点主机

`node` 运行**无头节点主机**或将之作为后台服务管理。参见
[`moltbot node`](/cli/node)。

子命令：
- `node run --host <gateway-host> --port 18789`
- `node status`
- `node install [--host <gateway-host>] [--port <port>] [--tls] [--tls-fingerprint <sha256>] [--node-id <id>] [--display-name <name>] [--runtime <node|bun>] [--force]`
- `node uninstall`
- `node stop`
- `node restart`

## 节点

`nodes` 与网关通信并针对配对的节点。参见 [/nodes](/nodes)。

常用选项：
- `--url`, `--token`, `--timeout`, `--json`

子命令：
- `nodes status [--connected] [--last-connected <duration>]`
- `nodes describe --node <id|name|ip>`
- `nodes list [--connected] [--last-connected <duration>]`
- `nodes pending`
- `nodes approve <requestId>`
- `nodes reject <requestId>`
- `nodes rename --node <id|name|ip> --name <displayName>`
- `nodes invoke --node <id|name|ip> --command <command> [--params <json>] [--invoke-timeout <ms>] [--idempotency-key <key>]`
- `nodes run --node <id|name|ip> [--cwd <path>] [--env KEY=VAL] [--command-timeout <ms>] [--needs-screen-recording] [--invoke-timeout <ms>] <command...>` （mac 节点或无头节点主机）
- `nodes notify --node <id|name|ip> [--title <text>] [--body <text>] [--sound <name>] [--priority <passive|active|timeSensitive>] [--delivery <system|overlay|auto>] [--invoke-timeout <ms>]` （仅 mac）

摄像头：
- `nodes camera list --node <id|name|ip>`
- `nodes camera snap --node <id|name|ip> [--facing front|back|both] [--device-id <id>] [--max-width <px>] [--quality <0-1>] [--delay-ms <ms>] [--invoke-timeout <ms>]`
- `nodes camera clip --node <id|name|ip> [--facing front|back] [--device-id <id>] [--duration <ms|10s|1m>] [--no-audio] [--invoke-timeout <ms>]`

画布 + 屏幕：
- `nodes canvas snapshot --node <id|name|ip> [--format png|jpg|jpeg] [--max-width <px>] [--quality <0-1>] [--invoke-timeout <ms>]`
- `nodes canvas present --node <id|name|ip> [--target <urlOrPath>] [--x <px>] [--y <px>] [--width <px>] [--height <px>] [--invoke-timeout <ms>]`
- `nodes canvas hide --node <id|name|ip> [--invoke-timeout <ms>]`
- `nodes canvas navigate <url> --node <id|name|ip> [--invoke-timeout <ms>]`
- `nodes canvas eval [<js>] --node <id|name|ip> [--js <code>] [--invoke-timeout <ms>]`
- `nodes canvas a2ui push --node <id|name|ip> (--jsonl <path> | --text <text>) [--invoke-timeout <ms>]`
- `nodes canvas a2ui reset --node <id|name|ip> [--invoke-timeout <ms>]`
- `nodes screen record --node <id|name|ip> [--screen <index>] [--duration <ms|10s>] [--fps <n>] [--no-audio] [--out <path>] [--invoke-timeout <ms>]`

位置：
- `nodes location get --node <id|name|ip> [--max-age <ms>] [--accuracy <coarse|balanced|precise>] [--location-timeout <ms>] [--invoke-timeout <ms>]`

## 浏览器

浏览器控制 CLI（专用 Chrome/Brave/Edge/Chromium）。参见 [`moltbot browser`](/cli/browser) 和 [浏览器工具](/tools/browser)。

常用选项：
- `--url`, `--token`, `--timeout`, `--json`
- `--browser-profile <name>`

管理：
- `browser status`
- `browser start`
- `browser stop`
- `browser reset-profile`
- `browser tabs`
- `browser open <url>`
- `browser focus <targetId>`
- `browser close [targetId]`
- `browser profiles`
- `browser create-profile --name <name> [--color <hex>] [--cdp-url <url>]`
- `browser delete-profile --name <name>`

检查：
- `browser screenshot [targetId] [--full-page] [--ref <ref>] [--element <selector>] [--type png|jpeg]`
- `browser snapshot [--format aria|ai] [--target-id <id>] [--limit <n>] [--interactive] [--compact] [--depth <n>] [--selector <sel>] [--out <path>]`

操作：
- `browser navigate <url> [--target-id <id>]`
- `browser resize <width> <height> [--target-id <id>]`
- `browser click <ref> [--double] [--button <left|right|middle>] [--modifiers <csv>] [--target-id <id>]`
- `browser type <ref> <text> [--submit] [--slowly] [--target-id <id>]`
- `browser press <key> [--target-id <id>]`
- `browser hover <ref> [--target-id <id>]`
- `browser drag <startRef> <endRef> [--target-id <id>]`
- `browser select <ref> <values...> [--target-id <id>]`
- `browser upload <paths...> [--ref <ref>] [--input-ref <ref>] [--element <selector>] [--target-id <id>] [--timeout-ms <ms>]`
- `browser fill [--fields <json>] [--fields-file <path>] [--target-id <id>]`
- `browser dialog --accept|--dismiss [--prompt <text>] [--target-id <id>] [--timeout-ms <ms>]`
- `browser wait [--time <ms>] [--text <value>] [--text-gone <value>] [--target-id <id>]`
- `browser evaluate --fn <code> [--ref <ref>] [--target-id <id>]`
- `browser console [--level <error|warn|info>] [--target-id <id>]`
- `browser pdf [--target-id <id>]`

## 文档搜索

### `docs [query...]`
搜索实时文档索引。

## TUI

### `tui`
打开连接到网关的终端 UI。

选项：
- `--url <url>`
- `--token <token>`
- `--password <password>`
- `--session <key>`
- `--deliver`
- `--thinking <level>`
- `--message <text>`
- `--timeout-ms <ms>` （默认为 `agents.defaults.timeoutSeconds`）
- `--history-limit <n>`
```

## 翻译说明

以下是该文档翻译的要点总结：

1. 保留了所有技术术语和命令格式不变
2. 将英文解释和描述翻译为中文
3. 保持了所有的代码块和命令行示例格式
4. 保留了文档结构和层次关系
5. 保留了所有路径、URL 和引用链接