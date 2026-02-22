---
summary: "Moltbot 如何构建提示上下文并报告令牌使用情况 + 成本"
read_when:
  - 解释令牌使用、成本或上下文窗口
  - 调试上下文增长或压缩行为
---
# 令牌使用和成本

Moltbot 跟踪 **令牌**，而不是字符。令牌是模型特定的，但对于英文文本，大多数
OpenAI 风格的模型平均每个令牌约为 4 个字符。

## 系统提示如何构建

Moltbot 在每次运行时组装自己的系统提示。它包括：

- 工具列表 + 简短描述
- 技能列表（仅元数据；指令在需要时用 `read` 加载）
- 自更新指令
- 工作空间 + 引导文件（`AGENTS.md`、`SOUL.md`、`TOOLS.md`、`IDENTITY.md`、`USER.md`、`HEARTBEAT.md`、`BOOTSTRAP.md` 当新的时候）。大文件被 `agents.defaults.bootstrapMaxChars`（默认：20000）截断。
- 时间（UTC + 用户时区）
- 回复标签 + 心跳行为
- 运行时元数据（主机/操作系统/模型/思维）

在 [系统提示](/concepts/system-prompt) 中查看完整细分。

## 上下文窗口中计算的内容

模型接收的所有内容都计入上下文限制：

- 系统提示（上面列出的所有部分）
- 对话历史（用户 + 助手消息）
- 工具调用和工具结果
- 附件/转录（图像、音频、文件）
- 压缩摘要和修剪工件
- 提供者包装器或安全头（不可见，但仍计算）

对于实际细分（每个注入文件、工具、技能和系统提示大小），使用 `/context list` 或 `/context detail`。参见 [上下文](/concepts/context)。

## 如何查看当前令牌使用情况

在聊天中使用这些：

- `/status` → **表情符号丰富状态卡**，包含会话模型、上下文使用情况、
  最后响应输入/输出令牌和 **估算成本**（仅 API 密钥）。
- `/usage off|tokens|full` → 将 **每响应使用情况页脚** 附加到每个回复。
  - 每会话持久化（存储为 `responseUsage`）。
  - OAuth 认证 **隐藏成本**（仅令牌）。
- `/usage cost` → 显示来自 Moltbot 会话日志的本地成本摘要。

其他界面：

- **TUI/Web TUI：** 支持 `/status` + `/usage`。
- **CLI：** `moltbot status --usage` 和 `moltbot channels list` 显示
  提供者配额窗口（不是每响应成本）。

## 成本估算（显示时）

成本从您的模型定价配置中估算：

```
models.providers.<provider>.models[].cost
```

这些是 `input`、`output`、`cacheRead` 和
`cacheWrite` 的 **每 100 万令牌美元**。如果缺少定价，Moltbot 仅显示令牌。OAuth 令牌从不显示美元成本。

## 缓存 TTL 和修剪影响

提供者提示缓存仅在缓存 TTL 窗口内应用。Moltbot 可以选择运行
**缓存 TTL 修剪**：一旦缓存 TTL 过期，它会修剪会话，
然后重置缓存窗口，以便后续请求可以重用
刚缓存的上下文，而不是重新缓存完整历史记录。当会话超过 TTL 闲置时，这可以降低缓存
写入成本。

在 [网关配置](/gateway/configuration) 中配置它并查看
[会话修剪](/concepts/session-pruning) 中的行为详情。

心跳可以保持缓存跨越空闲间隙 **温暖**。如果您的模型缓存 TTL
是 `1h`，将心跳间隔设置为略低于该值（例如，`55m`）可以避免
重新缓存完整提示，减少缓存写入成本。

对于 Anthropic API 定价，缓存读取比输入
令牌便宜得多，而缓存写入以更高的乘数计费。请参阅 Anthropic 的
提示缓存定价以获取最新费率和 TTL 乘数：
https://docs.anthropic.com/docs/build-with-claude/prompt-caching

### 示例：用心跳保持 1 小时缓存温暖

```yaml
agents:
  defaults:
    model:
      primary: "anthropic/claude-opus-4-5"
    models:
      "anthropic/claude-opus-4-5":
        params:
          cacheControlTtl: "1h"
    heartbeat:
      every: "55m"
```

## 减少令牌压力的提示

- 使用 `/compact` 摘要长会话。
- 在工作流程中修剪大的工具输出。
- 保持技能描述简短（技能列表注入到提示中）。
- 在冗长、探索性工作中首选较小模型。

参见 [技能](/tools/skills) 了解确切的技能列表开销公式。