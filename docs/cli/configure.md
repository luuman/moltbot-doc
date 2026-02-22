---
summary: "`moltbot configure` 的 CLI 参考（交互式配置提示）"
read_when:
  - 您想交互式地调整凭据、设备或代理默认设置
---

# `moltbot configure`

用于设置凭据、设备和代理默认值的交互式提示。

注意：**模型**部分现在包括 `agents.defaults.models` 允许列表的多选框
（在 `/model` 和模型选择器中显示的内容）。

提示：不带子命令的 `moltbot config` 会打开相同的向导。使用
`moltbot config get|set|unset` 进行非交互式编辑。

相关：
- 网关配置参考：[配置](/gateway/configuration)
- 配置 CLI：[配置](/cli/config)

注意事项：
- 选择网关运行位置总是会更新 `gateway.mode`。如果只需要这个，可以选择"继续"而不选择其他部分。
- 面向频道的服务（Slack/Discord/Matrix/Microsoft Teams）在设置期间提示频道/房间允许列表。您可以输入名称或 ID；向导会在可能的情况下将名称解析为 ID。

## 示例

```bash
moltbot configure
moltbot configure --section models --section channels
```
