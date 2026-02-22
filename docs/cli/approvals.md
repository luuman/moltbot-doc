---
summary: "`moltbot approvals` 的 CLI 参考（网关或节点主机的 exec 批准）"
read_when:
  - 您想从 CLI 编辑 exec 批准
  - 您需要管理网关或节点主机上的允许列表
---

# `moltbot approvals`

管理**本地主机**、**网关主机**或**节点主机**的 exec 批准。
默认情况下，命令针对磁盘上的本地批准文件。使用 `--gateway` 针对网关，或使用 `--node` 针对特定节点。

相关：
- Exec 批准：[Exec 批准](/tools/exec-approvals)
- 节点：[节点](/nodes)

## 常用命令

```bash
moltbot approvals get
moltbot approvals get --node <id|name|ip>
moltbot approvals get --gateway
```

## 从文件替换批准

```bash
moltbot approvals set --file ./exec-approvals.json
moltbot approvals set --node <id|name|ip> --file ./exec-approvals.json
moltbot approvals set --gateway --file ./exec-approvals.json
```

## 允许列表助手

```bash
moltbot approvals allowlist add "~/Projects/**/bin/rg"
moltbot approvals allowlist add --agent main --node <id|name|ip> "/usr/bin/uptime"
moltbot approvals allowlist add --agent "*" "/usr/bin/uname"

moltbot approvals allowlist remove "~/Projects/**/bin/rg"
```

## 注意事项

- `--node` 使用与 `moltbot nodes` 相同的解析器（id、name、ip 或 id 前缀）。
- `--agent` 默认为 `"*"`，应用于所有智能体。
- 节点主机必须宣传 `system.execApprovals.get/set`（macOS 应用或无头节点主机）。
- 批准文件按主机存储在 `~/.clawdbot/exec-approvals.json`。
