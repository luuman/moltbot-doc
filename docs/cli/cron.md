---
summary: "`moltbot cron` 的 CLI 参考（安排和运行后台作业）"
read_when:
  - 您想要计划的作业和唤醒
  - 您正在调试 cron 执行和日志
---

# `moltbot cron`

管理网关调度器的 cron 作业。

相关：
- 定时作业：[Cron 作业](/automation/cron-jobs)

提示：运行 `moltbot cron --help` 以获取完整的命令界面。

## 常用编辑

在不更改消息的情况下更新交付设置：

```bash
moltbot cron edit <job-id> --deliver --channel telegram --to "123456789"
```

为隔离作业禁用交付：

```bash
moltbot cron edit <job-id> --no-deliver
```