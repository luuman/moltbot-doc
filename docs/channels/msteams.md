---
summary: "Microsoft Teams 机器人支持状态、功能和配置"
read_when:
  - 处理 MS Teams 通道功能
---
# Microsoft Teams（插件）

> "进入这里的人，放弃一切希望。"

更新日期：2026-01-21

状态：支持文本 + 私信附件；频道/群组文件发送需要 `sharePointSiteId` + Graph 权限（参见 [在群组聊天中发送文件](#在群组聊天中发送文件)）。投票通过自适应卡片发送。

## 需要插件
Microsoft Teams 作为插件提供，未与核心安装捆绑。

**重大变更（2026.1.15）：** MS Teams 已移出核心。如果您使用它，必须安装插件。

解释：使核心安装更轻量，并让 MS Teams 依赖项独立更新。

通过 CLI（npm 注册表）安装：
```bash
moltbot plugins install @moltbot/msteams
```

本地检出（从 git 仓库运行时）：
```bash
moltbot plugins install ./extensions/msteams
```

如果您在配置/入门过程中选择 Teams 并检测到 git 检出，
Moltbot 将自动提供本地安装路径。

详情：[插件](/plugin)

## 快速设置（初学者）
1) 安装 Microsoft Teams 插件。
2) 创建 **Azure 机器人**（应用 ID + 客户端密钥 + 租户 ID）。
3) 使用这些凭证配置 Moltbot。
4) 通过公共 URL 或隧道公开 `/api/messages`（默认端口 3978）。
5) 安装 Teams 应用包并启动网关。

最小配置：
```json5
{
  channels: {
    msteams: {
      enabled: true,
      appId: "<APP_ID>",
      appPassword: "<APP_PASSWORD>",
      tenantId: "<TENANT_ID>",
      webhook: { port: 3978, path: "/api/messages" }
    }
  }
}
```
注意：群组聊天默认被阻止（`channels.msteams.groupPolicy: "allowlist"`）。要允许群组回复，请设置 `channels.msteams.groupAllowFrom`（或使用 `groupPolicy: "open"` 允许任何成员，提及门控）。

## 目标
- 通过 Teams 私信、群组聊天或频道与 Moltbot 交谈。
- 保持路由确定性：回复始终返回到它们到达的频道。
- 默认采用安全的频道行为（除非另有配置，否则需要提及）。

## 配置写入
默认情况下，Microsoft Teams 允许写入由 `/config set|unset` 触发的配置更新（需要 `commands.config: true`）。

禁用方法：
```json5
{
  channels: { msteams: { configWrites: false } }
}
```

## 访问控制（私信 + 群组）

**私信访问**
- 默认：`channels.msteams.dmPolicy = "pairing"`。未知发送者在获准之前被忽略。
- `channels.msteams.allowFrom` 接受 AAD 对象 ID、UPN 或显示名称。当凭证允许时，向导通过 Microsoft Graph 将名称解析为 ID。

**群组访问**
- 默认：`channels.msteams.groupPolicy = "allowlist"`（除非添加 `groupAllowFrom` 否则被阻止）。使用 `channels.defaults.groupPolicy` 在未设置时覆盖默认值。
- `channels.msteams.groupAllowFrom` 控制哪些发送者可以在群组聊天/频道中触发（回退到 `channels.msteams.allowFrom`）。
- 设置 `groupPolicy: "open"` 以允许任何成员（仍默认提及门控）。
- 要允许 **没有频道**，设置 `channels.msteams.groupPolicy: "disabled"`。

示例：
```json5
{
  channels: {
    msteams: {
      groupPolicy: "allowlist",
      groupAllowFrom: ["user@org.com"]
    }
  }
}
```

**Teams + 频道允许列表**
- 通过在 `channels.msteams.teams` 下列出团队和频道来限定群组/频道回复范围。
- 键可以是团队 ID 或名称；频道键可以是对话 ID 或名称。
- 当 `groupPolicy="allowlist"` 且存在团队允许列表时，只接受列出的团队/频道（提及门控）。
- 配置向导接受 `Team/Channel` 条目并为您存储。
- 启动时，Moltbot 将团队/频道和用户允许列表名称解析为 ID（当 Graph 权限允许时）
  并记录映射；未解析的条目保持键入的格式。

示例：
```json5
{
  channels: {
    msteams: {
      groupPolicy: "allowlist",
      teams: {
        "My Team": {
          channels: {
            "General": { requireMention: true }
          }
        }
      }
    }
  }
}
```

## 工作原理
1. 安装 Microsoft Teams 插件。
2. 创建 **Azure 机器人**（应用 ID + 密钥 + 租户 ID）。
3. 构建引用机器人的 **Teams 应用包** 并包含下面的 RSC 权限。
4. 将 Teams 应用上传/安装到团队（或用于私信的个人范围）。
5. 在 `~/.clawdbot/moltbot.json` 中配置 `msteams`（或环境变量）并启动网关。
6. 网关默认监听 `/api/messages` 上的 Bot Framework webhook 流量。

## Azure 机器人设置（先决条件）

配置 Moltbot 之前，您需要创建一个 Azure 机器人资源。

### 步骤 1：创建 Azure 机器人

1. 前往 [创建 Azure 机器人](https://portal.azure.com/#create/Microsoft.AzureBot)
2. 填写 **基本** 选项卡：

   | 字段 | 值 |
   |-------|-------|
   | **机器人句柄** | 您的机器人名称，例如 `moltbot-msteams`（必须唯一） |
   | **订阅** | 选择您的 Azure 订阅 |
   | **资源组** | 创建新的或使用现有的 |
   | **定价层** | **免费** 用于开发/测试 |
   | **应用类型** | **单租户**（推荐 - 参见下面的注释） |
   | **创建类型** | **创建新的 Microsoft 应用 ID** |

> **弃用通知：** 新的多租户机器人创建已于 2025-07-31 后弃用。新机器人使用 **单租户**。

3. 点击 **审查 + 创建** → **创建**（等待约 1-2 分钟）

### 步骤 2：获取凭证

1. 前往您的 Azure 机器人资源 → **配置**
2. 复制 **Microsoft 应用 ID** → 这是您的 `appId`
3. 点击 **管理密码** → 前往应用注册
4. 在 **证书和机密** 下 → **新建客户端机密** → 复制 **值** → 这是您的 `appPassword`
5. 前往 **概览** → 复制 **目录（租户）ID** → 这是您的 `tenantId`

### 步骤 3：配置消息端点

1. 在 Azure 机器人 → **配置**
2. 设置 **消息端点** 为您的 webhook URL：
   - 生产环境：`https://your-domain.com/api/messages`
   - 本地开发：使用隧道（参见下面的 [本地开发（隧道）](#本地开发（隧道）））

### 步骤 4：启用 Teams 频道

1. 在 Azure 机器人 → **频道**
2. 点击 **Microsoft Teams** → 配置 → 保存
3. 接受服务条款

## 本地开发（隧道）

Teams 无法访问 `localhost`。本地开发使用隧道：

**选项 A：ngrok**
```bash
ngrok http 3978
# 复制 https URL，例如 https://abc123.ngrok.io
# 将消息端点设置为：https://abc123.ngrok.io/api/messages
```

**选项 B：Tailscale Funnel**
```bash
tailscale funnel 3978
# 使用您的 Tailscale funnel URL 作为消息端点
```

## Teams 开发者门户（替代方案）

除了手动创建清单 ZIP，您可以使用 [Teams 开发者门户](https://dev.teams.microsoft.com/apps)：

1. 点击 **+ 新应用**
2. 填写基本信息（名称、描述、开发者信息）
3. 前往 **应用功能** → **机器人**
4. 选择 **手动输入机器人 ID** 并粘贴您的 Azure 机器人应用 ID
5. 检查范围：**个人**、**团队**、**群组聊天**
6. 点击 **分发** → **下载应用包**
7. 在 Teams 中：**应用** → **管理您的应用** → **上传自定义应用** → 选择 ZIP

这通常比手工编辑 JSON 清单更容易。

## 测试机器人

**选项 A：Azure Web Chat（先验证 webhook）**
1. 在 Azure 门户 → 您的 Azure 机器人资源 → **在 Web Chat 中测试**
2. 发送消息 - 您应该看到回复
3. 这确认您的 webhook 端点在 Teams 设置之前工作正常

**选项 B：Teams（安装应用后）**
1. 安装 Teams 应用（侧载或组织目录）
2. 在 Teams 中找到机器人并发送私信
3. 检查网关日志中的传入活动

## 设置（最小文本版）
1. **安装 Microsoft Teams 插件**
   - 从 npm：`moltbot plugins install @moltbot/msteams`
   - 从本地检出：`moltbot plugins install ./extensions/msteams`

2. **机器人注册**
   - 创建 Azure 机器人（参见上文）并注意：
     - 应用 ID
     - 客户端密钥（应用密码）
     - 租户 ID（单租户）

3. **Teams 应用清单**
   - 包含带有 `botId = <App ID>` 的 `bot` 条目。
   - 范围：`personal`、`team`、`groupChat`。
   - `supportsFiles: true`（个人范围文件处理所需）。
   - 添加 RSC 权限（如下）。
   - 创建图标：`outline.png`（32x32）和 `color.png`（192x192）。
   - 将三个文件打包在一起：`manifest.json`、`outline.png`、`color.png`。

4. **配置 Moltbot**
   ```json
   {
     "msteams": {
       "enabled": true,
       "appId": "<APP_ID>",
       "appPassword": "<APP_PASSWORD>",
       "tenantId": "<TENANT_ID>",
       "webhook": { "port": 3978, "path": "/api/messages" }
     }
   }
   ```

   您也可以使用环境变量代替配置键：
   - `MSTEAMS_APP_ID`
   - `MSTEAMS_APP_PASSWORD`
   - `MSTEAMS_TENANT_ID`

5. **机器人端点**
   - 将 Azure 机器人消息端点设置为：
     - `https://<host>:3978/api/messages`（或您选择的路径/端口）。

6. **运行网关**
   - 安装插件且存在带有凭证的 `msteams` 配置时，Teams 通道自动启动。

## 历史上下文
- `channels.msteams.historyLimit` 控制有多少最近的频道/群组消息被包装到提示中。
- 回退到 `messages.groupChat.historyLimit`。设置 `0` 以禁用（默认 50）。
- 私信历史可以用 `channels.msteams.dmHistoryLimit`（用户回合）限制。按用户覆盖：`channels.msteams.dms["<user_id>"].historyLimit`。

## 当前 Teams RSC 权限（清单）
这些是我们 Teams 应用清单中的 **现有资源特定权限**。它们只在安装应用的团队/聊天内部生效。

**对于频道（团队范围）：**
- `ChannelMessage.Read.Group`（应用）- 无需 @提及即可接收所有频道消息
- `ChannelMessage.Send.Group`（应用）
- `Member.Read.Group`（应用）
- `Owner.Read.Group`（应用）
- `ChannelSettings.Read.Group`（应用）
- `TeamMember.Read.Group`（应用）
- `TeamSettings.Read.Group`（应用）

**对于群组聊天：**
- `ChatMessage.Read.Chat`（应用）- 无需 @提及即可接收所有群组聊天消息

## 示例 Teams 清单（删节版）
具有必需字段的最小有效示例。替换 ID 和 URL。

```json
{
  "$schema": "https://developer.microsoft.com/en-us/json-schemas/teams/v1.23/MicrosoftTeams.schema.json",
  "manifestVersion": "1.23",
  "version": "1.0.0",
  "id": "00000000-0000-0000-0000-000000000000",
  "name": { "short": "Moltbot" },
  "developer": {
    "name": "Your Org",
    "websiteUrl": "https://example.com",
    "privacyUrl": "https://example.com/privacy",
    "termsOfUseUrl": "https://example.com/terms"
  },
  "description": { "short": "Moltbot in Teams", "full": "Moltbot in Teams" },
  "icons": { "outline": "outline.png", "color": "color.png" },
  "accentColor": "#5B6DEF",
  "bots": [
    {
      "botId": "11111111-1111-1111-1111-111111111111",
      "scopes": ["personal", "team", "groupChat"],
      "isNotificationOnly": false,
      "supportsCalling": false,
      "supportsVideo": false,
      "supportsFiles": true
    }
  ],
  "webApplicationInfo": {
    "id": "11111111-1111-1111-1111-111111111111"
  },
  "authorization": {
    "permissions": {
      "resourceSpecific": [
        { "name": "ChannelMessage.Read.Group", "type": "Application" },
        { "name": "ChannelMessage.Send.Group", "type": "Application" },
        { "name": "Member.Read.Group", "type": "Application" },
        { "name": "Owner.Read.Group", "type": "Application" },
        { "name": "ChannelSettings.Read.Group", "type": "Application" },
        { "name": "TeamMember.Read.Group", "type": "Application" },
        { "name": "TeamSettings.Read.Group", "type": "Application" },
        { "name": "ChatMessage.Read.Chat", "type": "Application" }
      ]
    }
  }
}
```

### 清单注意事项（必填字段）
- `bots[].botId` **必须** 与 Azure 机器人应用 ID 匹配。
- `webApplicationInfo.id` **必须** 与 Azure 机器人应用 ID 匹配。
- `bots[].scopes` 必须包含您计划使用的表面（`personal`、`team`、`groupChat`）。
- `bots[].supportsFiles: true` 是个人范围内文件处理所需的。
- `authorization.permissions.resourceSpecific` 必须包含频道读取/发送，如果您想要频道流量。

### 更新现有应用

要更新已安装的 Teams 应用（例如添加 RSC 权限）：

1. 用新设置更新您的 `manifest.json`
2. **增加 `version` 字段**（例如 `1.0.0` → `1.1.0`）
3. **重新压缩** 清单与图标（`manifest.json`、`outline.png`、`color.png`）
4. 上传新 zip：
   - **选项 A（Teams 管理中心）：** Teams 管理中心 → Teams 应用 → 管理应用 → 找到您的应用 → 上传新版本
   - **选项 B（侧载）：** 在 Teams → 应用 → 管理您的应用 → 上传自定义应用
5. **对于团队频道：** 在每个团队中重新安装应用以使新权限生效
6. **完全退出并重新启动 Teams**（不仅仅是关闭窗口）以清除缓存的应用元数据

## 功能：仅 RSC vs Graph

### 仅 **Teams RSC**（应用已安装，无 Graph API 权限）
可工作：
- 读取频道消息 **文本** 内容。
- 发送频道消息 **文本** 内容。
- 接收 **个人（私信）** 文件附件。

不工作：
- 频道/群组 **图像或文件内容**（负载仅包含 HTML 存根）。
- 下载存储在 SharePoint/OneDrive 中的附件。
- 读取消息历史（超出实时 webhook 事件）。

### **Teams RSC + Microsoft Graph 应用权限**
增加：
- 下载托管内容（粘贴到消息中的图像）。
- 下载存储在 SharePoint/OneDrive 中的文件附件。
- 通过 Graph 读取频道/聊天消息历史。

### RSC vs Graph API

| 功能 | RSC 权限 | Graph API |
|------------|-----------------|-----------|
| **实时消息** | 是（通过 webhook） | 否（仅轮询） |
| **历史消息** | 否 | 是（可以查询历史） |
| **设置复杂度** | 仅应用清单 | 需要管理员同意 + 令牌流 |
| **离线工作** | 否（必须运行） | 是（随时查询） |

**底线：** RSC 用于实时监听；Graph API 用于历史访问。要捕获离线时错过的消息，您需要具有 `ChannelMessage.Read.All` 的 Graph API（需要管理员同意）。

## 启用 Graph 的媒体 + 历史（频道必需）
如果您需要 **频道** 中的图像/文件或想要获取 **消息历史**，您必须启用 Microsoft Graph 权限并授予管理员同意。

1. 在 Entra ID（Azure AD）**应用注册** 中，添加 Microsoft Graph **应用权限**：
   - `ChannelMessage.Read.All`（频道附件 + 历史）
   - `Chat.Read.All` 或 `ChatMessage.Read.All`（群组聊天）
2. **为租户授予管理员同意**。
3. 提高 Teams 应用 **清单版本**，重新上传，**在 Teams 中重新安装应用**。
4. **完全退出并重新启动 Teams** 以清除缓存的应用元数据。

## 已知限制

### Webhook 超时
Teams 通过 HTTP webhook 传递消息。如果处理时间太长（例如，缓慢的 LLM 响应），您可能会看到：
- 网关超时
- Teams 重试消息（导致重复）
- 丢失的回复

Moltbot 通过快速返回并主动发送回复来处理这个问题，但非常慢的响应仍可能导致问题。

### 格式化
Teams markdown 比 Slack 或 Discord 更有限：
- 基本格式化工作：**粗体**、*斜体*、`代码`、链接
- 复杂 markdown（表格、嵌套列表）可能无法正确渲染
- 自适应卡片支持投票和任意卡片发送（参见下文）

## 配置
关键设置（参见 `/gateway/configuration` 了解共享通道模式）：

- `channels.msteams.enabled`：启用/禁用通道。
- `channels.msteams.appId`、`channels.msteams.appPassword`、`channels.msteams.tenantId`：机器人凭证。
- `channels.msteams.webhook.port`（默认 `3978`）
- `channels.msteams.webhook.path`（默认 `/api/messages`）
- `channels.msteams.dmPolicy`：`pairing | allowlist | open | disabled`（默认：配对）
- `channels.msteams.allowFrom`：私信允许列表（AAD 对象 ID、UPN 或显示名称）。当 Graph 访问可用时，向导在设置过程中将名称解析为 ID。
- `channels.msteams.textChunkLimit`：出站文本分块大小。
- `channels.msteams.chunkMode`：`length`（默认）或 `newline` 以在长度分块之前按空行（段落边界）分割。
- `channels.msteams.mediaAllowHosts`：入站附件主机允许列表（默认为 Microsoft/Teams 域）。
- `channels.msteams.requireMention`：在频道/群组中需要 @提及（默认 true）。
- `channels.msteams.replyStyle`：`thread | top-level`（参见 [回复样式](#回复样式-线程-vs-帖子)）。
- `channels.msteams.teams.<teamId>.replyStyle`：按团队覆盖。
- `channels.msteams.teams.<teamId>.requireMention`：按团队覆盖。
- `channels.msteams.teams.<teamId>.tools`：缺失频道覆盖时使用的默认按团队工具策略覆盖（`allow`/`deny`/`alsoAllow`）。
- `channels.msteams.teams.<teamId>.toolsBySender`：默认按团队按发送者工具策略覆盖（支持 `"*"` 通配符）。
- `channels.msteams.teams.<teamId>.channels.<conversationId>.replyStyle`：按频道覆盖。
- `channels.msteams.teams.<teamId>.channels.<conversationId>.requireMention`：按频道覆盖。
- `channels.msteams.teams.<teamId>.channels.<conversationId>.tools`：按频道工具策略覆盖（`allow`/`deny`/`alsoAllow`）。
- `channels.msteams.teams.<teamId>.channels.<conversationId>.toolsBySender`：按频道按发送者工具策略覆盖（支持 `"*"` 通配符）。
- `channels.msteams.sharePointSiteId`：群组聊天/频道中文件上传的 SharePoint 站点 ID（参见 [在群组聊天中发送文件](#在群组聊天中发送文件)）。

## 路由和会话
- 会话键遵循标准代理格式（参见 [/concepts/session](/concepts/session)）：
  - 直接消息共享主会话（`agent:<agentId>:<mainKey>`）。
  - 频道/群组消息使用对话 ID：
    - `agent:<agentId>:msteams:channel:<conversationId>`
    - `agent:<agentId>:msteams:group:<conversationId>`

## 回复样式：线程 vs 帖子

Teams 最近在相同底层数据模型上引入了两种频道 UI 样式：

| 样式 | 描述 | 推荐 `replyStyle` |
|-------|-------------|--------------------------|
| **帖子**（经典） | 消息显示为卡片，线程回复在下方 | `thread`（默认） |
| **线程**（类似 Slack） | 消息线性流动，更像 Slack | `top-level` |

**问题：** Teams API 不公开频道使用的 UI 样式。如果您使用错误的 `replyStyle`：
- `thread` 在线程样式频道中 → 回复尴尬地嵌套
- `top-level` 在帖子样式频道中 → 回复显示为单独的顶级帖子而不是线程内

**解决方案：** 根据频道设置配置 `replyStyle`：

```json
{
  "msteams": {
    "replyStyle": "thread",
    "teams": {
      "19:abc...@thread.tacv2": {
        "channels": {
          "19:xyz...@thread.tacv2": {
            "replyStyle": "top-level"
          }
        }
      }
    }
  }
}
```

## 附件和图像

**当前限制：**
- **私信：** 通过 Teams 机器人文件 API 工作的图像和文件附件。
- **频道/群组：** 附件存储在 M365 存储（SharePoint/OneDrive）中。webhook 负载仅包含 HTML 存根，而非实际文件字节。**需要 Graph API 权限** 下载频道附件。

没有 Graph 权限，带有图像的频道消息将以纯文本形式接收（图像内容对机器人不可访问）。
默认情况下，Moltbot 仅从 Microsoft/Teams 主机名下载媒体。使用 `channels.msteams.mediaAllowHosts` 覆盖（使用 `["*"]` 允许任何主机）。

## 在群组聊天中发送文件

机器人可以通过 FileConsentCard 流程在私信中发送文件（内置）。但是，**在群组聊天/频道中发送文件** 需要额外设置：

| 上下文 | 文件发送方式 | 需要设置 |
|---------|-------------------|--------------|
| **私信** | FileConsentCard → 用户接受 → 机器人上传 | 立即可用 |
| **群组聊天/频道** | 上传到 SharePoint → 分享链接 | 需要 `sharePointSiteId` + Graph 权限 |
| **图像（任何上下文）** | Base64 编码内联 | 立即可用 |

### 为什么群组聊天需要 SharePoint

机器人没有个人 OneDrive 驱动器（`/me/drive` Graph API 端点对应用身份无效）。要在群组聊天/频道中发送文件，机器人上传到 **SharePoint 站点** 并创建共享链接。

### 设置

1. **在 Entra ID（Azure AD）→ 应用注册中添加 Graph API 权限**：
   - `Sites.ReadWrite.All`（应用）- 上传文件到 SharePoint
   - `Chat.Read.All`（应用）- 可选，启用按用户共享链接

2. **为租户授予管理员同意**。

3. **获取您的 SharePoint 站点 ID：**
   ```bash
   # 通过 Graph Explorer 或使用有效令牌的 curl：
   curl -H "Authorization: Bearer $TOKEN" \
     "https://graph.microsoft.com/v1.0/sites/{hostname}:/{site-path}"

   # 示例：对于位于 "contoso.sharepoint.com/sites/BotFiles" 的站点
   curl -H "Authorization: Bearer $TOKEN" \
     "https://graph.microsoft.com/v1.0/sites/contoso.sharepoint.com:/sites/BotFiles"

   # 响应包含："id": "contoso.sharepoint.com,guid1,guid2"
   ```

4. **配置 Moltbot：**
   ```json5
   {
     channels: {
       msteams: {
         // ... 其他配置 ...
         sharePointSiteId: "contoso.sharepoint.com,guid1,guid2"
       }
     }
   }
   ```

### 共享行为

| 权限 | 共享行为 |
|------------|------------------|
| 仅 `Sites.ReadWrite.All` | 组织范围共享链接（组织内任何人都可以访问） |
| `Sites.ReadWrite.All` + `Chat.Read.All` | 按用户共享链接（仅聊天成员可以访问） |

按用户共享更安全，因为只有聊天参与者可以访问文件。如果缺少 `Chat.Read.All` 权限，机器人回退到组织范围共享。

### 回退行为

| 场景 | 结果 |
|----------|--------|
| 群组聊天 + 文件 + 配置了 `sharePointSiteId` | 上传到 SharePoint，发送共享链接 |
| 群组聊天 + 文件 + 无 `sharePointSiteId` | 尝试 OneDrive 上传（可能失败），仅发送文本 |
| 个人聊天 + 文件 | FileConsentCard 流程（无需 SharePoint） |
| 任何上下文 + 图像 | Base64 编码内联（无需 SharePoint） |

### 文件存储位置

上传的文件存储在配置的 SharePoint 站点的默认文档库中的 `/MoltbotShared/` 文件夹中。

## 投票（自适应卡片）
Moltbot 将 Teams 投票作为自适应卡片发送（没有原生 Teams 投票 API）。

- CLI：`moltbot message poll --channel msteams --target conversation:<id> ...`
- 投票由网关在 `~/.clawdbot/msteams-polls.json` 中记录。
- 网关必须保持在线以记录投票。
- 投票尚未自动发布结果摘要（如有需要，请检查存储文件）。

## 自适应卡片（任意）
使用 `message` 工具或 CLI 向 Teams 用户或对话发送任何自适应卡片 JSON。

`card` 参数接受自适应卡片 JSON 对象。当提供 `card` 时，消息文本是可选的。

**代理工具：**
```json
{
  "action": "send",
  "channel": "msteams",
  "target": "user:<id>",
  "card": {
    "type": "AdaptiveCard",
    "version": "1.5",
    "body": [{"type": "TextBlock", "text": "Hello!"}]
  }
}
```

**CLI：**
```bash
moltbot message send --channel msteams \
  --target "conversation:19:abc...@thread.tacv2" \
  --card '{"type":"AdaptiveCard","version":"1.5","body":[{"type":"TextBlock","text":"Hello!"}]}'
```

参见 [自适应卡片文档](https://adaptivecards.io/) 获取卡片模式和示例。有关目标格式的详细信息，请参见下面的 [目标格式](#目标格式)。

## 目标格式

MSTeams 目标使用前缀区分用户和对话：

| 目标类型 | 格式 | 示例 |
|-------------|--------|---------|
| 用户（按 ID） | `user:<aad-object-id>` | `user:40a1a0ed-4ff2-4164-a219-55518990c197` |
| 用户（按名称） | `user:<display-name>` | `user:John Smith`（需要 Graph API） |
| 群组/频道 | `conversation:<conversation-id>` | `conversation:19:abc123...@thread.tacv2` |
| 群组/频道（原始） | `<conversation-id>` | `19:abc123...@thread.tacv2`（如果包含 `@thread`） |

**CLI 示例：**
```bash
# 按 ID 发送给用户
moltbot message send --channel msteams --target "user:40a1a0ed-..." --message "Hello"

# 按显示名称发送给用户（触发 Graph API 查找）
moltbot message send --channel msteams --target "user:John Smith" --message "Hello"

# 发送到群组聊天或频道
moltbot message send --channel msteams --target "conversation:19:abc...@thread.tacv2" --message "Hello"

# 发送自适应卡片到对话
moltbot message send --channel msteams --target "conversation:19:abc...@thread.tacv2" \
  --card '{"type":"AdaptiveCard","version":"1.5","body":[{"type":"TextBlock","text":"Hello"}]}'
```

**代理工具示例：**
```json
{
  "action": "send",
  "channel": "msteams",
  "target": "user:John Smith",
  "message": "Hello!"
}
```

```json
{
  "action": "send",
  "channel": "msteams",
  "target": "conversation:19:abc...@thread.tacv2",
  "card": {"type": "AdaptiveCard", "version": "1.5", "body": [{"type": "TextBlock", "text": "Hello"}]}
}
```

注意：没有 `user:` 前缀，名称默认解析为群组/团队。在按显示名称定位人员时始终使用 `user:`。

## 主动消息
- 主动消息仅在用户交互**之后**可能，因为我们在此时存储对话引用。
- 参见 `/gateway/configuration` 了解 `dmPolicy` 和允许列表门控。

## 团队和频道 ID（常见错误）

Teams URL 中的 `groupId` 查询参数**不是**用于配置的团队 ID。从 URL 路径提取 ID：

**团队 URL：**
```
https://teams.microsoft.com/l/team/19%3ABk4j...%40thread.tacv2/conversations?groupId=...
                                    └────────────────────────────┘
                                    团队 ID（URL 解码这个）
```

**频道 URL：**
```
https://teams.microsoft.com/l/channel/19%3A15bc...%40thread.tacv2/ChannelName?groupId=...
                                      └─────────────────────────┘
                                      频道 ID（URL 解码这个）
```

**对于配置：**
- 团队 ID = `/team/` 后的路径段（URL 解码，例如 `19:Bk4j...@thread.tacv2`）
- 频道 ID = `/channel/` 后的路径段（URL 解码）
- **忽略** `groupId` 查询参数

## 私有频道

机器人在私有频道中支持有限：

| 功能 | 标准频道 | 私有频道 |
|---------|-------------------|------------------|
| 机器人安装 | 是 | 有限 |
| 实时消息（webhook） | 是 | 可能不工作 |
| RSC 权限 | 是 | 可能行为不同 |
| @提及 | 是 | 如果机器人可访问 |
| Graph API 历史 | 是 | 是（有权限） |

**如果私有频道不工作的工作区：**
1. 使用标准频道进行机器人交互
2. 使用私信 - 用户总是可以直接给机器人发消息
3. 使用 Graph API 进行历史访问（需要 `ChannelMessage.Read.All`）

## 故障排除

### 常见问题

- **频道中图像不显示：** Graph 权限或管理员同意缺失。重新安装 Teams 应用并完全退出/重新打开 Teams。
- **频道中无响应：** 默认需要提及；设置 `channels.msteams.requireMention=false` 或按团队/频道配置。
- **版本不匹配（Teams 仍显示旧清单）：** 删除 + 重新添加应用并完全退出 Teams 以刷新。
- **来自 webhook 的 401 未授权：** 手动测试时出现（没有 Azure JWT）- 表示端点可达但身份验证失败。使用 Azure Web Chat 适当测试。

### 清单上传错误

- **"图标文件不能为空"：** 清单引用的图标文件为 0 字节。创建有效的 PNG 图标（32x32 用于 `outline.png`，192x192 用于 `color.png`）。
- **"webApplicationInfo.Id 已在使用中"：** 应用仍在另一个团队/聊天中安装。查找并卸载它，或等待 5-10 分钟传播。
- **上传时"出现问题"：** 通过 https://admin.teams.microsoft.com 上传，打开浏览器开发工具（F12）→ 网络选项卡，检查响应体的实际错误。
- **侧载失败：** 尝试"上传应用到您的组织应用目录"而不是"上传自定义应用" - 这通常绕过侧载限制。

### RSC 权限不工作

1. 验证 `webApplicationInfo.id` 与您的机器人应用 ID 完全匹配
2. 重新上传应用并在团队/聊天中重新安装
3. 检查您的组织管理员是否阻止了 RSC 权限
4. 确认您使用正确的范围：团队的 `ChannelMessage.Read.Group`，群组聊天的 `ChatMessage.Read.Chat`

## 参考资料
- [创建 Azure 机器人](https://learn.microsoft.com/en-us/azure/bot-service/bot-service-quickstart-registration) - Azure 机器人设置指南
- [Teams 开发者门户](https://dev.teams.microsoft.com/apps) - 创建/管理 Teams 应用
- [Teams 应用清单架构](https://learn.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema)
- [使用 RSC 接收频道消息](https://learn.microsoft.com/en-us/microsoftteams/platform/bots/how-to/conversations/channel-messages-with-rsc)
- [RSC 权限参考](https://learn.microsoft.com/en-us/microsoftteams/platform/graph-api/rsc/resource-specific-consent)
- [Teams 机器人文件处理](https://learn.microsoft.com/en-us/microsoftteams/platform/bots/how-to/bots-filesv4)（频道/群组需要 Graph）
- [主动消息](https://learn.microsoft.com/en-us/microsoftteams/platform/bots/how-to/conversations/send-proactive-messages)