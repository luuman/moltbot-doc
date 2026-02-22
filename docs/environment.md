---
summary: "Moltbot 从何处加载环境变量及其优先级顺序"
read_when:
  - 您需要知道哪些环境变量被加载，以及它们的顺序
  - 您正在调试网关中缺失的 API 密钥
  - 您正在记录提供者认证或部署环境
---
# 环境变量

Moltbot 从多个源拉取环境变量。规则是 **永不覆盖现有值**。

## 优先级（最高 → 最低）

1) **进程环境**（网关进程从父 shell/守护进程已经拥有的内容）。
2) **当前工作目录中的 `.env`**（dotenv 默认值；不覆盖）。
3) **全局 `.env`** 位于 `~/.clawdbot/.env`（即 `$CLAWDBOT_STATE_DIR/.env`；不覆盖）。
4) **配置 `env` 块** 在 `~/.clawdbot/moltbot.json` 中（仅在缺失时应用）。
5) **可选登录 shell 导入**（`env.shellEnv.enabled` 或 `CLAWDBOT_LOAD_SHELL_ENV=1`），仅对缺失的预期键应用。

如果配置文件完全缺失，则跳过第 4 步；如果启用，shell 导入仍会运行。

## 配置 `env` 块

两种设置内联环境变量的等效方式（两者都不覆盖）：

```json5
{
  env: {
    OPENROUTER_API_KEY: "sk-or-...",
    vars: {
      GROQ_API_KEY: "gsk-..."
    }
  }
}
```

## Shell 环境导入

`env.shellEnv` 运行您的登录 shell 并仅导入 **缺失** 的预期键：

```json5
{
  env: {
    shellEnv: {
      enabled: true,
      timeoutMs: 15000
    }
  }
}
```

环境变量等效项：
- `CLAWDBOT_LOAD_SHELL_ENV=1`
- `CLAWDBOT_SHELL_ENV_TIMEOUT_MS=15000`

## 配置中的环境变量替换

您可以在配置字符串值中直接引用环境变量，使用 `${VAR_NAME}$` 语法：

```json5
{
  models: {
    providers: {
      "vercel-gateway": {
        apiKey: "${VERCEL_GATEWAY_API_KEY}"
      }
    }
  }
}
```

有关完整详细信息，请参见 [配置：环境变量替换](/gateway/configuration#env-var-substitution-in-config)。

## 相关内容

- [网关配置](/gateway/configuration)
- [常见问题：环境变量和 .env 加载](/help/faq#env-vars-and-env-loading)
- [模型概述](/concepts/models)