---
summary: "用于 web_search 的 Brave Search API 设置"
read_when:
  - 您想使用 Brave Search 进行 web_search
  - 您需要 BRAVE_API_KEY 或计划详情
---

# Brave Search API

Moltbot 使用 Brave Search 作为 `web_search` 的默认提供商。

## 获取 API 密钥

1) 在 https://brave.com/search/api/ 创建一个 Brave Search API 账户
2) 在仪表板中，选择 **Data for Search** 计划并生成一个 API 密钥。
3) 在配置中存储密钥（推荐）或在 Gateway 环境中设置 `BRAVE_API_KEY`。

## 配置示例

```json5
{
  tools: {
    web: {
      search: {
        provider: "brave",
        apiKey: "BRAVE_API_KEY_HERE",
        maxResults: 5,
        timeoutSeconds: 30
      }
    }
  }
}
```

## 注意事项

- AI 数据计划 **不** 兼容 `web_search`。
- Brave 提供免费套餐以及付费计划；请查看 Brave API 门户以获取当前限制。

请参阅 [Web 工具](/tools/web) 以获取完整的 web_search 配置。