---
summary: "macOS 权限持久性 (TCC) 和签名要求"
read_when:
  - 调试缺少或卡住的 macOS 权限提示
  - 打包或签署 macOS 应用
  - 更改 Bundle ID 或应用安装路径
---
# macOS 权限 (TCC)

macOS 权限授予是脆弱的。TCC 将权限授予与应用的代码签名、Bundle 标识符和磁盘路径关联。如果其中任何一项发生变化，
macOS 会将应用视为新的，并可能丢弃或隐藏提示。

## 稳定权限的要求
- 相同路径：从固定位置运行应用（对于 Moltbot，`dist/Moltbot.app`）。
- 相同 Bundle 标识符：更改 Bundle ID 会创建新的权限身份。
- 已签名应用：未签名或临时签名的构建不会持久化权限。
- 一致的签名：使用真实的 Apple Development 或 Developer ID 证书
  以便签名在重建时保持稳定。

临时签名在每次构建时生成新身份。macOS 会忘记以前的授权，提示可能会完全消失，直到清除过时条目。

## 提示消失时的恢复清单
1. 退出应用。
2. 在系统设置 -> 隐私与安全中删除应用条目。
3. 从相同路径重新启动应用并重新授予权限。
4. 如果提示仍然不出现，使用 `tccutil` 重置 TCC 条目并重试。
5. 某些权限只有在完整 macOS 重启后才会重新出现。

重置示例（根据需要替换 Bundle ID）：

```bash
sudo tccutil reset Accessibility bot.molt.mac
sudo tccutil reset ScreenCapture bot.molt.mac
sudo tccutil reset AppleEvents
```

如果您正在测试权限，请始终使用真实证书进行签名。临时
构建仅适用于权限无关紧要的快速本地运行。