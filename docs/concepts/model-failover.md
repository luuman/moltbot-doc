---
summary: "Moltbot 如何轮换认证配置文件并在模型间回退"
read_when:
  - 诊断认证配置文件轮换、冷却或模型回退行为时
  - 更新认证配置文件或模型的故障转移规则时
---

# 模型故障转移

Moltbot 在两个阶段处理故障：
1) **认证配置文件轮换** 在当前提供商内。
2) **模型回退** 到 `agents.defaults.model.fallbacks` 中的下一个模型。

本文档解释运行时规则和支撑它们的数据。

## 认证存储（密钥 + OAuth）

Moltbot 为 API 密钥和 OAuth 令牌使用 **认证配置文件**。

- 密钥存储在 `~/.clawdbot/agents/<agentId>/agent/auth-profiles.json`（遗留：`~/.clawdbot/agent/auth-profiles.json`）。
- 配置 `auth.profiles` / `auth.order` 仅 **元数据 + 路由**（无密钥）。
- 仅导入遗留 OAuth 文件：`~/.clawdbot/credentials/oauth.json`（在首次使用时导入到 `auth-profiles.json`）。

更多详情：[/concepts/oauth](/concepts/oauth)

认证类型：
- `type: "api_key"` → `{ provider, key }`
- `type: "oauth"` → `{ provider, access, refresh, expires, email? }`（+ `projectId`/`enterpriseUrl` 用于某些提供商）

## 配置文件 ID

OAuth 登录创建不同配置文件，以便多个账户可以共存。
- 默认：`provider:default` 当没有可用电子邮件时。
- OAuth 带电子邮件：`provider:<email>`（例如 `google-antigravity:user@gmail.com`）。

配置文件存储在 `~/.clawdbot/agents/<agentId>/agent/auth-profiles.json` 下的 `profiles` 中。

## 轮换顺序

当提供商有多个配置文件时，Moltbot 选择这样的顺序：

1) **显式配置**：`auth.order[provider]`（如果设置）。
2) **配置的配置文件**：按提供商过滤的 `auth.profiles`。
3) **存储的配置文件**：提供商的 `auth-profiles.json` 中的条目。

如果没有配置显式顺序，Moltbot 使用轮询顺序：
- **主键：** 配置文件类型（**OAuth 在 API 密钥之前**）。
- **次键：** `usageStats.lastUsed`（最旧优先，在每种类型内）。
- **冷却/禁用的配置文件** 被移到末尾，按最早到期排序。

### 会话粘性（缓存友好）

Moltbot **按会话固定选择的认证配置文件** 以保持提供商缓存温暖。
它 **不** 在每个请求上轮换。固定的配置文件被重用直到：
- 会话重置（`/new` / `/reset`）
- 压缩完成（压缩计数增加）
- 配置文件处于冷却/禁用状态

通过 `/model …@<profileId>` 的手动选择为此会话设置 **用户覆盖**
并且在新会话开始之前不会自动轮换。

由会话路由器选择的自动固定配置文件被视为 **偏好**：
它们首先被尝试，但如果出现速率限制/超时，Moltbot 可能在配置文件间轮换。
用户固定配置文件锁定到该配置文件；如果失败且配置了模型回退，
Moltbot 移动到下一个模型而不是切换配置文件。

### 为什么 OAuth 可能"看起来丢失"

如果您对同一提供商既有 OAuth 配置文件又有 API 密钥配置文件，除非固定，轮询可能在消息间在它们之间切换。要强制单个配置文件：
- 用 `auth.order[provider] = ["provider:profileId"]` 固定，或
- 通过 `/model …` 使用会话覆盖（当您的 UI/聊天界面支持时）。

## 冷却

当配置文件由于认证/速率限制错误（或看起来像速率限制的超时）而失败时，
Moltbot 将其标记为冷却并移动到下一个配置文件。
格式/无效请求错误（例如 Cloud Code Assist 工具调用 ID
验证失败）被视为值得故障转移，并使用相同的冷却。

冷却使用指数退避：
- 1 分钟
- 5 分钟
- 25 分钟
- 1 小时（上限）

状态存储在 `auth-profiles.json` 下的 `usageStats` 中：

```json
{
  "usageStats": {
    "provider:profile": {
      "lastUsed": 1736160000000,
      "cooldownUntil": 1736160600000,
      "errorCount": 2
    }
  }
}
```

## 计费禁用

计费/信用失败（例如"积分不足"/"信用余额太低"）被视为值得故障转移，但它们通常不是暂时的。与其使用短期冷却，Moltbot 将配置文件标记为 **禁用**（使用较长的退避）并轮换到下一个配置文件/提供商。

状态存储在 `auth-profiles.json` 中：

```json
{
  "usageStats": {
    "provider:profile": {
      "disabledUntil": 1736178000000,
      "disabledReason": "billing"
    }
  }
}
```

默认值：
- 计费退避从 **5 小时** 开始，每次计费失败加倍，并上限为 **24 小时**。
- 如果配置文件在 **24 小时** 内没有失败，退避计数器重置（可配置）。

## 模型回退

如果提供商的所有配置文件都失败，Moltbot 移动到
`agents.defaults.model.fallbacks` 中的下一个模型。这适用于认证失败、速率限制和
耗尽配置文件轮换的超时（其他错误不会推进回退）。

当运行以模型覆盖开始时（钩子或 CLI），回退仍会在尝试任何配置的回退后在
`agents.defaults.model.primary` 结束。

## 相关配置

参见 [网关配置](/gateway/configuration) 了解：
- `auth.profiles` / `auth.order`
- `auth.cooldowns.billingBackoffHours` / `auth.cooldowns.billingBackoffHoursByProvider`
- `auth.cooldowns.billingMaxHours` / `auth.cooldowns.failureWindowHours`
- `agents.defaults.model.primary` / `agents.defaults.model.fallbacks`
- `agents.defaults.imageModel` 路由

参见 [模型](/concepts/models) 了解更广泛的模型选择和回退概述。