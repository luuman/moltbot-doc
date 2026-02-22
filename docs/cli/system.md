---
summary: "`moltbot system` 的 CLI 参考（系统事件，心跳，存在）"
read_when:
  - 您想在不创建定时任务的情况下加入队列系统事件
  - 您需要启用或禁用心跳
  - 您想检查系统存在条目
---

# `moltbot system`

网关的系统级助手：将系统事件加入队列，控制心跳，
和查看存在状态。

## 常用命令

```bash
moltbot system event --text "检查紧急跟进事项" --mode now
moltbot system heartbeat enable
moltbot system heartbeat last
moltbot system presence
```

## `system event`

在**主**会话上将系统事件加入队列。下一个心跳将把它
作为 `System:` 行注入到提示中。使用 `--mode now` 立即触发心跳；
`next-heartbeat` 等待下一次预定的滴答。

标志：
- `--text <text>`: 必需的系统事件文本。
- `--mode <mode>`: `now` 或 `next-heartbeat`（默认）。
- `--json`: 机器可读输出。

## `system heartbeat last|enable|disable`

心跳控制：
- `last`: 显示最后一次心跳事件。
- `enable`: 重新开启心跳（如果它们被禁用，请使用此选项）。
- `disable`: 暂停心跳。

标志：
- `--json`: 机器可读输出。

## `system presence`

列出网关已知的当前系统存在条目（节点，
实例和类似的状​​态行）。

标志：
- `--json`: 机器可读输出。

## 注意事项

- 需要一个可通过您当前配置访问的运行网关（本地或远程）。
- 系统事件是临时的，不会在重启后保留。