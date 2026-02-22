---
summary: "`moltbot update` 的 CLI 参考（安全的源码更新 + 网关自动重启）"
read_when:
  - 您想要安全地更新源码检出
  - 您需要了解 `--update` 简写行为
---

# `moltbot update`

安全地更新 Moltbot 并在稳定版/测试版/开发版通道之间切换。

如果您通过 **npm/pnpm**（全局安装，无 git 元数据）安装，则更新通过 [更新](/install/updating) 中的包管理器流程进行。

## 用法

```bash
moltbot update
moltbot update status
moltbot update wizard
moltbot update --channel beta
moltbot update --channel dev
moltbot update --tag beta
moltbot update --no-restart
moltbot update --json
moltbot --update
```

## 选项

- `--no-restart`: 成功更新后跳过重启网关服务。
- `--channel <stable|beta|dev>`: 设置更新通道（git + npm；保存在配置中）。
- `--tag <dist-tag|version>`: 仅覆盖此次更新的 npm 分发标签或版本。
- `--json`: 打印机器可读的 `UpdateRunResult` JSON。
- `--timeout <seconds>`: 每步超时（默认为 1200 秒）。

注意：降级需要确认，因为旧版本可能会破坏配置。

## `update status`

显示活动的更新通道 + git 标签/分支/SHA（对于源码检出），加上更新可用性。

```bash
moltbot update status
moltbot update status --json
moltbot update status --timeout 10
```

选项：
- `--json`: 打印机器可读的状态 JSON。
- `--timeout <seconds>`: 检查超时（默认为 3 秒）。

## `update wizard`

交互式流程以选择更新通道并确认是否在更新后重启网关
（默认是重启）。如果您在没有 git 检出的情况下选择 `dev`，它
会提供创建一个。

## 功能说明

当您显式切换通道时（`--channel ...`），Moltbot 还会保持
安装方法一致：

- `dev` → 确保有 git 检出（默认：`~/moltbot`，用 `CLAWDBOT_GIT_DIR` 覆盖），
  更新它，并从该检出安装全局 CLI。
- `stable`/`beta` → 使用匹配的分发标签从 npm 安装。

## Git 检出流程

通道：

- `stable`: 检出最新的非测试版标签，然后构建 + 诊断。
- `beta`: 检出最新的 `-beta` 标签，然后构建 + 诊断。
- `dev`: 检出 `main`，然后获取 + 变基。

高级别：

1. 需要干净的工作树（无未提交的更改）。
2. 切换到选定的通道（标签或分支）。
3. 获取上游（仅 dev）。
4. 仅 dev：临时工作树中的预检 lint + TypeScript 构建；如果提示失败，最多回溯 10 个提交以找到最新的干净构建。
5. 变基到选定的提交（仅 dev）。
6. 安装依赖（首选 pnpm；npm 回退）。
7. 构建 + 构建控制 UI。
8. 运行 `moltbot doctor` 作为最终的"安全更新"检查。
9. 将插件同步到活动通道（dev 使用捆绑扩展；stable/beta 使用 npm）并更新 npm 安装的插件。

## `--update` 简写

`moltbot --update` 重写为 `moltbot update`（对 shell 和启动器脚本有用）。

## 参见

- `moltbot doctor` （在 git 检出上首先提供运行更新）
- [开发通道](/install/development-channels)
- [更新](/install/updating)
- [CLI 参考](/cli)