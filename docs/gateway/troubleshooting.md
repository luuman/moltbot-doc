---
summary: "常见 Moltbot 故障的快速故障排除指南"
read_when:
  - 调查运行时问题或故障
---
# 故障排除 🔧

当 Moltbot 表现异常时，这里是如何修复它的方法。

如果你只想快速分类处理，从 FAQ 的 [前 60 秒](/help/faq#first-60-seconds-if-somethings-broken) 开始。本页面深入探讨运行时故障和诊断。

特定提供商快捷方式：[/channels/troubleshooting](/channels/troubleshooting)

## 状态和诊断

快速分类命令（按顺序）：

| 命令 | 它告诉你什么 | 何时使用 |
|---|---|---|
| `moltbot status` | 本地摘要：操作系统 + 更新，网关可达性/模式，服务，代理/会话，提供商配置状态 | 首次检查，快速概览 |
| `moltbot status --all` | 完整本地诊断（只读，可粘贴，相对安全）包括日志尾部 | 当你需要分享调试报告时 |
| `moltbot status --deep` | 运行网关健康检查（包括提供商探测；需要可访问的网关） | 当"配置"不等于"工作"时 |
| `moltbot gateway probe` | 网关发现 + 可达性（本地 + 远程目标） | 当你怀疑你在探测错误的网关时 |
| `moltbot channels status --probe` | 向运行中的网关询问通道状态（可选探测） | 当网关可达但通道表现异常时 |
| `moltbot gateway status` | 监督程序状态（launchd/systemd/schtasks），运行时 PID/退出，最后网关错误 | 当服务"看起来已加载"但没有运行任何东西时 |
| `moltbot logs --follow` | 实时日志（运行时问题的最佳信号） | 当你需要实际的失败原因时 |

**分享输出：** 建议使用 `moltbot status --all`（它会脱敏令牌）。如果你粘贴 `moltbot status`，请考虑先设置 `CLAWDBOT_SHOW_SECRETS=0`（令牌预览）。

另请参阅：[健康检查](/gateway/health) 和 [日志](/logging)。

## 常见问题

### 找不到提供商 "anthropic" 的 API 密钥

这意味着 **代理的身份验证存储为空** 或缺少 Anthropic 凭证。
身份验证是 **按代理的**，所以新代理不会继承主代理的密钥。

修复选项：
- 重新运行入职流程并为该代理选择 **Anthropic**。
- 或者在 **网关主机** 上粘贴一个设置令牌：
  ```bash
  moltbot models auth setup-token --provider anthropic
  ```
- 或者从主代理目录复制 `auth-profiles.json` 到新代理目录。

验证：
```bash
moltbot models status
```

### OAuth 令牌刷新失败（Anthropic Claude 订阅）

这意味着存储的 Anthropic OAuth 令牌已过期且刷新失败。
如果你使用 Claude 订阅（无 API 密钥），最可靠的修复方法是
切换到 **Claude Code 设置令牌** 并在 **网关主机** 上粘贴它。

**推荐（设置令牌）：**

```bash
# 在网关主机上运行（粘贴设置令牌）
moltbot models auth setup-token --provider anthropic
moltbot models status
```

如果你在其他地方生成了令牌：

```bash
moltbot models auth paste-token --provider anthropic
moltbot models status
```

更多细节：[Anthropic](/providers/anthropic) 和 [OAuth](/concepts/oauth)。

### 控制 UI 在 HTTP 上失败（"需要设备身份" / "连接失败"）

如果你通过纯 HTTP 打开仪表板（例如 `http://<lan-ip>:18789/` 或
`http://<tailscale-ip>:18789/`），浏览器在 **非安全上下文** 中运行并
阻止 WebCrypto，因此无法生成设备身份。

**修复：**
- 优先使用 [Tailscale Serve](/gateway/tailscale) 的 HTTPS。
- 或者在网关主机上本地打开：`http://127.0.0.1:18789/`。
- 如果你必须停留在 HTTP，启用 `gateway.controlUi.allowInsecureAuth: true` 并
  使用网关令牌（仅令牌；无设备身份/配对）。参见
  [控制 UI](/web/control-ui#insecure-http)。

### CI 密钥扫描失败

这意味着 `detect-secrets` 找到了基线中尚未包含的新候选者。
遵循 [密钥扫描](/gateway/security#secret-scanning-detect-secrets)。

### 服务已安装但没有任何运行

如果网关服务已安装但进程立即退出，服务
可能看起来"已加载"但实际上没有运行任何东西。

**检查：**
```bash
moltbot gateway status
moltbot doctor
```

医生/服务将显示运行时状态（PID/上次退出）和日志提示。

**日志：**
- 首选：`moltbot logs --follow`
- 文件日志（始终）：`/tmp/moltbot/moltbot-YYYY-MM-DD.log`（或你配置的 `logging.file`）
- macOS LaunchAgent（如已安装）：`$CLAWDBOT_STATE_DIR/logs/gateway.log` 和 `gateway.err.log`
- Linux systemd（如已安装）：`journalctl --user -u moltbot-gateway[-<profile>].service -n 200 --no-pager`
- Windows：`schtasks /Query /TN "Moltbot Gateway (<profile>)" /V /FO LIST`

**启用更多日志记录：**
- 提升文件日志详细程度（持久化 JSONL）：
  ```json
  { "logging": { "level": "debug" } }
  ```
- 提升控制台详细程度（仅 TTY 输出）：
  ```json
  { "logging": { "consoleLevel": "debug", "consoleStyle": "pretty" } }
  ```
- 快速提示：`--verbose` 仅影响 **控制台** 输出。文件日志仍由 `logging.level` 控制。

参见 [/logging](/logging) 获取格式、配置和访问的完整概述。

### "网关启动被阻止：设置 gateway.mode=local"

这意味着配置存在但 `gateway.mode` 未设置（或不是 `local`），所以
网关拒绝启动。

**修复（推荐）：**
- 运行向导并将网关运行模式设置为 **本地**：
  ```bash
  moltbot configure
  ```
- 或直接设置：
  ```bash
  moltbot config set gateway.mode local
  ```

**如果你想运行远程网关：**
- 设置远程 URL 并保持 `gateway.mode=remote`：
  ```bash
  moltbot config set gateway.mode remote
  moltbot config set gateway.remote.url "wss://gateway.example.com"
  ```

**仅临时/开发：** 传递 `--allow-unconfigured` 在没有
`gateway.mode=local` 的情况下启动网关。

**还没有配置文件？** 运行 `moltbot setup` 创建起始配置，然后重新运行
网关。

### 服务环境（PATH + 运行时）

网关服务使用 **最小 PATH** 以避免 shell/manager 混乱：
- macOS：`/opt/homebrew/bin`, `/usr/local/bin`, `/usr/bin`, `/bin`
- Linux：`/usr/local/bin`, `/usr/bin`, `/bin`

这故意排除了版本管理器（nvm/fnm/volta/asdf）和包
管理器（pnpm/npm），因为服务不会加载你的 shell 初始化。运行时
变量如 `DISPLAY` 应该保存在 `~/.clawdbot/.env` 中（由
网关早期加载）。
在 `host=gateway` 上运行 exec 会将你的登录 shell `PATH` 合并到 exec 环境中，
所以缺少工具通常意味着你的 shell 初始化没有导出它们（或设置
`tools.exec.pathPrepend`）。参见 [/tools/exec](/tools/exec)。

WhatsApp + Telegram 通道需要 **Node**；Bun 不支持。如果你的
服务是用 Bun 或版本管理的 Node 路径安装的，运行 `moltbot doctor`
迁移到系统 Node 安装。

### 沙盒中技能缺少 API 密钥

**症状：** 技能在主机上工作但在沙盒中因缺少 API 密钥而失败。

**原因：** 沙盒 exec 在 Docker 内部运行，**不** 继承主机 `process.env`。

**修复：**
- 设置 `agents.defaults.sandbox.docker.env`（或按代理 `agents.list[].sandbox.docker.env`）
- 或将密钥烘焙到你的自定义沙盒镜像中
- 然后运行 `moltbot sandbox recreate --agent <id>`（或 `--all`）

### 服务运行但端口未监听

如果服务报告 **运行中** 但网关端口上没有监听任何东西，
网关可能拒绝绑定。

**"运行中" 在这里意味着什么**
- `Runtime: running` 意味着你的监督程序（launchd/systemd/schtasks）认为进程是活动的。
- `RPC probe` 意味着 CLI 实际上可以连接到网关 WebSocket 并调用 `status`。
- 始终信任 `Probe target:` + `Config (service):` 作为"我们实际上尝试了什么？"的行。

**检查：**
- `gateway.mode` 对于 `moltbot gateway` 和服务必须是 `local`。
- 如果你设置了 `gateway.mode=remote`，**CLI 默认** 为远程 URL。服务仍可能在本地运行，但你的 CLI 可能在探测错误的位置。使用 `moltbot gateway status` 查看服务解析的端口 + 探测目标（或传递 `--url`）。
- `moltbot gateway status` 和 `moltbot doctor` 会在服务看起来运行但端口关闭时从日志中显示 **最后网关错误**。
- 非环回绑定（`lan`/`tailnet`/`custom`，或在环回不可用时的 `auto`）需要身份验证：
  `gateway.auth.token`（或 `CLAWDBOT_GATEWAY_TOKEN`）。
- `gateway.remote.token` 仅用于远程 CLI 调用；它 **不** 启用本地身份验证。
- `gateway.token` 被忽略；使用 `gateway.auth.token`。

**如果 `moltbot gateway status` 显示配置不匹配**
- `Config (cli): ...` 和 `Config (service): ...` 应该通常匹配。
- 如果不匹配，你几乎肯定在编辑一个配置的同时服务正在运行另一个配置。
- 修复：从你希望服务使用的相同 `--profile` / `CLAWDBOT_STATE_DIR` 重新运行 `moltbot gateway install --force`。

**如果 `moltbot gateway status` 报告服务配置问题**
- 监督程序配置（launchd/systemd/schtasks）缺少当前默认值。
- 修复：运行 `moltbot doctor` 更新它（或 `moltbot gateway install --force` 进行完全重写）。

**如果 `Last gateway error:` 提到"拒绝在没有身份验证的情况下绑定 …"**
- 你将 `gateway.bind` 设置为非环回模式（`lan`/`tailnet`/`custom`，或在环回不可用时的 `auto`）但没有配置身份验证。
- 修复：设置 `gateway.auth.mode` + `gateway.auth.token`（或导出 `CLAWDBOT_GATEWAY_TOKEN`）并重启服务。

**如果 `moltbot gateway status` 说 `bind=tailnet` 但没有找到 tailnet 接口**
- 网关试图绑定到 Tailscale IP（100.64.0.0/10）但在主机上没有检测到。
- 修复：在该机器上启动 Tailscale（或将 `gateway.bind` 更改为 `loopback`/`lan`）。

**如果 `Probe note:` 说探测使用环回**
- 这对于 `bind=lan` 是预期的：网关监听 `0.0.0.0`（所有接口），环回应该仍能本地连接。
- 对于远程客户端，使用真实的 LAN IP（不是 `0.0.0.0`）加上端口，并确保配置了身份验证。

### 地址已在使用（端口 18789）

这意味着已经有其他东西在监听网关端口。

**检查：**
```bash
moltbot gateway status
```

它将显示监听器和可能的原因（网关已在运行，SSH 隧道）。
如果需要，停止服务或选择不同的端口。

### 检测到额外的工作空间文件夹

如果你从旧安装升级，你可能仍有 `~/moltbot` 在磁盘上。
多个工作空间目录可能导致混乱的身份验证或状态漂移，因为
只有一个工作空间处于活动状态。

**修复：** 保留单个活动工作空间并归档/删除其余的。参见
[代理工作空间](/concepts/agent-workspace#extra-workspace-folders)。

### 主聊天在沙盒工作空间中运行

症状：`pwd` 或文件工具显示 `~/.clawdbot/sandboxes/...` 即使你
期望的是主机工作空间。

**原因：** `agents.defaults.sandbox.mode: "non-main"` 基于 `session.mainKey`（默认为 `"main"`）。
组/频道会话使用自己的密钥，所以它们被视为非主会话并
获得沙盒工作空间。

**修复选项：**
- 如果你希望代理使用主机工作空间：设置 `agents.list[].sandbox.mode: "off"`。
- 如果你希望在沙盒内访问主机工作空间：为该代理设置 `workspaceAccess: "rw"`。

### "代理被中止"

代理在响应中途被中断。

**原因：**
- 用户发送了 `stop`、`abort`、`esc`、`wait` 或 `exit`
- 超时超出
- 进程崩溃

**修复：** 只需发送另一条消息。会话继续。

### "代理在回复前失败：未知模型：anthropic/claude-haiku-3-5"

Moltbot 故意拒绝 **较旧/不安全的模型**（尤其是那些更容易
受到提示注入攻击的模型）。如果你看到此错误，该模型名称已不再
支持。

**修复：**
- 为提供商选择 **最新** 模型并更新你的配置或模型别名。
- 如果你不确定哪些模型可用，运行 `moltbot models list` 或
  `moltbot models scan` 并选择一个支持的模型。
- 检查网关日志以获取详细的失败原因。

另请参见：[模型 CLI](/cli/models) 和 [模型提供商](/concepts/model-providers)。

### 消息未触发

**检查 1：** 发送者是否在白名单中？
```bash
moltbot status
```
在输出中查找 `AllowFrom: ...`。

**检查 2：** 对于群聊，是否需要提及？
```bash
# 消息必须匹配 mentionPatterns 或明确提及；默认值位于频道组/公会中。
# 多代理：`agents.list[].groupChat.mentionPatterns` 覆盖全局模式。
grep -n "agents\\|groupChat\\|mentionPatterns\\|channels\\.whatsapp\\.groups\\|channels\\.telegram\\.groups\\|channels\\.imessage\\.groups\\|channels\\.discord\\.guilds" \
  "${CLAWDBOT_CONFIG_PATH:-$HOME/.clawdbot/moltbot.json}"
```

**检查 3：** 检查日志
```bash
moltbot logs --follow
# 或如果你想要快速过滤：
tail -f "$(ls -t /tmp/moltbot/moltbot-*.log | head -1)" | grep "blocked\\|skip\\|unauthorized"
```

### 配对码未到达

如果 `dmPolicy` 是 `pairing`，未知发送者应该收到一个码，他们的消息会被忽略直到批准。

**检查 1：** 是否已有待处理请求？
```bash
moltbot pairing list <channel>
```

待处理 DM 配对请求默认限制为 **每频道 3 个**。如果列表已满，新请求不会生成码，直到其中一个被批准或过期。

**检查 2：** 请求是否已创建但没有发送回复？
```bash
moltbot logs --follow | grep "pairing request"
```

**检查 3：** 确认该频道的 `dmPolicy` 不是 `open`/`allowlist`。

### 图像 + 提及不起作用

已知问题：当你只发送带有提及（没有其他文本）的图像时，WhatsApp 有时不包含提及元数据。

**解决方法：** 在提及中添加一些文本：
- ❌ `@clawd` + 图像
- ✅ `@clawd check this` + 图像

### 会话未恢复

**检查 1：** 会话文件是否存在？
```bash
ls -la ~/.clawdbot/agents/<agentId>/sessions/
```

**检查 2：** 重置窗口是否太短？
```json
{
  "session": {
    "reset": {
      "mode": "daily",
      "atHour": 4,
      "idleMinutes": 10080  // 7 天
    }
  }
}
```

**检查 3：** 是否有人发送了 `/new`、`/reset` 或重置触发器？

### 代理超时

默认超时为 30 分钟。对于长时间任务：

```json
{
  "reply": {
    "timeoutSeconds": 3600  // 1 小时
  }
}
```

或使用 `process` 工具将长时间命令后台化。

### WhatsApp 断开连接

```bash
# 检查本地状态（凭据、会话、排队事件）
moltbot status
# 探测运行中的网关 + 通道（WA 连接 + Telegram + Discord API）
moltbot status --deep

# 查看最近的连接事件
moltbot logs --limit 200 | grep "connection\\|disconnect\\|logout"
```

**修复：** 一旦网关运行通常会自动重新连接。如果你卡住了，重启网关进程（无论你如何监督它），或使用详细输出手动运行：

```bash
moltbot gateway --verbose
```

如果你已登出/取消链接：

```bash
moltbot channels logout
trash "${CLAWDBOT_STATE_DIR:-$HOME/.clawdbot}/credentials" # 如果登出不能干净地移除所有内容
moltbot channels login --verbose       # 重新扫描 QR
```

### 媒体发送失败

**检查 1：** 文件路径是否有效？
```bash
ls -la /path/to/your/image.jpg
```

**检查 2：** 文件是否太大？
- 图像：最大 6MB
- 音频/视频：最大 16MB  
- 文档：最大 100MB

**检查 3：** 检查媒体日志
```bash
grep "media\\|fetch\\|download" "$(ls -t /tmp/moltbot/moltbot-*.log | head -1)" | tail -20
```

### 高内存使用率

Moltbot 在内存中保持对话历史。

**修复：** 定期重启或设置会话限制：
```json
{
  "session": {
    "historyLimit": 100  // 保留的最大消息数
  }
}
```

## 常见故障排除

### "网关无法启动 — 配置无效"

当配置包含未知键、格式错误的值或无效类型时，Moltbot 现在拒绝启动。
这是出于安全考虑的故意行为。

用 Doctor 修复它：
```bash
moltbot doctor
moltbot doctor --fix
```

说明：
- `moltbot doctor` 报告每个无效条目。
- `moltbot doctor --fix` 应用迁移/修复并重写配置。
- 即使配置无效，`moltbot logs`、`moltbot health`、`moltbot status`、`moltbot gateway status` 和 `moltbot gateway probe` 等诊断命令仍可运行。

### "所有模型都失败了" — 我应该首先检查什么？

- **凭据** 是否为正在尝试的提供商提供（身份验证配置文件 + 环境变量）。
- **模型路由**：确认 `agents.defaults.model.primary` 和备用项是你能访问的模型。
- **网关日志** 在 `/tmp/moltbot/…` 中查找确切的提供商错误。
- **模型状态**：使用 `/model status`（聊天）或 `moltbot models status`（CLI）。

### 我在我的个人 WhatsApp 号码上运行 — 为什么自聊很奇怪？

启用自聊模式并允许白名单你的号码：

```json5
{
  channels: {
    whatsapp: {
      selfChatMode: true,
      dmPolicy: "allowlist",
      allowFrom: ["+15555550123"]
    }
  }
}
```

参见 [WhatsApp 设置](/channels/whatsapp)。

### WhatsApp 登出我了。我如何重新认证？

再次运行登录命令并扫描 QR 码：

```bash
moltbot channels login
```

### `main` 上的构建错误 — 标准修复路径是什么？

1) `git pull origin main && pnpm install`
2) `moltbot doctor`
3) 检查 GitHub 问题或 Discord
4) 临时解决方法：检出较早的提交

### npm install 失败（allow-build-scripts / 缺少 tar 或 yargs）。现在怎么办？

如果你从源码运行，请使用仓库的包管理器：**pnpm**（首选）。
仓库声明了 `packageManager: "pnpm@…"`。

典型恢复：
```bash
git status   # 确保你在仓库根目录
pnpm install
pnpm build
moltbot doctor
moltbot gateway restart
```

原因：pnpm 是此仓库配置的包管理器。

### 如何在 git 安装和 npm 安装之间切换？

使用 **网站安装程序** 并使用标志选择安装方法。它
就地升级并将网关服务重写为指向新安装。

切换 **到 git 安装**：
```bash
curl -fsSL https://molt.bot/install.sh | bash -s -- --install-method git --no-onboard
```

切换 **到 npm 全局**：
```bash
curl -fsSL https://molt.bot/install.sh | bash
```

说明：
- git 流程仅在仓库干净时才会变基。先提交或暂存更改。
- 切换后，运行：
  ```bash
  moltbot doctor
  moltbot gateway restart
  ```

### Telegram 块流在工具调用之间不分割文本。为什么？

块流仅发送 **已完成的文本块**。你看到单条消息的常见原因：
- `agents.defaults.blockStreamingDefault` 仍是 `"off"`。
- `channels.telegram.blockStreaming` 设置为 `false`。
- `channels.telegram.streamMode` 是 `partial` 或 `block` **且草稿流处于活动状态**
  （私聊 + 主题）。在这种情况下，草稿流禁用块流。
- 你的 `minChars` / 合并设置太高，所以块被合并。
- 模型发出一个大文本块（没有中间回复刷新点）。

修复清单：
1) 将块流设置放在 `agents.defaults` 下，而不是根目录。
2) 如果你想要真正的多消息块回复，设置 `channels.telegram.streamMode: "off"`。
3) 调试时使用较小的块/合并阈值。

参见 [流](/concepts/streaming)。

### Discord 在我的服务器中不回复，即使设置了 `requireMention: false`。为什么？

`requireMention` 仅在频道通过白名单后控制提及门控。
默认情况下 `channels.discord.groupPolicy` 是 **白名单**，所以公会必须明确启用。
如果你设置了 `channels.discord.guilds.<guildId>.channels`，只允许列出的频道；省略它以允许公会中的所有频道。

修复清单：
1) 设置 `channels.discord.groupPolicy: "open"` **或** 添加公会白名单条目（可选频道白名单）。
2) 在 `channels.discord.guilds.<guildId>.channels` 中使用 **数字频道 ID**。
3) 将 `requireMention: false` 放在 `channels.discord.guilds` **下**（全局或按频道）。
   顶级 `channels.discord.requireMention` 不是受支持的键。
4) 确保机器人有 **消息内容意图** 和频道权限。
5) 运行 `moltbot channels status --probe` 获取审计提示。

文档：[Discord](/channels/discord)，[通道故障排除](/channels/troubleshooting)。

### 云代码助手 API 错误：无效工具架构（400）。现在怎么办？

这几乎总是一个 **工具架构兼容性** 问题。云代码助手
端点接受 JSON 架构的严格子集。Moltbot 在当前 `main` 中清理/规范化工具
架构，但修复尚未包含在最新发布版中（截至
2026年1月13日）。

修复清单：
1) **更新 Moltbot**：
   - 如果你能从源码运行，拉取 `main` 并重启网关。
   - 否则，等待包含架构清理器的下次发布。
2) 避免不支持的关键字如 `anyOf/oneOf/allOf`、`patternProperties`、
   `additionalProperties`、`minLength`、`maxLength`、`format` 等。
3) 如果你定义自定义工具，将顶层架构保持为 `type: "object"` 带
   `properties` 和简单枚举。

参见 [工具](/tools) 和 [TypeBox 架构](/concepts/typebox)。

## macOS 特定问题

### 授予权限时应用程序崩溃（语音/麦克风）

如果你点击隐私提示上的"允许"时应用程序消失或显示"Abort trap 6"：

**修复 1：重置 TCC 缓存**
```bash
tccutil reset All bot.molt.mac.debug
```

**修复 2：强制新捆绑 ID**
如果重置不起作用，更改 [`scripts/package-mac-app.sh`](https://github.com/moltbot/moltbot/blob/main/scripts/package-mac-app.sh) 中的 `BUNDLE_ID`（例如，添加 `.test` 后缀）并重建。这强制 macOS 将其视为新应用程序。

### 网关卡在"启动中..."

应用程序连接到端口 `18789` 上的本地网关。如果它持续卡住：

**修复 1：停止监督程序（首选）**
如果网关由 launchd 监督，杀死 PID 只会使它重生。先停止监督程序：
```bash
moltbot gateway status
moltbot gateway stop
# 或：launchctl bootout gui/$UID/bot.molt.gateway（替换为 bot.molt.<profile>；遗留的 com.clawdbot.* 仍有效）
```

**修复 2：端口忙（查找监听器）**
```bash
lsof -nP -iTCP:18789 -sTCP:LISTEN
```

如果是无人监督的进程，先尝试优雅停止，然后升级：
```bash
kill -TERM <PID>
sleep 1
kill -9 <PID> # 最后手段
```

**修复 3：检查 CLI 安装**
确保全局 `moltbot` CLI 已安装并与应用程序版本匹配：
```bash
moltbot --version
npm install -g moltbot@<version>
```

## 调试模式

获取详细日志：

```bash
# 在配置中打开跟踪日志：
#   ${CLAWDBOT_CONFIG_PATH:-$HOME/.clawdbot/moltbot.json} -> { logging: { level: "trace" } }
#
# 然后运行详细命令将调试输出镜像到标准输出：
moltbot gateway --verbose
moltbot channels login --verbose
```

## 日志位置

| 日志 | 位置 |
|-----|----------|
| 网关文件日志（结构化） | `/tmp/moltbot/moltbot-YYYY-MM-DD.log`（或 `logging.file`） |
| 网关服务日志（监督程序） | macOS：`$CLAWDBOT_STATE_DIR/logs/gateway.log` + `gateway.err.log`（默认：`~/.clawdbot/logs/...`；配置文件使用 `~/.clawdbot-<profile>/logs/...`）<br />Linux：`journalctl --user -u moltbot-gateway[-<profile>].service -n 200 --no-pager`<br />Windows：`schtasks /Query /TN "Moltbot Gateway (<profile>)" /V /FO LIST` |
| 会话文件 | `$CLAWDBOT_STATE_DIR/agents/<agentId>/sessions/` |
| 媒体缓存 | `$CLAWDBOT_STATE_DIR/media/` |
| 凭据 | `$CLAWDBOT_STATE_DIR/credentials/` |

## 健康检查

```bash
# 监督程序 + 探测目标 + 配置路径
moltbot gateway status
# 包括系统级扫描（遗留/额外服务，端口监听器）
moltbot gateway status --deep

# 网关是否可达？
moltbot health --json
# 如果失败，使用连接详情重新运行：
moltbot health --verbose

# 默认端口上是否有东西在监听？
lsof -nP -iTCP:18789 -sTCP:LISTEN

# 最近活动（RPC 日志尾部）
moltbot logs --follow
# 如果 RPC 停止的后备方案
tail -20 /tmp/moltbot/moltbot-*.log
```

## 重置一切

终极选项：

```bash
moltbot gateway stop
# 如果你安装了服务并希望干净安装：
# moltbot gateway uninstall

trash "${CLAWDBOT_STATE_DIR:-$HOME/.clawdbot}"
moltbot channels login         # 重新配对 WhatsApp
moltbot gateway restart           # 或：moltbot gateway
```

⚠️ 这会丢失所有会话并需要重新配对 WhatsApp。

## 获取帮助

1. 首先检查日志：`/tmp/moltbot/`（默认：`moltbot-YYYY-MM-DD.log`，或你配置的 `logging.file`）
2. 搜索 GitHub 上的现有问题
3. 开启新问题，包含：
   - Moltbot 版本
   - 相关日志片段
   - 重现步骤
   - 你的配置（脱敏密钥！）

---

*"你试过关闭再打开吗？"* — 每个 IT 人员都说过

🦞🔧

### 浏览器未启动（Linux）

如果你看到 `"Failed to start Chrome CDP on port 18800"`：

**最可能的原因：** Ubuntu 上的 Snap 打包的 Chromium。

**快速修复：** 改为安装 Google Chrome：
```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
```

然后在配置中设置：
```json
{
  "browser": {
    "executablePath": "/usr/bin/google-chrome-stable"
  }
}
```

**完整指南：** 参见 [browser-linux-troubleshooting](/tools/browser-linux-troubleshooting)
