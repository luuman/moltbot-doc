---
summary: "运行用于 IDE 集成的 ACP 桥接器"
read_when:
  - 设置基于 ACP 的 IDE 集成
  - 调试到网关的 ACP 会话路由
---

# acp

运行与 Moltbot 网关通信的 ACP（智能体客户端协议）桥接器。

该命令通过 stdio 为 IDE 发送 ACP 并通过 WebSocket 将提示转发到网关。
它将 ACP 会话映射到网关会话密钥。

## 用法

```bash
moltbot acp

# 远程网关
moltbot acp --url wss://gateway-host:18789 --token <token>

# 附加到现有会话密钥
moltbot acp --session agent:main:main

# 按标签附加（必须已存在）
moltbot acp --session-label "支持收件箱"

# 在首次提示前重置会话密钥
moltbot acp --session agent:main:main --reset-session
```

## ACP 客户端（调试）

使用内置的 ACP 客户端在没有 IDE 的情况下检查桥接器。
它启动 ACP 桥接器并允许您交互式地键入提示。

```bash
moltbot acp client

# 将启动的桥接器指向远程网关
moltbot acp client --server-args --url wss://gateway-host:18789 --token <token>

# 覆盖服务器命令（默认值：moltbot）
moltbot acp client --server "node" --server-args moltbot.mjs acp --url ws://127.0.0.1:19001
```

## 如何使用

当 IDE（或其他客户端）使用智能体客户端协议并且您希望
它驱动 Moltbot 网关会话时，请使用 ACP。

1. 确保网关正在运行（本地或远程）。
2. 配置网关目标（配置或标志）。
3. 让您的 IDE 通过 stdio 运行 `moltbot acp`。

示例配置（持久化）：

```bash
moltbot config set gateway.remote.url wss://gateway-host:18789
moltbot config set gateway.remote.token <token>
```

示例直接运行（不写入配置）：

```bash
moltbot acp --url wss://gateway-host:18789 --token <token>
```

## 选择智能体

ACP 不直接选择智能体。它按网关会话密钥路由。

使用智能体范围的会话密钥来定位特定智能体：

```bash
moltbot acp --session agent:main:main
moltbot acp --session agent:design:main
moltbot acp --session agent:qa:bug-123
```

每个 ACP 会话映射到单个网关会话密钥。一个智能体可以有多个
会话；ACP 默认使用隔离的 `acp:<uuid>` 会话，除非您覆盖
密钥或标签。

## Zed 编辑器设置

在 `~/.config/zed/settings.json` 中添加自定义 ACP 智能体（或使用 Zed 的设置界面）：

```json
{
  "agent_servers": {
    "Moltbot ACP": {
      "type": "custom",
      "command": "moltbot",
      "args": ["acp"],
      "env": {}
    }
  }
}
```

要定位特定网关或智能体：

```json
{
  "agent_servers": {
    "Moltbot ACP": {
      "type": "custom",
      "command": "moltbot",
      "args": [
        "acp",
        "--url", "wss://gateway-host:18789",
        "--token", "<token>",
        "--session", "agent:design:main"
      ],
      "env": {}
    }
  }
}
```

在 Zed 中，打开智能体面板并选择 "Moltbot ACP" 以启动线程。

## 会话映射

默认情况下，ACP 会话获得带 `acp:` 前缀的隔离网关会话密钥。
要重用已知会话，请传递会话密钥或标签：

- `--session <key>`: 使用特定网关会话密钥。
- `--session-label <label>`: 按标签解析现有会话。
- `--reset-session`: 为此密钥生成新的会话 id（相同密钥，新记录）。

如果您的 ACP 客户端支持元数据，您可以按会话覆盖：

```json
{
  "_meta": {
    "sessionKey": "agent:main:main",
    "sessionLabel": "支持收件箱",
    "resetSession": true
  }
}
```

在 [/concepts/session](/concepts/session) 了解有关会话密钥的更多信息。

## 选项

- `--url <url>`: 网关 WebSocket URL（配置时默认为 gateway.remote.url）。
- `--token <token>`: 网关认证令牌。
- `--password <password>`: 网关认证密码。
- `--session <key>`: 默认会话密钥。
- `--session-label <label>`: 要解析的默认会话标签。
- `--require-existing`: 如果会话密钥/标签不存在则失败。
- `--reset-session`: 在首次使用前重置会话密钥。
- `--no-prefix-cwd`: 不用工作目录作为提示前缀。
- `--verbose, -v`: 详细日志输出到 stderr。

### `acp client` 选项

- `--cwd <dir>`: ACP 会话的工作目录。
- `--server <command>`: ACP 服务器命令（默认值：`moltbot`）。
- `--server-args <args...>`: 传递给 ACP 服务器的额外参数。
- `--server-verbose`: 启用 ACP 服务器上的详细日志记录。
- `--verbose, -v`: 详细的客户端日志记录。

## 翻译说明

此文档已翻译为中文，保留了原有的技术术语和命令格式。