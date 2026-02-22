---
summary: "PeekabooBridge integration for macOS UI automation"
read_when:
  - Hosting PeekabooBridge in Moltbot.app
  - Integrating Peekaboo via Swift Package Manager
  - Changing PeekabooBridge protocol/paths
---
# Peekaboo桥接 (macOS UI自动化)

Moltbot可以托管**PeekabooBridge**作为本地的、具有权限感知的UI自动化
代理。这使得`peekaboo` CLI能够驱动UI自动化，同时重用
macOS应用的TCC权限。

## 这是什么（以及不是什么）

- **主机**: Moltbot.app可以充当PeekabooBridge主机。
- **客户端**: 使用`peekaboo` CLI（无需单独的`moltbot ui ...`界面）。
- **UI**: 视觉覆盖层保留在Peekaboo.app中；Moltbot是一个轻量级代理主机。

## 启用桥接

在macOS应用中：
- 设置 → **启用Peekaboo桥接**

启用后，Moltbot启动一个本地UNIX套接字服务器。如果禁用，则主机
停止，`peekaboo`将回退到其他可用主机。

## 客户端发现顺序

Peekaboo客户端通常按以下顺序尝试主机：

1. Peekaboo.app（完整UX）
2. Claude.app（如果已安装）
3. Moltbot.app（轻量级代理）

使用`peekaboo bridge status --verbose`查看哪个主机处于活动状态以及
正在使用哪个套接字路径。您可以使用以下命令覆盖：

```bash
export PEEKABOO_BRIDGE_SOCKET=/path/to/bridge.sock
```

## 安全性和权限

- 桥接验证**调用者代码签名**；执行TeamID白名单（Peekaboo主机TeamID + Moltbot应用TeamID）。
- 请求在约10秒后超时。
- 如果缺少所需权限，桥接将返回清晰的错误消息
  而不是启动系统设置。

## 快照行为（自动化）

快照存储在内存中，并在短时间窗口后自动过期。
如果需要更长的保留时间，请从客户端重新捕获。

## 故障排除

- 如果`peekaboo`报告"桥接客户端未授权"，请确保客户端
  已正确签名或在**调试**模式下使用`PEEKABOO_ALLOW_UNSIGNED_SOCKET_CLIENTS=1`
  运行主机。
- 如果未找到主机，请打开其中一个主机应用（Peekaboo.app或Moltbot.app）
  并确认已授予权限。