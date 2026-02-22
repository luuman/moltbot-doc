---
summary: "Setup guide for developers working on the Moltbot macOS app"
read_when:
  - Setting up the macOS development environment
---
# macOS开发者设置

本指南涵盖从源代码构建和运行Moltbot macOS应用程序所需的步骤。

## 先决条件

在构建应用之前，请确保已安装以下内容：

1.  **Xcode 26.2+**: Swift开发所必需。
2.  **Node.js 22+ & pnpm**: 网关、CLI和打包脚本所必需。

## 1. 安装依赖项

安装项目范围的依赖项：

```bash
pnpm install
```

## 2. 构建和打包应用

要构建macOS应用并将其打包到`dist/Moltbot.app`中，请运行：

```bash
./scripts/package-mac-app.sh
```

如果您没有Apple Developer ID证书，脚本将自动使用**临时签名**（`-`）。

有关开发运行模式、签名标志和Team ID故障排除，请参阅macOS应用README：
https://github.com/moltbot/moltbot/blob/main/apps/macos/README.md

> **注意**: 临时签名的应用可能会触发安全提示。如果应用立即崩溃并显示"Abort trap 6"，请参阅[故障排除](#故障排除)部分。

## 3. 安装CLI

macOS应用期望全局安装`moltbot` CLI来管理后台任务。

**安装方法（推荐）：**
1.  打开Moltbot应用。
2.  转到**常规**设置选项卡。
3.  点击**"安装CLI"**。

或者手动安装：
```bash
npm install -g moltbot@<version>
```

## 故障排除

### 构建失败：工具链或SDK不匹配
macOS应用构建需要最新的macOS SDK和Swift 6.2工具链。

**系统依赖项（必需）：**
- **软件更新中提供的最新macOS版本**（Xcode 26.2 SDK所必需）
- **Xcode 26.2**（Swift 6.2工具链）

**检查：**
```bash
xcodebuild -version
xcrun swift --version
```

如果版本不匹配，请更新macOS/Xcode并重新运行构建。

### 应用在权限授予时崩溃
如果在尝试允许**语音识别**或**麦克风**访问时应用崩溃，可能是由于损坏的TCC缓存或签名不匹配。

**修复：**
1. 重置TCC权限：
   ```bash
   tccutil reset All bot.molt.mac.debug
   ```
2. 如果失败，请暂时在[`scripts/package-mac-app.sh`](https://github.com/moltbot/moltbot/blob/main/scripts/package-mac-app.sh)中更改`BUNDLE_ID`以强制从macOS获得"干净状态"。

### 网关无限期"启动中..."
如果网关状态停留在"启动中..."，请检查是否有僵尸进程占用了端口：

```bash
moltbot gateway status
moltbot gateway stop

# 如果您不使用LaunchAgent（开发模式/手动运行），请查找监听器：
lsof -nP -iTCP:18789 -sTCP:LISTEN
```
如果手动运行占用了端口，请停止该进程（Ctrl+C）。作为最后手段，请终止上面找到的PID。