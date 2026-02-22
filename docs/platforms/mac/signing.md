---
summary: "打包脚本生成的 macOS 调试版本签名步骤"
read_when:
  - 构建或签署 mac 调试版本
---
# mac 签名（调试版本）

此应用通常从 [`scripts/package-mac-app.sh`](https://github.com/moltbot/moltbot/blob/main/scripts/package-mac-app.sh) 构建，现在：

- 设置稳定的调试包标识符：`bot.molt.mac.debug`
- 使用该包 ID 写入 Info.plist（通过 `BUNDLE_ID=...` 覆盖）
- 调用 [`scripts/codesign-mac-app.sh`](https://github.com/moltbot/moltbot/blob/main/scripts/codesign-mac-app.sh) 签名主二进制文件和应用包，以便 macOS 将每次重建视为相同的签名包并保持 TCC 权限（通知、辅助功能、屏幕录制、麦克风、语音）。为了稳定的权限，请使用真实的签名标识；临时签名是选择加入的且不稳定（参见 [macOS 权限](/platforms/mac/permissions)）。
- 默认使用 `CODESIGN_TIMESTAMP=auto`；它为开发者 ID 签名启用可信时间戳。设置 `CODESIGN_TIMESTAMP=off` 跳过时间戳（离线调试构建）。
- 将构建元数据注入 Info.plist：`MoltbotBuildTimestamp`（UTC）和 `MoltbotGitCommit`（短哈希），以便关于面板可以显示构建、git 和调试/发布渠道。
- **打包需要 Node 22+**：脚本运行 TS 构建和控制 UI 构建。
- 从环境中读取 `SIGN_IDENTITY`。在您的 shell rc 中添加 `export SIGN_IDENTITY="Apple Development: Your Name (TEAMID)"`（或您的开发者 ID 应用证书）以始终使用您的证书签名。临时签名需要通过 `ALLOW_ADHOC_SIGNING=1` 或 `SIGN_IDENTITY="-"` 明确选择（不推荐用于权限测试）。
- 签名后运行团队 ID 审计，如果应用包内的任何 Mach-O 由不同团队 ID 签名则失败。设置 `SKIP_TEAM_ID_CHECK=1` 以绕过。

## 用法

```bash
# 从仓库根目录
scripts/package-mac-app.sh               # 自动选择标识；如果没有找到则报错
SIGN_IDENTITY="Developer ID Application: Your Name" scripts/package-mac-app.sh   # 真实证书
ALLOW_ADHOC_SIGNING=1 scripts/package-mac-app.sh    # 临时（权限不会保留）
SIGN_IDENTITY="-" scripts/package-mac-app.sh        # 明确临时（相同警告）
DISABLE_LIBRARY_VALIDATION=1 scripts/package-mac-app.sh   # 仅开发 Sparkle 团队 ID 不匹配解决方法
```

### 临时签名说明
当使用 `SIGN_IDENTITY="-"`（临时）签名时，脚本自动禁用**硬化运行时**（`--options runtime`）。这是必要的，以防止应用尝试加载不共享相同团队 ID 的嵌入框架（如 Sparkle）时崩溃。临时签名也会破坏 TCC 权限持久性；有关恢复步骤，请参见 [macOS 权限](/platforms/mac/permissions)。

## 关于构建元数据

`package-mac-app.sh` 将包加盖：
- `MoltbotBuildTimestamp`：打包时的 ISO8601 UTC
- `MoltbotGitCommit`：短 git 哈希（或 `unknown` 如果不可用）

关于标签读取这些键以显示版本、构建日期、git 提交和是否为调试构建（通过 `#if DEBUG`）。在代码更改后运行打包程序以刷新这些值。

## 原因

TCC 权限与包标识符*和*代码签名相关联。具有变化 UUID 的未签名调试版本导致 macOS 在每次重建后忘记授权。签名二进制文件（默认为临时）并保持固定包 ID/路径（`dist/Moltbot.app`）在构建之间保留授权，匹配 VibeTunnel 方法。