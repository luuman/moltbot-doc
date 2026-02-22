---
summary: "入站通道位置解析（Telegram + WhatsApp）和上下文字段"
read_when:
  - 添加或修改通道位置解析
  - 在代理提示或工具中使用位置上下文字段
---

# 通道位置解析

Moltbot 将聊天通道共享的位置标准化为：
- 添加到入站正文的人类可读文本，以及
- 自动回复上下文有效载荷中的结构化字段。

目前支持：
- **Telegram**（位置标记 + 场所 + 实时位置）
- **WhatsApp**（locationMessage + liveLocationMessage）
- **Matrix**（带有 `geo_uri` 的 `m.location`）

## 文本格式
位置被渲染为友好的行，不带括号：

- 标记：
  - `📍 48.858844, 2.294351 ±12m`
- 有名地点：
  - `📍 埃菲尔铁塔 — 战神广场，巴黎 (48.858844, 2.294351 ±12m)`
- 实时分享：
  - `🛰 实时位置：48.858844, 2.294351 ±12m`

如果通道包含标题/评论，则会在下一行追加：
```
📍 48.858844, 2.294351 ±12m
在这里见面
```

## 上下文字段
当存在位置时，这些字段将添加到 `ctx`：
- `LocationLat`（数字）
- `LocationLon`（数字）
- `LocationAccuracy`（数字，米；可选）
- `LocationName`（字符串；可选）
- `LocationAddress`（字符串；可选）
- `LocationSource`（`pin | place | live`）
- `LocationIsLive`（布尔值）

## 通道说明
- **Telegram**：场所映射到 `LocationName/LocationAddress`；实时位置使用 `live_period`。
- **WhatsApp**：`locationMessage.comment` 和 `liveLocationMessage.caption` 作为标题行追加。
- **Matrix**：`geo_uri` 被解析为标记位置；海拔被忽略且 `LocationIsLive` 始终为假。