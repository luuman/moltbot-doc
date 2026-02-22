---
summary: "子代理：生成孤立的代理运行并将结果公告回请求者聊天"
read_when:
  - 您希望通过代理进行后台/并行工作
  - 您正在更改 sessions_spawn 或子代理工具策略
---

# 子代理

子代理是从现有代理运行生成的后台代理运行。它们在自己的会话中运行（`agent:<agentId>:subagent:<uuid>`），完成后，**公告**他们的结果回请求者聊天频道。

## 斜杠命令

使用 `/subagents` 检查或控制 **当前会话** 的子代理运行：
- `/subagents list`
- `/subagents stop <id|#|all>`
- `/subagents log <id|#> [limit] [tools]`
- `/subagents info <id|#>`
- `/subagents send <id|#> <message>`

`/subagents info` 显示运行元数据（状态、时间戳、会话 ID、转录路径、清理）。

主要目标：
- 并行化"研究/长期任务/慢速工具"工作而不阻塞主运行。
- 默认保持子代理隔离（会话分离+可选沙箱）。
- 保持工具表面难以滥用：子代理默认**不**获得会话工具。
- 避免嵌套扇出：子代理不能生成子代理。

成本说明：每个子代理都有其**自己**的上下文和令牌使用。对于繁重或重复
任务，为子代理设置更便宜的模型并保持您的主代理在高质量模型上。
您可以通过 `agents.defaults.subagents.model` 或按代理覆盖来配置。

## 工具

使用 `sessions_spawn`：
- 启动子代理运行（`deliver: false`，全局通道：`subagent`）
- 然后运行公告步骤并将公告回复发布到请求者聊天频道
- 默认模型：继承调用者，除非您设置 `agents.defaults.subagents.model`（或按代理 `agents.list[].subagents.model`）；显式 `sessions_spawn.model` 仍然胜出。

工具参数：
- `task`（必需）
- `label?`（可选）
- `agentId?`（可选；如果允许，在另一个代理 ID 下生成）
- `model?`（可选；覆盖子代理模型；无效值被跳过，子代理在默认模型上运行并在工具结果中显示警告）
- `thinking?`（可选；覆盖子代理运行的思维级别）
- `runTimeoutSeconds?`（默认 `0`；设置时，子代理运行在 N 秒后中止）
- `cleanup?`（`delete|keep`，默认 `keep`）

允许列表：
- `agents.list[].subagents.allowAgents`：可通过 `agentId` 目标的代理 ID 列表（`["*"]` 表示允许任何）。默认：仅请求者代理。

发现：
- 使用 `agents_list` 查看当前允许用于 `sessions_spawn` 的代理 ID。

自动归档：
- 子代理会话在 `agents.defaults.subagents.archiveAfterMinutes` 后自动归档（默认：60）。
- 归档使用 `sessions.delete` 并将转录重命名为 `*.deleted.<timestamp>`（相同文件夹）。
- `cleanup: "delete"` 在公告后立即归档（仍通过重命名保留转录）。
- 自动归档是尽力而为；如果网关重启，待处理的计时器会丢失。
- `runTimeoutSeconds` **不** 自动归档；它只停止运行。会话保持直到自动归档。

## 认证

子代理认证通过 **代理 ID** 解析，而不是通过会话类型：
- 子代理会话键是 `agent:<agentId>:subagent:<uuid>`。
- 认证存储从该代理的 `agentDir` 加载。
- 主代理的认证配置文件作为 **后备** 合并；代理配置文件在冲突时覆盖主配置文件。

注意：合并是累加的，所以主配置文件始终可作为后备。每个代理的完全隔离认证尚不支持。

## 公告

子代理通过公告步骤报告：
- 公告步骤在子代理会话内运行（不是请求者会话）。
- 如果子代理确切回复 `ANNOUNCE_SKIP`，则不发布任何内容。
- 否则公告回复通过后续 `agent` 调用（`deliver=true`）发布到请求者聊天频道。
- 公告回复在可用时保留线程/主题路由（Slack 线程、Telegram 主题、Matrix 线程）。
- 公告消息被规范化为稳定模板：
  - `Status:` 来自运行结果（`success`、`error`、`timeout` 或 `unknown`）。
  - `Result:` 来自公告步骤的摘要内容（如果缺失则为 `(not available)`）。
  - `Notes:` 错误详情和其他有用上下文。
- `Status` 不从模型输出推断；它来自运行时结果信号。

公告载荷在末尾包含统计行（即使包装时）：
- 运行时（例如，`runtime 5m12s`）
- 令牌使用（输入/输出/总计）
- 配置模型定价时的估计成本（`models.providers.*.models[].cost`）
- `sessionKey`、`sessionId` 和转录路径（所以主代理可以通过 `sessions_history` 获取历史或检查磁盘上的文件）

## 工具策略（子代理工具）

默认情况下，子代理获得 **除会话工具外的所有工具**：
- `sessions_list`
- `sessions_history`
- `sessions_send`
- `sessions_spawn`

通过配置覆盖：

```json5
{
  agents: {
    defaults: {
      subagents: {
        maxConcurrent: 1
      }
    }
  },
  tools: {
    subagents: {
      tools: {
        // deny 胜出
        deny: ["gateway", "cron"],
        // 如果设置 allow，则变为仅允许（deny 仍然胜出）
        // allow: ["read", "exec", "process"]
      }
    }
  }
}
```

## 并发

子代理使用专用的进程内队列通道：
- 通道名称：`subagent`
- 并发：`agents.defaults.subagents.maxConcurrent`（默认 `8`）

## 停止

- 在请求者聊天中发送 `/stop` 中止请求者会话并停止从中生成的任何活动子代理运行。

## 限制

- 子代理公告是 **尽力而为**。如果网关重启，待处理的"公告回"工作会丢失。
- 子代理仍共享相同的网关进程资源；将 `maxConcurrent` 视为安全阀。
- `sessions_spawn` 始终是非阻塞的：它立即返回 `{ status: "accepted", runId, childSessionKey }`。
- 子代理上下文仅注入 `AGENTS.md` + `TOOLS.md`（没有 `SOUL.md`、`IDENTITY.md`、`USER.md`、`HEARTBEAT.md` 或 `BOOTSTRAP.md`）。
