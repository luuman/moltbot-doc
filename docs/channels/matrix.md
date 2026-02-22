---
summary: "Matrix 支持状态、功能和配置"
read_when:
  - 处理 Matrix 通道功能
---
# Matrix（插件）

Matrix 是一个开放的、去中心化的消息协议。Moltbot 作为 Matrix **用户** 连接到任何 homeserver，
所以您需要为机器人创建一个 Matrix 账户。一旦登录，您可以直接私信
机器人或将其邀请到房间（Matrix "群组"）。Beeper 也是一个有效的客户端选项，
但它需要启用 E2EE。

状态：通过插件支持（@vector-im/matrix-bot-sdk）。直接消息、房间、线程、媒体、反应，
投票（发送 + 投票开始作为文本）、位置和 E2EE（支持加密）。

## 需要插件

Matrix 作为插件提供，未与核心安装捆绑。

通过 CLI（npm 注册表）安装：

```bash
moltbot plugins install @moltbot/matrix
```

本地检出（从 git 仓库运行时）：

```bash
moltbot plugins install ./extensions/matrix
```

如果您在配置/入门过程中选择 Matrix 并检测到 git 检出，
Moltbot 将自动提供本地安装路径。

详情：[插件](/plugin)

## 设置

1) 安装 Matrix 插件：
   - 从 npm：`moltbot plugins install @moltbot/matrix`
   - 从本地检出：`moltbot plugins install ./extensions/matrix`
2) 在 homeserver 上创建 Matrix 账户：
   - 在 [https://matrix.org/ecosystem/hosting/](https://matrix.org/ecosystem/hosting/) 浏览托管选项
   - 或自己托管。
3) 获取机器人账户的访问令牌：
   - 在您的 home 服务器上使用 Matrix 登录 API 和 `curl`：

   ```bash
   curl --request POST \
     --url https://matrix.example.org/_matrix/client/v3/login \
     --header 'Content-Type: application/json' \
     --data '{
     "type": "m.login.password",
     "identifier": {
       "type": "m.id.user",
       "user": "your-user-name"
     },
     "password": "your-password"
   }'
   ```

   - 将 `matrix.example.org` 替换为您的 homeserver URL。
   - 或设置 `channels.matrix.userId` + `channels.matrix.password`：Moltbot 调用相同的
     登录端点，将访问令牌存储在 `~/.clawdbot/credentials/matrix/credentials.json` 中，
     并在下次启动时重用它。
4) 配置凭证：
   - 环境变量：`MATRIX_HOMESERVER`、`MATRIX_ACCESS_TOKEN`（或 `MATRIX_USER_ID` + `MATRIX_PASSWORD`）
   - 或配置：`channels.matrix.*`
   - 如果两者都设置，配置优先。
   - 使用访问令牌：通过 `/whoami` 自动获取用户 ID。
   - 设置时，`channels.matrix.userId` 应该是完整的 Matrix ID（示例：`@bot:example.org`）。
5) 重启网关（或完成入门）。
6) 从任何 Matrix 客户端（Element、Beeper 等；参见 https://matrix.org/ecosystem/clients/）
   开始与机器人的私信或将其邀请到房间。Beeper 需要 E2EE，
   所以设置 `channels.matrix.encryption: true` 并验证设备。

最小配置（访问令牌，用户 ID 自动获取）：

```json5
{
  channels: {
    matrix: {
      enabled: true,
      homeserver: "https://matrix.example.org",
      accessToken: "syt_***",
      dm: { policy: "pairing" }
    }
  }
}
```

E2EE 配置（启用端到端加密）：

```json5
{
  channels: {
    matrix: {
      enabled: true,
      homeserver: "https://matrix.example.org",
      accessToken: "syt_***",
      encryption: true,
      dm: { policy: "pairing" }
    }
  }
}
```

## 加密（E2EE）

端到端加密通过 Rust 加密 SDK **支持**。

使用 `channels.matrix.encryption: true` 启用：

- 如果加密模块加载，加密房间会自动解密。
- 发送到加密房间的出站媒体会被加密。
- 首次连接时，Moltbot 会从您的其他会话请求设备验证。
- 在另一个 Matrix 客户端（Element 等）中验证设备以启用密钥共享。
- 如果无法加载加密模块，E2EE 被禁用，加密房间将不会解密；
  Moltbot 记录警告。
- 如果您看到缺少加密模块错误（例如，`@matrix-org/matrix-sdk-crypto-nodejs-*`），
  允许 `@matrix-org/matrix-sdk-crypto-nodejs` 的构建脚本并运行
  `pnpm rebuild @matrix-org/matrix-sdk-crypto-nodejs` 或使用
  `node node_modules/@matrix-org/matrix-sdk-crypto-nodejs/download-lib.js` 获取二进制文件。

加密状态按账户 + 访问令牌存储在
`~/.clawdbot/matrix/accounts/<account>/<homeserver>__<user>/<token-hash>/crypto/`
（SQLite 数据库）。同步状态与它并存于 `bot-storage.json`。
如果访问令牌（设备）更改，将创建新存储，机器人必须
为加密房间重新验证。

**设备验证：**
启用 E2EE 时，机器人将在启动时从您的其他会话请求验证。
打开 Element（或其他客户端）并批准验证请求以建立信任。
验证后，机器人可以解密加密房间中的消息。

## 路由模型

- 回复始终返回到 Matrix。
- 私信共享代理的主会话；房间映射到群组会话。

## 访问控制（私信）

- 默认：`channels.matrix.dm.policy = "pairing"`。未知发送者获得配对码。
- 批准方式：
  - `moltbot pairing list matrix`
  - `moltbot pairing approve matrix <CODE>`
- 公开私信：`channels.matrix.dm.policy="open"` 加 `channels.matrix.dm.allowFrom=["*"]`。
- `channels.matrix.dm.allowFrom` 接受用户 ID 或显示名称。当目录搜索可用时，向导将显示名称解析为用户 ID。

## 房间（群组）

- 默认：`channels.matrix.groupPolicy = "allowlist"`（提及门控）。使用 `channels.defaults.groupPolicy` 在未设置时覆盖默认值。
- 使用 `channels.matrix.groups` 允许列表房间（房间 ID、别名或名称）：

```json5
{
  channels: {
    matrix: {
      groupPolicy: "allowlist",
      groups: {
        "!roomId:example.org": { allow: true },
        "#alias:example.org": { allow: true }
      },
      groupAllowFrom: ["@owner:example.org"]
    }
  }
}
```

- `requireMention: false` 在该房间中启用自动回复。
- `groups."*"` 可以设置跨房间的提及门控默认值。
- `groupAllowFrom` 限制哪些发送者可以在房间中触发机器人（可选）。
- 按房间的 `users` 允许列表可以进一步限制特定房间内的发送者。
- 配置向导提示房间允许列表（房间 ID、别名或名称），并在可能时解析名称。
- 启动时，Moltbot 将允许列表中的房间/用户名称解析为 ID 并记录映射；未解析的条目保持键入的格式。
- 邀请默认自动加入；使用 `channels.matrix.autoJoin` 和 `channels.matrix.autoJoinAllowlist` 控制。
- 要允许 **没有房间**，设置 `channels.matrix.groupPolicy: "disabled"`（或保持空的允许列表）。
- 遗留键：`channels.matrix.rooms`（与 `groups` 形状相同）。

## 线程

- 支持回复线程。
- `channels.matrix.threadReplies` 控制回复是否留在线程中：
  - `off`、`inbound`（默认）、`always`
- `channels.matrix.replyToMode` 控制不在线程中回复时的回复到元数据：
  - `off`（默认）、`first`、`all`

## 功能

| 功能 | 状态 |
|---------|--------|
| 直接消息 | ✅ 支持 |
| 房间 | ✅ 支持 |
| 线程 | ✅ 支持 |
| 媒体 | ✅ 支持 |
| E2EE | ✅ 支持（需要加密模块） |
| 反应 | ✅ 支持（通过工具发送/读取） |
| 投票 | ✅ 支持发送；入站投票开始转换为文本（响应/结束被忽略） |
| 位置 | ✅ 支持（地理 URI；海拔被忽略） |
| 原生命令 | ✅ 支持 |

## 配置参考（Matrix）

完整配置：[配置](/gateway/configuration)

提供者选项：

- `channels.matrix.enabled`：启用/禁用通道启动。
- `channels.matrix.homeserver`：homeserver URL。
- `channels.matrix.userId`：Matrix 用户 ID（使用访问令牌时可选）。
- `channels.matrix.accessToken`：访问令牌。
- `channels.matrix.password`：登录密码（令牌存储）。
- `channels.matrix.deviceName`：设备显示名称。
- `channels.matrix.encryption`：启用 E2EE（默认：false）。
- `channels.matrix.initialSyncLimit`：初始同步限制。
- `channels.matrix.threadReplies`：`off | inbound | always`（默认：inbound）。
- `channels.matrix.textChunkLimit`：出站文本分块大小（字符）。
- `channels.matrix.chunkMode`：`length`（默认）或 `newline` 以在长度分块之前按空行（段落边界）分割。
- `channels.matrix.dm.policy`：`pairing | allowlist | open | disabled`（默认：配对）。
- `channels.matrix.dm.allowFrom`：私信允许列表（用户 ID 或显示名称）。`open` 需要 `"*"`。向导在可能时将名称解析为 ID。
- `channels.matrix.groupPolicy`：`allowlist | open | disabled`（默认：允许列表）。
- `channels.matrix.groupAllowFrom`：群组消息的允许列表发送者。
- `channels.matrix.allowlistOnly`：强制对私信 + 房间使用允许列表规则。
- `channels.matrix.groups`：群组允许列表 + 按房间设置映射。
- `channels.matrix.rooms`：遗留群组允许列表/配置。
- `channels.matrix.replyToMode`：线程/标签的回复到模式。
- `channels.matrix.mediaMaxMb`：入站/出站媒体限制（MB）。
- `channels.matrix.autoJoin`：邀请处理（`always | allowlist | off`，默认：always）。
- `channels.matrix.autoJoinAllowlist`：自动加入的允许房间 ID/别名。
- `channels.matrix.actions`：按操作工具门控（反应/消息/置顶/成员信息/频道信息）。