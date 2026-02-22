---
summary: "CLI reference for `moltbot agents` (list/add/delete/set identity)"
read_when:
  - You want multiple isolated agents (workspaces + routing + auth)
---

# `moltbot agents`

管理隔离的智能体（工作空间 + 认证 + 路由）。

Related:
- Multi-agent routing: [Multi-Agent Routing](/concepts/multi-agent)
- Agent workspace: [Agent workspace](/concepts/agent-workspace)

## Examples

```bash
moltbot agents list
moltbot agents add work --workspace ~/clawd-work
moltbot agents set-identity --workspace ~/clawd --from-identity
moltbot agents set-identity --agent main --avatar avatars/clawd.png
moltbot agents delete work
```

## Identity files

每个智能体工作空间可以在工作空间根目录包含一个 `IDENTITY.md`：
- 示例路径：`~/clawd/IDENTITY.md`
- `set-identity --from-identity` 从工作空间根目录读取（或显式的 `--identity-file`）

头像路径相对于工作空间根目录解析。

## 设置身份

`set-identity` 将字段写入 `agents.list[].identity`：
- `name`
- `theme`
- `emoji`
- `avatar`（工作空间相对路径，http(s) URL 或 data URI）

从 `IDENTITY.md` 加载：

```bash
moltbot agents set-identity --workspace ~/clawd --from-identity
```

显式覆盖字段：

```bash
moltbot agents set-identity --agent main --name "Clawd" --emoji "🦞" --avatar avatars/clawd.png
```

配置示例：

```json5
{
  agents: {
    list: [
      {
        id: "main",
        identity: {
          name: "Clawd",
          theme: "space lobster",
          emoji: "🦞",
          avatar: "avatars/clawd.png"
        }
      }
    ]
  }
}
```
