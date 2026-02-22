---
title: 形式化验证（安全模型）
summary: 用于 Moltbot 最高风险路径的机器检查安全模型。
permalink: /security/formal-verification/
---

# 形式化验证（安全模型）

此页面跟踪 Moltbot 的**形式化安全模型**（目前使用 TLA+/TLC；按需添加更多）。

> 注意：一些较旧的链接可能会引用以前的项目名称。

**目标（北极星）：** 在明确的假设下，提供一个机器检查的论证，证明 Moltbot 实施了其预期的安全策略（授权、会话隔离、工具网关和配置错误安全）。

**当前是什么（今天）：** 一个可执行的、攻击者驱动的**安全回归套件**：
- 每个声明都有一个在有限状态空间上可运行的模型检查。
- 许多声明都配有一个**负模型**，为现实的错误类产生反例轨迹。

**目前不是什么（还不能）：** 证明"Moltbot 在各个方面都是安全的"或完整的 TypeScript 实现是正确的。

## 模型存放位置

模型维护在一个单独的仓库中：[vignesh07/clawdbot-formal-models](https://github.com/vignesh07/clawdbot-formal-models)。

## 重要注意事项

- 这些是**模型**，而不是完整的 TypeScript 实现。模型与代码之间可能存在偏差。
- 结果受 TLC 探索的状态空间限制；"绿色"并不意味着超出建模假设和边界的安全性。
- 一些声明依赖于明确的环境假设（例如，正确部署、正确的配置输入）。

## 复现结果

今天，通过克隆模型仓库并在本地运行 TLC 来复现结果（见下文）。未来版本可能会提供：
- CI 运行的模型及公共构件（反例轨迹、运行日志）
- 托管的"运行此模型"工作流程，用于小规模、有界检查

开始：

```bash
git clone https://github.com/vignesh07/clawdbot-formal-models
cd clawdbot-formal-models

# 需要 Java 11+（TLC 在 JVM 上运行）。
# 仓库提供了固定的 `tla2tools.jar`（TLA+ 工具）并提供 `bin/tlc` + Make 目标。

make <target>
```

### 网关暴露和开放网关配置错误

**声明：** 绑定到回环之外而不进行身份验证可能会使远程攻击成为可能/增加暴露面；令牌/密码阻止未经授权的攻击者（根据模型假设）。

- 绿色运行：
  - `make gateway-exposure-v2`
  - `make gateway-exposure-v2-protected`
- 红色（预期）：
  - `make gateway-exposure-v2-negative`

另见：模型仓库中的 `docs/gateway-exposure-matrix.md`。

### Nodes.run 管道（最高风险能力）

**声明：** `nodes.run` 需要 (a) 节点命令白名单加上声明的命令和 (b) 配置时的实时批准；批准是标记化的以防止重放（在模型中）。

- 绿色运行：
  - `make nodes-pipeline`
  - `make approvals-token`
- 红色（预期）：
  - `make nodes-pipeline-negative`
  - `make approvals-token-negative`

### 配对存储（DM 网关）

**声明：** 配对请求尊重 TTL 和待处理请求上限。

- 绿色运行：
  - `make pairing`
  - `make pairing-cap`
- 红色（预期）：
  - `make pairing-negative`
  - `make pairing-cap-negative`

### 入站网关（提及 + 控制命令绕过）

**声明：** 在需要提及的组上下文中，未经授权的"控制命令"无法绕过提及网关。

- 绿色：
  - `make ingress-gating`
- 红色（预期）：
  - `make ingress-gating-negative`

### 路由/会话键隔离

**声明：** 来自不同对等方的私信不会合并到同一个会话中，除非显式链接/配置。

- 绿色：
  - `make routing-isolation`
- 红色（预期）：
  - `make routing-isolation-negative`


## v1++：额外的有界模型（并发、重试、轨迹正确性）

这些是后续模型，围绕现实世界的故障模式（非原子更新、重试和消息扇出）提高保真度。

### 配对存储并发/幂等性

**声明：** 配对存储应该即使在交错情况下也强制执行 `MaxPending` 和幂等性（即，"检查后写入"必须是原子的/加锁的；刷新不应创建重复项）。

含义：
- 在并发请求下，您不能超过通道的 `MaxPending`。
- 对相同 `(channel, sender)` 的重复请求/刷新不应创建重复的活动待处理行。

- 绿色运行：
  - `make pairing-race`（原子/加锁上限检查）
  - `make pairing-idempotency`
  - `make pairing-refresh`
  - `make pairing-refresh-race`
- 红色（预期）：
  - `make pairing-race-negative`（非原子开始/提交上限竞争）
  - `make pairing-idempotency-negative`
  - `make pairing-refresh-negative`
  - `make pairing-refresh-race-negative`

### 入站轨迹关联/幂等性

**声明：** 摄取应该在扇出过程中保持轨迹关联，并在提供者重试下是幂等的。

含义：
- 当一个外部事件变成多个内部消息时，每个部分都保持相同的轨迹/事件标识。
- 重试不会导致双重处理。
- 如果提供者事件 ID 缺失，去重回退到安全密钥（例如，轨迹 ID）以避免丢弃不同事件。

- 绿色：
  - `make ingress-trace`
  - `make ingress-trace2`
  - `make ingress-idempotency`
  - `make ingress-dedupe-fallback`
- 红色（预期）：
  - `make ingress-trace-negative`
  - `make ingress-trace2-negative`
  - `make ingress-idempotency-negative`
  - `make ingress-dedupe-fallback-negative`

### 路由 dmScope 优先级 + identityLinks

**声明：** 路由必须默认保持 DM 会话隔离，只有在显式配置时才合并会话（通道优先级 + 身份链接）。

含义：
- 通道特定的 dmScope 覆盖必须胜过全局默认值。
- identityLinks 应该只在显式链接的组内合并，而不是跨无关对等方。

- 绿色：
  - `make routing-precedence`
  - `make routing-identitylinks`
- 红色（预期）：
  - `make routing-precedence-negative`
  - `make routing-identitylinks-negative`
