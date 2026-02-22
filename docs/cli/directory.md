---
summary: "`moltbot directory` 的 CLI 参考（自己，同伴，群组）"
read_when:
  - 您想查找频道的联系人/群组/自己的 ID
  - 您正在开发频道目录适配器
---

# `moltbot directory`

支持目录查询的频道（联系人/同伴，群组和"我"）。

## 常用标志
- `--channel <name>`: 频道 ID/别名（配置多个频道时必需；只配置一个时自动选择）
- `--account <id>`: 账户 ID（默认：频道默认值）
- `--json`: 输出 JSON

## 注意事项
- `directory` 旨在帮助您找到可以粘贴到其他命令中的 ID（特别是 `moltbot message send --target ...`）。
- 对于许多频道，结果是基于配置的（允许列表/配置的群组），而不是实时提供程序目录。
- 默认输出是用制表符分隔的 `id`（有时还有 `name`）；使用 `--json` 进行脚本编写。

## 与 `message send` 结合使用结果

```bash
moltbot directory peers list --channel slack --query "U0"
moltbot message send --channel slack --target user:U012ABCDEF --message "hello"
```

## ID 格式（按频道）

- WhatsApp: `+15551234567`（私信），`1234567890-1234567890@g.us`（群组）
- Telegram: `@username` 或数字聊天 ID；群组是数字 ID
- Slack: `user:U…` 和 `channel:C…`
- Discord: `user:<id>` 和 `channel:<id>`
- Matrix（插件）: `user:@user:server`，`room:!roomId:server`，或 `#alias:server`
- Microsoft Teams（插件）: `user:<id>` 和 `conversation:<id>`
- Zalo（插件）: 用户 ID（机器人 API）
- Zalo 个人 / `zalouser`（插件）: 来自 `zca`（`me`，`friend list`，`group list`）的线程 ID（私信/群组）

## 自己（"me"）

```bash
moltbot directory self --channel zalouser
```

## 同伴（联系人/用户）

```bash
moltbot directory peers list --channel zalouser
moltbot directory peers list --channel zalouser --query "name"
moltbot directory peers list --channel zalouser --limit 50
```

## 群组

```bash
moltbot directory groups list --channel zalouser
moltbot directory groups list --channel zalouser --query "work"
moltbot directory groups members --channel zalouser --group-id <id>
```
