---
summary: "`moltbot dns` 的 CLI 参考（广域发现辅助工具）"
read_when:
  - 您想通过 Tailscale + CoreDNS 进行广域发现（DNS-SD）
  - 您正在为 moltbot.internal 设置拆分 DNS
---

# `moltbot dns`

用于广域发现（Tailscale + CoreDNS）的 DNS 辅助工具。目前专注于 macOS + Homebrew CoreDNS。

相关：
- 网关发现：[发现](/gateway/discovery)
- 广域发现配置：[配置](/gateway/configuration)

## 设置

```bash
moltbot dns setup
moltbot dns setup --apply
```

