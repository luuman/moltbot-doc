---
summary: "使用 Ollama（本地 LLM 运行时）运行 Moltbot"
read_when:
  - 您希望通过 Ollama 使用本地模型运行 Moltbot
  - 您需要 Ollama 设置和配置指导
---
# Ollama

Ollama 是一个本地 LLM 运行时，可以轻松在您的机器上运行开源模型。Moltbot 与 Ollama 的 OpenAI 兼容 API 集成，并且当您使用 `OLLAMA_API_KEY`（或身份验证配置文件）选择加入且不定义显式的 `models.providers.ollama` 条目时，可以**自动发现支持工具的模型**。

## 快速开始

1) 安装 Ollama：https://ollama.ai

2) 拉取模型：

```bash
ollama pull llama3.3
# 或
ollama pull qwen2.5-coder:32b
# 或
ollama pull deepseek-r1:32b
```

3) 为 Moltbot 启用 Ollama（任何值都可以；Ollama 不需要真正的密钥）：

```bash
# 设置环境变量
export OLLAMA_API_KEY="ollama-local"

# 或在配置文件中配置
moltbot config set models.providers.ollama.apiKey "ollama-local"
```

4) 使用 Ollama 模型：

```json5
{
  agents: {
    defaults: {
      model: { primary: "ollama/llama3.3" }
    }
  }
}
```

## 模型发现（隐式提供者）

当您设置 `OLLAMA_API_KEY`（或身份验证配置文件）且**不**定义 `models.providers.ollama` 时，Moltbot 从位于 `http://127.0.0.1:11434` 的本地 Ollama 实例发现模型：

- 查询 `/api/tags` 和 `/api/show`
- 仅保留报告 `tools` 功能的模型
- 当模型报告 `thinking` 时标记 `reasoning`
- 在可用时从 `model_info["<arch>.context_length"]` 读取 `contextWindow`
- 将 `maxTokens` 设置为上下文窗口的 10 倍
- 将所有成本设置为 `0`

这避免了手动模型条目，同时保持目录与 Ollama 功能的一致性。

查看可用模型：

```bash
ollama list
moltbot models list
```

要添加新模型，只需使用 Ollama 拉取它：

```bash
ollama pull mistral
```

新模型将被自动发现并可供使用。

如果您显式设置 `models.providers.ollama`，则跳过自动发现，您必须手动定义模型（见下文）。

## 配置

### 基础设置（隐式发现）

启用 Ollama 的最简单方法是通过环境变量：

```bash
export OLLAMA_API_KEY="ollama-local"
```

### 显式设置（手动模型）

在以下情况下使用显式配置：
- Ollama 在另一台主机/端口上运行。
- 您想强制使用特定的上下文窗口或模型列表。
- 您想包含不报告工具支持的模型。

```json5
{
  models: {
    providers: {
      ollama: {
        // 使用包含 /v1 的主机以兼容 OpenAI API
        baseUrl: "http://ollama-host:11434/v1",
        apiKey: "ollama-local",
        api: "openai-completions",
        models: [
          {
            id: "llama3.3",
            name: "Llama 3.3",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 8192,
            maxTokens: 8192 * 10
          }
        ]
      }
    }
  }
}
```

如果设置了 `OLLAMA_API_KEY`，您可以省略提供者条目中的 `apiKey`，Moltbot 将在可用性检查时填充它。

### 自定义基础 URL（显式配置）

如果 Ollama 在不同的主机或端口上运行（显式配置禁用自动发现，因此请手动定义模型）：

```json5
{
  models: {
    providers: {
      ollama: {
        apiKey: "ollama-local",
        baseUrl: "http://ollama-host:11434/v1"
      }
    }
  }
}
```

### 模型选择

配置完成后，所有 Ollama 模型都可用：

```json5
{
  agents: {
    defaults: {
      model: {
        primary: "ollama/llama3.3",
        fallback: ["ollama/qwen2.5-coder:32b"]
      }
    }
  }
}
```

## 高级

### 推理模型

当 Ollama 在 `/api/show` 中报告 `thinking` 时，Moltbot 将模型标记为具备推理能力：

```bash
ollama pull deepseek-r1:32b
```

### 模型成本

Ollama 是免费的并在本地运行，因此所有模型成本都设置为 $0。

### 上下文窗口

对于自动发现的模型，Moltbot 在可用时使用 Ollama 报告的上下文窗口，否则默认为 `8192`。您可以在显式提供者配置中覆盖 `contextWindow` 和 `maxTokens`。

## 故障排除

### 未检测到 Ollama

确保 Ollama 正在运行并且您设置了 `OLLAMA_API_KEY`（或身份验证配置文件），并且您**没有**定义显式的 `models.providers.ollama` 条目：

```bash
ollama serve
```

并且 API 可访问：

```bash
curl http://localhost:11434/api/tags
```

### 无可用模型

Moltbot 仅自动发现报告工具支持的模型。如果您的模型未列出，则：
- 拉取支持工具的模型，或
- 在 `models.providers.ollama` 中显式定义模型。

添加模型：

```bash
ollama list  # 查看已安装的内容
ollama pull llama3.3  # 拉取模型
```

### 连接被拒绝

检查 Ollama 是否在正确的端口上运行：

```bash
# 检查 Ollama 是否正在运行
ps aux | grep ollama

# 或重启 Ollama
ollama serve
```

## 参见

- [模型提供者](/concepts/model-providers) - 所有提供者的概述
- [模型选择](/concepts/models) - 如何选择模型
- [配置](/gateway/configuration) - 完整配置参考
