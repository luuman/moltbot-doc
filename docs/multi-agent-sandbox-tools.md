---
summary: "每个代理沙盒 + 工具限制、优先级和示例"
title: 多代理沙盒和工具
read_when: "您想要在多代理网关中使用每个代理沙盒或每个代理工具允许/拒绝策略。"
status: active
---

# 多代理沙盒和工具配置

## 概述

多代理设置中的每个代理现在可以有自己的：
- **沙盒配置**（`agents.list[].sandbox` 覆盖 `agents.defaults.sandbox`）
- **工具限制**（`tools.allow` / `tools.deny`，加上 `agents.list[].tools`）

这允许您运行具有不同安全配置的多个代理：
- 具有完全访问权限的个人助手
- 工具受限的家庭/工作代理
- 沙盒中的面向公众的代理

`setupCommand` 属于 `sandbox.docker` 下（全局或每个代理）并在容器创建时运行一次。

认证是按代理的：每个代理从其自己的 `agentDir` 认证存储中读取：

```
~/.clawdbot/agents/<agentId>/agent/auth-profiles.json
```

凭证 **不** 在代理之间共享。切勿在代理间重用 `agentDir`。
如果您想共享凭据，请将 `auth-profiles.json` 复制到另一个代理的 `agentDir` 中。

有关沙盒在运行时的行为方式，请参见 [沙盒](/gateway/sandboxing)。
有关调试"为什么被阻止？"，请参见 [沙盒 vs 工具策略 vs 提权](/gateway/sandbox-vs-tool-policy-vs-elevated) 和 `moltbot sandbox explain`。

---

## 配置示例

### 示例 1：个人 + 受限家庭代理

```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "default": true,
        "name": "个人助手",
        "workspace": "~/clawd",
        "sandbox": { "mode": "off" }
      },
      {
        "id": "family",
        "name": "家庭机器人",
        "workspace": "~/clawd-family",
        "sandbox": {
          "mode": "all",
          "scope": "agent"
        },
        "tools": {
          "allow": ["read"],
          "deny": ["exec", "write", "edit", "apply_patch", "process", "browser"]
        }
      }
    ]
  },
  "bindings": [
    {
      "agentId": "family",
      "match": {
        "provider": "whatsapp",
        "accountId": "*",
        "peer": {
          "kind": "group",
          "id": "120363424282127706@g.us"
        }
      }
    }
  ]
}
```

**结果：**
- `main` 代理：在主机上运行，完全工具访问
- `family` 代理：在 Docker 中运行（每个代理一个容器），仅 `read` 工具

---

### 示例 2：具有共享沙盒的工作代理

```json
{
  "agents": {
    "list": [
      {
        "id": "personal",
        "workspace": "~/clawd-personal",
        "sandbox": { "mode": "off" }
      },
      {
        "id": "work",
        "workspace": "~/clawd-work",
        "sandbox": {
          "mode": "all",
          "scope": "shared",
          "workspaceRoot": "/tmp/work-sandboxes"
        },
        "tools": {
          "allow": ["read", "write", "apply_patch", "exec"],
          "deny": ["browser", "gateway", "discord"]
        }
      }
    ]
  }
}
```

---

### 示例 2b：全局编码配置文件 + 仅消息代理

```json
{
  "tools": { "profile": "coding" },
  "agents": {
    "list": [
      {
        "id": "support",
        "tools": { "profile": "messaging", "allow": ["slack"] }
      }
    ]
  }
}
```

**结果：**
- 默认代理获得编码工具
- `support` 代理仅用于消息传递（+ Slack 工具）

---

### 示例 3：每个代理的不同沙盒模式

```json
{
  "agents": {
    "defaults": {
      "sandbox": {
        "mode": "non-main",  // 全局默认
        "scope": "session"
      }
    },
    "list": [
      {
        "id": "main",
        "workspace": "~/clawd",
        "sandbox": {
          "mode": "off"  // 覆盖：主代理从不沙盒化
        }
      },
      {
        "id": "public",
        "workspace": "~/clawd-public",
        "sandbox": {
          "mode": "all",  // 覆盖：公共代理总是沙盒化
          "scope": "agent"
        },
        "tools": {
          "allow": ["read"],
          "deny": ["exec", "write", "edit", "apply_patch"]
        }
      }
    ]
  }
}
```

---

## 配置优先级

当同时存在全局（`agents.defaults.*`）和代理特定（`agents.list[].*`）配置时：

### 沙盒配置
代理特定设置覆盖全局：
```
agents.list[].sandbox.mode > agents.defaults.sandbox.mode
agents.list[].sandbox.scope > agents.defaults.sandbox.scope
agents.list[].sandbox.workspaceRoot > agents.defaults.sandbox.workspaceRoot
agents.list[].sandbox.workspaceAccess > agents.defaults.sandbox.workspaceAccess
agents.list[].sandbox.docker.* > agents.defaults.sandbox.docker.*
agents.list[].sandbox.browser.* > agents.defaults.sandbox.browser.*
agents.list[].sandbox.prune.* > agents.defaults.sandbox.prune.*
```

**注意事项：**
- `agents.list[].sandbox.{docker,browser,prune}.*` 覆盖该代理的 `agents.defaults.sandbox.{docker,browser,prune}.*`（当沙盒范围解析为 `"shared"` 时被忽略）。

### 工具限制
过滤顺序为：
1. **工具配置文件**（`tools.profile` 或 `agents.list[].tools.profile`）
2. **提供者工具配置文件**（`tools.byProvider[provider].profile` 或 `agents.list[].tools.byProvider[provider].profile`）
3. **全局工具策略**（`tools.allow` / `tools.deny`）
4. **提供者工具策略**（`tools.byProvider[provider].allow/deny`）
5. **代理特定工具策略**（`agents.list[].tools.allow/deny`）
6. **代理提供者策略**（`agents.list[].tools.byProvider[provider].allow/deny`）
7. **沙盒工具策略**（`tools.sandbox.tools` 或 `agents.list[].tools.sandbox.tools`）
8. **子代理工具策略**（`tools.subagents.tools`，如适用）

每个级别都可以进一步限制工具，但不能授予早先级别拒绝的工具。
如果设置了 `agents.list[].tools.sandbox.tools`，它将替换该代理的 `tools.sandbox.tools`。
如果设置了 `agents.list[].tools.profile`，它将覆盖该代理的 `tools.profile`。
提供者工具键接受 `provider`（例如 `google-antigravity`）或 `provider/model`（例如 `openai/gpt-5.2`）。

### 工具组（简写）

工具策略（全局、代理、沙盒）支持 `group:*` 条目，扩展为多个具体工具：

- `group:runtime`: `exec`, `bash`, `process`
- `group:fs`: `read`, `write`, `edit`, `apply_patch`
- `group:sessions`: `sessions_list`, `sessions_history`, `sessions_send`, `sessions_spawn`, `session_status`
- `group:memory`: `memory_search`, `memory_get`
- `group:ui`: `browser`, `canvas`
- `group:automation`: `cron`, `gateway`
- `group:messaging`: `message`
- `group:nodes`: `nodes`
- `group:moltbot`: 所有内置 Moltbot 工具（不包括提供者插件）

### 提权模式
`tools.elevated` 是全局基线（基于发送者的白名单）。`agents.list[].tools.elevated` 可以进一步限制特定代理的提权（两者都必须允许）。

缓解模式：
- 对不受信任的代理拒绝 `exec`（`agents.list[].tools.deny: ["exec"]`）
- 避免将路由到受限代理的发送者列入白名单
- 如果您只想要沙盒执行，请全局禁用提权（`tools.elevated.enabled: false`）
- 对于敏感配置文件，请按代理禁用提权（`agents.list[].tools.elevated.enabled: false`）

---

## 从单代理迁移

**之前（单代理）：**
```json
{
  "agents": {
    "defaults": {
      "workspace": "~/clawd",
      "sandbox": {
        "mode": "non-main"
      }
    }
  },
  "tools": {
    "sandbox": {
      "tools": {
        "allow": ["read", "write", "apply_patch", "exec"],
        "deny": []
      }
    }
  }
}
```

**之后（具有不同配置文件的多代理）：**
```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "default": true,
        "workspace": "~/clawd",
        "sandbox": { "mode": "off" }
      }
    ]
  }
}
```

遗留的 `agent.*` 配置由 `moltbot doctor` 迁移；向前发展请优先使用 `agents.defaults` + `agents.list`。

---

## 工具限制示例

### 只读代理
```json
{
  "tools": {
    "allow": ["read"],
    "deny": ["exec", "write", "edit", "apply_patch", "process"]
  }
}
```

### 安全执行代理（无文件修改）
```json
{
  "tools": {
    "allow": ["read", "exec", "process"],
    "deny": ["write", "edit", "apply_patch", "browser", "gateway"]
  }
}
```

### 仅通信代理
```json
{
  "tools": {
    "allow": ["sessions_list", "sessions_send", "sessions_history", "session_status"],
    "deny": ["exec", "write", "edit", "apply_patch", "read", "browser"]
  }
}
```

---

## 常见陷阱："non-main"

`agents.defaults.sandbox.mode: "non-main"` 基于 `session.mainKey`（默认为 `"main"`），
而不是代理 ID。群组/频道会话总是获得自己的密钥，所以它们
被视为非主会话并会被沙盒化。如果您希望代理从不
沙盒化，请设置 `agents.list[].sandbox.mode: "off"`。

---

## 测试

配置多代理沙盒和工具后：

1. **检查代理解析：**
   ```exec
   moltbot agents list --bindings
   ```

2. **验证沙盒容器：**
   ```exec
   docker ps --filter "label=moltbot.sandbox=1"
   ```

3. **测试工具限制：**
   - 发送需要受限工具的消息
   - 验证代理无法使用被拒绝的工具

4. **监控日志：**
   ```exec
   tail -f "${CLAWDBOT_STATE_DIR:-$HOME/.clawdbot}/logs/gateway.log" | grep -E "routing|sandbox|tools"
   ```

---

## 故障排除

### 代理未沙盒化尽管设置了 `mode: "all"`
- 检查是否存在覆盖它的全局 `agents.defaults.sandbox.mode`
- 代理特定配置优先，因此设置 `agents.list[].sandbox.mode: "all"`

### 工具仍在拒绝列表中可用
- 检查工具过滤顺序：全局 → 代理 → 沙盒 → 子代理
- 每个级别只能进一步限制，不能授予
- 通过日志验证：`[tools] filtering tools for agent:${agentId}`

### 容器未按代理隔离
- 在代理特定沙盒配置中设置 `scope: "agent"`
- 默认为 `"session"`，为每个会话创建一个容器

---

## 参见

- [多代理路由](/concepts/multi-agent)
- [沙盒配置](/gateway/configuration#agentsdefaults-sandbox)
- [会话管理](/concepts/session)