---
summary: "代理、信封和提示的时区处理"
read_when:
  - 您需要了解时间戳如何为模型标准化时
  - 配置系统提示的用户时区时
---

# 时区

Moltbot 标准化时间戳，使模型看到一个 **单一时区参考时间**。

## 消息信封（默认为本地）

入站消息被包装在如下信封中：

```
[Provider ... 2026-01-05 16:26 PST] 消息文本
```

信封中的时间戳 **默认为主机本地**，精度为分钟。

您可以覆盖此设置：

```json5
{
  agents: {
    defaults: {
      envelopeTimezone: "local", // "utc" | "local" | "user" | IANA 时区
      envelopeTimestamp: "on", // "on" | "off"
      envelopeElapsed: "on" // "on" | "off"
    }
  }
}
```

- `envelopeTimezone: "utc"` 使用 UTC。
- `envelopeTimezone: "user"` 使用 `agents.defaults.userTimezone`（回退到主机时区）。
- 使用明确的 IANA 时区（例如，`"Europe/Vienna"`）以固定偏移。
- `envelopeTimestamp: "off"` 从信封头中移除绝对时间戳。
- `envelopeElapsed: "off"` 移除经过时间后缀（`+2m` 样式）。

### 示例

**本地（默认）：**

```
[Signal Alice +1555 2026-01-18 00:19 PST] hello
```

**固定时区：**

```
[Signal Alice +1555 2026-01-18 06:19 GMT+1] hello
```

**经过时间：**

```
[Signal Alice +1555 +2m 2026-01-18T05:19Z] follow-up
```

## 工具载荷（原始提供商数据 + 标准化字段）

工具调用（`channels.discord.readMessages`、`channels.slack.readMessages` 等）返回 **原始提供商时间戳**。
我们还附加标准化字段以保持一致性：

- `timestampMs`（UTC 纪元毫秒）
- `timestampUtc`（ISO 8601 UTC 字符串）

原始提供商字段保留。

## 系统提示的用户时区

设置 `agents.defaults.userTimezone` 以告知模型用户的本地时区。如果未设置，
Moltbot 解析 **运行时主机时区**（不写入配置）。

```json5
{
  agents: { defaults: { userTimezone: "America/Chicago" } }
}
```

系统提示包括：
- 带有本地时间和时区的 `Current Date & Time` 部分
- `Time format: 12-hour` 或 `24-hour`

您可以使用 `agents.defaults.timeFormat` 控制提示格式（`auto` | `12` | `24`）。

参见 [日期和时间](/date-time) 获取完整行为和示例。