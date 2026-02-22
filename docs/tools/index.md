---
summary: "Moltbot 的代理工具表面（浏览器、画布、节点、cron），替换旧的 `moltbot-*` 技能"
read_when:
  - 添加或修改代理工具
  - 淘汰或更改 `moltbot-*` 技能
---

# 工具（Moltbot）

Moltbot 为浏览器、画布、节点和 cron 暴露 **一流代理工具**。
这些替换了旧的 `moltbot-*` 技能：工具是类型化的，无需外壳，
代理应直接依赖它们。

## 禁用工具

您可以通过 `moltbot.json` 中的 `tools.allow` / `tools.deny` 全局允许/拒绝工具
（拒绝优先）。这阻止不允许的工具被发送到模型提供者。

```json5
{
  tools: { deny: ["browser"] }
}
```

注意事项：
- 匹配不区分大小写。
- 支持 `*` 通配符（`"*"` 表示所有工具）。
- 如果 `tools.allow` 仅引用未知或未加载的插件工具名称，Moltbot 记录警告并忽略允许列表，以便核心工具保持可用。

## 工具配置文件（基础允许列表）

`tools.profile` 在 `tools.allow`/`tools.deny` 之前设置 **基础工具允许列表**。
每个代理覆盖：`agents.list[].tools.profile`。

配置文件：
- `minimal`：仅 `session_status`
- `coding`：`group:fs`, `group:runtime`, `group:sessions`, `group:memory`, `image`
- `messaging`：`group:messaging`, `sessions_list`, `sessions_history`, `sessions_send`, `session_status`
- `full`：无限制（与未设置相同）

示例（默认仅限消息，也允许 Slack + Discord 工具）：
```json5
{
  tools: {
    profile: "messaging",
    allow: ["slack"]
  }
}
```

示例（编码配置文件，但在任何地方拒绝 exec/process）：
```json5
{
  tools: {
    profile: "coding",
    deny: ["group:runtime"]
  }
}
```

示例（全局编码配置文件，仅限消息支持代理）：
```json5
{
  tools: { profile: "coding" },
  agents: {
    list: [
      {
        id: "support",
        tools: { profile: "messaging", allow: ["slack"] }
      }
    ]
  }
}
```

## 特定提供者的工具策略

使用 `tools.byProvider` 来 **进一步限制** 特定提供者
（或单个 `provider/model`）的工具，而不更改您的全局默认值。
每个代理覆盖：`agents.list[].tools.byProvider`。

这在基础工具配置文件之后和允许/拒绝列表之前应用，
因此它只能缩小工具集。
提供者键接受 `provider`（例如 `google-antigravity`）或
`provider/model`（例如 `openai/gpt-5.2`）。

示例（保持全局编码配置文件，但 Google Antigravity 使用最小工具）：
```json5
{
  tools: {
    profile: "coding",
    byProvider: {
      "google-antigravity": { profile: "minimal" }
    }
  }
}
```

示例（特定提供者/模型的允许列表，针对不稳定的端点）：
```json5
{
  tools: {
    allow: ["group:fs", "group:runtime", "sessions_list"],
    byProvider: {
      "openai/gpt-5.2": { allow: ["group:fs", "sessions_list"] }
    }
  }
}
```

示例（针对单个提供者的代理特定覆盖）：
```json5
{
  agents: {
    list: [
      {
        id: "support",
        tools: {
          byProvider: {
            "google-antigravity": { allow: ["message", "sessions_list"] }
          }
        }
      }
    ]
  }
}
```

## 工具组（简写）

工具策略（全局、代理、沙盒）支持 `group:*` 条目，扩展为多个工具。
在 `tools.allow` / `tools.deny` 中使用这些。

可用组：
- `group:runtime`: `exec`, `bash`, `process`
- `group:fs`: `read`, `write`, `edit`, `apply_patch`
- `group:sessions`: `sessions_list`, `sessions_history`, `sessions_send`, `sessions_spawn`, `session_status`
- `group:memory`: `memory_search`, `memory_get`
- `group:web`: `web_search`, `web_fetch`
- `group:ui`: `browser`, `canvas`
- `group:automation`: `cron`, `gateway`
- `group:messaging`: `message`
- `group:nodes`: `nodes`
- `group:moltbot`: 所有内置 Moltbot 工具（不包括提供者插件）

示例（仅允许文件工具 + 浏览器）：
```json5
{
  tools: {
    allow: ["group:fs", "browser"]
  }
}
```

## 插件 + 工具

插件可以注册核心集之外的 **额外工具**（和 CLI 命令）。
有关安装 + 配置，请参见 [插件](/plugin)，有关
工具使用指导如何注入到提示中，请参见 [技能](/tools/skills)。一些插件随工具一起发布自己的技能
（例如，语音通话插件）。

可选插件工具：
- [Lobster](/tools/lobster)：带有可恢复审批的类型化工作流运行时（需要网关主机上的 Lobster CLI）。
- [LLM 任务](/tools/llm-task)：用于结构化工作流输出的仅 JSON LLM 步骤（可选架构验证）。

## 工具清单

### `apply_patch`
跨一个或多个文件应用结构化补丁。用于多块编辑。
实验性：通过 `tools.exec.applyPatch.enabled` 启用（仅 OpenAI 模型）。

### `exec`
在工作区中运行 shell 命令。

核心参数：
- `command`（必需）
- `yieldMs`（超时后自动后台化，默认 10000）
- `background`（立即后台化）
- `timeout`（秒；超过时间杀死进程，默认 1800）
- `elevated`（布尔值；如果启用/允许提升模式，则在主机上运行；仅当代理沙盒化时才改变行为）
- `host`（`sandbox | gateway | node`）
- `security`（`deny | allowlist | full`）
- `ask`（`off | on-miss | always`）
- `node`（`host=node` 的节点 ID/名称）
需要真正的 TTY？设置 `pty: true`。

注意事项：
- 后台化时返回 `status: "running"` 和 `sessionId`。
- 使用 `process` 来轮询/日志/写入/杀死/清除后台会话。
- 如果 `process` 被禁止，`exec` 同步运行并忽略 `yieldMs`/`background`。
- `elevated` 受 `tools.elevated` 和任何 `agents.list[].tools.elevated` 覆盖控制（两者都必须允许）并且是 `host=gateway` + `security=full` 的别名。
- `elevated` 仅在代理沙盒化时改变行为（否则是无操作）。
- `host=node` 可以定位 macOS 伴侣应用或无头节点主机（`moltbot node run`）。
- 网关/节点审批和允许列表：[执行审批](/tools/exec-approvals)。

### `process`
管理后台 exec 会话。

核心操作：
- `list`, `poll`, `log`, `write`, `kill`, `clear`, `remove`

注意事项：
- `poll` 在完成时返回新输出和退出状态。
- `log` 支持基于行的 `offset`/`limit`（省略 `offset` 以获取最后 N 行）。
- `process` 按代理范围；其他代理的会话不可见。

### `web_search`
使用 Brave Search API 搜索网络。

核心参数：
- `query`（必需）
- `count`（1–10；默认来自 `tools.web.search.maxResults`）

注意事项：
- 需要 Brave API 密钥（推荐：`moltbot configure --section web`，或设置 `BRAVE_API_KEY`）。
- 通过 `tools.web.search.enabled` 启用。
- 响应被缓存（默认 15 分钟）。
- 请参见 [Web 工具](/tools/web) 了解设置。

### `web_fetch`
从 URL 获取并提取可读内容（HTML → markdown/文本）。

核心参数：
- `url`（必需）
- `extractMode`（`markdown` | `text`）
- `maxChars`（截断长页面）

注意事项：
- 通过 `tools.web.fetch.enabled` 启用。
- 响应被缓存（默认 15 分钟）。
- 对于 JS 密集型网站，优先使用浏览器工具。
- 请参见 [Web 工具](/tools/web) 了解设置。
- 请参见 [Firecrawl](/tools/firecrawl) 了解可选的反机器人回退。

### `browser`
控制专用的 clawd 浏览器。

核心操作：
- `status`, `start`, `stop`, `tabs`, `open`, `focus`, `close`
- `snapshot`（aria/ai）
- `screenshot`（返回图像块 + `MEDIA:<path>`）
- `act`（UI 操作：click/type/press/hover/drag/select/fill/resize/wait/evaluate）
- `navigate`, `console`, `pdf`, `upload`, `dialog`

配置文件管理：
- `profiles` — 列出所有浏览器配置文件及其状态
- `create-profile` — 创建新配置文件，自动分配端口（或 `cdpUrl`）
- `delete-profile` — 停止浏览器，删除用户数据，从配置中移除（仅本地）
- `reset-profile` — 在配置文件端口上杀死孤立进程（仅本地）

常用参数：
- `profile`（可选；默认为 `browser.defaultProfile`）
- `target`（`sandbox` | `host` | `node`）
- `node`（可选；选择特定节点 ID/名称）
注意事项：
- 需要 `browser.enabled=true`（默认为 `true`；设置为 `false` 以禁用）。
- 所有操作接受可选的 `profile` 参数以支持多实例。
- 当省略 `profile` 时，使用 `browser.defaultProfile`（默认为 "chrome"）。
- 配置文件名称：仅小写字母数字 + 连字符（最多 64 个字符）。
- 端口范围：18800-18899（约 100 个配置文件最大）。
- 远程配置文件仅可附加（无启动/停止/重置）。
- 如果连接了支持浏览器的节点，工具可能会自动路由到它（除非您固定 `target`）。
- `snapshot` 在安装 Playwright 时默认为 `ai`；使用 `aria` 获取无障碍树。
- `snapshot` 还支持角色快照选项（`interactive`, `compact`, `depth`, `selector`），返回像 `e12` 这样的引用。
- `act` 需要来自 `snapshot` 的 `ref`（AI 快照中的数字 `12`，或角色快照中的 `e12`）；对于罕见的 CSS 选择器需求使用 `evaluate`。
- 默认避免 `act` → `wait`；仅在特殊情况下使用（没有可靠的 UI 状态等待）。
- `upload` 可选择传递 `ref` 以在武装后自动点击。
- `upload` 还支持 `inputRef`（aria 引用）或 `element`（CSS 选择器）来直接设置 `<input type="file">`。

### `canvas`
驱动节点画布（呈现、评估、快照、A2UI）。

核心操作：
- `present`, `hide`, `navigate`, `eval`
- `snapshot`（返回图像块 + `MEDIA:<path>`）
- `a2ui_push`, `a2ui_reset`

注意事项：
- 在底层使用网关 `node.invoke`。
- 如果未提供 `node`，工具会选择默认值（单个连接节点或本地 mac 节点）。
- A2UI 仅 v0.8（无 `createSurface`）；CLI 拒绝带有行错误的 v0.9 JSONL。
- 快速烟雾测试：`moltbot nodes canvas a2ui push --node <id> --text "Hello from A2UI"`。

### `nodes`
发现和定位配对节点；发送通知；捕获相机/屏幕。

核心操作：
- `status`, `describe`
- `pending`, `approve`, `reject`（配对）
- `notify`（macOS `system.notify`）
- `run`（macOS `system.run`）
- `camera_snap`, `camera_clip`, `screen_record`
- `location_get`

注意事项：
- 相机/屏幕命令需要节点应用处于前台。
- 图像返回图像块 + `MEDIA:<path>`。
- 视频返回 `FILE:<path>`（mp4）。
- 位置返回 JSON 载荷（纬度/经度/精度/时间戳）。
- `run` 参数：`command` argv 数组；可选 `cwd`, `env`（`KEY=VAL`）, `commandTimeoutMs`, `invokeTimeoutMs`, `needsScreenRecording`。

示例（`run`）：
```json
{
  "action": "run",
  "node": "office-mac",
  "command": ["echo", "Hello"],
  "env": ["FOO=bar"],
  "commandTimeoutMs": 12000,
  "invokeTimeoutMs": 45000,
  "needsScreenRecording": false
}
```

### `image`
使用配置的图像模型分析图像。

核心参数：
- `image`（必需路径或 URL）
- `prompt`（可选；默认为 "描述图像。"）
- `model`（可选覆盖）
- `maxBytesMb`（可选大小限制）

注意事项：
- 仅当配置了 `agents.defaults.imageModel`（主要或备用），或可以从您的默认模型 + 配置的身份验证推断隐式图像模型时（尽力配对）才可用。
- 直接使用图像模型（独立于主要聊天模型）。

### `message`
跨 Discord/Google Chat/Slack/Telegram/WhatsApp/Signal/iMessage/MS Teams 发送消息和频道操作。

核心操作：
- `send`（文本 + 可选媒体；MS Teams 还支持用于自适应卡片的 `card`）
- `poll`（WhatsApp/Discord/MS Teams 投票）
- `react` / `reactions` / `read` / `edit` / `delete`
- `pin` / `unpin` / `list-pins`
- `permissions`
- `thread-create` / `thread-list` / `thread-reply`
- `search`
- `sticker`
- `member-info` / `role-info`
- `emoji-list` / `emoji-upload` / `sticker-upload`
- `role-add` / `role-remove`
- `channel-info` / `channel-list`
- `voice-status`
- `event-list` / `event-create`
- `timeout` / `kick` / `ban`

注意事项：
- `send` 通过网关路由 WhatsApp；其他频道直接发送。
- `poll` 为 WhatsApp 和 MS Teams 使用网关；Discord 投票直接发送。
- 当消息工具调用绑定到活动聊天会话时，发送受限于该会话的目标，以避免跨上下文泄漏。

### `cron`
管理网关 cron 作业和唤醒。

核心操作：
- `status`, `list`
- `add`, `update`, `remove`, `run`, `runs`
- `wake`（排队系统事件 + 可选立即心跳）

注意事项：
- `add` 期望完整的 cron 作业对象（与 `cron.add` RPC 相同架构）。
- `update` 使用 `{ id, patch }`。

### `gateway`
重启或应用更新到运行中的网关进程（就地）。

核心操作：
- `restart`（授权 + 发送 `SIGUSR1` 以就地重启；`moltbot gateway` 就地重启）
- `config.get` / `config.schema`
- `config.apply`（验证 + 写入配置 + 重启 + 唤醒）
- `config.patch`（合并部分更新 + 重启 + 唤醒）
- `update.run`（运行更新 + 重启 + 唤醒）

注意事项：
- 使用 `delayMs`（默认 2000）以避免中断正在进行的回复。
- `restart` 默认禁用；通过 `commands.restart: true` 启用。

### `sessions_list` / `sessions_history` / `sessions_send` / `sessions_spawn` / `session_status`
列出会话，检查转录历史，或发送到另一个会话。

核心参数：
- `sessions_list`: `kinds?`, `limit?`, `activeMinutes?`, `messageLimit?`（0 = 无）
- `sessions_history`: `sessionKey`（或 `sessionId`），`limit?`, `includeTools?`
- `sessions_send`: `sessionKey`（或 `sessionId`），`message`，`timeoutSeconds?`（0 = 发送即忘）
- `sessions_spawn`: `task`, `label?`, `agentId?`, `model?`, `runTimeoutSeconds?`, `cleanup?`
- `session_status`: `sessionKey?`（默认当前；接受 `sessionId`），`model?`（`default` 清除覆盖）

注意事项：
- `main` 是规范的直接聊天键；全局/未知被隐藏。
- `messageLimit > 0` 获取每个会话的最后 N 条消息（过滤工具消息）。
- `sessions_send` 在 `timeoutSeconds > 0` 时等待最终完成。
- 交付/公告发生在完成后，是尽力而为的；`status: "ok"` 确认代理运行完成，不是公告已送达。
- `sessions_spawn` 启动子代理运行并将公告回复发布回请求者聊天。
- `sessions_spawn` 是非阻塞的，立即返回 `status: "accepted"`。
- `sessions_send` 运行回复回_ping_pong（回复 `REPLY_SKIP` 以停止；最大回合数通过 `session.agentToAgent.maxPingPongTurns`，0–5）。
- ping_pong 之后，目标代理运行一个 **公告步骤**；回复 `ANNOUNCE_SKIP` 以抑制公告。

### `agents_list`
列出当前会话可能使用 `sessions_spawn` 目标的代理 ID。

注意事项：
- 结果受每个代理允许列表限制（`agents.list[].subagents.allowAgents`）。
- 当配置为 `["*"]` 时，工具包含所有配置的代理并标记 `allowAny: true`。

## 参数（通用）

网关支持的工具（`canvas`, `nodes`, `cron`）：
- `gatewayUrl`（默认 `ws://127.0.0.1:18789`）
- `gatewayToken`（如果启用身份验证）
- `timeoutMs`

浏览器工具：
- `profile`（可选；默认为 `browser.defaultProfile`）
- `target`（`sandbox` | `host` | `node`）
- `node`（可选；固定特定节点 ID/名称）

## 推荐的代理流程

浏览器自动化：
1) `browser` → `status` / `start`
2) `snapshot`（ai 或 aria）
3) `act`（click/type/press）
4) `screenshot` 如果您需要视觉确认

画布渲染：
1) `canvas` → `present`
2) `a2ui_push`（可选）
3) `snapshot`

节点定位：
1) `nodes` → `status`
2) 在选定节点上 `describe`
3) `notify` / `run` / `camera_snap` / `screen_record`

## 安全

- 避免直接 `system.run`；仅在明确用户同意的情况下使用 `nodes` → `run`。
- 尊重用户对相机/屏幕捕获的同意。
- 使用 `status/describe` 在调用媒体命令之前确保权限。

## 工具如何呈现给代理

工具在两个并行通道中公开：

1) **系统提示文本**：人类可读的列表 + 指导。
2) **工具架构**：发送到模型 API 的结构化函数定义。

这意味着代理既能看到"有什么工具"也能看到"如何调用它们"。如果工具
没有出现在系统提示或架构中，模型无法调用它。