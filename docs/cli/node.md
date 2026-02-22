---
summary: "`moltbot node` 的 CLI 参考（无头节点主机）"
read_when:
  - 运行无头节点主机
  - 为非 macOS 节点配对以使用 system.run
---

# `moltbot node`

运行连接到网关 WebSocket 并在此机器上公开
`system.run` / `system.which` 的**无头节点主机**。

## 为什么要使用节点主机？

当您希望智能体在不安装完整 macOS 伴侣应用程序的情况下**在其他机器上运行命令**时，
请使用节点主机。

常见用例：
- 在远程 Linux/Windows 机器上运行命令（构建服务器、实验室机器、NAS）。
- 在网关上保持 exec **沙盒化**，但将已批准的运行委托给其他主机。
- 为自动化或 CI 节点提供轻量级、无头的执行目标。

执行仍受节点主机上的**exec 批准**和每智能体允许列表保护，
因此您可以保持命令访问范围明确。

## 浏览器代理（零配置）

如果节点上未禁用 `browser.enabled`，节点主机会自动广播浏览器代理。
这使智能体可以在该节点上使用浏览器自动化而无需额外配置。

如有需要可在节点上禁用：

```json5
{
  nodeHost: {
    browserProxy: {
      enabled: false
    }
  }
}
```

## 运行（前台）

```bash
moltbot node run --host <gateway-host> --port 18789
```

选项：
- `--host <host>`: 网关 WebSocket 主机（默认：`127.0.0.1`）
- `--port <port>`: 网关 WebSocket 端口（默认：`18789`）
- `--tls`: 为网关连接使用 TLS
- `--tls-fingerprint <sha256>`: 期望的 TLS 证书指纹（sha256）
- `--node-id <id>`: 覆盖节点 ID（清除配对令牌）
- `--display-name <name>`: 覆盖节点显示名称

## 服务（后台）

将无头节点主机安装为用户服务。

```bash
moltbot node install --host <gateway-host> --port 18789
```

选项：
- `--host <host>`: 网关 WebSocket 主机（默认：`127.0.0.1`）
- `--port <port>`: 网关 WebSocket 端口（默认：`18789`）
- `--tls`: 为网关连接使用 TLS
- `--tls-fingerprint <sha256>`: 期望的 TLS 证书指纹（sha256）
- `--node-id <id>`: 覆盖节点 ID（清除配对令牌）
- `--display-name <name>`: 覆盖节点显示名称
- `--runtime <runtime>`: 服务运行时（`node` 或 `bun`）
- `--force`: 如果已安装则重新安装/覆盖

管理服务：

```bash
moltbot node status
moltbot node stop
moltbot node restart
moltbot node uninstall
```

使用 `moltbot node run` 运行前台节点主机（无服务）。

服务命令接受 `--json` 以获取机器可读输出。

## 配对

首次连接会在网关上创建一个待处理的节点配对请求。
通过以下方式批准：

```bash
moltbot nodes pending
moltbot nodes approve <requestId>
```

节点主机将其节点 ID、令牌、显示名称和网关连接信息存储在
`~/.clawdbot/node.json` 中。

## Exec 批准

`system.run` 受本地 exec 批准限制：

- `~/.clawdbot/exec-approvals.json`
- [Exec 批准](/tools/exec-approvals)
- `moltbot approvals --node <id|name|ip>`（从网关编辑）
