---
summary: "通过 gogcli 将 Gmail Pub/Sub 推送连接到 Moltbot 网络钩子"
read_when:
  - 将 Gmail 收件箱触发器连接到 Moltbot
  - 为代理唤醒设置 Pub/Sub 推送
---

# Gmail Pub/Sub -> Moltbot

目标：Gmail 监视 -> Pub/Sub 推送 -> `gog gmail watch serve` -> Moltbot 网络钩子。

## 前提条件

- 已安装并登录 `gcloud`（[安装指南](https://docs.cloud.google.com/sdk/docs/install-sdk)）。
- 已安装并授权 `gog` (gogcli) 用于 Gmail 账户（[gogcli.sh](https://gogcli.sh/)）。
- 已启用 Moltbot 钩子（参见 [网络钩子](/automation/webhook)）。
- 已登录 `tailscale`（[tailscale.com](https://tailscale.com/)）。支持的设置使用 Tailscale Funnel 作为公共 HTTPS 端点。
  其他隧道服务可以工作，但需要 DIY/不支持，需要手动连线。
  目前，我们只支持 Tailscale。

示例钩子配置（启用 Gmail 预设映射）：

```json5
{
  hooks: {
    enabled: true,
    token: "CLAWDBOT_HOOK_TOKEN",
    path: "/hooks",
    presets: ["gmail"]
  }
}
```

要将 Gmail 摘要传递到聊天界面，请使用设置 `deliver` + 可选的 `channel`/`to` 的映射来覆盖预设：

```json5
{
  hooks: {
    enabled: true,
    token: "CLAWDBOT_HOOK_TOKEN",
    presets: ["gmail"],
    mappings: [
      {
        match: { path: "gmail" },
        action: "agent",
        wakeMode: "now",
        name: "Gmail",
        sessionKey: "hook:gmail:{{messages[0].id}}",
        messageTemplate:
          "来自 {{messages[0].from}} 的新邮件\n主题: {{messages[0].subject}}\n{{messages[0].snippet}}\n{{messages[0].body}}",
        model: "openai/gpt-5.2-mini",
        deliver: true,
        channel: "last"
        // to: "+15551234567"
      }
    ]
  }
}
```

如果想要固定频道，请设置 `channel` + `to`。否则 `channel: "last"`
使用最后的传递路径（回退到 WhatsApp）。

要为 Gmail 运行强制使用更便宜的模型，请在映射中设置 `model`
（`provider/model` 或别名）。如果您强制执行 `agents.defaults.models`，请在那里包含它。

要专门为 Gmail 钩子设置默认模型和思考级别，请在配置中添加
`hooks.gmail.model` / `hooks.gmail.thinking`：

```json5
{
  hooks: {
    gmail: {
      model: "openrouter/meta-llama/llama-3.3-70b-instruct:free",
      thinking: "off"
    }
  }
}
```

注意事项：
- 映射中的每个钩子 `model`/`thinking` 仍然会覆盖这些默认值。
- 回退顺序：`hooks.gmail.model` → `agents.defaults.model.fallbacks` → 主要（认证/速率限制/超时）。
- 如果设置了 `agents.defaults.models`，Gmail 模型必须在允许列表中。
- Gmail 钩子内容默认用外部内容安全边界包装。
  要禁用（危险），请设置 `hooks.gmail.allowUnsafeExternalContent: true`。

要进一步自定义有效载荷处理，请添加 `hooks.mappings` 或在
`hooks.transformsDir` 下添加 JS/TS 转换模块
（参见 [网络钩子](/automation/webhook)）。

## 向导（推荐）

使用 Moltbot 助手连接所有内容（在 macOS 上通过 brew 安装依赖项）：

```bash
moltbot webhooks gmail setup \
  --account moltbot@gmail.com
```

默认值：
- 使用 Tailscale Funnel 作为公共推送端点。
- 为 `moltbot webhooks gmail run` 写入 `hooks.gmail` 配置。
- 启用 Gmail 钩子预设（`hooks.presets: ["gmail"]`）。

路径说明：当启用 `tailscale.mode` 时，Moltbot 自动设置
`hooks.gmail.serve.path` 为 `/` 并保持公共路径在
`hooks.gmail.tailscale.path`（默认 `/gmail-pubsub`），因为 Tailscale
在代理之前删除了设置路径前缀。
如果您需要后端接收带前缀的路径，请设置
`hooks.gmail.tailscale.target`（或 `--tailscale-target`）为完整 URL，如
`http://127.0.0.1:8788/gmail-pubsub` 并匹配 `hooks.gmail.serve.path`。

想要自定义端点？使用 `--push-endpoint <url>` 或 `--tailscale off`。

平台说明：在 macOS 上，向导通过 Homebrew 安装 `gcloud`、`gogcli` 和 `tailscale`；
在 Linux 上请先手动安装它们。

网关自动启动（推荐）：
- 当 `hooks.enabled=true` 且设置了 `hooks.gmail.account` 时，网关在启动时
  启动 `gog gmail watch serve` 并自动续订监视。
- 设置 `CLAWDBOT_SKIP_GMAIL_WATCHER=1` 以选择退出（如果您自己运行守护进程则很有用）。
- 不要在同一时间运行手动守护进程，否则会出现
  `listen tcp 127.0.0.1:8788: bind: address already in use`。

手动守护进程（启动 `gog gmail watch serve` + 自动续订）：

```bash
moltbot webhooks gmail run
```

## 一次性设置

1) 选择 GCP 项目 **该拥有由 `gog` 使用的 OAuth 客户端**。

```bash
gcloud auth login
gcloud config set project <project-id>
```

注意：Gmail 监视要求 Pub/Sub 主题与 OAuth 客户端位于同一项目中。

2) 启用 API：

```bash
gcloud services enable gmail.googleapis.com pubsub.googleapis.com
```

3) 创建一个主题：

```bash
gcloud pubsub topics create gog-gmail-watch
```

4) 允许 Gmail 推送发布：

```bash
gcloud pubsub topics add-iam-policy-binding gog-gmail-watch \
  --member=serviceAccount:gmail-api-push@system.gserviceaccount.com \
  --role=roles/pubsub.publisher
```

## 开始监视

```bash
gog gmail watch start \
  --account moltbot@gmail.com \
  --label INBOX \
  --topic projects/<project-id>/topics/gog-gmail-watch
```

保存输出中的 `history_id`（用于调试）。

## 运行推送处理器

本地示例（共享令牌认证）：

```bash
gog gmail watch serve \
  --account moltbot@gmail.com \
  --bind 127.0.0.1 \
  --port 8788 \
  --path /gmail-pubsub \
  --token <shared> \
  --hook-url http://127.0.0.1:18789/hooks/gmail \
  --hook-token CLAWDBOT_HOOK_TOKEN \
  --include-body \
  --max-bytes 20000
```

注意事项：
- `--token` 保护推送端点（`x-gog-token` 或 `?token=`）。
- `--hook-url` 指向 Moltbot `/hooks/gmail`（映射；隔离运行 + 摘要到主服务器）。
- `--include-body` 和 `--max-bytes` 控制发送到 Moltbot 的正文片段。

推荐：`moltbot webhooks gmail run` 包装相同的流程并自动续订监视。

## 公开端处理器（高级，不支持）

如果您需要非 Tailscale 隧道，请手动连接并在推送
订阅中使用公共 URL（不支持，无保护措施）：

```bash
cloudflared tunnel --url http://127.0.0.1:8788 --no-autoupdate
```

使用生成的 URL 作为推送端点：

```bash
gcloud pubsub subscriptions create gog-gmail-watch-push \
  --topic gog-gmail-watch \
  --push-endpoint "https://<public-url>/gmail-pubsub?token=<shared>"
```

生产环境：使用稳定的 HTTPS 端点并配置 Pub/Sub OIDC JWT，然后运行：

```bash
gog gmail watch serve --verify-oidc --oidc-email <svc@...>
```

## 测试

向监视的收件箱发送消息：

```bash
gog gmail send \
  --account moltbot@gmail.com \
  --to moltbot@gmail.com \
  --subject "watch test" \
  --body "ping"
```

检查监视状态和历史记录：

```bash
gog gmail watch status --account moltbot@gmail.com
gog gmail history --account moltbot@gmail.com --since <historyId>
```

## 故障排除

- `Invalid topicName`: 项目不匹配（主题不在 OAuth 客户端项目中）。
- `User not authorized`: 主题上缺少 `roles/pubsub.publisher`。
- 空消息：Gmail 推送仅提供 `historyId`；通过 `gog gmail history` 获取。

## 清理

```bash
gog gmail watch stop --account moltbot@gmail.com
gcloud pubsub subscriptions delete gog-gmail-watch-push
gcloud pubsub topics delete gog-gmail-watch
```