---
summary: "`moltbot doctor` 的 CLI 参考（健康检查 + 引导修复）"
read_when:
  - 您遇到连接/认证问题并希望得到引导修复
  - 您进行了更新并希望进行完整性检查
---

# `moltbot doctor`

网关和频道的健康检查 + 快速修复。

相关：
- 故障排除：[故障排除](/gateway/troubleshooting)
- 安全审计：[安全](/gateway/security)

## 示例

```bash
moltbot doctor
moltbot doctor --repair
moltbot doctor --deep
```

注意事项：
- 交互式提示（如钥匙串/OAuth 修复）仅在 stdin 是 TTY 且未设置 `--non-interactive` 时运行。无头运行（cron、Telegram、无终端）将跳过提示。
- `--fix`（`--repair` 的别名）将备份写入 `~/.clawdbot/moltbot.json.bak` 并删除未知配置键，列出每个删除项。

## macOS：`launchctl` 环境变量覆盖

如果您之前运行了 `launchctl setenv CLAWDBOT_GATEWAY_TOKEN ...`（或 `...PASSWORD`），该值会覆盖您的配置文件并可能导致持续的"未授权"错误。

```bash
launchctl getenv CLAWDBOT_GATEWAY_TOKEN
launchctl getenv CLAWDBOT_GATEWAY_PASSWORD

launchctl unsetenv CLAWDBOT_GATEWAY_TOKEN
launchctl unsetenv CLAWDBOT_GATEWAY_PASSWORD
```
