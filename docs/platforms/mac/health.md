---
summary: "How the macOS app reports gateway/Baileys health states"
read_when:
  - Debugging mac app health indicators
---
# macOS上的健康检查

如何从菜单栏应用查看链接的频道是否健康。

## 菜单栏
- 状态点现在反映Baileys健康状况：
  - 绿色：已链接 + 最近打开套接字。
  - 橙色：连接/重试中。
  - 红色：已登出或探测失败。
- 第二行显示"linked · auth 12m"或显示失败原因。
- "运行健康检查"菜单项触发按需探测。

## 设置
- 常规选项卡增加了一个健康卡片，显示：链接认证年龄、会话存储路径/数量、上次检查时间、上次错误/状态码，以及运行健康检查/显示日志按钮。
- 使用缓存快照以便UI即时加载，并在离线时优雅降级。
- **频道选项卡** 显示频道状态 + WhatsApp/Telegram的控制（登录QR码、登出、探测、上次断开连接/错误）。

## 探测工作原理
- 应用通过`ShellExecutor`每~60秒和按需运行`moltbot health --json`。探测加载凭据并报告状态而不发送消息。
- 分别缓存最后一次良好快照和最后一次错误以避免闪烁；显示每个的时间戳。

## 如有疑问
- 您仍然可以在[网关健康](/gateway/health)中使用CLI流程（`moltbot status`、`moltbot status --deep`、`moltbot health --json`）并监视`/tmp/moltbot/moltbot-*.log`中的`web-heartbeat` / `web-reconnect`。