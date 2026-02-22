---
summary: "`moltbot channels` 的 CLI 参考（账户、状态、登录/注销、日志）"
read_when:
  - 您想要添加/删除频道账户（WhatsApp/Telegram/Discord/Google Chat/Slack/Mattermost（插件）/Signal/iMessage）
  - 您想要检查频道状态或跟踪频道日志
---

# `moltbot channels`

管理网关上的聊天频道账户及其运行时状态。

相关文档：
- 频道指南：[频道](/channels/index)
- 网关配置：[配置](/gateway/configuration)

## 常用命令

```bash
moltbot channels list
moltbot channels status
moltbot channels capabilities
moltbot channels capabilities --channel discord --target channel:123
moltbot channels resolve --channel slack "#general" "@jane"
moltbot channels logs --channel all
```

## 添加 / 删除账户

```bash
moltbot channels add --channel telegram --token <bot-token>
moltbot channels remove --channel telegram --delete
```

提示：`moltbot channels add --help` 显示每个频道的标志（令牌、应用令牌、signal-cli 路径等）。

## 登录 / 注销（交互式）

```bash
moltbot channels login --channel whatsapp
moltbot channels logout --channel whatsapp
```

## 故障排除

- 运行 `moltbot status --deep` 进行广泛探测。
- 使用 `moltbot doctor` 进行引导修复。
- `moltbot channels list` 打印 `Claude: HTTP 403 ... user:profile` → 使用情况快照需要 `user:profile` 作用域。使用 `--no-usage`，或提供 claude.ai 会话密钥（`CLAUDE_WEB_SESSION_KEY` / `CLAUDE_WEB_COOKIE`），或通过 Claude Code CLI 重新认证。

## 功能探测

获取提供程序功能提示（可用时的意图/作用域）加上静态功能支持：

```bash
moltbot channels capabilities
moltbot channels capabilities --channel discord --target channel:123
```

注意事项：
- `--channel` 是可选的；省略它以列出每个频道（包括扩展）。
- `--target` 接受 `channel:<id>` 或原始数字频道 ID，仅适用于 Discord。
- 探测是提供程序特定的：Discord 意图 + 可选频道权限；Slack 机器人 + 用户作用域；Telegram 机器人标志 + webhook；Signal 守护进程版本；MS Teams 应用令牌 + Graph 角色/作用域（已知处标注）。没有探测的频道报告 `Probe: unavailable`。

## 将名称解析为 ID

使用提供程序目录将频道/用户名称解析为 ID：

```bash
moltbot channels resolve --channel slack "#general" "@jane"
moltbot channels resolve --channel discord "My Server/#support" "@someone"
moltbot channels resolve --channel matrix "Project Room"
```

注意事项：
- 使用 `--kind user|group|auto` 强制目标类型。
- 当多个条目共享相同名称时，解析优先考虑活跃匹配。
