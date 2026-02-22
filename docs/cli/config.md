---
summary: "`moltbot config` 的 CLI 参考（获取/设置/取消设置配置值）"
read_when:
  - 您想以非交互方式读取或编辑配置
---

# `moltbot config`

配置助手：通过路径获取/设置/取消设置值。不带子命令运行以打开
配置向导（与 `moltbot configure` 相同）。

## 示例

```bash
moltbot config get browser.executablePath
moltbot config set browser.executablePath "/usr/bin/google-chrome"
moltbot config set agents.defaults.heartbeat.every "2h"
moltbot config set agents.list[0].tools.exec.node "node-id-or-name"
moltbot config unset tools.web.search.apiKey
```

## 路径

路径使用点号或括号表示法：

```bash
moltbot config get agents.defaults.workspace
moltbot config get agents.list[0].id
```

使用代理列表索引来定位特定代理：

```bash
moltbot config get agents.list
moltbot config set agents.list[1].tools.exec.node "node-id-or-name"
```

## 值

值尽可能解析为 JSON5；否则作为字符串处理。
使用 `--json` 要求 JSON5 解析。

```bash
moltbot config set agents.defaults.heartbeat.every "0m"
moltbot config set gateway.port 19001 --json
moltbot config set channels.whatsapp.groups '["*"]' --json
```

编辑后重启网关。
