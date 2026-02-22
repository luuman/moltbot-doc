---
summary: "Moltbot 中的 OAuth：令牌交换、存储和多账户模式"
read_when:
  - 您想了解 Moltbot OAuth 端到端时
  - 您遇到令牌失效/注销问题时
  - 您想要设置令牌或 OAuth 认证流程时
  - 您想要多个账户或配置文件路由时
---
# OAuth

Moltbot 支持通过 OAuth 进行"订阅认证"，适用于提供它的提供商（特别是 **OpenAI Codex (ChatGPT OAuth)**）。对于 Anthropic 订阅，使用 **设置令牌** 流程。本页面解释：

- OAuth **令牌交换** 如何工作（PKCE）
- 令牌 **存储** 在哪里（原因）
- 如何处理 **多个账户**（配置文件 + 每会话覆盖）

Moltbot 还支持 **提供商插件**，它们自带 OAuth 或 API 密钥
流程。通过以下方式运行它们：

```bash
moltbot models auth login --provider <id>
```

## 令牌池（存在的原因）

OAuth 提供商通常在登录/刷新流程期间生成 **新刷新令牌**。某些提供商（或 OAuth 客户端）可以在为同一用户/应用程序发出新令牌时使旧的刷新令牌失效。

实际症状：
- 您通过 Moltbot *和* 通过 Claude Code / Codex CLI 登录 → 其中一个随机在稍后"退出登录"

为了减少这种情况，Moltbot 将 `auth-profiles.json` 视为 **令牌池**：
- 运行时从 **一个地方** 读取凭证
- 我们可以保留多个配置文件并确定性地路由它们

## 存储（令牌位置）

凭据存储在 **每个代理** 的基础上：

- 认证配置文件（OAuth + API 密钥）：`~/.clawdbot/agents/<agentId>/agent/auth-profiles.json`
- 运行时缓存（自动管理；不要编辑）：`~/.clawdbot/agents/<agentId>/agent/auth.json`

遗留导入文件（仍支持，但不是主要存储）：
- `~/.clawdbot/credentials/oauth.json`（在首次使用时导入到 `auth-profiles.json`）

以上所有也都遵守 `$CLAWDBOT_STATE_DIR`（状态目录覆盖）。完整参考：[/gateway/configuration](/gateway/configuration#auth-storage-oauth--api-keys)

## Anthropic 设置令牌（订阅认证）

在任何机器上运行 `claude setup-token`，然后将其粘贴到 Moltbot：

```bash
moltbot models auth setup-token --provider anthropic
```

如果您在其他地方生成了令牌，请手动粘贴：

```bash
moltbot models auth paste-token --provider anthropic
```

验证：

```bash
moltbot models status
```

## OAuth 交换（登录工作原理）

Moltbot 的交互式登录流程在 `@mariozechner/pi-ai` 中实现并连接到向导/命令。

### Anthropic（Claude Pro/Max）设置令牌

流程形状：

1) 运行 `claude setup-token`
2) 将令牌粘贴到 Moltbot
3) 存储为令牌认证配置文件（无需刷新）

向导路径是 `moltbot onboard` → 认证选项 `setup-token`（Anthropic）。

### OpenAI Codex（ChatGPT OAuth）

流程形状（PKCE）：

1) 生成 PKCE 验证器/挑战 + 随机 `state`
2) 打开 `https://auth.openai.com/oauth/authorize?...`
3) 尝试在 `http://127.0.0.1:1455/auth/callback` 上捕获回调
4) 如果回调无法绑定（或者您是远程/无头的），请粘贴重定向 URL/代码
5) 在 `https://auth.openai.com/oauth/token` 交换
6) 从访问令牌中提取 `accountId` 并存储 `{ access, refresh, expires, accountId }`

向导路径是 `moltbot onboard` → 认证选项 `openai-codex`。

## 刷新 + 过期

配置文件存储 `expires` 时间戳。

运行时：
- 如果 `expires` 是未来 → 使用存储的访问令牌
- 如果过期 → 刷新（在文件锁下）并覆盖存储的凭证

刷新流程是自动的；通常不需要手动管理令牌。

## 多个账户（配置文件）+ 路由

两种模式：

### 1) 首选：单独代理

如果您希望"个人"和"工作"从不互动，请使用隔离代理（单独的会话 + 凭证 + 工作区）：

```bash
moltbot agents add work
moltbot agents add personal
```

然后为每个代理配置认证（向导）并将聊天路由到正确的代理。

### 2) 高级：一个代理中的多个配置文件

`auth-profiles.json` 支持同一提供商的多个配置文件 ID。

选择使用哪个配置文件：
- 通过配置排序全局（`auth.order`）
- 通过 `/model ...@<profileId>` 每会话

示例（会话覆盖）：
- `/model Opus@anthropic:work`

如何查看存在哪些配置文件 ID：
- `moltbot channels list --json`（显示 `auth[]`）

相关文档：
- [/concepts/model-failover](/concepts/model-failover)（轮换 + 冷却规则）
- [/tools/slash-commands](/tools/slash-commands)（命令界面）