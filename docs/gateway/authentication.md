---
summary: "模型认证：OAuth、API 密钥和 setup-token"
read_when:
  - 调试模型认证或 OAuth 过期
  - 记录认证或凭证存储
---
# 认证

Moltbot 支持模型提供商的 OAuth 和 API 密钥。对于 Anthropic
账户，我们建议使用 **API 密钥**。对于 Claude 订阅访问，
使用 `claude setup-token` 创建的长期有效令牌。

有关完整 OAuth 流程和存储布局，请参见 [/concepts/oauth](/concepts/oauth)。

## 推荐的 Anthropic 设置（API 密钥）

如果直接使用 Anthropic，请使用 API 密钥。

1) 在 Anthropic 控制台中创建 API 密钥。
2) 将其放在 **网关主机**（运行 `moltbot gateway` 的机器）上。

```bash
export ANTHROPIC_API_KEY="..."
moltbot models status
```

3) 如果网关在 systemd/launchd 下运行，最好将密钥放在
`~/.clawdbot/.env` 中，以便守护进程可以读取它：

```bash
cat >> ~/.clawdbot/.env <<'EOF'
ANTHROPIC_API_KEY=...
EOF
```

然后重启守护进程（或重启您的网关进程）并重新检查：

```bash
moltbot models status
moltbot doctor
```

如果您不想自己管理环境变量，入职向导可以为守护进程存储
API 密钥：`moltbot onboard`。

有关环境继承（`env.shellEnv`、
`~/.clawdbot/.env`、systemd/launchd）的详细信息，请参见 [帮助](/help)。

## Anthropic：setup-token（订阅认证）

对于 Anthropic，推荐路径是 **API 密钥**。如果您正在使用 Claude
订阅，也支持 setup-token 流程。在 **网关主机** 上运行它：

```bash
claude setup-token
```

然后将其粘贴到 Moltbot 中：

```bash
moltbot models auth setup-token --provider anthropic
```

如果令牌是在另一台机器上创建的，请手动粘贴：

```bash
moltbot models auth paste-token --provider anthropic
```

如果您看到类似以下的 Anthropic 错误：

```
此凭证仅授权用于 Claude Code，不能用于其他 API 请求。
```

…请改用 Anthropic API 密钥。

手动令牌输入（任何提供商；写入 `auth-profiles.json` + 更新配置）：

```bash
moltbot models auth paste-token --provider anthropic
moltbot models auth paste-token --provider openrouter
```

自动化友好的检查（过期/缺失时退出 `1`，即将过期时退出 `2`）：

```bash
moltbot models status --check
```

可选的运维脚本（systemd/Termux）记录在这里：
[/automation/auth-monitoring](/automation/auth-monitoring)

> `claude setup-token` 需要交互式 TTY。

## 检查模型认证状态

```bash
moltbot models status
moltbot doctor
```

## 控制使用的凭证

### 按会话（聊天命令）

使用 `/model <alias-or-id>@<profileId>` 为当前会话固定特定提供商凭证（示例配置文件ID：`anthropic:default`、`anthropic:work`）。

使用 `/model`（或 `/model list`）进行紧凑选择；使用 `/model status` 查看完整视图（候选项 + 下一个认证配置文件，以及配置时的提供商端点详情）。

### 按代理（CLI 覆盖）

为代理设置显式的认证配置文件顺序覆盖（存储在该代理的 `auth-profiles.json` 中）：

```bash
moltbot models auth order get --provider anthropic
moltbot models auth order set --provider anthropic anthropic:default
moltbot models auth order clear --provider anthropic
```

使用 `--agent <id>` 指定特定代理；省略它以使用配置的默认代理。

## 故障排除

### "找不到凭证"

如果 Anthropic 令牌配置文件缺失，在
**网关主机** 上运行 `claude setup-token`，然后重新检查：

```bash
moltbot models status
```

### 令牌即将过期/已过期

运行 `moltbot models status` 确认哪个配置文件即将过期。如果配置文件
缺失，重新运行 `claude setup-token` 并再次粘贴令牌。

## 要求

- Claude Max 或 Pro 订阅（用于 `claude setup-token`）
- 已安装 Claude Code CLI（`claude` 命令可用）