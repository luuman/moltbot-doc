---
summary: "网关仪表板（控制界面）访问和认证"
read_when:
  - 更改仪表板认证或暴露模式时
---
# 仪表板（控制界面）

网关仪表板是默认在 `/` 路径提供服务的浏览器控制界面
（可通过 `gateway.controlUi.basePath` 进行覆盖）。

快速打开（本地网关）：
- http://127.0.0.1:18789/ (或 http://localhost:18789/)

主要参考：
- [控制界面](/web/control-ui) 了解使用方法和界面功能。
- [Tailscale](/gateway/tailscale) 了解 Serve/Funnel 自动化。
- [Web 界面](/web) 了解绑定模式和安全说明。

认证通过 `connect.params.auth` 在 WebSocket 握手时强制执行
（令牌或密码）。参见 [网关配置](/gateway/configuration) 中的 `gateway.auth`。

安全提醒：控制界面是一个 **管理界面**（聊天、配置、exec 审批）。
请勿公开暴露。界面在首次加载后将令牌存储在 `localStorage` 中。
建议使用 localhost、Tailscale Serve 或 SSH 隧道。

## 快速路径（推荐）

- 入门后，CLI 现在会自动使用您的令牌打开仪表板并打印相同的带令牌链接。
- 随时重新打开：`moltbot dashboard`（复制链接，如果可能则打开浏览器，如果无头模式则显示 SSH 提示）。
- 令牌保持本地（仅查询参数）；界面在首次加载后会删除它并保存到 localStorage 中。

## 令牌基础（本地与远程）

- **本地主机**：打开 `http://127.0.0.1:18789/`。如果您看到"未授权"，运行 `moltbot dashboard` 并使用带令牌的链接（`?token=...`）。
- **令牌来源**：`gateway.auth.token`（或 `CLAWDBOT_GATEWAY_TOKEN`）；界面在首次加载后会存储它。
- **非本地主机**：使用 Tailscale Serve（如果 `gateway.auth.allowTailscale: true` 则无需令牌）、带令牌的内联网绑定或 SSH 隧道。参见 [Web 界面](/web)。

## 如果您看到"未授权" / 1008

- 运行 `moltbot dashboard` 获取新的带令牌链接。
- 确保网关可访问（本地：`moltbot status`；远程：SSH 隧道 `ssh -N -L 18789:127.0.0.1:18789 user@host` 然后打开 `http://127.0.0.1:18789/?token=...`）。
- 在仪表板设置中，粘贴您在 `gateway.auth.token`（或 `CLAWDBOT_GATEWAY_TOKEN`）中配置的相同令牌。
