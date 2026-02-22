---
summary: "`moltbot logs` 的 CLI 参考（通过 RPC 跟踪网关日志）"
read_when:
  - 您需要远程跟踪网关日志（无需 SSH）
  - 您想要用于工具的 JSON 日志行
---

# `moltbot logs`

通过 RPC 跟踪网关文件日志（在远程模式下工作）。

相关：
- 日志概述：[日志](/logging)

## 示例

```bash
moltbot logs
moltbot logs --follow
moltbot logs --json
moltbot logs --limit 500
```

