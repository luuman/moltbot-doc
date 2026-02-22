---
summary: "日志概述：文件日志、控制台输出、CLI 跟踪和控制界面"
read_when:
  - 您需要初学者友好的日志概述
  - 您想要配置日志级别或格式
  - 您正在排错并需要快速找到日志
---

# 日志记录

Moltbot 在两个地方记录日志：

- **文件日志**（JSON 行）由网关写入。
- **控制台输出** 显示在终端和控制界面中。

本页面解释日志的位置、如何阅读它们，以及如何配置日志级别和格式。

## 日志位置

默认情况下，网关会在以下位置写入滚动日志文件：

`/tmp/moltbot/moltbot-YYYY-MM-DD.log`

日期使用网关主机的本地时区。

您可以在 `~/.clawdbot/moltbot.json` 中覆盖此设置：

```json
{
  "logging": {
    "file": "/path/to/moltbot.log"
  }
}
```

## 如何阅读日志

### CLI：实时跟踪（推荐）

使用 CLI 通过 RPC 跟踪网关日志文件：

```bash
moltbot logs --follow
```

输出模式：

- **TTY 会话**：美观、彩色、结构化的日志行。
- **非 TTY 会话**：纯文本。
- `--json`：行分隔的 JSON（每行一个日志事件）。
- `--plain`：在 TTY 会话中强制纯文本。
- `--no-color`：禁用 ANSI 颜色。

在 JSON 模式下，CLI 发出 `type` 标记的对象：

- `meta`：流元数据（文件、光标、大小）
- `log`：解析的日志条目
- `notice`：截断/轮换提示
- `raw`：未解析的日志行

如果无法访问网关，CLI 会打印简短提示运行：

```bash
moltbot doctor
```

### 控制界面（web）

控制界面的 **日志** 选项卡使用 `logs.tail` 跟踪同一文件。
请参见 [/web/control-ui](/web/control-ui) 了解如何打开它。

### 仅通道日志

要过滤通道活动（WhatsApp/Telegram/等），请使用：

```bash
moltbot channels logs --channel whatsapp
```

## 日志格式

### 文件日志（JSONL）

日志文件中的每一行都是一个 JSON 对象。CLI 和控制界面解析这些
条目以渲染结构化输出（时间、级别、子系统、消息）。

### 控制台输出

控制台日志是 **TTY 感知** 的，并为可读性格式化：

- 子系统前缀（例如 `gateway/channels/whatsapp`）
- 级别着色（info/warn/error）
- 可选的紧凑或 JSON 模式

控制台格式由 `logging.consoleStyle` 控制。

## 配置日志记录

所有日志配置都位于 `~/.clawdbot/moltbot.json` 中的 `logging` 下。

```json
{
  "logging": {
    "level": "info",
    "file": "/tmp/moltbot/moltbot-YYYY-MM-DD.log",
    "consoleLevel": "info",
    "consoleStyle": "pretty",
    "redactSensitive": "tools",
    "redactPatterns": [
      "sk-.*"
    ]
  }
}
```

### 日志级别

- `logging.level`：**文件日志**（JSONL）级别。
- `logging.consoleLevel`：**控制台** 详细程度级别。

`--verbose` 只影响控制台输出；它不会改变文件日志级别。

### 控制台样式

`logging.consoleStyle`：

- `pretty`：人性化、彩色、带时间戳。
- `compact`：更紧凑的输出（最适合长时间会话）。
- `json`：每行 JSON（用于日志处理器）。

### 红action

工具摘要可以在进入控制台之前红action敏感令牌：

- `logging.redactSensitive`：`off` | `tools`（默认：`tools`）
- `logging.redactPatterns`：覆盖默认集的正则表达式字符串列表

红action仅影响 **控制台输出**，不会更改文件日志。

## 诊断 + OpenTelemetry

诊断是结构化、机器可读的事件，用于模型运行 **和**
消息流遥测（webhooks、队列、会话状态）。它们 **不**
替代日志；它们的存在是为了馈送指标、追踪和其他导出器。

诊断事件在进程中发出，但导出器只有在
启用诊断 + 导出器插件时才会附加。

### OpenTelemetry 与 OTLP

- **OpenTelemetry (OTel)**：数据模型 + 用于追踪、指标和日志的 SDK。
- **OTLP**：用于将 OTel 数据导出到收集器/后端的线协议。
- Moltbot 今天通过 **OTLP/HTTP (protobuf)** 导出。

### 导出信号

- **指标**：计数器 + 直方图（令牌使用情况、消息流、队列）。
- **追踪**：模型使用 + webhook/消息处理的跨度。
- **日志**：当启用 `diagnostics.otel.logs` 时通过 OTLP 导出。日志
  量可能很高；请记住 `logging.level` 和导出器过滤器。

### 诊断事件目录

模型使用：
- `model.usage`：令牌、成本、持续时间、上下文、提供者/模型/通道、会话 ID。

消息流：
- `webhook.received`：每个通道的 webhook 入站。
- `webhook.processed`：webhook 处理 + 持续时间。
- `webhook.error`：webhook 处理器错误。
- `message.queued`：消息排队等待处理。
- `message.processed`：结果 + 持续时间 + 可选错误。

队列 + 会话：
- `queue.lane.enqueue`：命令队列通道排队 + 深度。
- `queue.lane.dequeue`：命令队列通道出队 + 等待时间。
- `session.state`：会话状态转换 + 原因。
- `session.stuck`：会话卡住警告 + 年龄。
- `run.attempt`：运行重试/尝试元数据。
- `diagnostic.heartbeat`：聚合计数器（webhooks/queue/session）。

### 启用诊断（无导出器）

如果您希望诊断事件可供插件或自定义接收器使用，请使用此方法：

```json
{
  "diagnostics": {
    "enabled": true
  }
}
```

### 诊断标志（目标日志）

使用标志在不提高 `logging.level` 的情况下开启额外的目标调试日志。
标志不区分大小写并支持通配符（例如 `telegram.*` 或 `*`）。

```json
{
  "diagnostics": {
    "flags": ["telegram.http"]
  }
}
```

环境覆盖（一次性）：

```
CLAWDBOT_DIAGNOSTICS=telegram.http,telegram.payload
```

注意事项：
- 标志日志转到标准日志文件（与 `logging.file` 相同）。
- 输出仍根据 `logging.redactSensitive` 进行红action。
- 完整指南：[/diagnostics/flags](/diagnostics/flags)。

### 导出到 OpenTelemetry

诊断可以通过 `diagnostics-otel` 插件（OTLP/HTTP）导出。这
适用于接受 OTLP/HTTP 的任何 OpenTelemetry 收集器/后端。

```json
{
  "plugins": {
    "allow": ["diagnostics-otel"],
    "entries": {
      "diagnostics-otel": {
        "enabled": true
      }
    }
  },
  "diagnostics": {
    "enabled": true,
    "otel": {
      "enabled": true,
      "endpoint": "http://otel-collector:4318",
      "protocol": "http/protobuf",
      "serviceName": "moltbot-gateway",
      "traces": true,
      "metrics": true,
      "logs": true,
      "sampleRate": 0.2,
      "flushIntervalMs": 60000
    }
  }
}
```

注意事项：
- 您也可以使用 `moltbot plugins enable diagnostics-otel` 启用插件。
- `protocol` 当前仅支持 `http/protobuf`。`grpc` 被忽略。
- 指标包括令牌使用情况、成本、上下文大小、运行持续时间和消息流
  计数器/直方图（webhooks、队列、会话状态、队列深度/等待）。
- 追踪/指标可以用 `traces` / `metrics` 切换（默认：开启）。追踪
  包括模型使用跨度加上启用时的 webhook/消息处理跨度。
- 当您的收集器需要认证时设置 `headers`。
- 支持的环境变量：`OTEL_EXPORTER_OTLP_ENDPOINT`、
  `OTEL_SERVICE_NAME`、`OTEL_EXPORTER_OTLP_PROTOCOL`。

### 导出指标（名称 + 类型）

模型使用：
- `moltbot.tokens`（计数器，属性：`moltbot.token`、`moltbot.channel`、
  `moltbot.provider`、`moltbot.model`）
- `moltbot.cost.usd`（计数器，属性：`moltbot.channel`、`moltbot.provider`、
  `moltbot.model`）
- `moltbot.run.duration_ms`（直方图，属性：`moltbot.channel`、
  `moltbot.provider`、`moltbot.model`）
- `moltbot.context.tokens`（直方图，属性：`moltbot.context`、
  `moltbot.channel`、`moltbot.provider`、`moltbot.model`）

消息流：
- `moltbot.webhook.received`（计数器，属性：`moltbot.channel`、
  `moltbot.webhook`）
- `moltbot.webhook.error`（计数器，属性：`moltbot.channel`、
  `moltbot.webhook`）
- `moltbot.webhook.duration_ms`（直方图，属性：`moltbot.channel`、
  `moltbot.webhook`）
- `moltbot.message.queued`（计数器，属性：`moltbot.channel`、
  `moltbot.source`）
- `moltbot.message.processed`（计数器，属性：`moltbot.channel`、
  `moltbot.outcome`）
- `moltbot.message.duration_ms`（直方图，属性：`moltbot.channel`、
  `moltbot.outcome`）

队列 + 会话：
- `moltbot.queue.lane.enqueue`（计数器，属性：`moltbot.lane`）
- `moltbot.queue.lane.dequeue`（计数器，属性：`moltbot.lane`）
- `moltbot.queue.depth`（直方图，属性：`moltbot.lane` 或
  `moltbot.channel=heartbeat`）
- `moltbot.queue.wait_ms`（直方图，属性：`moltbot.lane`）
- `moltbot.session.state`（计数器，属性：`moltbot.state`、`moltbot.reason`）
- `moltbot.session.stuck`（计数器，属性：`moltbot.state`）
- `moltbot.session.stuck_age_ms`（直方图，属性：`moltbot.state`）
- `moltbot.run.attempt`（计数器，属性：`moltbot.attempt`）

### 导出跨度（名称 + 关键属性）

- `moltbot.model.usage`
  - `moltbot.channel`、`moltbot.provider`、`moltbot.model`
  - `moltbot.sessionKey`、`moltbot.sessionId`
  - `moltbot.tokens.*`（输入/输出/cache_read/cache_write/总计）
- `moltbot.webhook.processed`
  - `moltbot.channel`、`moltbot.webhook`、`moltbot.chatId`
- `moltbot.webhook.error`
  - `moltbot.channel`、`moltbot.webhook`、`moltbot.chatId`、
    `moltbot.error`
- `moltbot.message.processed`
  - `moltbot.channel`、`moltbot.outcome`、`moltbot.chatId`、
    `moltbot.messageId`、`moltbot.sessionKey`、`moltbot.sessionId`、
    `moltbot.reason`
- `moltbot.session.stuck`
  - `moltbot.state`、`moltbot.ageMs`、`moltbot.queueDepth`、
    `moltbot.sessionKey`、`moltbot.sessionId`

### 采样 + 刷新

- 追踪采样：`diagnostics.otel.sampleRate`（0.0–1.0，仅根跨度）。
- 指标导出间隔：`diagnostics.otel.flushIntervalMs`（最小 1000ms）。

### 协议说明

- OTLP/HTTP 端点可以通过 `diagnostics.otel.endpoint` 或
  `OTEL_EXPORTER_OTLP_ENDPOINT` 设置。
- 如果端点已包含 `/v1/traces` 或 `/v1/metrics`，则按原样使用。
- 如果端点已包含 `/v1/logs`，则按原样用于日志。
- `diagnostics.otel.logs` 为主要记录器输出启用 OTLP 日志导出。

### 日志导出行为

- OTLP 日志使用写入 `logging.file` 的相同结构化记录。
- 遵守 `logging.level`（文件日志级别）。控制台红action **不** 适用于
  OTLP 日志。
- 高容量安装应首选 OTLP 收集器采样/过滤。

## 故障排除技巧

- **无法访问网关？** 首先运行 `moltbot doctor`。
- **日志为空？** 检查网关是否正在运行并向 `logging.file` 中的文件路径
  写入。
- **需要更多细节？** 将 `logging.level` 设置为 `debug` 或 `trace` 并重试。