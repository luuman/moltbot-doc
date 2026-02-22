---
summary: "多代理路由：隔离代理、通道账户和绑定"
title: 多代理路由
read_when: "您希望在一个网关进程中使用多个隔离代理（工作区 + 认证）时。"
status: active
---

# 多代理路由

目标：多个 *隔离* 代理（单独的工作区 + `agentDir` + 会话），以及一个运行网关中的多个通道账户（例如两个 WhatsApp）。入站通过绑定路由到代理。

## 什么是"一个代理"？

一个 **代理** 是一个完全作用域的大脑，拥有自己的：

- **工作区**（文件、AGENTS.md/SOUL.md/USER.md、本地注释、个性规则）。
- **状态目录**（`agentDir`）用于认证配置文件、模型注册表和每个代理配置。
- **会话存储**（聊天历史 + 路由状态）在 `~/.clawdbot/agents/<agentId>/sessions` 下。

认证配置文件是 **每个代理**。每个代理从自己的读取：

```
~/.clawdbot/agents/<agentId>/agent/auth-profiles.json
```

主代理凭证 **不** 自动共享。切勿在代理间重用 `agentDir`
（它会导致认证/会话冲突）。如果您想共享凭证，
将 `auth-profiles.json` 复制到另一个代理的 `agentDir`。

技能通过每个工作区的 `skills/` 文件夹每个代理，共享技能
从 `~/.clawdbot/skills` 可用。参见 [技能：每个代理 vs 共享](/tools/skills#per-agent-vs-shared-skills)。

网关可以托管 **一个代理**（默认）或 **多个代理** 并排。

**工作区说明：** 每个代理的工作区是 **默认 cwd**，不是一个硬
沙盒。相对路径在工作区内解析，但绝对路径可以
到达其他主机位置，除非启用了沙盒。参见
[沙盒](/gateway/sandboxing)。

## 路径（快速映射）

- 配置：`~/.clawdbot/moltbot.json`（或 `CLAWDBOT_CONFIG_PATH`）
- 状态目录：`~/.clawdbot`（或 `CLAWDBOT_STATE_DIR`）
- 工作区：`~/clawd`（或 `~/clawd-<agentId>`）
- 代理目录：`~/.clawdbot/agents/<agentId>/agent`（或 `agents.list[].agentDir`）
- 会话：`~/.clawdbot/agents/<agentId>/sessions`

### 单代理模式（默认）

如果您什么都不做，Moltbot 运行单个代理：

- `agentId` 默认为 **`main`**。
- 会话键入为 `agent:main:<mainKey>`。
- 工作区默认为 `~/clawd`（或当设置 `CLAWDBOT_PROFILE` 时为 `~/clawd-<profile>`）。
- 状态默认为 `~/.clawdbot/agents/main/agent`。

## 代理助手

使用代理向导添加新的隔离代理：

```bash
moltbot agents add work
```

然后添加 `bindings`（或让向导执行）以路由入站消息。

验证：

```bash
moltbot agents list --bindings
```

## 多个代理 = 多个人，多个个性

使用 **多个代理**，每个 `agentId` 成为一个 **完全隔离的个性**：

- **不同电话号码/账户**（每个通道 `accountId`）。
- **不同个性**（每个代理工作区文件如 `AGENTS.md` 和 `SOUL.md`）。
- **分离认证 + 会话**（除非明确启用，否则无交叉通信）。

这允许 **多个人** 共享一个网关服务器，同时保持他们的 AI"大脑"和数据隔离。

## 一个 WhatsApp 号码，多个人（DM 分割）

您可以在 **一个 WhatsApp 账户** 上路由 **不同的 WhatsApp DM** 到不同代理。按发送者 E.164（如 `+15551234567`）匹配，使用 `peer.kind: "dm"`。回复仍来自同一个 WhatsApp 号码（无每个代理发送者身份）。

重要细节：直接聊天合并到代理的 **主会话键**，所以真正的隔离需要 **每个人一个代理**。

示例：

```json5
{
  agents: {
    list: [
      { id: "alex", workspace: "~/clawd-alex" },
      { id: "mia", workspace: "~/clawd-mia" }
    ]
  },
  bindings: [
    { agentId: "alex", match: { channel: "whatsapp", peer: { kind: "dm", id: "+15551230001" } } },
    { agentId: "mia",  match: { channel: "whatsapp", peer: { kind: "dm", id: "+15551230002" } } }
  ],
  channels: {
    whatsapp: {
      dmPolicy: "allowlist",
      allowFrom: ["+15551230001", "+15551230002"]
    }
  }
}
```

说明：
- DM 访问控制是 **每个 WhatsApp 账户全局**（配对/白名单），不是每个代理。
- 对于共享群组，将群组绑定到一个代理或使用 [广播组](/broadcast-groups)。

## 路由规则（消息如何选择代理）

绑定是 **确定性的** 和 **最具体获胜**：

1. `peer` 匹配（确切的 DM/群组/通道 id）
2. `guildId`（Discord）
3. `teamId`（Slack）
4. 通道的 `accountId` 匹配
5. 通道级匹配（`accountId: "*"`）
6. 回退到默认代理（`agents.list[].default`，否则是第一个列表条目，默认：`main`）

## 多个账户/电话号码

支持 **多个账户**（例如 WhatsApp）的通道使用 `accountId` 来识别
每个登录。每个 `accountId` 可以路由到不同的代理，所以一台服务器可以托管
多个电话号码而不混合会话。

## 概念

- `agentId`：一个"大脑"（工作区、每个代理认证、每个代理会话存储）。
- `accountId`：一个通道账户实例（例如 WhatsApp 账户 "personal" vs "biz"）。
- `binding`：通过 `(channel, accountId, peer)` 将入站消息路由到 `agentId`，可选地还有公会/团队 id。
- 直接聊天合并到 `agent:<agentId>:<mainKey>`（每个代理"主"；`session.mainKey`）。

## 示例：两个 WhatsApp → 两个代理

`~/.clawdbot/moltbot.json`（JSON5）：

```js
{
  agents: {
    list: [
      {
        id: "home",
        default: true,
        name: "Home",
        workspace: "~/clawd-home",
        agentDir: "~/.clawdbot/agents/home/agent",
      },
      {
        id: "work",
        name: "Work",
        workspace: "~/clawd-work",
        agentDir: "~/.clawdbot/agents/work/agent",
      },
    ],
  },

  // 确定性路由：第一个匹配获胜（最具体的优先）。
  bindings: [
    { agentId: "home", match: { channel: "whatsapp", accountId: "personal" } },
    { agentId: "work", match: { channel: "whatsapp", accountId: "biz" } },

    // 可选的每个对等覆盖（示例：将特定群组发送到工作代理）。
    {
      agentId: "work",
      match: {
        channel: "whatsapp",
        accountId: "personal",
        peer: { kind: "group", id: "1203630...@g.us" },
      },
    },
  ],

  // 默认关闭：代理到代理消息必须明确启用 + 白名单。
  tools: {
    agentToAgent: {
      enabled: false,
      allow: ["home", "work"],
    },
  },

  channels: {
    whatsapp: {
      accounts: {
        personal: {
          // 可选覆盖。默认：~/.clawdbot/credentials/whatsapp/personal
          // authDir: "~/.clawdbot/credentials/whatsapp/personal",
        },
        biz: {
          // 可选覆盖。默认：~/.clawdbot/credentials/whatsapp/biz
          // authDir: "~/.clawdbot/credentials/whatsapp/biz",
        },
      },
    },
  },
}
```

## 示例：WhatsApp 日常聊天 + Telegram 深度工作

按通道分割：将 WhatsApp 路由到快速日常代理，将 Telegram 路由到 Opus 代理。

```json5
{
  agents: {
    list: [
      {
        id: "chat",
        name: "Everyday",
        workspace: "~/clawd-chat",
        model: "anthropic/claude-sonnet-4-5"
      },
      {
        id: "opus",
        name: "Deep Work",
        workspace: "~/clawd-opus",
        model: "anthropic/claude-opus-4-5"
      }
    ]
  },
  bindings: [
    { agentId: "chat", match: { channel: "whatsapp" } },
    { agentId: "opus", match: { channel: "telegram" } }
  ]
}
```

说明：
- 如果您有通道的多个账户，请在绑定中添加 `accountId`（例如 `{ channel: "whatsapp", accountId: "personal" }`）。
- 要将单个 DM/群组路由到 Opus，同时保持其余在聊天上，请为该对等添加 `match.peer` 绑定；对等匹配总是胜过通道范围规则。

## 示例：相同通道，一个对等到 Opus

保持 WhatsApp 在快速代理上，但将一个 DM 路由到 Opus：

```json5
{
  agents: {
    list: [
      { id: "chat", name: "Everyday", workspace: "~/clawd-chat", model: "anthropic/claude-sonnet-4-5" },
      { id: "opus", name: "Deep Work", workspace: "~/clawd-opus", model: "anthropic/claude-opus-4-5" }
    ]
  },
  bindings: [
    { agentId: "opus", match: { channel: "whatsapp", peer: { kind: "dm", id: "+15551234567" } } },
    { agentId: "chat", match: { channel: "whatsapp" } }
  ]
}
```

对等绑定总是获胜，所以将它们保持在通道范围规则之上。

## 家庭代理绑定到 WhatsApp 群组

将专用家庭代理绑定到单个 WhatsApp 群组，带有提及门控
和更严格的工具策略：

```json5
{
  agents: {
    list: [
      {
        id: "family",
        name: "Family",
        workspace: "~/clawd-family",
        identity: { name: "Family Bot" },
        groupChat: {
          mentionPatterns: ["@family", "@familybot", "@Family Bot"]
        },
        sandbox: {
          mode: "all",
          scope: "agent"
        },
        tools: {
          allow: ["exec", "read", "sessions_list", "sessions_history", "sessions_send", "sessions_spawn", "session_status"],
          deny: ["write", "edit", "apply_patch", "browser", "canvas", "nodes", "cron"]
        }
      }
    ]
  },
  bindings: [
    {
      agentId: "family",
      match: {
        channel: "whatsapp",
        peer: { kind: "group", id: "120363999999999999@g.us" }
      }
    }
  ]
}
```

说明：
- 工具允许/拒绝列表是 **工具**，不是技能。如果技能需要运行
  二进制文件，请确保允许 `exec` 并且二进制文件在沙盒中存在。
- 为了更严格的门控，设置 `agents.list[].groupChat.mentionPatterns` 并保持
  通道的群组白名单启用。

## 每代理沙盒和工具配置

从 v2026.1.6 开始，每个代理可以有自己的沙盒和工具限制：

```js
{
  agents: {
    list: [
      {
        id: "personal",
        workspace: "~/clawd-personal",
        sandbox: {
          mode: "off",  // 个人代理无沙盒
        },
        // 无工具限制 - 所有工具可用
      },
      {
        id: "family",
        workspace: "~/clawd-family",
        sandbox: {
          mode: "all",     // 始终沙盒化
          scope: "agent",  // 每个代理一个容器
          docker: {
            // 容器创建后可选的一次性设置
            setupCommand: "apt-get update && apt-get install -y git curl",
          },
        },
        tools: {
          allow: ["read"],                    // 仅读取工具
          deny: ["exec", "write", "edit", "apply_patch"],    // 拒绝其他
        },
      },
    ],
  },
}
```

注意：`setupCommand` 位于 `sandbox.docker` 下，在容器创建时运行一次。
当解析的作用域为 "shared" 时，每个代理的 `sandbox.docker.*` 覆盖被忽略。

**好处：**
- **安全隔离**：为不受信任的代理限制工具
- **资源控制**：沙盒特定代理，同时保持其他在主机上
- **灵活策略**：每个代理不同权限

注意：`tools.elevated` 是 **全局** 和基于发送者的；不能为每个代理配置。
如果您需要每个代理边界，请使用 `agents.list[].tools` 拒绝 `exec`。
对于群组定位，请使用 `agents.list[].groupChat.mentionPatterns`，以便 @提及清晰地映射到预期的代理。

参见 [多代理沙盒和工具](/multi-agent-sandbox-tools) 获取详细示例。