---
summary: "在同一主机上运行多个 Moltbot 网关（隔离、端口和配置文件）"
read_when:
  - 在同一台机器上运行多个网关
  - 您需要每个网关的隔离配置/状态/端口
---
# 多网关（同一主机）

大多数设置应使用一个网关，因为单个网关可以处理多个消息连接和代理。如果您需要更强的隔离或冗余（例如，救援机器人），请运行具有隔离配置文件/端口的单独网关。

## 隔离清单（必需）
- `CLAWDBOT_CONFIG_PATH` — 每实例配置文件
- `CLAWDBOT_STATE_DIR` — 每实例会话、凭据、缓存
- `agents.defaults.workspace` — 每实例工作区根目录
- `gateway.port`（或 `--port`）— 每实例唯一
- 派生端口（浏览器/画布）不得重叠

如果这些是共享的，您将遇到配置竞争和端口冲突。

## 推荐：配置文件（`--profile`）

配置文件自动限定 `CLAWDBOT_STATE_DIR` + `CLAWDBOT_CONFIG_PATH` 并为服务名称添加后缀。

```bash
# main
moltbot --profile main setup
moltbot --profile main gateway --port 18789

# rescue
moltbot --profile rescue setup
moltbot --profile rescue gateway --port 19001
```

每配置文件服务：
```bash
moltbot --profile main gateway install
moltbot --profile rescue gateway install
```

## 救援机器人指南

在同一主机上运行第二个具有自己的：
- 配置文件/配置
- 状态目录
- 工作区
- 基础端口（加上派生端口）

这使救援机器人与主机器人隔离，因此如果主机器人宕机，它可以调试或应用配置更改。

端口间距：在基础端口之间至少留出 20 个端口，以便派生的浏览器/画布/CDP 端口永远不会冲突。

### 如何安装（救援机器人）

```bash
# 主机器人（现有或全新，不带 --profile 参数）
# 在端口 18789 + Chrome CDC/Canvas/... 端口上运行
moltbot onboard
moltbot gateway install

# 救援机器人（隔离配置文件 + 端口）
moltbot --profile rescue onboard
# 注意：
# - 工作区名称默认将以 -rescue 为后缀
# - 端口应至少为 18789 + 20 端口，
#   最好选择完全不同的基础端口，如 19789，
# - 其余入门过程与正常情况相同

# 安装服务（如果在入门期间未自动完成）
moltbot --profile rescue gateway install
```

## 端口映射（派生）

基础端口 = `gateway.port`（或 `CLAWDBOT_GATEWAY_PORT` / `--port`）。

- 浏览器控制服务端口 = 基础 + 2（仅环回）
- `canvasHost.port = base + 4`
- 浏览器配置文件 CDP 端口从 `browser.controlPort + 9 .. + 108` 自动分配

如果您在配置或环境中覆盖其中任何一个，您必须保持每个实例的唯一性。

## 浏览器/CDP 注意事项（常见陷阱）

- **不要** 将 `browser.cdpUrl` 固定到多个实例上的相同值。
- 每个实例需要自己的浏览器控制端口和 CDP 范围（从其网关端口派生）。
- 如果您需要显式 CDP 端口，请为每个实例设置 `browser.profiles.<name>.cdpPort`。
- 远程 Chrome：使用 `browser.profiles.<name>.cdpUrl`（每个配置文件，每个实例）。

## 手动环境示例

```bash
CLAWDBOT_CONFIG_PATH=~/.clawdbot/main.json \
CLAWDBOT_STATE_DIR=~/.clawdbot-main \
moltbot gateway --port 18789

CLAWDBOT_CONFIG_PATH=~/.clawdbot/rescue.json \
CLAWDBOT_STATE_DIR=~/.clawdbot-rescue \
moltbot gateway --port 19001
```

## 快速检查

```bash
moltbot --profile main status
moltbot --profile rescue status
moltbot --profile rescue browser status
```
