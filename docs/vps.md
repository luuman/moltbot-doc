---
summary: "Moltbot 的 VPS 托管中心（Oracle/Fly/Hetzner/GCP/exe.dev）"
read_when:
  - 您想在云端运行网关
  - 您需要 VPS/托管指南的快速地图
---
# VPS 托管

此中心链接到支持的 VPS/托管指南，并从高层解释云部署的工作原理。

## 选择提供商

- **Railway**（一键 + 浏览器设置）：[Railway](/railway)
- **Northflank**（一键 + 浏览器设置）：[Northflank](/northflank)
- **Oracle Cloud（始终免费）**：[Oracle](/platforms/oracle) — $0/月（始终免费，ARM；容量/注册可能不稳定）
- **Fly.io**：[Fly.io](/platforms/fly)
- **Hetzner（Docker）**：[Hetzner](/platforms/hetzner)
- **GCP（计算引擎）**：[GCP](/platforms/gcp)
- **exe.dev**（VM + HTTPS 代理）：[exe.dev](/platforms/exe-dev)
- **AWS（EC2/Lightsail/免费套餐）**：也运行良好。视频指南：
  https://x.com/techfrenAJ/status/2014934471095812547

## 云设置的工作原理

- **网关在 VPS 上运行** 并拥有状态 + 工作区。
- 您通过 **控制 UI** 或 **Tailscale/SSH** 从笔记本电脑/手机连接。
- 将 VPS 视为事实来源并 **备份** 状态 + 工作区。
- 安全默认：将网关保持在环回接口上，并通过 SSH 隧道或 Tailscale Serve 访问它。
  如果您绑定到 `lan`/`tailnet`，请要求 `gateway.auth.token` 或 `gateway.auth.password`。

远程访问：[网关远程](/gateway/remote)  
平台中心：[平台](/platforms)

## 在 VPS 上使用节点

您可以将网关保留在云端，并在本地设备上配对 **节点**
（Mac/iOS/Android/无头）。节点提供本地屏幕/摄像头/画布和 `system.run`
功能，同时网关保留在云端。

文档：[节点](/nodes)，[节点 CLI](/cli/nodes)