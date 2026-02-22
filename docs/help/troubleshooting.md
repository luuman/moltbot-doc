---
summary: "故障排除中心：症状 → 检查 → 修复"
read_when:
  - 遇到错误并希望找到修复路径时
  - 安装程序显示"成功"，但 CLI 不工作时
---

# 故障排除

## 前 60 秒

按顺序运行以下命令：

```bash
moltbot status
moltbot status --all
moltbot gateway probe
moltbot logs --follow
moltbot doctor
```

如果网关可访问，则进行深度探测：

```bash
moltbot status --deep
```

## 常见的"出问题了"情况

### `moltbot: command not found`

几乎总是 Node/npm PATH 问题。从这里开始：

- [安装 (Node/npm PATH 安全检查)](/install#nodejs--npm-path-sanity)

### 安装失败（或需要完整日志）

在详细模式下重新运行安装程序以查看完整的跟踪和 npm 输出：

```bash
curl -fsSL https://molt.bot/install.sh | bash -s -- --verbose
```

对于测试版安装：

```bash
curl -fsSL https://molt.bot/install.sh | bash -s -- --beta --verbose
```

您也可以设置 `CLAWDBOT_VERBOSE=1` 来代替标志。

### 网关"未授权"、无法连接或不断重连

- [网关故障排除](/gateway/troubleshooting)
- [网关认证](/gateway/authentication)

### 控制 UI 在 HTTP 上失败（需要设备身份）

- [网关故障排除](/gateway/troubleshooting)
- [控制 UI](/web/control-ui#insecure-http)

### `docs.molt.bot` 显示 SSL 错误（Comcast/Xfinity）

某些 Comcast/Xfinity 连接通过 Xfinity 高级安全功能阻止 `docs.molt.bot`。
禁用高级安全功能或将 `docs.molt.bot` 添加到允许列表中，然后重试。

- Xfinity 高级安全帮助：https://www.xfinity.com/support/articles/using-xfinity-xfi-advanced-security
- 快速健全性检查：尝试移动热点或 VPN 以确认是 ISP 级别的过滤

### 服务显示运行中，但 RPC 探测失败

- [网关故障排除](/gateway/troubleshooting)
- [后台进程 / 服务](/gateway/background-process)

### 模型/认证失败（速率限制、计费、"所有模型失败"）

- [模型](/cli/models)
- [OAuth / 认证概念](/concepts/oauth)

### `/model` 显示 `model not allowed`

这通常意味着 `agents.defaults.models` 被配置为允许列表。当它非空时，
只允许选择那些提供者/模型键。

- 检查允许列表：`moltbot config get agents.defaults.models`
- 添加您想要的模型（或清除允许列表）并重试 `/model`
- 使用 `/models` 浏览允许的提供者/模型

### 提交问题时

粘贴一份安全报告：

```bash
moltbot status --all
```

如果可以，请包含来自 `moltbot logs --follow` 的相关日志尾部。