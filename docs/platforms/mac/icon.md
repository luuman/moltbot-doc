---
summary: "Menu bar icon states and animations for Moltbot on macOS"
read_when:
  - Changing menu bar icon behavior
---
# 菜单栏图标状态

作者: steipete · 更新时间: 2025-12-06 · 范围: macOS 应用 (`apps/macos`)

- **空闲:** 正常图标动画（眨眼，偶尔摇摆）。
- **暂停:** 状态项使用 `appearsDisabled`；无动作。
- **语音触发（大耳朵）:** 语音唤醒检测器在听到唤醒词时调用 `AppState.triggerVoiceEars(ttl: nil)`，在捕获话语时保持 `earBoostActive=true`。耳朵放大（1.9倍），获得圆形耳洞以提高可读性，然后在1秒静音后通过 `stopVoiceEars()` 恢复。仅从应用内语音管道触发。
- **工作中（代理运行中）:** `AppState.isWorking=true` 驱动"尾巴/腿部急促"微动作：工作进行时腿部摇摆更快并略有偏移。当前在WebChat代理运行周围切换；在连接其他长时间任务时添加相同的切换。

连接点
- 语音唤醒: 运行时/测试器在触发时调用 `AppState.triggerVoiceEars(ttl: nil)`，在1秒静音后调用 `stopVoiceEars()` 以匹配捕获窗口。
- 代理活动: 在工作跨度周围设置 `AppStateStore.shared.setWorking(true/false)`（已在WebChat代理调用中完成）。保持跨度短并在 `defer` 块中重置以避免卡住动画。

形状和大小
- 基础图标绘制在 `CritterIconRenderer.makeIcon(blink:legWiggle:earWiggle:earScale:earHoles:)` 中。
- 耳朵缩放默认为 `1.0`；语音增强设置 `earScale=1.9` 并切换 `earHoles=true` 而不改变整体框架（18×18 pt 模板图像渲染到 36×36 px 的Retina后备存储中）。
- 急促使用腿部摇摆最多约1.0并带有小水平抖动；它是对任何现有空闲摇摆的附加。

行为注释
- 没有耳朵/工作的外部CLI/代理切换；将其保留在应用程序自身信号内部以避免意外拍打。
- 保持TTL短（&lt;10秒），以便图标在作业挂起时快速返回基线。