---
summary: "macOS 技能设置 UI 和网关支持的状态"
read_when:
  - 更新 macOS 技能设置 UI
  - 更改技能门控或安装行为
---
# 技能 (macOS)

macOS 应用通过网关显示 Moltbot 技能；它不在本地解析技能。

## 数据源
- `skills.status`（网关）返回所有技能加上资格和缺失要求
  （包括捆绑技能的白名单阻止）。
- 要求从每个 `SKILL.md` 中的 `metadata.moltbot.requires` 派生。

## 安装操作
- `metadata.moltbot.install` 定义安装选项（brew/node/go/uv）。
- 应用调用 `skills.install` 在网关主机上运行安装程序。
- 当提供多个安装程序时，网关仅显示一个首选安装程序
  （可用时为 brew，否则为 `skills.install` 中的节点管理器，默认 npm）。

## 环境/API 密钥
- 应用在 `~/.clawdbot/moltbot.json` 下的 `skills.entries.<skillKey>` 中存储密钥。
- `skills.update` 修补 `enabled`、`apiKey` 和 `env`。

## 远程模式
- 安装 + 配置更新发生在网关主机上（而不是本地 Mac）。