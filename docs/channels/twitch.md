---
summary: "Twitch 聊天机器人配置和设置"
read_when:
  - 为 Moltbot 设置 Twitch 聊天集成
---
# Twitch（插件）

通过 IRC 连接支持 Twitch 聊天。Moltbot 作为 Twitch 用户（机器人账户）连接，以在频道中接收和发送消息。

## 需要插件

Twitch 作为插件提供，未与核心安装捆绑。

通过 CLI（npm 注册表）安装：

```bash
moltbot plugins install @moltbot/twitch
```

本地检出（从 git 仓库运行时）：

```bash
moltbot plugins install ./extensions/twitch
```

详情：[插件](/plugin)

## 快速设置（初学者）

1) 为机器人创建专用的 Twitch 账户（或使用现有账户）。
2) 生成凭证：[Twitch Token Generator](https://twitchtokengenerator.com/)
   - 选择 **机器人令牌**
   - 确认选择了 `chat:read` 和 `chat:write` 范围
   - 复制 **客户端 ID** 和 **访问令牌**
3) 查找您的 Twitch 用户 ID：https://www.streamweasels.com/tools/convert-twitch-username-to-user-id/
4) 配置令牌：
   - 环境变量：`CLAWDBOT_TWITCH_ACCESS_TOKEN=...`（仅限默认账户）
   - 或配置：`channels.twitch.accessToken`
   - 如果两者都设置，配置优先（环境变量回退仅限默认账户）。
5) 启动网关。

**⚠️ 重要：** 添加访问控制（`allowFrom` 或 `allowedRoles`）以防止未经授权的用户触发机器人。`requireMention` 默认为 `true`。

最小配置：

```json5
{
  channels: {
    twitch: {
      enabled: true,
      username: "moltbot",              // 机器人的 Twitch 账户
      accessToken: "oauth:abc123...",    // OAuth 访问令牌（或使用 CLAWDBOT_TWITCH_ACCESS_TOKEN 环境变量）
      clientId: "xyz789...",             // 令牌生成器中的客户端 ID
      channel: "vevisk",                 // 加入哪个 Twitch 频道的聊天（必需）
      allowFrom: ["123456789"]           // （推荐）仅您的 Twitch 用户 ID - 从 https://www.streamweasels.com/tools/convert-twitch-username-to-user-id/ 获取
    }
  }
}
```

## 它是什么

- 由网关拥有的 Twitch 频道。
- 确定性路由：回复始终返回到 Twitch。
- 每个账户映射到一个隔离的会话键 `agent:<agentId>:twitch:<accountName>`。
- `username` 是机器人的账户（谁进行身份验证），`channel` 是要加入的聊天室。

## 设置（详细）

### 生成凭证

使用 [Twitch Token Generator](https://twitchtokengenerator.com/)：
- 选择 **机器人令牌**
- 确认选择了 `chat:read` 和 `chat:write` 范围
- 复制 **客户端 ID** 和 **访问令牌**

无需手动应用注册。令牌在几小时后过期。

### 配置机器人

**环境变量（仅限默认账户）：**
```bash
CLAWDBOT_TWITCH_ACCESS_TOKEN=oauth:abc123...
```

**或配置：**
```json5
{
  channels: {
    twitch: {
      enabled: true,
      username: "moltbot",
      accessToken: "oauth:abc123...",
      clientId: "xyz789...",
      channel: "vevisk"
    }
  }
}
```

如果同时设置了环境变量和配置，配置优先。

### 访问控制（推荐）

```json5
{
  channels: {
    twitch: {
      allowFrom: ["123456789"],       // （推荐）仅您的 Twitch 用户 ID
      allowedRoles: ["moderator"]     // 或限制为角色
    }
  }
}
```

**可用角色：** `"moderator"`, `"owner"`, `"vip"`, `"subscriber"`, `"all"`。

**为什么使用用户 ID？** 用户名可能会更改，导致冒充。用户 ID 是永久的。

查找您的 Twitch 用户 ID：https://www.streamweasels.com/tools/convert-twitch-username-%20to-user-id/（将您的 Twitch 用户名转换为 ID）

## 令牌刷新（可选）

来自 [Twitch Token Generator](https://twitchtokengenerator.com/) 的令牌无法自动刷新 - 过期时重新生成。

要实现自动令牌刷新，请在 [Twitch Developer Console](https://dev.twitch.tv/console) 中创建自己的 Twitch 应用并添加到配置中：

```json5
{
  channels: {
    twitch: {
      clientSecret: "your_client_secret",
      refreshToken: "your_refresh_token"
    }
  }
}
```

机器人在到期前自动刷新令牌并记录刷新事件。

## 多账户支持

使用 `channels.twitch.accounts` 配置每个账户的令牌。参见 [`gateway/configuration`](/gateway/configuration) 了解共享模式。

示例（一个机器人账户在两个频道中）：

```json5
{
  channels: {
    twitch: {
      accounts: {
        channel1: {
          username: "moltbot",
          accessToken: "oauth:abc123...",
          clientId: "xyz789...",
          channel: "vevisk"
        },
        channel2: {
          username: "moltbot",
          accessToken: "oauth:def456...",
          clientId: "uvw012...",
          channel: "secondchannel"
        }
      }
    }
  }
}
```

**注意：** 每个账户都需要自己的令牌（每个频道一个令牌）。

## 访问控制

### 基于角色的限制

```json5
{
  channels: {
    twitch: {
      accounts: {
        default: {
          allowedRoles: ["moderator", "vip"]
        }
      }
    }
  }
}
```

### 按用户 ID 允许列表（最安全）

```json5
{
  channels: {
    twitch: {
      accounts: {
        default: {
          allowFrom: ["123456789", "987654321"]
        }
      }
    }
  }
}
```

### 组合允许列表 + 角色

`allowFrom` 中的用户绕过角色检查：

```json5
{
  channels: {
    twitch: {
      accounts: {
        default: {
          allowFrom: ["123456789"],
          allowedRoles: ["moderator"]
        }
      }
    }
  }
}
```

### 禁用 @提及要求

默认情况下，`requireMention` 为 `true`。要禁用并回复所有消息：

```json5
{
  channels: {
    twitch: {
      accounts: {
        default: {
          requireMention: false
        }
      }
    }
  }
}
```

## 故障排除

首先，运行诊断命令：

```bash
moltbot doctor
moltbot channels status --probe
```

### 机器人不回复消息

**检查访问控制：** 临时设置 `allowedRoles: ["all"]` 进行测试。

**检查机器人是否在频道中：** 机器人必须加入 `channel` 中指定的频道。

### 令牌问题

**"连接失败" 或身份验证错误：**
- 验证 `accessToken` 是 OAuth 访问令牌值（通常以 `oauth:` 前缀开头）
- 检查令牌是否具有 `chat:read` 和 `chat:write` 范围
- 如果使用令牌刷新，验证 `clientSecret` 和 `refreshToken` 已设置

### 令牌刷新不起作用

**检查日志中的刷新事件：**
```
Using env token source for mybot
Access token refreshed for user 123456 (expires in 14400s)
```

如果您看到 "token refresh disabled (no refresh token)"：
- 确保提供了 `clientSecret`
- 确保提供了 `refreshToken`

## 配置

**账户配置：**
- `username` - 机器人用户名
- `accessToken` - OAuth 访问令牌，具有 `chat:read` 和 `chat:write`
- `clientId` - Twitch 客户端 ID（来自令牌生成器或您的应用）
- `channel` - 要加入的频道（必需）
- `enabled` - 启用此账户（默认：`true`）
- `clientSecret` - 可选：用于自动令牌刷新
- `refreshToken` - 可选：用于自动令牌刷新
- `expiresIn` - 令牌到期时间（秒）
- `obtainmentTimestamp` - 令牌获取时间戳
- `allowFrom` - 用户 ID 允许列表
- `allowedRoles` - 基于角色的访问控制（`"moderator" | "owner" | "vip" | "subscriber" | "all"`）
- `requireMention` - 需要 @提及（默认：`true`）

**提供者选项：**
- `channels.twitch.enabled` - 启用/禁用频道启动
- `channels.twitch.username` - 机器人用户名（简化单账户配置）
- `channels.twitch.accessToken` - OAuth 访问令牌（简化单账户配置）
- `channels.twitch.clientId` - Twitch 客户端 ID（简化单账户配置）
- `channels.twitch.channel` - 要加入的频道（简化单账户配置）
- `channels.twitch.accounts.<accountName>` - 多账户配置（上述所有账户字段）

完整示例：

```json5
{
  channels: {
    twitch: {
      enabled: true,
      username: "moltbot",
      accessToken: "oauth:abc123...",
      clientId: "xyz789...",
      channel: "vevisk",
      clientSecret: "secret123...",
      refreshToken: "refresh456...",
      allowFrom: ["123456789"],
      allowedRoles: ["moderator", "vip"],
      accounts: {
        default: {
          username: "mybot",
          accessToken: "oauth:abc123...",
          clientId: "xyz789...",
          channel: "your_channel",
          enabled: true,
          clientSecret: "secret123...",
          refreshToken: "refresh456...",
          expiresIn: 14400,
          obtainmentTimestamp: 1706092800000,
          allowFrom: ["123456789", "987654321"],
          allowedRoles: ["moderator"]
        }
      }
    }
  }
}
```

## 工具操作

代理可以使用操作调用 `twitch`：
- `send` - 向频道发送消息

示例：

```json5
{
  "action": "twitch",
  "params": {
    "message": "Hello Twitch!",
    "to": "#mychannel"
  }
}
```

## 安全与运维

- **将令牌视为密码** - 切勿将令牌提交到 git
- **对长期运行的机器人使用自动令牌刷新**
- **使用用户 ID 允许列表而不是用户名进行访问控制**
- **监控日志** 以获取令牌刷新事件和连接状态
- **最小化令牌范围** - 仅请求 `chat:read` 和 `chat:write`
- **如果卡住**：确认没有其他进程拥有会话后重启网关

## 限制

- **每条消息 500 个字符**（在单词边界自动分块）
- 在分块之前剥离 Markdown
- 无速率限制（使用 Twitch 的内置速率限制）