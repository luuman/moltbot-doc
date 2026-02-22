---
summary: "Moltbot macOS 发布清单 (Sparkle feed, 打包, 签名)"
read_when:
  - 发布或验证 Moltbot macOS 版本
  - 更新 Sparkle appcast 或 feed 资产
---

# Moltbot macOS 发布 (Sparkle)

此应用现在提供 Sparkle 自动更新。发布版本必须使用 Developer ID 签名、压缩并使用签名的 appcast 条目发布。

## 先决条件
- 已安装 Developer ID Application 证书（示例：`Developer ID Application: <Developer Name> (<TEAMID>)`）。
- Sparkle 私钥路径在环境中设置为 `SPARKLE_PRIVATE_KEY_FILE`（您的 Sparkle ed25519 私钥路径；公钥嵌入到 Info.plist 中）。如果缺失，请检查 `~/.profile`。
- `xcrun notarytool` 的公证凭证（钥匙串配置文件或 API 密钥），如果您希望分发 Gatekeeper 安全的 DMG/zip。
  - 我们使用名为 `moltbot-notary` 的钥匙串配置文件，从您的 shell 配置文件中的 App Store Connect API 密钥环境变量创建：
    - `APP_STORE_CONNECT_API_KEY_P8`, `APP_STORE_CONNECT_KEY_ID`, `APP_STORE_CONNECT_ISSUER_ID`
    - `echo "$APP_STORE_CONNECT_API_KEY_P8" | sed 's/\\n/\n/g' > /tmp/moltbot-notary.p8`
    - `xcrun notarytool store-credentials "moltbot-notary" --key /tmp/moltbot-notary.p8 --key-id "$APP_STORE_CONNECT_KEY_ID" --issuer "$APP_STORE_CONNECT_ISSUER_ID"`
- `pnpm` 依赖已安装（`pnpm install --config.node-linker=hoisted`）。
- Sparkle 工具通过 SwiftPM 自动获取，位于 `apps/macos/.build/artifacts/sparkle/Sparkle/bin/`（`sign_update`, `generate_appcast` 等）。

## 构建和打包
说明：
- `APP_BUILD` 映射到 `CFBundleVersion`/`sparkle:version`；保持数字 + 单调递增（无 `-beta`），否则 Sparkle 将其比较为相等。
- 默认为当前架构（`$(uname -m)`）。对于发布/通用构建，设置 `BUILD_ARCHS="arm64 x86_64"`（或 `BUILD_ARCHS=all`）。
- 使用 `scripts/package-mac-dist.sh` 获取发布资产（zip + DMG + 公证）。使用 `scripts/package-mac-app.sh` 进行本地/开发打包。

```bash
# 从仓库根目录；设置发布 ID 以便启用 Sparkle feed。
# APP_BUILD 必须是数字 + 单调递增以用于 Sparkle 比较。
BUNDLE_ID=bot.molt.mac \
APP_VERSION=2026.1.27-beta.1 \
APP_BUILD="$(git rev-list --count HEAD)" \
BUILD_CONFIG=release \
SIGN_IDENTITY="Developer ID Application: <Developer Name> (<TEAMID>)" \
scripts/package-mac-app.sh

# 用于分发的压缩包（包含资源分叉以支持 Sparkle 增量支持）
ditto -c -k --sequesterRsrc --keepParent dist/Moltbot.app dist/Moltbot-2026.1.27-beta.1.zip

# 可选：也为人类构建样式化的 DMG（拖拽到 /Applications）
scripts/create-dmg.sh dist/Moltbot.app dist/Moltbot-2026.1.27-beta.1.dmg

# 推荐：构建 + 公证/装订 zip + DMG
# 首先，创建钥匙串配置文件一次：
#   xcrun notarytool store-credentials "moltbot-notary" \
#     --apple-id "<apple-id>" --team-id "<team-id>" --password "<app-specific-password>"
NOTARIZE=1 NOTARYTOOL_PROFILE=moltbot-notary \
BUNDLE-ID=bot.molt.mac \
APP_VERSION=2026.1.27-beta.1 \
APP_BUILD="$(git rev-list --count HEAD)" \
BUILD_CONFIG=release \
SIGN_IDENTITY="Developer ID Application: <Developer Name> (<TEAMID>)" \
scripts/package-mac-dist.sh

# 可选：与发布一起发布 dSYM
ditto -c -k --keepParent apps/macos/.build/release/Moltbot.app.dSYM dist/Moltbot-2026.1.27-beta.1.dSYM.zip
```

## Appcast 条目
使用发布说明生成器以便 Sparkle 渲染格式化的 HTML 说明：
```bash
SPARKLE_PRIVATE_KEY_FILE=/path/to/ed25519-private-key scripts/make_appcast.sh dist/Moltbot-2026.1.27-beta.1.zip https://raw.githubusercontent.com/moltbot/moltbot/main/appcast.xml
```
从 `CHANGELOG.md` 生成 HTML 发布说明（通过 [`scripts/changelog-to-html.sh`](https://github.com/moltbot/moltbot/blob/main/scripts/changelog-to-html.sh)）并将其嵌入 appcast 条目中。
发布时将更新的 `appcast.xml` 与发布资产（zip + dSYM）一起提交。

## 发布和验证
- 将 `Moltbot-2026.1.27-beta.1.zip`（和 `Moltbot-2026.1.27-beta.1.dSYM.zip`）上传到标签 `v2026.1.27-beta.1` 的 GitHub 发布。
- 确保原始 appcast URL 与烘焙的 feed 匹配：`https://raw.githubusercontent.com/moltbot/moltbot/main/appcast.xml`。
- 基本检查：
  - `curl -I https://raw.githubusercontent.com/moltbot/moltbot/main/appcast.xml` 返回 200。
  - 资产上传后 `curl -I <enclosure url>` 返回 200。
  - 在先前的公开版本上，从关于标签运行"检查更新…"并验证 Sparkle 干净地安装新版本。

完成定义：签名的应用 + appcast 已发布，从较早安装的版本更新流程工作，发布资产已附加到 GitHub 发布。