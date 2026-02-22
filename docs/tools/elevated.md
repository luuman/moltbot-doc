---
summary: "提升的执行模式和 /elevated 指令"
read_when:
  - 调整提升模式默认值、允许列表或斜杠命令行为
---
# 提升模式（/elevated 指令）

## 功能
- `/elevated on` 在网关主机上运行并保留执行审批（与 `/elevated ask` 相同）。
- `/elevated full` 在网关主机上运行 **并** 自动批准执行（跳过执行审批）。
- `/elevated ask` 在网关主机上运行但保留执行审批（与 `/elevated on` 相同）。
- `on`/`ask` 不强制 `exec.security=full`；配置的安全性/询问策略仍然适用。
- 仅当代理是 **沙盒化** 时才改变行为（否则执行已经在主机上运行）。
- 指令形式：`/elevated on|off|ask|full`，`/elev on|off|ask|full`。
- 仅接受 `on|off|ask|full`；其他任何内容都会返回提示且不改变状态。

## 控制什么（以及不控制什么）
- **可用性门控**：`tools.elevated` 是全局基线。`agents.list[].tools.elevated` 可以进一步限制每个代理的提升（两者都必须允许）。
- **每会话状态**：`/elevated on|off|ask|full` 为当前会话键设置提升级别。
- **内联指令**：消息内的 `/elevated on|ask|full` 仅适用于该消息。
- **群组**：在群聊中，仅当提到代理时才接受提升指令。绕过提及要求的仅命令消息被视为已提及。
- **主机执行**：提升强制 `exec` 在网关主机上；`full` 还设置 `security=full`。
- **审批**：`full` 跳过执行审批；`on`/`ask` 在允许列表/询问规则要求时遵守它们。
- **未沙盒化代理**：对位置来说是无操作；仅影响门控、日志记录和状态。
- **工具策略仍然适用**：如果工具策略拒绝了 `exec`，则无法使用提升。
- **与 `/exec` 分离**：`/exec` 调整授权发送者的每会话默认值，不需要提升。

## 解析顺序
1. 消息上的内联指令（仅适用于该消息）。
2. 会话覆盖（通过发送仅指令消息设置）。
3. 全局默认值（配置中的 `agents.defaults.elevatedDefault`）。

## 设置会话默认值
- 发送 **仅** 指令的消息（允许空白字符），例如 `/elevated full`。
- 发送确认回复（`提升模式设置为 full...` / `提升模式已禁用。`）。
- 如果提升访问被禁用或发送者不在批准的允许列表中，指令回复可操作错误且不改变会话状态。
- 发送 `/elevated`（或 `/elevated:`）且无参数以查看当前提升级别。

## 可用性 + 允许列表
- 功能门控：`tools.elevated.enabled`（默认可以通过配置关闭，即使代码支持）。
- 发送者允许列表：`tools.elevated.allowFrom` 带有每个提供者的允许列表（例如 `discord`，`whatsapp`）。
- 每代理门控：`agents.list[].tools.elevated.enabled`（可选；只能进一步限制）。
- 每代理允许列表：`agents.list[].tools.elevated.allowFrom`（可选；设置时，发送者必须匹配 **两者** 全局 + 每代理允许列表）。
- Discord 回退：如果省略了 `tools.elevated.allowFrom.discord`，则使用 `channels.discord.dm.allowFrom` 列表作为回退。设置 `tools.elevated.allowFrom.discord`（即使是 `[]`）以覆盖。每代理允许列表 **不** 使用回退。
- 所有门控都必须通过；否则提升被视为不可用。

## 日志记录 + 状态
- 提升的执行调用在信息级别记录。
- 会话状态包括提升模式（例如 `elevated=ask`，`elevated=full`）。