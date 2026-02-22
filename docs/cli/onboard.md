---
summary: "`moltbot onboard` 的 CLI 参考（交互式入门向导）"
read_when:
  - 您想要网关、工作空间、认证、频道和技能的引导设置
---

# `moltbot onboard`

交互式入门向导（本地或远程网关设置）。

相关：
- 向导指南：[入门](/start/onboarding)

## 示例

```bash
moltbot onboard
moltbot onboard --flow quickstart
moltbot onboard --flow manual
moltbot onboard --mode remote --remote-url ws://gateway-host:18789
```

流程说明：
- `quickstart`: 最少提示，自动生成网关令牌。
- `manual`: 端口/绑定/认证的完整提示（`advanced` 的别名）。
- 最快首次聊天：`moltbot dashboard` （控制 UI，无需频道设置）。