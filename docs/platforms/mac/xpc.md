---
summary: "Moltbot 应用、网关节点传输和 PeekabooBridge 的 macOS IPC 架构"
read_when:
  - 编辑 IPC 合约或菜单栏应用 IPC
---
# Moltbot macOS IPC 架构

**当前模型：** 一个本地 Unix 套接字连接**节点主机服务**到**macOS 应用**以进行 exec 批准 + `system.run`。存在一个 `moltbot-mac` 调试 CLI 用于发现/连接检查；代理操作仍然通过网关 WebSocket 和 `node.invoke` 流动。UI 自动化使用 PeekabooBridge。

## 目标
- 单个 GUI 应用实例，拥有所有面向 TCC 的工作（通知、屏幕录制、麦克风、语音、AppleScript）。
- 小的自动化表面：网关 + 节点命令，加上 PeekabooBridge 用于 UI 自动化。
- 可预测的权限：始终是相同的签名包 ID，由 launchd 启动，因此 TCC 授权保持。

## 工作原理
### 网关 + 节点传输
- 应用运行网关（本地模式）并作为节点连接到它。
- 代理操作通过 `node.invoke` 执行（例如 `system.run`、`system.notify`、`canvas.*`）。

### 节点服务 + 应用 IPC
- 一个无头节点主机服务连接到网关 WebSocket。
- `system.run` 请求通过本地 Unix 套接字转发到 macOS 应用。
- 应用在 UI 上下文中执行 exec，根据需要提示，并返回输出。

图表 (SCI)：
```
代理 -> 网关 -> 节点服务 (WS)
                      |  IPC (UDS + 令牌 + HMAC + TTL)
                      v
                  Mac 应用 (UI + TCC + system.run)
```

### PeekabooBridge (UI 自动化)
- UI 自动化使用一个名为 `bridge.sock` 的单独 UNIX 套接字和 PeekabooBridge JSON 协议。
- 主机偏好顺序（客户端）：Peekaboo.app → Claude.app → Moltbot.app → 本地执行。
- 安全性：桥接主机需要允许的 TeamID；DEBUG-only 相同 UID 逃生舱由 `PEEKABOO_ALLOW_UNSIGNED_SOCKET_CLIENTS=1`（Peekaboo 约定）保护。
- 参见：[PeekabooBridge 用法](/platforms/mac/peekaboo) 了解详情。

## 操作流程
- 重启/重建：`SIGN_IDENTITY="Apple Development: <Developer Name> (<TEAMID>)" scripts/restart-mac.sh`
  - 终止现有实例
  - Swift 构建 + 打.pack
  - 写入/引导/启动 LaunchAgent
- 单实例：如果具有相同包 ID 的另一个实例正在运行，应用会提前退出。

## 加固说明
- 优先要求所有特权表面都需要 TeamID 匹配。
- PeekabooBridge：`PEEKABOO_ALLOW_UNSIGNED_SOCKET_CLIENTS=1`（仅 DEBUG）可能允许相同 UID 调用者用于本地开发。
- 所有通信仅保持本地；不暴露网络套接字。
- TCC 提示仅来自 GUI 应用包；在重建过程中保持签名包 ID 稳定。
- IPC 加固：套接字模式 `0600`，令牌，对等 UID 检查，HMAC 挑战/响应，短 TTL。