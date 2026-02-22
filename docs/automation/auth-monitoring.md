---
summary: "监控模型提供商的 OAuth 过期情况"
read_when:
  - 设置身份验证过期监控或警报
  - 自动化 Claude Code / Codex OAuth 刷新检查
---
# 身份验证监控

Moltbot 通过 `moltbot models status` 暴露 OAuth 过期健康状况。用于
自动化和警报；脚本是电话工作流程的可选附加组件。

## 首选：CLI 检查（便携式）

```bash
moltbot models status --check
```

退出代码：
- `0`: 正常
- `1`: 凭据过期或缺失
- `2`: 即将过期（24 小时内）

这在 cron/systemd 中工作，不需要额外的脚本。

## 可选脚本（运维/电话工作流程）

这些位于 `scripts/` 下，是 **可选的**。它们假定对
网关主机的 SSH 访问，并针对 systemd + Termux 进行调整。

- `scripts/claude-auth-status.sh` 现在使用 `moltbot models status --json` 作为
  权威数据源（如果 CLI 不可用，则回退到直接文件读取），
  因此将 `moltbot` 保留在 `PATH` 上以用于定时器。
- `scripts/auth-monitor.sh`: cron/systemd 定时器目标；发送警报（ntfy 或电话）。
- `scripts/systemd/moltbot-auth-monitor.{service,timer}`: systemd 用户定时器。
- `scripts/claude-auth-status.sh`: Claude Code + Moltbot 身份验证检查器（完整/json/简单）。
- `scripts/mobile-reauth.sh`: 通过 SSH 引导重新身份验证流程。
- `scripts/termux-quick-auth.sh`: 一键小部件状态 + 打开身份验证 URL。
- `scripts/termux-auth-widget.sh`: 完整引导的小部件流程。
- `scripts/termux-sync-widget.sh`: 同步 Claude Code 凭据 → Moltbot。

如果您不需要电话自动化或 systemd 定时器，请跳过这些脚本。