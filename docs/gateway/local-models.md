---
summary: "在本地 LLM 上运行 Moltbot（LM Studio、vLLM、LiteLLM、自定义 OpenAI 端点）"
read_when:
  - 您想从自己的 GPU 设备提供模型服务
  - 您正在配置 LM Studio 或 OpenAI 兼容代理
  - 您需要最安全的本地模型指导
---
# 本地模型

本地是可以实现的，但 Moltbot 期望大上下文 + 强大的防提示注入保护。小显卡会截断上下文并泄露安全性。目标要高：**≥2 台满配的 Mac Studios 或等效的 GPU 设备（约 $30k+）**。单个 **24 GB** GPU 只适用于较轻的提示且延迟较高。使用 **您可以运行的最大/全尺寸模型变体**；过度量化或"小"检查点会增加提示注入风险（参见 [安全](/gateway/security)）。

## 推荐：LM Studio + MiniMax M2.1（Responses API，全尺寸）

目前最佳的本地堆栈。在 LM Studio 中加载 MiniMax M2.1，启用本地服务器（默认 `http://127.0.0.1:1234`），并使用 Responses API 保持推理与最终文本分离。

```json5
{
  agents: {
    defaults: {
      model: { primary: "lmstudio/minimax-m2.1-gs32" },
      models: {
        "anthropic/claude-opus-4-5": { alias: "Opus" },
        "lmstudio/minimax-m2.1-gs32": { alias: "Minimax" }
      }
    }
  },
  models: {
    mode: "merge",
    providers: {
      lmstudio: {
        baseUrl: "http://127.0.0.1:1234/v1",
        apiKey: "lmstudio",
        api: "openai-responses",
        models: [
          {
            id: "minimax-m2.1-gs32",
            name: "MiniMax M2.1 GS32",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 196608,
            maxTokens: 8192
          }
        ]
      }
    }
  }
}
```

**设置清单**
- 安装 LM Studio：https://lmstudio.ai
- 在 LM Studio 中，下载 **可用的最大 MiniMax M2.1 构建版本**（避免"小"/高度量化的变体），启动服务器，确认 `http://127.0.0.1:1234/v1/models` 列出了它。
- 保持模型加载；冷加载会增加启动延迟。
- 如果您的 LM Studio 构建版本不同，请调整 `contextWindow`/`maxTokens`。
- 对于 WhatsApp，请坚持使用 Responses API，这样只发送最终文本。

即使运行本地模型时也要配置托管模型；使用 `models.mode: "merge"` 以保持备用方案可用。

### 混合配置：托管为主，本地为备用

```json5
{
  agents: {
    defaults: {
      model: {
        primary: "anthropic/claude-sonnet-4-5",
        fallbacks: ["lmstudio/minimax-m2.1-gs32", "anthropic/claude-opus-4-5"]
      },
      models: {
        "anthropic/claude-sonnet-4-5": { alias: "Sonnet" },
        "lmstudio/minimax-m2.1-gs32": { alias: "MiniMax Local" },
        "anthropic/claude-opus-4-5": { alias: "Opus" }
      }
    }
  },
  models: {
    mode: "merge",
    providers: {
      lmstudio: {
        baseUrl: "http://127.0.0.1:1234/v1",
        apiKey: "lmstudio",
        api: "openai-responses",
        models: [
          {
            id: "minimax-m2.1-gs32",
            name: "MiniMax M2.1 GS32",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 196608,
            maxTokens: 8192
          }
        ]
      }
    }
  }
}
```

### 本地优先，托管安全网

交换主用和备用顺序；保持相同的提供商块和 `models.mode: "merge"`，这样当本地设备宕机时可以回退到 Sonnet 或 Opus。

### 区域托管 / 数据路由

- 托管的 MiniMax/Kimi/GLM 变体也存在于 OpenRouter 上，带有区域固定的端点（例如，美国托管）。选择那里的区域变体以将流量保留在您选择的司法管辖区内，同时仍使用 `models.mode: "merge"` 进行 Anthropic/OpenAI 备用。
- 仅本地仍然是最强的隐私路径；托管区域路由是中间路线，当您需要提供商功能但希望控制数据流向时使用。

## 其他 OpenAI 兼容的本地代理

如果 vLLM、LiteLLM、OAI-proxy 或自定义网关暴露 OpenAI 风格的 `/v1` 端点，则可以工作。用您的端点和模型 ID 替换上面的提供商块：

```json5
{
  models: {
    mode: "merge",
    providers: {
      local: {
        baseUrl: "http://127.0.0.1:8000/v1",
        apiKey: "sk-local",
        api: "openai-responses",
        models: [
          {
            id: "my-local-model",
            name: "Local Model",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 120000,
            maxTokens: 8192
          }
        ]
      }
    }
  }
}
```

保持 `models.mode: "merge"` 以便托管模型作为备用方案保持可用。

## 故障排除
- 网关能否访问代理？`curl http://127.0.0.1:1234/v1/models`。
- LM Studio 模型未加载？重新加载；冷启动是常见的"挂起"原因。
- 上下文错误？降低 `contextWindow` 或提高您的服务器限制。
- 安全性：本地模型跳过提供商端过滤器；保持代理范围狭窄并开启压缩以限制提示注入影响范围。
