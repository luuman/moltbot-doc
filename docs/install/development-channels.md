---
summary: "稳定版、测试版和开发版通道：语义、切换和标记"
read_when:
  - 您想在稳定版/测试版/开发版之间切换
  - 您正在标记或发布预发布版本
---

# 开发通道

最后更新：2026-01-21

Moltbot 提供三个更新通道：

- **stable**：npm 分发标签 `latest`。
- **beta**：npm 分发标签 `beta`（正在测试的构建）。
- **dev**：`main` 的移动头部（git）。npm 分发标签：`dev`（发布时）。

我们将构建发布到**beta**，测试它们，然后**将经过验证的构建提升到 `latest`**
而不改变版本号 — 分发标签是 npm 安装的真实来源。

## 切换通道

Git checkout：

```bash
moltbot update --channel stable
moltbot update --channel beta
moltbot update --channel dev
```

- `stable`/`beta` 检出最新的匹配标签（通常相同的标签）。
- `dev` 切换到 `main` 并变基到上游。

npm/pnpm 全局安装：

```bash
moltbot update --channel stable
moltbot update --channel beta
moltbot update --channel dev
```

这通过相应的 npm 分发标签（`latest`，`beta`，`dev`）进行更新。

当您**明确**使用 `--channel` 切换通道时，Moltbot 还会对齐
安装方法：

- `dev` 确保 git checkout（默认 `~/moltbot`，可通过 `CLAWDBOT_GIT_DIR` 覆盖），
  更新它，并从该 checkout 安装全局 CLI。
- `stable`/`beta` 使用匹配的分发标签从 npm 安装。

提示：如果您想要并行的稳定版 + 开发版，请保留两个克隆并让您的网关指向稳定版。

## 插件和通道

当您使用 `moltbot update` 切换通道时，Moltbot 还会同步插件源：

- `dev` 优先使用来自 git checkout 的捆绑插件。
- `stable` 和 `beta` 恢复 npm 安装的插件包。

## 标记最佳实践

- 标记您希望 git checkout 登陆的发布版本（`vYYYY.M.D` 或 `vYYYY.M.D-<patch>`）。
- 保持标签不可变：永远不要移动或重用标签。
- npm 分发标签仍然是 npm 安装的真实来源：
  - `latest` → 稳定版
  - `beta` → 候选构建
  - `dev` → main 快照（可选）

## macOS 应用可用性

测试版和开发版构建可能**不**包含 macOS 应用发布。这没关系：

- git 标签和 npm 分发标签仍可发布。
- 在发布说明或变更日志中指出"此测试版无 macOS 构建"。