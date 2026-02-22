---
summary: "处理信封、提示、工具和连接器中的日期和时间"
read_when:
  - 您正在更改时间戳向模型或用户显示的方式
  - 您正在调试消息或系统提示输出中的时间格式
---

# 日期和时间

Moltbot 默认使用 **本地主机时间作为传输时间戳** 和 **仅在系统提示中的用户时区**。
保留提供者时间戳以便工具保持其本机语义（可通过 `session_status` 获取当前时间）。

## 消息信封（默认为本地时间）

传入消息被包装了一个时间戳（分钟精度）：

```
[Provider ... 2026-01-05 16:26 PST] 消息文本
```

此信封时间戳默认为 **主机本地时间**，无论提供者时区如何。

您可以覆盖此行为：

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
- `envelopeTimezone: "local"` 使用主机时区。
- `envelopeTimezone: "user"` 使用 `agents.defaults.userTimezone`（回退到主机时区）。
- 使用明确的 IANA 时区（例如 `"America/Chicago"`）以固定某个区域。
- `envelopeTimestamp: "off"` 从信封头移除绝对时间戳。
- `envelopeElapsed: "off"` 移除经过时间后缀（如 `+2m` 样式）。

### 示例

**本地时间（默认）：**

```
[WhatsApp +1555 2026-01-18 00:19 PST] hello
```

**用户时区：**

```
[WhatsApp +1555 2026-01-18 00:19 CST] hello
```

**启用经过时间：**

```
[WhatsApp +1555 +30s 2026-01-18T05:19Z] follow-up
```

## 系统提示：当前日期和时间

如果已知用户时区，系统提示会包含一个专门的
**当前日期和时间** 部分，其中只有 **时区**（无时钟/时间格式）
以保持提示缓存稳定：

```
Time zone: America/Chicago
```

当代理需要当前时间时，请使用 `session_status` 工具；状态卡
包含时间戳行。

## 系统事件行（默认为本地时间）

插入代理上下文的排队系统事件以前缀时间戳开头，使用与
消息信封相同的时区选择（默认：主机本地时间）。

```
System: [2026-01-12 12:19:17 PST] 模型已切换。
```

### 配置用户时区 + 格式

```json5
{
  agents: {
    defaults: {
      userTimezone: "America/Chicago",
      timeFormat: "auto" // auto | 12 | 24
    }
  }
}
```

- `userTimezone` 设置提示上下文的 **用户本地时区**。
- `timeFormat` 控制提示中的 **12小时/24小时显示**。`auto` 遵循操作系统首选项。

## 时间格式检测（自动）

当 `timeFormat: "auto"` 时，Moltbot 检查操作系统首选项（macOS/Windows）
并回退到区域格式。检测到的值按进程 **缓存**
以避免重复的系统调用。

## 工具负载 + 连接器（原始提供者时间 + 标准化字段）

通道工具返回 **提供者原生时间戳** 并添加标准化字段以确保一致性：

- `timestampMs`：纪元毫秒（UTC）
- `timestampUtc`：ISO 8601 UTC 字符串

保留原始提供者字段以免丢失任何信息。

- Slack：来自 API 的类似纪元字符串
- Discord：UTC ISO 时间戳
- Telegram/WhatsApp：提供者特定的数字/ISO 时间戳

如果需要本地时间，请使用已知时区在下游转换。

## 相关文档

- [系统提示](/concepts/system-prompt)
- [时区](/concepts/timezone)
- [消息](/concepts/messages)