---
summary: "网络搜索 + 获取工具（Brave Search API，Perplexity 直接/OpenRouter）"
read_when:
  - 您想要启用 web_search 或 web_fetch
  - 您需要 Brave Search API 密钥设置
  - 您想要使用 Perplexity Sonar 进行网络搜索
---

# 网络工具

Moltbot 提供两个轻量级网络工具：

- `web_search` — 通过 Brave Search API（默认）或 Perplexity Sonar（直接或通过 OpenRouter）搜索网络。
- `web_fetch` — HTTP 获取 + 可读内容提取（HTML → markdown/文本）。

这些 **不是** 浏览器自动化。对于 JS 密集型网站或登录，使用
[浏览器工具](/tools/browser)。

## 工作原理

- `web_search` 调用您配置的提供者并返回结果。
  - **Brave**（默认）：返回结构化结果（标题、URL、片段）。
  - **Perplexity**：返回 AI 综合答案，附带实时网络搜索的引用。
- 结果按查询缓存 15 分钟（可配置）。
- `web_fetch` 执行纯 HTTP GET 并提取可读内容
  （HTML → markdown/文本）。它 **不** 执行 JavaScript。
- `web_fetch` 默认启用（除非明确禁用）。

## 选择搜索提供者

| 提供者 | 优点 | 缺点 | API 密钥 |
|----------|------|------|---------|
| **Brave**（默认） | 快速、结构化结果、免费套餐 | 传统搜索结果 | `BRAVE_API_KEY` |
| **Perplexity** | AI 综合答案、引用、实时 | 需要 Perplexity 或 OpenRouter 访问 | `OPENROUTER_API_KEY` 或 `PERPLEXITY_API_KEY` |

请参阅 [Brave Search 设置](/brave-search) 和 [Perplexity Sonar](/perplexity) 获取特定提供者的详细信息。

在配置中设置提供者：

```json5
{
  tools: {
    web: {
      search: {
        provider: "brave"  // 或 "perplexity"
      }
    }
  }
}
```

示例：切换到 Perplexity Sonar（直接 API）：

```json5
{
  tools: {
    web: {
      search: {
        provider: "perplexity",
        perplexity: {
          apiKey: "pplx-...",
          baseUrl: "https://api.perplexity.ai",
          model: "perplexity/sonar-pro"
        }
      }
    }
  }
}
```

## 获取 Brave API 密钥

1) 在 https://brave.com/search/api/ 创建 Brave Search API 账户
2) 在仪表板中，选择 **Data for Search** 计划（不是"Data for AI"）并生成 API 密钥。
3) 运行 `moltbot configure --section web` 将密钥存储在配置中（推荐），或在环境中设置 `BRAVE_API_KEY`。

Brave 提供免费套餐和付费计划；请在 Brave API 门户中查看
当前限制和定价。

### 在哪里设置密钥（推荐）

**推荐：** 运行 `moltbot configure --section web`。它将密钥存储在
`~/.clawdbot/moltbot.json` 中的 `tools.web.search.apiKey` 下。

**环境替代方案：** 在网关进程环境中设置 `BRAVE_API_KEY`。
对于网关安装，请将其放入 `~/.clawdbot/.env`（或您的
服务环境）。请参见 [环境变量](/help/faq#how-does-moltbot-load-environment-variables)。

## 使用 Perplexity（直接或通过 OpenRouter）

Perplexity Sonar 模型具有内置网络搜索功能，并返回带有引用的 AI 综合
答案。您可以通过 OpenRouter 使用它们（无需信用卡 - 支持
加密货币/预付费）。

### 获取 OpenRouter API 密钥

1) 在 https://openrouter.ai/ 创建账户
2) 添加积分（支持加密货币、预付费或信用卡）
3) 在您的账户设置中生成 API 密钥

### 设置 Perplexity 搜索

```json5
{
  tools: {
    web: {
      search: {
        enabled: true,
        provider: "perplexity",
        perplexity: {
          // API 密钥（如果设置了 OPENROUTER_API_KEY 或 PERPLEXITY_API_KEY 则可选）
          apiKey: "sk-or-v1-...",
          // 基础 URL（如果省略则使用密钥感知默认值）
          baseUrl: "https://openrouter.ai/api/v1",
          // 模型（默认为 perplexity/sonar-pro）
          model: "perplexity/sonar-pro"
        }
      }
    }
  }
}
```

**环境替代方案：** 在网关环境中设置 `OPENROUTER_API_KEY` 或 `PERPLEXITY_API_KEY`。
对于网关安装，请将其放入 `~/.clawdbot/.env`。

如果没有设置基础 URL，Moltbot 根据 API 密钥来源选择默认值：

- `PERPLEXITY_API_KEY` 或 `pplx-...` → `https://api.perplexity.ai`
- `OPENROUTER_API_KEY` 或 `sk-or-...` → `https://openrouter.ai/api/v1`
- 未知密钥格式 → OpenRouter（安全回退）

### 可用的 Perplexity 模型

| 模型 | 描述 | 最适合 |
|-------|-------------|----------|
| `perplexity/sonar` | 带网络搜索的快速问答 | 快速查找 |
| `perplexity/sonar-pro`（默认） | 带网络搜索的多步骤推理 | 复杂问题 |
| `perplexity/sonar-reasoning-pro` | 链式思维分析 | 深入研究 |

## web_search

使用您配置的提供者搜索网络。

### 要求

- `tools.web.search.enabled` 不能为 `false`（默认：启用）
- 您选择的提供者的 API 密钥：
  - **Brave**: `BRAVE_API_KEY` 或 `tools.web.search.apiKey`
  - **Perplexity**: `OPENROUTER_API_KEY`, `PERPLEXITY_API_KEY`, 或 `tools.web.search.perplexity.apiKey`

### 配置

```json5
{
  tools: {
    web: {
      search: {
        enabled: true,
        apiKey: "BRAVE_API_KEY_HERE", // 如果设置了 BRAVE_API_KEY 则可选
        maxResults: 5,
        timeoutSeconds: 30,
        cacheTtlMinutes: 15
      }
    }
  }
}
```

### 工具参数

- `query`（必需）
- `count`（1–10；来自配置的默认值）
- `country`（可选）：2 字母国家代码以获得特定地区的结果（例如，"DE"，"US"，"ALL"）。如果省略，Brave 选择其默认地区。
- `search_lang`（可选）：搜索结果的 ISO 语言代码（例如，"de"，"en"，"fr"）
- `ui_lang`（可选）：UI 元素的 ISO 语言代码
- `freshness`（可选，仅 Brave）：按发现时间筛选（`pd`，`pw`，`pm`，`py`，或 `YYYY-MM-DDtoYYYY-MM-DD`）

**示例：**

```javascript
// 德国特定搜索
await web_search({
  query: "TV online schauen",
  count: 10,
  country: "DE",
  search_lang: "de"
});

// 法语搜索，法语 UI
await web_search({
  query: "actualités",
  country: "FR",
  search_lang: "fr",
  ui_lang: "fr"
});

// 最近结果（过去一周）
await web_search({
  query: "TMBG interview",
  freshness: "pw"
});
```

## web_fetch

获取 URL 并提取可读内容。

### 要求

- `tools.web.fetch.enabled` 不能为 `false`（默认：启用）
- 可选 Firecrawl 回退：设置 `tools.web.fetch.firecrawl.apiKey` 或 `FIRECRAWL_API_KEY`。

### 配置

```json5
{
  tools: {
    web: {
      fetch: {
        enabled: true,
        maxChars: 50000,
        timeoutSeconds: 30,
        cacheTtlMinutes: 15,
        maxRedirects: 3,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        readability: true,
        firecrawl: {
          enabled: true,
          apiKey: "FIRECRAWL_API_KEY_HERE", // 如果设置了 FIRECRAWL_API_KEY 则可选
          baseUrl: "https://api.firecrawl.dev",
          onlyMainContent: true,
          maxAgeMs: 86400000, // 毫秒（1 天）
          timeoutSeconds: 60
        }
      }
    }
  }
}
```

### 工具参数

- `url`（必需，仅 http/https）
- `extractMode`（`markdown` | `text`）
- `maxChars`（截断长页面）

注意事项：
- `web_fetch` 首先使用 Readability（主要内容提取），然后 Firecrawl（如果配置）。如果两者都失败，工具返回错误。
- Firecrawl 请求使用绕过机器人模式，默认缓存结果。
- `web_fetch` 默认发送类似 Chrome 的 User-Agent 和 `Accept-Language`；如有需要覆盖 `userAgent`。
- `web_fetch` 阻止私有/内部主机名并重新检查重定向（使用 `maxRedirects` 限制）。
- `web_fetch` 是尽力而为的提取；某些网站需要浏览器工具。
- 请参见 [Firecrawl](/tools/firecrawl) 了解密钥设置和服务详细信息。
- 响应被缓存（默认 15 分钟）以减少重复获取。
- 如果您使用工具配置文件/允许列表，请添加 `web_search`/`web_fetch` 或 `group:web`。
- 如果缺少 Brave 密钥，`web_search` 返回一个简短的设置提示，附带文档链接。