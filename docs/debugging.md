---
summary: "调试工具：监视模式、原始模型流和推理泄漏追踪"
read_when:
  - 您需要检查原始模型输出中的推理泄漏
  - 您想在迭代时以监视模式运行网关
  - 您需要可重复的调试工作流程
---

# 调试

本页面涵盖了流输出的调试助手，特别是当
提供者将推理混入普通文本时。

## 运行时调试覆盖

在聊天中使用 `/debug` 设置 **仅运行时** 配置覆盖（内存，非磁盘）。
默认情况下禁用 `/debug`；使用 `commands.debug: true` 启用。
当您需要切换模糊设置而无需编辑 `moltbot.json` 时，这很方便。

示例：

```
/debug show
/debug set messages.responsePrefix="[moltbot]"
/debug unset messages.responsePrefix
/debug reset
```

`/debug reset` 清除所有覆盖并返回到磁盘上的配置。

## 网关监视模式

为了快速迭代，在文件监视器下运行网关：

```bash
pnpm gateway:watch --force
```

这映射到：

```bash
tsx watch src/entry.ts gateway --force
```

在 `gateway:watch` 之后添加任何网关 CLI 标志，它们将在
每次重启时传递。

## 开发配置文件 + 开发网关 (--dev)

使用开发配置文件隔离状态并启动安全、可丢弃的设置进行
调试。有 **两个** `--dev` 标志：

- **全局 `--dev`（配置文件）：** 将状态隔离在 `~/.clawdbot-dev` 下并
  将网关端口默认为 `19001`（派生端口随之移动）。
- **`gateway --dev`：告诉网关在缺少时自动创建默认配置 +
  工作空间**（并跳过 BOOTSTRAP.md）。

推荐流程（开发配置文件 + 开发引导）：

```bash
pnpm gateway:dev
CLAWDBOT_PROFILE=dev moltbot tui
```

如果您还没有全局安装，请通过 `pnpm moltbot ...` 运行 CLI。

这会做什么：

1) **配置文件隔离**（全局 `--dev`）
   - `CLAWDBOT_PROFILE=dev`
   - `CLAWDBOT_STATE_DIR=~/.clawdbot-dev`
   - `CLAWDBOT_CONFIG_PATH=~/.clawdbot-dev/moltbot.json`
   - `CLAWDBOT_GATEWAY_PORT=19001`（浏览器/画布相应移动）

2) **开发引导**（`gateway --dev`）
   - 如果缺失则写入最小配置（`gateway.mode=local`，绑定回环）。
   - 将 `agent.workspace` 设置为开发工作空间。
   - 设置 `agent.skipBootstrap=true`（无 BOOTSTRAP.md）。
   - 如果缺失则播种工作空间文件：
     `AGENTS.md`、`SOUL.md`、`TOOLS.md`、`IDENTITY.md`、`USER.md`、`HEARTBEAT.md`。
   - 默认标识：**C3‑PO**（协议机器人）。
   - 在开发模式下跳过频道提供者（`CLAWDBOT_SKIP_CHANNELS=1`）。

重置流程（全新开始）：

```bash
pnpm gateway:dev:reset
```

注意：`--dev` 是一个 **全局** 配置文件标志，会被一些运行器吃掉。
如果您需要明确说明，请使用环境变量形式：

```bash
CLAWDBOT_PROFILE=dev moltbot gateway --dev --reset
```

`--reset` 擦除配置、凭证、会话和开发工作空间（使用
`trash`，不是 `rm`），然后重新创建默认开发设置。

提示：如果非开发网关已在运行（launchd/systemd），请先停止它：

```bash
moltbot gateway stop
```

## 原始流日志记录（Moltbot）

Moltbot 可以在任何过滤/格式化之前记录 **原始助手流**。
这是查看推理是否作为纯文本增量到达的最佳方式
（或者作为单独的思考块）。

通过 CLI 启用它：

```bash
pnpm gateway:watch --force --raw-stream
```

可选路径覆盖：

```bash
pnpm gateway:watch --force --raw-stream --raw-stream-path ~/.clawdbot/logs/raw-stream.jsonl
```

等效环境变量：

```bash
CLAWDBOT_RAW_STREAM=1
CLAWDBOT_RAW_STREAM_PATH=~/.clawdbot/logs/raw-stream.jsonl
```

默认文件：

`~/.clawdbot/logs/raw-stream.jsonl`

## 原始块日志记录（pi-mono）

要捕获 **原始 OpenAI 兼容块** 在解析为块之前，
pi-mono 暴露了一个单独的日志记录器：

```bash
PI_RAW_STREAM=1
```

可选路径：

```bash
PI_RAW_STREAM_PATH=~/.pi-mono/logs/raw-openai-completions.jsonl
```

默认文件：

`~/.pi-mono/logs/raw-openai-completions.jsonl`

> 注意：这只由使用 pi-mono 的进程发出
> `openai-completions` 提供者。

## 安全注意事项

- 原始流日志可能包括完整提示、工具输出和用户数据。
- 将日志保存在本地并在调试后删除它们。
- 如果您分享日志，请先清除密钥和 PII。