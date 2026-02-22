---
summary: "web_fetch 的 Firecrawl 回退（反机器人 + 缓存提取）"
read_when:
  - 想要基于 Firecrawl 的网页提取
  - 需要 Firecrawl API 密钥
  - 想要为 web_fetch 提供反机器人提取
---

# Firecrawl

Moltbot 可以使用 **Firecrawl** 作为 `web_fetch` 的回退提取器。这是一个托管的
内容提取服务，支持绕过机器人检测和缓存，有助于处理
JS 重型站点或阻止普通 HTTP 获取的页面。

## 获取 API 密钥

1) 创建 Firecrawl 账户并生成 API 密钥。
2) 将其存储在配置中或在网关环境中设置 `FIRECRAWL_API_KEY`。

## 配置 Firecrawl

```json5
{
  tools: {
    web: {
      fetch: {
        firecrawl: {
          apiKey: "FIRECRAWL_API_KEY_HERE",
          baseUrl: "https://api.firecrawl.dev",
          onlyMainContent: true,
          maxAgeMs: 172800000,
          timeoutSeconds: 60
        }
      }
    }
  }
}
```

注意事项:
- 当存在 API 密钥时，`firecrawl.enabled` 默认为 true。
- `maxAgeMs` 控制缓存结果可以有多旧（毫秒）。默认为 2 天。

## 隐蔽 / 机器人绕过

Firecrawl 为机器人绕过公开了一个 **代理模式** 参数（`basic`、`stealth` 或 `auto`）。
Moltbot 总是为 Firecrawl 请求使用 `proxy: "auto"` 加上 `storeInCache: true`。
如果省略代理，Firecrawl 默认为 `auto`。如果基本尝试失败，`auto` 会使用隐蔽代理重试，这可能比仅基本抓取使用更多的积分。

## `web_fetch` 如何使用 Firecrawl

`web_fetch` 提取顺序:
1) Readability（本地）
2) Firecrawl（如果配置）
3) 基本 HTML 清理（最后回退）

有关完整网页工具设置，请参见 [Web tools](/tools/web)。
