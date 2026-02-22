---
summary: "运行 Moltbot 作为个人助手的端到端指南，包含安全警告"
read_when:
  - 为新助手实例办理入职手续时
  - 审查安全/权限影响时
---
# 使用 Moltbot 构建个人助手 (Clawd风格)

Moltbot 是 **Pi** 代理的 WhatsApp + Telegram + Discord + iMessage 网关。插件添加了 Mattermost。本指南是"个人助手"设置：一个专用的 WhatsApp 号码，行为类似于您的常开代理。

## ⚠️ 安全第一

您正在将代理置于以下位置：
- 在您的机器上运行命令（取决于您的 Pi 工具设置）
- 在工作区中读/写文件
- 通过 WhatsApp/Telegram/Discord/Mattermost（插件）发送消息

保守开始：
- 始终设置 `channels.whatsapp.allowFrom`（永远不要在您的个人 Mac 上运行面向世界的开放服务）。
- 为助手使用专用 WhatsApp 号码。
- 心跳现在默认每 30 分钟一次。在您信任设置之前禁用，方法是设置 `agents.defaults.heartbeat.every: "0m"`。

## 先决条件

- Node **22+**
- Moltbot 可在 PATH 中使用（推荐：全局安装）
- 用于助手的第二个电话号码（SIM/eSIM/预付费）

```bash
npm install -g moltbot@latest
# 或：pnpm add -g moltbot@latest
```

从源码（开发）：

```bash
git clone https://github.com/moltbot/moltbot.git
cd moltbot
pnpm install
pnpm ui:build # 首次运行时自动安装 UI 依赖项
pnpm build
pnpm link --global
```

## 两手机设置（推荐）

您想要这样的设置：

```
您的手机（个人）              第二部手机（助手）
┌─────────────────┐           ┌─────────────────┐
│  您的 WhatsApp  │  ──────▶  │  助手 WA        │
│  +1-555-YOU     │  消息     │  +1-555-CLAWD   │
└─────────────────┘           └────────┬────────┘
                                       │ 通过 QR 链接
                                       ▼
                              ┌─────────────────┐
                              │  您的 Mac       │
                              │  (moltbot)      │
                              │    Pi 代理      │
                              └─────────────────┘
```

如果您将个人 WhatsApp 与 Moltbot 链接，每条发给您的消息都会变成"代理输入"。这很少是您想要的。

## 5 分钟快速开始

1) 配对 WhatsApp Web（显示 QR；用助手手机扫描）：

```bash
moltbot channels login
```

2) 启动网关（让它保持运行）：

```bash
moltbot gateway --port 18789
```

3) 在 `~/.clawdbot/moltbot.json` 中放置最小配置：

```json5
{
  channels: { whatsapp: { allowFrom: ["+15555550123"] } }
}
```

现在从您的白名单手机向助手号码发送消息。

入职完成后，我们会自动打开带有网关令牌的仪表板并打印令牌化链接。要稍后重新打开：`moltbot dashboard`。

## 为代理提供工作区 (AGENTS)

Clawd 从其工作区目录读取操作指令和"内存"。

默认情况下，Moltbot 使用 `~/clawd` 作为代理工作区，并会在设置/首次代理运行时自动创建它（加上初始 `AGENTS.md`、`SOUL.md`、`TOOLS.md`、`IDENTITY.md`、`USER.md`）。`BOOTSTRAP.md` 仅在工作区全新时创建（删除后不应再出现）。

提示：像对待 Clawd 的"内存"一样对待这个文件夹，并将其设为 git 仓库（理想情况下是私有的），这样您的 `AGENTS.md` + 内存文件就会被备份。如果安装了 git，全新的工作区会自动初始化。

```bash
moltbot setup
```

完整工作区布局 + 备份指南：[代理工作区](/concepts/agent-workspace)
内存工作流：[内存](/concepts/memory)

可选：使用 `agents.defaults.workspace` 选择不同的工作区（支持 `~`）。

```json5
{
  agent: {
    workspace: "~/clawd"
  }
}
```

如果您已经从仓库提供自己的工作区文件，可以完全禁用引导文件创建：

```json5
{
  agent: {
    skipBootstrap: true
  }
}
```

## 将其转换为"助手"的配置

Moltbot 默认为良好的助手设置，但通常您需要调整：
- `SOUL.md` 中的个性/指令
- 思考默认值（如果需要）
- 心跳（一旦您信任它）

示例：

```json5
{
  logging: { level: "info" },
  agent: {
    model: "anthropic/claude-opus-4-5",
    workspace: "~/clawd",
    thinkingDefault: "high",
    timeoutSeconds: 1800,
    // 从 0 开始；稍后启用。
    heartbeat: { every: "0m" }
  },
  channels: {
    whatsapp: {
      allowFrom: ["+15555550123"],
      groups: {
        "*": { requireMention: true }
      }
    }
  },
  routing: {
    groupChat: {
      mentionPatterns: ["@clawd", "clawd"]
    }
  },
  session: {
    scope: "per-sender",
    resetTriggers: ["/new", "/reset"],
    reset: {
      mode: "daily",
      atHour: 4,
      idleMinutes: 10080
    }
  }
}
```

## 会话和内存

- 会话文件：`~/.clawdbot/agents/<agentId>/sessions/{{SessionId}}.jsonl`
- 会话元数据（令牌使用情况、最后路由等）：`~/.clawdbot/agents/<agentId>/sessions/sessions.json`（传统：`~/.clawdbot/sessions/sessions.json`）
- `/new` 或 `/reset` 为此聊天启动一个新会话（可通过 `resetTriggers` 配置）。如果单独发送，代理会回复简短的问候以确认重置。
- `/compact [instructions]` 压缩会话上下文并报告剩余的上下文预算。

## 心跳（主动模式）

默认情况下，Moltbot 每 30 分钟运行一次心跳，提示：
`如果存在 HEARTBEAT.md 则读取它（工作区上下文）。严格遵循。不要从之前的聊天中推断或重复旧任务。如果没有什么需要注意的，请回复 HEARTBEAT_OK。`
设置 `agents.defaults.heartbeat.every: "0m"` 以禁用。

- 如果 `HEARTBEAT.md` 存在但实际上是空的（只有空行和 markdown 标题如 `# Heading`），Moltbot 会跳过心跳运行以节省 API 调用。
- 如果文件丢失，心跳仍然运行，模型决定做什么。
- 如果代理回复 `HEARTBEAT_OK`（可选带短填充；参见 `agents.defaults.heartbeat.ackMaxChars`），Moltbot 会抑制该心跳的外发交付。
- 心跳运行完整的代理回合——较短的间隔会消耗更多令牌。

```json5
{
  agent: {
    heartbeat: { every: "30m" }
  }
}
```

## 媒体进出

入站附件（图像/音频/文档）可以通过模板显示给您的命令：
- `{{MediaPath}}`（本地临时文件路径）
- `{{MediaUrl}}`（伪 URL）
- `{{Transcript}}`（如果启用了音频转录）

来自代理的出站附件：在自己的行上包含 `MEDIA:<path-or-url>`（无空格）。示例：

```
这是截图。
MEDIA:/tmp/screenshot.png
```

Moltbot 提取这些并将其作为媒体与文本一起发送。

## 操作清单

```bash
moltbot status          # 本地状态（凭据、会话、排队事件）
moltbot status --all    # 完整诊断（只读，可粘贴）
moltbot status --deep   # 添加网关健康探针（Telegram + Discord）
moltbot health --json   # 网关健康快照（WS）
```

日志位于 `/tmp/moltbot/` 下（默认：`moltbot-YYYY-MM-DD.log`）。

## 下一步

- WebChat：[WebChat](/web/webchat)
- 网关操作：[网关操作手册](/gateway)
- Cron + 唤醒：[Cron 作业](/automation/cron-jobs)
- macOS 菜单栏伴侣：[Moltbot macOS 应用](/platforms/macos)
- iOS 节点应用：[iOS 应用](/platforms/ios)
- Android 节点应用：[Android 应用](/platforms/android)
- Windows 状态：[Windows (WSL2)](/platforms/windows)
- Linux 状态：[Linux 应用](/platforms/linux)
- 安全性：[安全性](/gateway/security)
