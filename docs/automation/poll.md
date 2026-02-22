---
summary: "通过网关 + CLI 发送投票"
read_when:
  - 添加或修改投票支持
  - 调试来自 CLI 或网关的投票发送
---
# 投票


## 支持的渠道
- WhatsApp（网页渠道）
- Discord
- MS Teams（自适应卡片）

## CLI

```bash
# WhatsApp
moltbot message poll --target +15555550123 \
  --poll-question "今天吃午饭？" --poll-option "是" --poll-option "否" --poll-option "也许"
moltbot message poll --target 123456789@g.us \
  --poll-question "会议时间？" --poll-option "上午10点" --poll-option "下午2点" --poll-option "下午4点" --poll-multi

# Discord
moltbot message poll --channel discord --target channel:123456789 \
  --poll-question "零食？" --poll-option "披萨" --poll-option "寿司"
moltbot message poll --channel discord --target channel:123456789 \
  --poll-question "计划？" --poll-option "A" --poll-option "B" --poll-duration-hours 48

# MS Teams
moltbot message poll --channel msteams --target conversation:19:abc@thread.tacv2 \
  --poll-question "午饭？" --poll-option "披萨" --poll-option "寿司"
```

选项：
- `--channel`: `whatsapp`（默认），`discord`，或 `msteams`
- `--poll-multi`: 允许选择多个选项
- `--poll-duration-hours`: 仅 Discord（省略时默认为 24）

## 网关 RPC

方法：`poll`

参数：
- `to`（字符串，必需）
- `question`（字符串，必需）
- `options`（字符串[]，必需）
- `maxSelections`（数字，可选）
- `durationHours`（数字，可选）
- `channel`（字符串，可选，默认：`whatsapp`）
- `idempotencyKey`（字符串，必需）

## 渠道差异
- WhatsApp：2-12 个选项，`maxSelections` 必须在选项计数范围内，忽略 `durationHours`。
- Discord：2-10 个选项，`durationHours` 限制为 1-768 小时（默认 24）。`maxSelections > 1` 启用多选；Discord 不支持严格的选定计数。
- MS Teams：自适应卡片投票（Moltbot 管理）。没有本机投票 API；忽略 `durationHours`。

## 代理工具（消息）
使用带有 `poll` 操作的 `message` 工具（`to`、`pollQuestion`、`pollOption`，可选 `pollMulti`、`pollDurationHours`、`channel`）。

注意：Discord 没有"精确选择 N 项"模式；`pollMulti` 映射到多选。
Teams 投票渲染为自适应卡片，需要网关保持在线
以在 `~/.clawdbot/msteams-polls.json` 中记录投票。