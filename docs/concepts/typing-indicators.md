---
summary: "Moltbot 何时显示输入指示器以及如何调整它们"
read_when:
  - 更改输入指示器行为或默认值时
---
# 输入指示器

当运行活跃时，输入指示器发送到聊天通道。使用
`agents.defaults.typingMode` 控制 **何时** 开始输入和 `typingIntervalSeconds`
控制 **多久** 刷新一次。

## 默认值
当 `agents.defaults.typingMode` **未设置** 时，Moltbot 保持传统行为：
- **直接聊天**：一旦模型循环开始，输入立即开始。
- **有提及的群聊**：输入立即开始。
- **没有提及的群聊**：仅当消息文本开始流式传输时输入才开始。
- **心跳运行**：输入被禁用。

## 模式
将 `agents.defaults.typingMode` 设置为以下之一：
- `never` — 从不显示输入指示器。
- `instant` — 在模型循环开始时 **立即开始输入**，即使运行
  稍后仅返回静默回复令牌。
- `thinking` — 在 **第一个推理增量** 时开始输入（需要
  `reasoningLevel: "stream"` 用于运行）。
- `message` — 在 **第一个非静默文本增量** 时开始输入（忽略
  `NO_REPLY` 静默令牌）。

"触发时间早晚"的顺序：
`never` → `message` → `thinking` → `instant`

## 配置
```json5
{
  agent: {
    typingMode: "thinking",
    typingIntervalSeconds: 6
  }
}
```

您可以为每个会话覆盖模式或节奏：
```json5
{
  session: {
    typingMode: "message",
    typingIntervalSeconds: 4
  }
}
```

## 注意事项
- `message` 模式不会为仅静默回复显示输入（例如 `NO_REPLY`
  用于抑制输出的令牌）。
- `thinking` 仅在运行流式传输推理时触发（`reasoningLevel: "stream"`）。
  如果模型不发出推理增量，输入不会开始。
- 心跳从不显示输入，无论模式如何。
- `typingIntervalSeconds` 控制 **刷新节奏**，不是开始时间。
  默认值为 6 秒。