---
summary: "Moltbot 内存如何工作（工作区文件 + 自动内存刷新）"
read_when:
  - 您想要内存文件布局和工作流程时
  - 您想要调整自动预压缩内存刷新时
---
# 内存

Moltbot 内存是 **代理工作区中的纯 Markdown**。文件是
真相来源；模型只"记住"写入磁盘的内容。

内存搜索工具由活动内存插件提供（默认：
`memory-core`）。使用 `plugins.slots.memory = "none"` 禁用内存插件。

## 内存文件（Markdown）

默认工作区布局使用两层内存：

- `memory/YYYY-MM-DD.md`
  - 每日日志（仅追加）。
  - 在会话开始时读取今天 + 昨天。
- `MEMORY.md`（可选）
  - 精选的长期内存。
  - **仅在主、私有会话中加载**（永不加载到群组上下文中）。

这些文件存储在工作区下（`agents.defaults.workspace`，默认
`~/clawd`）。参见 [代理工作区](/concepts/agent-workspace) 了解完整布局。

## 何时写入内存

- 决策、偏好和持久事实进入 `MEMORY.md`。
- 日常笔记和运行上下文进入 `memory/YYYY-MM-DD.md`。
- 如果有人说"记住这个"，写下来（不要保留在 RAM 中）。
- 这个领域仍在发展。提醒模型存储内存会有所帮助；它会知道该怎么做。
- 如果您想让某事留下印象，**要求机器人写入** 内存。

## 自动内存刷新（预压缩 ping）

当会话 **接近自动压缩** 时，Moltbot 触发一个 **静默、
代理回合**，提醒模型在上下文被压缩 **之前** 写入持久内存。默认提示明确说明模型 *可以回复*，
但通常 `NO_REPLY` 是正确响应，因此用户永远不会看到这个回合。

这由 `agents.defaults.compaction.memoryFlush` 控制：

```json5
{
  agents: {
    defaults: {
      compaction: {
        reserveTokensFloor: 20000,
        memoryFlush: {
          enabled: true,
          softThresholdTokens: 4000,
          systemPrompt: "Session nearing compaction. Store durable memories now.",
          prompt: "Write any lasting notes to memory/YYYY-MM-DD.md; reply with NO_REPLY if nothing to store."
        }
      }
    }
  }
}
```

详情：
- **软阈值**：当会话 token 估计值跨越
  `contextWindow - reserveTokensFloor - softThresholdTokens` 时触发刷新。
- **默认静默**：提示包含 `NO_REPLY`，因此不发送任何内容。
- **两个提示**：用户提示加上系统提示追加提醒。
- **每个压缩周期一次刷新**（在 `sessions.json` 中跟踪）。
- **工作区必须可写**：如果会话在沙盒中运行，使用
  `workspaceAccess: "ro"` 或 `"none"`，则跳过刷新。

有关完整压缩生命周期，请参见
[会话管理 + 压缩](/reference/session-management-compaction)。

## 向量内存搜索

Moltbot 可以在 `MEMORY.md` 和 `memory/*.md` 上构建小向量索引，以便
语义查询可以找到相关笔记，即使措辞不同。

默认值：
- 默认启用。
- 监视内存文件的变化（防抖）。
- 默认使用远程嵌入。如果未设置 `memorySearch.provider`，Moltbot 自动选择：
  1. 如果配置了 `memorySearch.local.modelPath` 且文件存在，则为 `local`。
  2. 如果可以解析 OpenAI 密钥，则为 `openai`。
  3. 如果可以解析 Gemini 密钥，则为 `gemini`。
  4. 否则内存搜索保持禁用，直到配置。
- 本地模式使用 node-llama-cpp，可能需要 `pnpm approve-builds`。
- 使用 sqlite-vec（当可用时）在 SQLite 内部加速向量搜索。

远程嵌入 **需要** 嵌入提供商的 API 密钥。Moltbot
从认证配置文件、`models.providers.*.apiKey` 或环境
变量中解析密钥。Codex OAuth 仅涵盖聊天/补全，**不** 满足
内存搜索的嵌入。对于 Gemini，使用 `GEMINI_API_KEY` 或
`models.providers.google.apiKey`。使用自定义 OpenAI 兼容端点时，
设置 `memorySearch.remote.apiKey`（和可选的 `memorySearch.remote.headers`）。

### Gemini 嵌入（原生）

将提供商设置为 `gemini` 以直接使用 Gemini 嵌入 API：

```json5
agents: {
  defaults: {
    memorySearch: {
      provider: "gemini",
      model: "gemini-embedding-001",
      remote: {
        apiKey: "YOUR_GEMINI_API_KEY"
      }
    }
  }
}
```

说明：
- `remote.baseUrl` 是可选的（默认为 Gemini API 基础 URL）。
- `remote.headers` 让您在需要时添加额外标头。
- 默认模型：`gemini-embedding-001`。

如果您想使用 **自定义 OpenAI 兼容端点**（OpenRouter、vLLM 或代理），
您可以使用 OpenAI 提供商的 `remote` 配置：

```json5
agents: {
  defaults: {
    memorySearch: {
      provider: "openai",
      model: "text-embedding-3-small",
      remote: {
        baseUrl: "https://api.example.com/v1/",
        apiKey: "YOUR_OPENAI_COMPAT_API_KEY",
        headers: { "X-Custom-Header": "value" }
      }
    }
  }
}
```

如果您不想设置 API 密钥，使用 `memorySearch.provider = "local"` 或设置
`memorySearch.fallback = "none"`。

回退：
- `memorySearch.fallback` 可以是 `openai`、`gemini`、`local` 或 `none`。
- 仅当主嵌入提供商失败时才使用回退提供商。

批量索引（OpenAI + Gemini）：
- OpenAI 和 Gemini 嵌入默认启用。设置 `agents.defaults.memorySearch.remote.batch.enabled = false` 以禁用。
- 默认行为等待批量完成；根据需要调整 `remote.batch.wait`、`remote.batch.pollIntervalMs` 和 `remote.batch.timeoutMinutes`。
- 设置 `remote.batch.concurrency` 以控制我们并行提交多少批量作业（默认：2）。
- 批量模式在 `memorySearch.provider = "openai"` 或 `"gemini"` 时应用，使用相应的 API 密钥。
- Gemini 批量作业使用异步嵌入批量端点，需要 Gemini 批量 API 可用性。

为什么 OpenAI 批量快速 + 便宜：
- 对于大型回填，OpenAI 通常是我们支持的最快选项，因为我们可以在单个批量作业中提交许多嵌入请求，让 OpenAI 异步处理它们。
- OpenAI 为批量 API 工作负载提供折扣定价，因此大型索引运行通常比同步发送相同请求更便宜。
- 有关详细信息，请参见 OpenAI 批量 API 文档和定价：
  - https://platform.openai.com/docs/api-reference/batch
  - https://platform.openai.com/pricing

配置示例：

```json5
agents: {
  defaults: {
    memorySearch: {
      provider: "openai",
      model: "text-embedding-3-small",
      fallback: "openai",
      remote: {
        batch: { enabled: true, concurrency: 2 }
      },
      sync: { watch: true }
    }
  }
}
```

工具：
- `memory_search` — 返回带文件 + 行范围的片段。
- `memory_get` — 按路径读取内存文件内容。

本地模式：
- 设置 `agents.defaults.memorySearch.provider = "local"`。
- 提供 `agents.defaults.memorySearch.local.modelPath`（GGUF 或 `hf:` URI）。
- 可选：设置 `agents.defaults.memorySearch.fallback = "none"` 以避免远程回退。

### 内存工具如何工作

- `memory_search` 从 `MEMORY.md` + `memory/**/*.md` 语义搜索 Markdown 块（~400 token 目标，80-token 重叠）。它返回片段文本（上限 ~700 字符）、文件路径、行范围、分数、提供商/模型，以及我们是否从本地 → 远程嵌入回退。不返回完整文件载荷。
- `memory_get` 读取特定内存 Markdown 文件（工作区相对），可选地从起始行开始并读取 N 行。拒绝 `MEMORY.md` / `memory/` 之外的路径。
- 仅当 `memorySearch.enabled` 对代理解析为真时才启用这两个工具。

### 索引什么（以及何时）

- 文件类型：仅 Markdown（`MEMORY.md`，`memory/**/*.md`）。
- 索引存储：每个代理 SQLite 位于 `~/.clawdbot/memory/<agentId>.sqlite`（可通过 `agents.defaults.memorySearch.store.path` 配置，支持 `{agentId}` 令牌）。
- 新鲜度：`MEMORY.md` + `memory/` 上的监视器将索引标记为脏（防抖 1.5s）。在会话开始、搜索或间隔时安排同步，并异步运行。会话记录使用增量阈值触发后台同步。
- 重新索引触发器：索引存储嵌入 **提供商/模型 + 端点指纹 + 分块参数**。如果其中任何一项更改，Moltbot 自动重置并重新索引整个存储。

### 混合搜索（BM25 + 向量）

启用时，Moltbot 组合：
- **向量相似性**（语义匹配，措辞可能不同）
- **BM25 关键词相关性**（确切的令牌，如 ID、环境变量、代码符号）

如果您的平台上全文搜索不可用，Moltbot 回退到仅向量搜索。

#### 为什么混合？

向量搜索擅长"这意味着同样的事情"：
- "Mac Studio 网关主机" vs "运行网关的机器"
- "防抖文件更新" vs "避免在每次写入时索引"

但它在确切的高信号令牌上可能较弱：
- ID（`a828e60`，`b3b9895a…`）
- 代码符号（`memorySearch.query.hybrid`）
- 错误字符串（"sqlite-vec 不可用"）

BM25（全文）相反：在确切令牌上强，在转述上弱。
混合搜索是实用的中间地带：**使用两种检索信号**，这样您就能获得
"自然语言"查询和"大海捞针"查询的良好结果。

#### 我们如何合并结果（当前设计）

实现草图：

1) 从两侧检索候选池：
- **向量**：按余弦相似性排序的前 `maxResults * candidateMultiplier`。
- **BM25**：按 FTS5 BM25 排名（越低越好）排序的前 `maxResults * candidateMultiplier`。

2) 将 BM25 排名转换为 0..1 左右的分数：
- `textScore = 1 / (1 + max(0, bm25Rank))`

3) 按块 ID 联合候选并计算加权分数：
- `finalScore = vectorWeight * vectorScore + textWeight * textScore`

说明：
- `vectorWeight` + `textWeight` 在配置解析中归一化为 1.0，因此权重表现得像百分比。
- 如果嵌入不可用（或提供商返回零向量），我们仍运行 BM25 并返回关键词匹配。
- 如果无法创建 FTS5，我们保持仅向量搜索（无硬故障）。

这不是"IR 理论完美"，但简单、快速，并倾向于在真实笔记上改进召回率/精度。
如果我们以后想更花哨，常见的下一步是倒数排名融合（RRF）或混合前的分数标准化
（最小/最大或 z 得分）。

配置：

```json5
agents: {
  defaults: {
    memorySearch: {
      query: {
        hybrid: {
          enabled: true,
          vectorWeight: 0.7,
          textWeight: 0.3,
          candidateMultiplier: 4
        }
      }
    }
  }
}
```

### 嵌入缓存

Moltbot 可以在 SQLite 中缓存 **块嵌入**，这样重新索引和频繁更新（尤其是会话记录）不会重新嵌入未更改的文本。

配置：

```json5
agents: {
  defaults: {
    memorySearch: {
      cache: {
        enabled: true,
        maxEntries: 50000
      }
    }
  }
}
```

### 会话内存搜索（实验性）

您可以选择索引 **会话记录** 并通过 `memory_search` 显示它们。
这由实验标志控制。

```json5
agents: {
  defaults: {
    memorySearch: {
      experimental: { sessionMemory: true },
      sources: ["memory", "sessions"]
    }
  }
}
```

说明：
- 会话索引是 **选择加入**（默认关闭）。
- 会话更新被防抖，并且 **异步索引** 一旦它们跨越增量阈值（尽力而为）。
- `memory_search` 从不阻塞索引；结果可能稍微过时，直到后台同步完成。
- 结果仍然只包含片段；`memory_get` 仍限于内存文件。
- 会话索引在每个代理中隔离（仅索引该代理的会话日志）。
- 会话日志存储在磁盘上（`~/.clawdbot/agents/<agentId>/sessions/*.jsonl`）。任何具有文件系统访问权限的进程/用户都可以读取它们，因此将磁盘访问视为信任边界。要更严格地隔离，请在单独的操作系统用户或主机下运行代理。

增量阈值（显示默认值）：

```json5
agents: {
  defaults: {
    memorySearch: {
      sync: {
        sessions: {
          deltaBytes: 100000,   // ~100 KB
          deltaMessages: 50     // JSONL 行
        }
      }
    }
  }
}
```

### SQLite 向量加速（sqlite-vec）

当 sqlite-vec 扩展可用时，Moltbot 在
SQLite 虚拟表（`vec0`）中存储嵌入，并在数据库中执行向量距离查询。
这保持搜索快速，而无需将每个嵌入加载到 JS 中。

配置（可选）：

```json5
agents: {
  defaults: {
    memorySearch: {
      store: {
        vector: {
          enabled: true,
          extensionPath: "/path/to/sqlite-vec"
        }
      }
    }
  }
}
```

说明：
- `enabled` 默认为真；禁用时，搜索回退到存储嵌入上的进程内
  余弦相似性。
- 如果 sqlite-vec 扩展缺失或加载失败，Moltbot 记录
  错误并继续使用 JS 回退（无向量表）。
- `extensionPath` 覆盖捆绑的 sqlite-vec 路径（对自定义构建
  或非标准安装位置有用）。

### 本地嵌入自动下载

- 默认本地嵌入模型：`hf:ggml-org/embeddinggemma-300M-GGUF/embeddinggemma-300M-Q8_0.gguf`（~0.6 GB）。
- 当 `memorySearch.provider = "local"` 时，`node-llama-cpp` 解析 `modelPath`；如果 GGUF 缺失，它 **自动下载** 到缓存（或如果设置则到 `local.modelCacheDir`），然后加载它。下载在重试时恢复。
- 本机构建要求：运行 `pnpm approve-builds`，选择 `node-llama-cpp`，然后 `pnpm rebuild node-llama-cpp`。
- 回退：如果本地设置失败且 `memorySearch.fallback = "openai"`，我们自动切换到远程嵌入（除非覆盖否则为 `openai/text-embedding-3-small`）并记录原因。

### 自定义 OpenAI 兼容端点示例

```json5
agents: {
  defaults: {
    memorySearch: {
      provider: "openai",
      model: "text-embedding-3-small",
      remote: {
        baseUrl: "https://api.example.com/v1/",
        apiKey: "YOUR_REMOTE_API_KEY",
        headers: {
          "X-Organization": "org-id",
          "X-Project": "project-id"
        }
      }
    }
  }
}
```

说明：
- `remote.*` 优先于 `models.providers.openai.*`。
- `remote.headers` 与 OpenAI 标头合并；远程在键冲突时获胜。省略 `remote.headers` 以使用 OpenAI 默认值。