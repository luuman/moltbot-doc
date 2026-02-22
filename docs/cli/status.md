---
summary: "`moltbot status` 的 CLI 参考（诊断、探测、使用情况快照）"
read_when:
  - 您想要快速诊断渠道健康状况 + 最近会话接收者
  - 您想要可粘贴的"全部"状态用于调试
---

# `moltbot status`

用于渠道和会话的诊断。

```bash
moltbot status
moltbot status --all
moltbot status --deep
moltbot status --usage
```

注意事项：
- `--deep` 运行实时探测（WhatsApp Web + Telegram + Discord + Google Chat + Slack + Signal）。
- 输出包含每个智能体的会话存储（当配置了多个智能体时）。
- 概览包括网关和节点主机服务安装/运行时状态（如果可用）。
- 概览包括更新渠道和 git SHA（用于源代码检出）。
- 更新信息显示在概览中；如果有更新可用，状态会打印提示运行 `moltbot update`（参见 [更新](/install/updating)）。
