---
summary: "Gateway lifecycle on macOS (launchd)"
read_when:
  - Integrating the mac app with the gateway lifecycle
---
# macOS上的网关生命周期

macOS应用默认情况下**通过launchd管理网关**，而不是作为子进程生成网关。
它首先尝试连接到配置端口上已经运行的网关；如果没有可达的网关，
它通过外部`moltbot` CLI（无嵌入式运行时）启用launchd服务。
这为您提供登录时可靠的自动启动和崩溃时重启。

子进程模式（网关直接由应用生成）目前**未使用**。
如果您需要与UI更紧密的耦合，请在终端中手动运行网关。

## 默认行为（launchd）

- 应用安装一个标记为`bot.molt.gateway`的每用户LaunchAgent
  （或在使用`--profile`/`CLAWDBOT_PROFILE`时为`bot.molt.<profile>`；支持旧版`com.clawdbot.*`）。
- 启用本地模式时，应用确保LaunchAgent已加载并在需要时启动网关。
- 日志写入launchd网关日志路径（在调试设置中可见）。

常用命令：

```bash
launchctl kickstart -k gui/$UID/bot.molt.gateway
launchctl bootout gui/$UID/bot.molt.gateway
```

运行命名配置文件时将标签替换为`bot.molt.<profile>`。

## 未签名的开发构建

`scripts/restart-mac.sh --no-sign`用于您没有签名密钥时的快速本地构建。
为防止launchd指向未签名的中继二进制文件，它：

- 写入`~/.clawdbot/disable-launchagent`。

签名运行的`scripts/restart-mac.sh`会在存在标记时清除此覆盖。
要手动重置：

```bash
rm ~/.clawdbot/disable-launchagent
```

## 仅连接模式

要强制macOS应用**从不安装或管理launchd**，请使用
`--attach-only`（或`--no-launchd`）启动它。
这设置了`~/.clawdbot/disable-launchagent`，
因此应用只连接到已经运行的网关。
您可以在调试设置中切换相同的行为。

## 远程模式

远程模式从不启动本地网关。应用使用SSH隧道连接到
远程主机并通过该隧道连接。

## 为什么我们偏好launchd

- 登录时自动启动。
- 内置重启/KeepAlive语义。
- 可预测的日志和监督。

如果将来再次需要真正的子进程模式，应该将其记录为
单独的、明确的仅开发模式。