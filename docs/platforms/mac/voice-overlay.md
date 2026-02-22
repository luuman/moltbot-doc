---
summary: "唤醒词和按键通话重叠时的语音叠加生命周期"
read_when:
  - 调整语音叠加行为
---
# 语音叠加生命周期 (macOS)

受众：macOS 应用贡献者。目标：在唤醒词和按键通话重叠时保持语音叠加层可预测。

### 当前意图
- 如果叠加层已从唤醒词显示，用户按下热键，热键会话*采用*现有文本而不是重置它。叠加层在按下热键时保持显示。当用户释放时：如果有修剪后的文本则发送，否则关闭。
- 唤醒词仍然在静音时自动发送；按键通话在释放时立即发送。

### 已实现 (2025年12月9日)
- 叠加层会话现在为每次捕获携带一个令牌（唤醒词或按键通话）。当令牌不匹配时，部分/最终/发送/关闭/级别更新会被丢弃，避免陈旧回调。
- 按键通话采用任何可见的叠加层文本作为前缀（因此在唤醒叠加层显示时按下热键会保留文本并追加新语音）。它最多等待1.5秒获取最终转录，然后再回退到当前文本。
- 哨声/叠加层日志在类别 `voicewake.overlay`、`voicewake.ptt` 和 `voicewake.chime` 中以 `info` 级别发出（会话开始、部分、最终、发送、关闭、哨声原因）。

### 下一步
1. **VoiceSessionCoordinator (actor)**
   - 一次只拥有一个 `VoiceSession`。
   - API（基于令牌）：`beginWakeCapture`、`beginPushToTalk`、`updatePartial`、`endCapture`、`cancel`、`applyCooldown`。
   - 丢弃携带陈旧令牌的回调（防止旧识别器重新打开叠加层）。
2. **VoiceSession (模型)**
   - 字段：`token`、`source`（唤醒词|按键通话）、已提交/临时文本、哨声标志、计时器（自动发送、空闲）、`overlayMode`（显示|编辑|发送）、冷却截止时间。
3. **叠加层绑定**
   - `VoiceSessionPublisher`（`ObservableObject`）将活动会话镜像到 SwiftUI。
   - `VoiceWakeOverlayView` 仅通过发布者渲染；它永远不会直接改变全局单例。
   - 叠加层用户操作（`sendNow`、`dismiss`、`edit`）使用会话令牌回调到协调器。
4. **统一发送路径**
   - 在 `endCapture` 时：如果修剪后的文本为空 → 关闭；否则 `performSend(session:)`（播放发送哨声一次，转发，关闭）。
   - 按键通话：无延迟；唤醒词：自动发送的可选延迟。
   - 在按键通话完成后对唤醒运行时应用短暂冷却，以免唤醒词立即重新触发。
5. **日志记录**
   - 协调器在子系统 `bot.molt` 中发出 `.info` 日志，类别为 `voicewake.overlay` 和 `voicewake.chime`。
   - 关键事件：`session_started`、`adopted_by_push_to_talk`、`partial`、`finalized`、`send`、`dismiss`、`cancel`、`cooldown`。

### 调试清单
- 在重现粘滞叠加层时流式传输日志：

  ```bash
  sudo log stream --predicate 'subsystem == "bot.molt" AND category CONTAINS "voicewake"' --level info --style compact
  ```
- 验证只有一个活动会话令牌；陈旧回调应被协调器丢弃。
- 确保按键通话释放总是使用活动令牌调用 `endCapture`；如果文本为空，期望 `dismiss` 且无哨声或发送。

### 迁移步骤（建议）
1. 添加 `VoiceSessionCoordinator`、`VoiceSession` 和 `VoiceSessionPublisher`。
2. 重构 `VoiceWakeRuntime` 以创建/更新/结束会话，而不是直接触摸 `VoiceWakeOverlayController`。
3. 重构 `VoicePushToTalk` 以采用现有会话并在释放时调用 `endCapture`；应用运行时冷却。
4. 将 `VoiceWakeOverlayController` 连接到发布者；移除来自运行时/PTT 的直接调用。
5. 为会话采用、冷却和空文本关闭添加集成测试。