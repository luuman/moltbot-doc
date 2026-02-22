---
summary: "使用 Nix 声明式安装 Moltbot"
read_when:
  - 您想要可重现、可回滚的安装
  - 您已经在使用 Nix/NixOS/Home Manager
  - 您想要一切都被固定和声明式管理
---

# Nix 安装

使用 Nix 运行 Moltbot 的推荐方式是通过 **[nix-moltbot](https://github.com/moltbot/nix-moltbot)** — 一个内置电池的 Home Manager 模块。

## 快速开始

将此粘贴到您的 AI 代理（Claude、Cursor 等）：

```text
我想在我的 Mac 上设置 nix-moltbot。
仓库：github:moltbot/nix-moltbot

我需要您做的：
1. 检查是否安装了 Determinate Nix（如果没有，请安装）
2. 使用 templates/agent-first/flake.nix 在 ~/code/moltbot-local 创建一个本地 flake
3. 帮我创建一个 Telegram 机器人 (@BotFather) 并获取我的聊天 ID (@userinfobot)
4. 设置密钥 (机器人令牌、Anthropic 密钥) - ~/.secrets/ 下的纯文本文件即可
5. 填写模板占位符并运行 home-manager switch
6. 验证：launchd 运行中，机器人响应消息

参考 nix-moltbot README 了解模块选项。
```

> **📦 完整指南：[github.com/moltbot/nix-moltbot](https://github.com/moltbot/nix-moltbot)**
>
> nix-moltbot 仓库是 Nix 安装的真实来源。此页面只是快速概述。

## 您将获得

- 网关 + macOS 应用 + 工具 (whisper, spotify, cameras) — 全部固定
- 在重启后依然存在的 Launchd 服务
- 带有声明式配置的插件系统
- 即时回滚：`home-manager switch --rollback`

---

## Nix 模式运行时行为

当设置 `CLAWDBOT_NIX_MODE=1` 时（nix-moltbot 中自动启用）：

Moltbot 支持一个 **Nix 模式**，使配置确定化并禁用自动安装流程。
通过导出来启用：

```bash
CLAWDBOT_NIX_MODE=1
```

在 macOS 上，GUI 应用不会自动继承 shell 环境变量。您还可以通过默认设置启用 Nix 模式：

```bash
defaults write bot.molt.mac moltbot.nixMode -bool true
```

### 配置 + 状态路径

Moltbot 从 `CLAWDBOT_CONFIG_PATH` 读取 JSON5 配置，并将可变数据存储在 `CLAWDBOT_STATE_DIR` 中。

- `CLAWDBOT_STATE_DIR`（默认：`~/.clawdbot`）
- `CLAWDBOT_CONFIG_PATH`（默认：`$CLAWDBOT_STATE_DIR/moltbot.json`）

在 Nix 下运行时，明确设置这些为 Nix 管理的位置，以便运行时状态和配置
留在不可变存储之外。

### Nix 模式下的运行时行为

- 自动安装和自我变异流程被禁用
- 缺少的依赖项会显示特定于 Nix 的修复消息
- UI 在存在时显示只读 Nix 模式横幅

## 打包注意事项 (macOS)

macOS 打包流程期望在以下位置有一个稳定的 Info.plist 模板：

```
apps/macos/Sources/Moltbot/Resources/Info.plist
```

[`scripts/package-mac-app.sh`](https://github.com/moltbot/moltbot/blob/main/scripts/package-mac-app.sh) 将此模板复制到应用程序包中并修补动态字段
(包标识符、版本/构建、Git SHA、Sparkle 密钥)。这使得 plist 对于 SwiftPM
打包和 Nix 构建是确定性的（不依赖完整的 Xcode 工具链）。

## 相关

- [nix-moltbot](https://github.com/moltbot/nix-moltbot) — 完整设置指南
- [向导](/start/wizard) — 非 Nix CLI 设置
- [Docker](/install/docker) — 容器化设置