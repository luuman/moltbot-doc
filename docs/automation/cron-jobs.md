---
summary: "网关调度程序的 Cron 作业和唤醒功能"
read_when:
  - 安排后台作业或唤醒
  - 连接应与心跳同时运行或独立运行的自动化
  - 在心跳和 cron 之间为计划任务做决定
---
# Cron 作业（网关调度程序）

> **Cron 与心跳？** 请参阅 [Cron 与心跳](/automation/cron-vs-heartbeat) 了解何时使用每种方法的指导。

Cron 是网关内置的调度程序。它持久化作业，在正确的时间唤醒代理，
并且可以选择将输出返回到聊天中。

如果您想要 *“每天早上运行这个”* 或 *“20 分钟后唤醒代理”*，
cron 就是机制。

## 概要
- Cron 在 **网关内部** 运行（不在模型内部）。
- 作业持久化存储在 `~/.clawdbot/cron/` 中，因此重启不会丢失计划。
- 两种执行方式：
  - **主会话**：排队系统事件，然后在下次心跳时运行。
  - **隔离**：在 `cron:<jobId>` 中运行专用代理回合，可选择传递输出。
- 唤醒是一等公民：作业可以请求"立即唤醒"与"下次心跳"。

## 初学者友好概述
将 cron 作业想象为：**何时**运行 + **做什么**。

1) **选择一个计划**
   - 一次性提醒 → `schedule.kind = "at"`（CLI：`--at`）
   - 重复作业 → `schedule.kind = "every"` 或 `schedule.kind = "cron"`
   - 如果您的 ISO 时间戳省略了时区，则被视为 **UTC**。

2) **选择运行位置**
   - `sessionTarget: "main"` → 在下次心跳期间使用主上下文运行。
   - `sessionTarget: "isolated"` → 在 `cron:<jobId>` 中运行专用代理回合。

3) **选择有效载荷**
   - 主会话 → `payload.kind = "systemEvent"`
   - 隔离会话 → `payload.kind = "agentTurn"`

可选：`deleteAfterRun: true` 从存储中删除成功的一次性作业。

## 概念

### 作业
Cron 作业是一个存储记录，包含：
- 一个 **计划**（应该何时运行），
- 一个 **有效载荷**（应该做什么），
- 可选的 **传递**（输出应该发送到哪里）。
- 可选的 **代理绑定**（`agentId`）：在特定代理下运行作业；如果
  缺失或未知，网关回退到默认代理。

作业由稳定的 `jobId` 标识（CLI/Gateway API 使用）。
在代理工具调用中，`jobId` 是规范的；遗留的 `id` 为了兼容性被接受。
作业可以通过 `deleteAfterRun: true` 在成功的一次性运行后自动删除。

### 计划
Cron 支持三种计划类型：
- `at`：一次性时间戳（自纪元以来的毫秒数）。网关接受 ISO 8601 并转换为 UTC。
- `every`：固定间隔（毫秒）。
- `cron`：5 字段 cron 表达式，带可选的 IANA 时区。

Cron 表达式使用 `croner`。如果省略时区，则使用网关主机的
本地时区。

### 主会话与隔离执行

#### 主会话作业（系统事件）
主作业排队系统事件并可选择唤醒心跳运行器。
它们必须使用 `payload.kind = "systemEvent"`。

- `wakeMode: "next-heartbeat"`（默认）：事件等待下次计划的心跳。
- `wakeMode: "now"`：事件触发即时心跳运行。

这是当您想要正常心跳提示 + 主会话上下文时的最佳选择。
请参阅 [心跳](/gateway/heartbeat)。

#### 隔离作业（专用 cron 会话）
隔离作业在会话 `cron:<jobId>` 中运行专用代理回合。

关键行为：
- 提示以 `[cron:<jobId> <job name>]` 为前缀以便追踪。
- 每次运行都以 **新的会话 ID** 开始（没有先前对话的延续）。
- 摘要发布到主会话（前缀 `Cron`，可配置）。
- `wakeMode: "now"` 在发布摘要后立即触发心跳。
- 如果 `payload.deliver: true`，输出传递到通道；否则保持内部。

对嘈杂、频繁或不应在主聊天历史中刷屏的"后台任务"使用隔离作业。

### 有效载荷形状（运行什么）
支持两种有效载荷类型：
- `systemEvent`：仅主会话，通过心跳提示路由。
- `agentTurn`：仅隔离会话，运行专用代理回合。

常见的 `agentTurn` 字段：
- `message`：必需的文本提示。
- `model` / `thinking`：可选覆盖（见下文）。
- `timeoutSeconds`：可选超时覆盖。
- `deliver`：`true` 将输出发送到通道目标。
- `channel`：`last` 或特定通道。
- `to`：通道特定目标（电话/聊天/通道 ID）。
- `bestEffortDeliver`：如果交付失败则避免作业失败。

隔离选项（仅适用于 `session=isolated`）：
- `postToMainPrefix`（CLI：`--post-prefix`）：主会话中系统事件的前缀。
- `postToMainMode`：`summary`（默认）或 `full`。
- `postToMainMaxChars`：当 `postToMainMode=full` 时的最大字符数（默认 8000）。

### 模型和思考覆盖
隔离作业（`agentTurn`）可以覆盖模型和思考级别：
- `model`：提供者/模型字符串（例如，`anthropic/claude-sonnet-4-20250514`）或别名（例如，`opus`）
- `thinking`：思考级别（`off`、`minimal`、`low`、`medium`、`high`、`xhigh`；仅 GPT-5.2 + Codex 模型）

注意：您也可以在主会话作业上设置 `model`，但它会更改共享的主
会话模型。我们建议仅对隔离作业进行模型覆盖，以避免
意外的上下文转换。

解析优先级：
1. 作业有效载荷覆盖（最高）
2. 钩子特定默认值（例如，`hooks.gmail.model`）
3. 代理配置默认值

### 传递（通道 + 目标）
隔离作业可以将输出传递到通道。作业有效载荷可以指定：
- `channel`：`whatsapp` / `telegram` / `discord` / `slack` / `mattermost`（插件）/ `signal` / `imessage` / `last`
- `to`：通道特定收件人目标

如果省略 `channel` 或 `to`，cron 可以回退到主会话的"最后路由"
（代理上次回复的地方）。

传递说明：
- 如果设置了 `to`，即使省略了 `deliver`，cron 也会自动传递代理的最终输出。
- 当您希望在没有显式 `to` 的情况下使用最后路由传递时，请使用 `deliver: true`。
- 即使存在 `to`，使用 `deliver: false` 保持输出内部。

目标格式提醒：
- Slack/Discord/Mattermost（插件）目标应使用显式前缀（例如 `channel:<id>`，`user:<id>`）以避免歧义。
- Telegram 主题应使用 `:topic:` 形式（见下文）。

#### Telegram 传递目标（主题/论坛线程）
Telegram 通过 `message_thread_id` 支持论坛主题。对于 cron 传递，您可以将
主题/线程编码到 `to` 字段中：

- `-1001234567890`（仅聊天 ID）
- `-1001234567890:topic:123`（首选：显式主题标记）
- `-1001234567890:123`（简写：数字后缀）

也接受像 `telegram:...` / `telegram:group:...` 这样的前缀目标：
- `telegram:group:-1001234567890:topic:123`

## 存储和历史
- 作业存储：`~/.clawdbot/cron/jobs.json`（网关管理的 JSON）。
- 运行历史：`~/.clawdbot/cron/runs/<jobId>.jsonl`（JSONL，自动修剪）。
- 覆盖存储路径：配置中的 `cron.store`。

## 配置

```json5
{
  cron: {
    enabled: true, // 默认 true
    store: "~/.clawdbot/cron/jobs.json",
    maxConcurrentRuns: 1 // 默认 1
  }
}
```

完全禁用 cron：
- `cron.enabled: false`（配置）
- `CLAWDBOT_SKIP_CRON=1`（环境变量）

## CLI 快速入门

一次性提醒（UTC ISO，成功后自动删除）：
```bash
moltbot cron add \
  --name "发送提醒" \
  --at "2026-01-12T18:00:00Z" \
  --session main \
  --system-event "提醒：提交费用报告。" \
  --wake now \
  --delete-after-run
```

一次性提醒（主会话，立即唤醒）：
```bash
moltbot cron add \
  --name "日历检查" \
  --at "20m" \
  --session main \
  --system-event "下次心跳：检查日历。" \
  --wake now
```

重复隔离作业（传递到 WhatsApp）：
```bash
moltbot cron add \
  --name "早晨状态" \
  --cron "0 7 * * *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "总结今天的收件箱 + 日历。" \
  --deliver \
  --channel whatsapp \
  --to "+15551234567"
```

重复隔离作业（传递到 Telegram 主题）：
```bash
moltbot cron add \
  --name "夜间摘要（主题）" \
  --cron "0 22 * * *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "总结今天；发送到夜间主题。" \
  --deliver \
  --channel telegram \
  --to "-1001234567890:topic:123"
```

具有模型和思考覆盖的隔离作业：
```bash
moltbot cron add \
  --name "深度分析" \
  --cron "0 6 * * 1" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "每周对项目进度进行深度分析。" \
  --model "opus" \
  --thinking high \
  --deliver \
  --channel whatsapp \
  --to "+15551234567"
```

代理选择（多代理设置）：
```bash
# 将作业固定到代理 "ops"（如果该代理缺失则回退到默认值）
moltbot cron add --name "Ops sweep" --cron "0 6 * * *" --session isolated --message "Check ops queue" --agent ops

# 在现有作业上切换或清除代理
moltbot cron edit <jobId> --agent ops
moltbot cron edit <jobId> --clear-agent
```

手动运行（调试）：
```bash
moltbot cron run <jobId> --force
```

编辑现有作业（修补字段）：
```bash
moltbot cron edit <jobId> \
  --message "更新提示" \
  --model "opus" \
  --thinking low
```

运行历史：
```bash
moltbot cron runs --id <jobId> --limit 50
```

无需创建作业即可立即系统事件：
```bash
moltbot system event --mode now --text "下次心跳：检查电池。"
```

## 网关 API 表面
- `cron.list`, `cron.status`, `cron.add`, `cron.update`, `cron.remove`
- `cron.run`（强制或到期），`cron.runs`
对于没有作业的立即系统事件，请使用 [`moltbot system event`](/cli/system)。

## 故障排除

### "什么都没运行"
- 检查 cron 是否已启用：`cron.enabled` 和 `CLAWDBOT_SKIP_CRON`。
- 检查网关是否持续运行（cron 在网关进程中运行）。
- 对于 `cron` 计划：确认时区（`--tz`）与主机时区。

### Telegram 发送到错误的位置
- 对于论坛主题，使用 `-100…:topic:<id>` 使其明确且无歧义。
- 如果您在日志或存储的"最后路由"目标中看到 `telegram:...` 前缀，这很正常；
  cron 传递接受它们并仍能正确解析主题 ID。