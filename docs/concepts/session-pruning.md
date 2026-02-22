---
summary: "会话修剪：修剪工具结果以减少上下文膨胀"
read_when:
  - 您想减少工具输出导致的 LLM 上下文增长时
  - 您正在调整 agents.defaults.contextPruning 时
---
# 会话修剪

会话修剪在每次 LLM 调用之前从内存上下文中修剪 **旧工具结果**。它 **不** 重写磁盘上的会话历史（`*.jsonl`）。

## 运行时机
- 当启用 `mode: "cache-ttl"` 且会话的最后一次 Anthropic 调用早于 `ttl` 时。
- 仅影响发送给模型的该请求的消息。
 - 仅对 Anthropic API 调用（和 OpenRouter Anthropic 模型）生效。
 - 为了获得最佳效果，请将 `ttl` 与您的模型 `cacheControlTtl` 匹配。
 - 修剪后，TTL 窗口重置，因此后续请求保持缓存直到 `ttl` 再次到期。

## 智能默认值（Anthropic）
- **OAuth 或设置令牌** 配置文件：启用 `cache-ttl` 修剪并将心跳设置为 `1h`。
- **API 密钥** 配置文件：启用 `cache-ttl` 修剪，将心跳设置为 `30m`，并将 Anthropic 模型上的默认 `cacheControlTtl` 设置为 `1h`。
- 如果您明确设置了这些值中的任何一个，Moltbot **不** 会覆盖它们。

## 这改善了什么（成本 + 缓存行为）
- **为什么修剪：** Anthropic 提示缓存仅在 TTL 内应用。如果会话在 TTL 过期后空闲，下次请求将重新缓存完整提示，除非您先修剪它。
- **什么变得更便宜：** 修剪减少了 TTL 到期后第一次请求的 **cacheWrite** 大小。
- **为什么 TTL 重置很重要：** 一旦修剪运行，缓存窗口重置，因此后续请求可以重用新缓存的提示，而不是再次重新缓存完整历史。
- **它不做的是：** 修剪不会添加 token 或“双重”成本；它只改变 TTL 后第一次请求的缓存内容。

## 可以修剪什么
- 仅 `toolResult` 消息。
- 用户 + 助手消息 **永远** 不会被修改。
- 最后的 `keepLastAssistants` 个助手消息受到保护；该截止点之后的工具结果不会被修剪。
- 如果没有足够的助手消息来建立截止点，修剪将被跳过。
- 包含 **图像块** 的工具结果被跳过（永远不会修剪/清除）。

## 上下文窗口估计
修剪使用估计的上下文窗口（字符 ≈ token × 4）。窗口大小按以下顺序解析：
1) 模型定义 `contextWindow`（来自模型注册表）。
2) `models.providers.*.models[].contextWindow` 覆盖。
3) `agents.defaults.contextTokens`。
4) 默认 `200000` token。

## 模式
### cache-ttl
- 仅当上次 Anthropic 调用早于 `ttl`（默认 `5m`）时才运行修剪。
- 运行时：与之前相同的软修剪 + 硬清除行为。

## 软修剪 vs 硬修剪
- **软修剪**：仅针对过大的工具结果。
  - 保留头部 + 尾部，插入 `...`，并附加原始大小的注释。
  - 跳过包含图像块的结果。
- **硬清除**：用 `hardClear.placeholder` 替换整个工具结果。

## 工具选择
- `tools.allow` / `tools.deny` 支持 `*` 通配符。
- 拒绝优先。
- 匹配不区分大小写。
- 空允许列表 => 允许所有工具。

## 与其他限制的交互
- 内置工具已经截断了自己的输出；会话修剪是一个额外的层，防止长时间运行的聊天在模型上下文中积累过多工具输出。
- 压缩是分开的：压缩总结并持久化，修剪是每个请求的临时操作。参见 [/concepts/compaction](/concepts/compaction)。

## 默认值（启用时）
- `ttl`: `"5m"`
- `keepLastAssistants`: `3`
- `softTrimRatio`: `0.3`
- `hardClearRatio`: `0.5`
- `minPrunableToolChars`: `50000`
- `softTrim`: `{ maxChars: 4000, headChars: 1500, tailChars: 1500 }`
- `hardClear`: `{ enabled: true, placeholder: "[Old tool result content cleared]" }`

## 示例
默认（关闭）：
```json5
{
  agent: {
    contextPruning: { mode: "off" }
  }
}
```

启用 TTL 感知修剪：
```json5
{
  agent: {
    contextPruning: { mode: "cache-ttl", ttl: "5m" }
  }
}
```

将修剪限制为特定工具：
```json5
{
  agent: {
    contextPruning: {
      mode: "cache-ttl",
      tools: { allow: ["exec", "read"], deny: ["*image*"] }
    }
  }
}
```

参见配置参考：[网关配置](/gateway/configuration)