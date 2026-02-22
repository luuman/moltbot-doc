---
summary: "Zalo 机器人支持状态、功能和配置"
read_when:
  - 处理 Zalo 功能或 webhooks
---
# Zalo（机器人 API）

状态：实验性。仅支持直接消息；根据 Zalo 文档，群组功能即将推出。

## 需要插件
Zalo 作为插件提供，未与核心安装捆绑。
- 通过 CLI 安装：`moltbot plugins install @moltbot/zalo`
- 或在入门过程中选择 **Zalo** 并确认安装提示
- 详情：[插件](/plugin)

## 快速设置（初学者）
1) 安装 Zalo 插件：
   - 从源代码检出：`moltbot plugins install ./extensions/zalo`
   - 从 npm（如果已发布）：`moltbot plugins install @moltbot/zalo`
   - 或在入门过程中选择 **Zalo** 并确认安装提示
2) 设置令牌：
   - 环境变量：`ZALO_BOT_TOKEN=...`
   - 或配置：`channels.zalo.botToken: "..."`。
3) 重启网关（或完成入门）。
4) 私信访问默认为配对；在首次联系时批准配对码。

最小配置：
```json5
{
  channels: {
    zalo: {
      enabled: true,
      botToken: "12345689:abc-xyz",
      dmPolicy: "pairing"
    }
  }
}
```

## 它是什么
Zalo 是一款专注于越南的消息应用；其机器人 API 允许网关运行用于 1:1 对话的机器人。
如果您希望将路由确定性地返回到 Zalo，它非常适合支持或通知场景。
- 由网关拥有的 Zalo 机器人 API 通道。
- 确定性路由：回复返回到 Zalo；模型永远不会选择通道。
- 私信共享代理的主会话。
- 群组尚未支持（Zalo 文档说明"即将推出"）。

## 设置（快速路径）

### 1) 创建机器人令牌（Zalo 机器人平台）
1) 前往 **https://bot.zaloplatforms.com** 并登录。
2) 创建一个新机器人并配置其设置。
3) 复制机器人令牌（格式：`12345689:abc-xyz`）。

### 2) 配置令牌（环境变量或配置）
示例：

```json5
{
  channels: {
    zalo: {
      enabled: true,
      botToken: "12345689:abc-xyz",
      dmPolicy: "pairing"
    }
  }
}
```

环境变量选项：`ZALO_BOT_TOKEN=...`（仅适用于默认账户）。

多账户支持：使用 `channels.zalo.accounts` 配置每个账户的令牌和可选的 `name`。

3) 重启网关。当令牌解析（环境变量或配置）时，Zalo 启动。
4) 私信访问默认为配对。当机器人首次被联系时批准代码。

## 工作原理（行为）
- 入站消息被规范化为带有媒体占位符的共享通道信封。
- 回复始终路由回相同的 Zalo 聊天。
- 默认为长轮询；通过 `channels.zalo.webhookUrl` 可用 webhook 模式。

## 限制
- 出站文本分割为 2000 个字符（Zalo API 限制）。
- 媒体下载/上传受 `channels.zalo.mediaMaxMb`（默认 5）限制。
- 由于 2000 字符限制使流式传输不太有用，默认阻止流式传输。

## 访问控制（私信）

### 私信访问
- 默认：`channels.zalo.dmPolicy = "pairing"`。未知发送者收到配对码；在批准之前忽略消息（代码在 1 小时后过期）。
- 批准方式：
  - `moltbot pairing list zalo`
  - `moltbot pairing approve zalo <CODE>`
- 配对是默认的令牌交换。详情：[配对](/start/pairing)
- `channels.zalo.allowFrom` 接受数字用户 ID（无用户名查找可用）。

## 长轮询 vs webhook
- 默认：长轮询（不需要公共 URL）。
- Webhook 模式：设置 `channels.zalo.webhookUrl` 和 `channels.zalo.webhookSecret`。
  - Webhook 密钥必须为 8-256 个字符。
  - Webhook URL 必须使用 HTTPS。
  - Zalo 发送带有 `X-Bot-Api-Secret-Token` 标头的事件以供验证。
  - 网关 HTTP 在 `channels.zalo.webhookPath`（默认为 webhook URL 路径）处理 webhook 请求。

**注意：** 根据 Zalo API 文档，getUpdates（轮询）和 webhook 是互斥的。

## 支持的消息类型
- **文本消息**：完全支持，支持 2000 字符分割。
- **图像消息**：下载和处理入站图像；通过 `sendPhoto` 发送图像。
- **贴纸**：记录但未完全处理（无代理响应）。
- **不支持的类型**：记录（例如，来自受保护用户的邮件）。

## 功能
| 功能 | 状态 |
|---------|--------|
| 直接消息 | ✅ 支持 |
| 群组 | ❌ 即将推出（根据 Zalo 文档） |
| 媒体（图像） | ✅ 支持 |
| 反应 | ❌ 不支持 |
| 线程 | ❌ 不支持 |
| 投票 | ❌ 不支持 |
| 原生命令 | ❌ 不支持 |
| 流式传输 | ⚠️ 已阻止（2000 字符限制） |

## 交付目标（CLI/cron）
- 使用聊天 ID 作为目标。
- 示例：`moltbot message send --channel zalo --target 123456789 --message "hi"`。

## 故障排除

**机器人不响应：**
- 检查令牌是否有效：`moltbot channels status --probe`
- 验证发送者是否已批准（配对或 allowFrom）
- 检查网关日志：`moltbot logs --follow`

**Webhook 未接收事件：**
- 确保 webhook URL 使用 HTTPS
- 验证密钥为 8-256 个字符
- 确认网关 HTTP 端点在配置的路径上可访问
- 检查 getUpdates 轮询是否未运行（它们是互斥的）

## 配置参考（Zalo）
完整配置：[配置](/gateway/configuration)

提供者选项：
- `channels.zalo.enabled`：启用/禁用通道启动。
- `channels.zalo.botToken`：来自 Zalo 机器人平台的机器人令牌。
- `channels.zalo.tokenFile`：从文件路径读取令牌。
- `channels.zalo.dmPolicy`：`pairing | allowlist | open | disabled`（默认：配对）。
- `channels.zalo.allowFrom`：私信允许列表（用户 ID）。`open` 需要 `"*"`。向导将询问数字 ID。
- `channels.zalo.mediaMaxMb`：入站/出站媒体上限（MB，默认 5）。
- `channels.zalo.webhookUrl`：启用 webhook 模式（需要 HTTPS）。
- `channels.zalo.webhookSecret`：webhook 密钥（8-256 个字符）。
- `channels.zalo.webhookPath`：网关 HTTP 服务器上的 webhook 路径。
- `channels.zalo.proxy`：API 请求的代理 URL。

多账户选项：
- `channels.zalo.accounts.<id>.botToken`：按账户令牌。
- `channels.zalo.accounts.<id>.tokenFile`：按账户令牌文件。
- `channels.zalo.accounts.<id>.name`：显示名称。
- `channels.zalo.accounts.<id>.enabled`：启用/禁用账户。
- `channels.zalo.accounts.<id>.dmPolicy`：按账户私信策略。
- `channels.zalo.accounts.<id>.allowFrom`：按账户允许列表。
- `channels.zalo.accounts.<id>.webhookUrl`：按账户 webhook URL。
- `channels.zalo.accounts.<id>.webhookSecret`：按账户 webhook 密钥。
- `channels.zalo.accounts.<id>.webhookPath`：按账户 webhook 路径。
- `channels.zalo.accounts.<id>.proxy`：按账户代理 URL。