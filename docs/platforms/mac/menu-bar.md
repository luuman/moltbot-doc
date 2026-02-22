---
summary: "菜单栏状态逻辑和向用户展示的内容"
read_when:
  - 调整 mac 菜单 UI 或状态逻辑
---
# 菜单栏状态逻辑

## 显示的内容
- 我们在菜单栏图标和菜单的第一个状态行中显示当前代理工作状态。
- 工作活跃时隐藏健康状态；所有会话空闲时恢复显示。
- 菜单中的"节点"块仅列出**设备**（通过 `node.list` 配对的节点），而不是客户端/存在条目。
- 当提供者使用情况快照可用时，在上下文下会出现"使用情况"部分。

## 状态模型
- 会话：事件到达时带有 `runId`（每次运行）和有效载荷中的 `sessionKey`。"main" 会话是键 `main`；如果不存在，我们回退到最近更新的会话。
- 优先级：main 始终获胜。如果 main 活跃，立即显示其状态。如果 main 空闲，显示最近活跃的非 main 会话。我们不会在活动中期切换；只有当前会话变空闲或 main 变活跃时才切换。
- 活动类型：
  - `job`：高级命令执行（`state: started|streaming|done|error`）。
  - `tool`：`phase: start|result` 带有 `toolName` 和 `meta/args`。

## IconState 枚举（Swift）
- `idle`
- `workingMain(ActivityKind)`
- `workingOther(ActivityKind)`
- `overridden(ActivityKind)`（调试覆盖）

### ActivityKind → 图标
- `exec` → 💻
- `read` → 📄
- `write` → ✍️
- `edit` → 📝
- `attach` → 📎
- 默认 → 🛠️

### 视觉映射
- `idle`：正常小动物。
- `workingMain`：带图标徽章，完整着色，腿"工作"动画。
- `workingOther`：带图标徽章，淡色，无奔跑动画。
- `overridden`：使用所选图标/着色，不管活动状态。

## 状态行文本（菜单）
- 工作活跃时：`<会话角色> · <活动标签>`
  - 示例：`Main · exec: pnpm test`, `Other · read: apps/macos/Sources/Moltbot/AppState.swift`。
- 空闲时：回退到健康摘要。

## 事件摄入
- 源：控制通道 `agent` 事件（`ControlChannel.handleAgentEvent`）。
- 解析字段：
  - `stream: "job"` 带有 `data.state` 用于开始/停止。
  - `stream: "tool"` 带有 `data.phase`、`name`、可选的 `meta`/`args`。
- 标签：
  - `exec`：`args.command` 的第一行。
  - `read`/`write`：缩短的路径。
  - `edit`：路径加上从 `meta`/差异计数推断的变更类型。
  - 回退：工具名称。

## 调试覆盖
- 设置 ▸ 调试 ▸ "图标覆盖" 选择器：
  - `系统（自动）`（默认）
  - `工作中：main`（按工具类型）
  - `工作中：other`（按工具类型）
  - `空闲`
- 通过 `@AppStorage("iconOverride")` 存储；映射到 `IconState.overridden`。

## 测试清单
- 触发 main 会话作业：验证图标立即切换，状态行显示 main 标签。
- main 空闲时触发非 main 会话作业：图标/状态显示非 main；保持稳定直到完成。
- 其他活跃时启动 main：图标立即切换到 main。
- 快速工具突发：确保徽章不闪烁（工具结果的 TTL 宽限期）。
- 所有会话空闲后健康行重新出现。