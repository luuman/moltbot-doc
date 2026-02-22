---
summary: "Platform support overview (Gateway + companion apps)"
read_when:
  - Looking for OS support or install paths
  - Deciding where to run the Gateway
---
# 平台

Moltbot 核心使用 TypeScript 编写。**Node 是推荐的运行时**。
Bun 不推荐用于网关 (WhatsApp/Telegram 错误)。

为 macOS (菜单栏应用) 和移动节点 (iOS/Android) 存在配套应用。Windows 和
Linux 配套应用正在计划中，但网关目前已完全支持。
Windows 的原生配套应用也在计划中；建议通过 WSL2 使用网关。

## 选择您的操作系统

- macOS: [macOS](/platforms/macos)
- iOS: [iOS](/platforms/ios)
- Android: [Android](/platforms/android)
- Windows: [Windows](/platforms/windows)
- Linux: [Linux](/platforms/linux)

## VPS 和托管

- VPS 集线器: [VPS 托管](/vps)
- Fly.io: [Fly.io](/platforms/fly)
- Hetzner (Docker): [Hetzner](/platforms/hetzner)
- GCP (计算引擎): [GCP](/platforms/gcp)
- exe.dev (虚拟机 + HTTPS 代理): [exe.dev](/platforms/exe-dev)

## 常用链接

- 安装指南: [入门](/start/getting-started)
- 网关操作手册: [网关](/gateway)
- 网关配置: [配置](/gateway/configuration)
- 服务状态: `moltbot gateway status`

## 网关服务安装 (CLI)

使用以下之一 (全部支持):

- 向导 (推荐): `moltbot onboard --install-daemon`
- 直接: `moltbot gateway install`
- 配置流程: `moltbot configure` → 选择**网关服务**
- 修复/迁移: `moltbot doctor` (提供安装或修复服务)