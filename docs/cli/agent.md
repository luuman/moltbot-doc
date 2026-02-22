---
summary: "`moltbot agent` 的 CLI 参考（通过网关发送一个智能体回合）"
read_when:
  - 您想从脚本运行一个智能体回合（可选地传递回复）
---

# `moltbot agent`

通过网关运行一个智能体回合（嵌入式使用 `--local`）。
使用 `--agent <id>` 直接定位配置的智能体。

相关：
- 智能体发送工具：[智能体发送](/tools/agent-send)

## 示例

```bash
moltbot agent --to +15555550123 --message "状态更新" --deliver
moltbot agent --agent ops --message "汇总日志"
moltbot agent --session-id 1234 --message "汇总收件箱" --thinking medium
moltbot agent --agent ops --message "生成报告" --deliver --reply-channel slack --reply-to "#reports"
```

## 翻译说明

此文档已翻译为中文，保留了原有的技术术语和命令格式。
