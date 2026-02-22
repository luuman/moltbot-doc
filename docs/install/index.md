---
summary: "安装 Moltbot（推荐安装程序、全局安装或从源码安装）"
read_when:
  - 安装 Moltbot
  - 您想从 GitHub 安装
---

# 安装

除非您有理由不这样做，否则使用安装程序。它设置 CLI 并运行入门向导。

## 快速安装（推荐）

```bash
curl -fsSL https://molt.bot/install.sh | bash
```

Windows（PowerShell）：

```powershell
iwr -useb https://molt.bot/install.ps1 | iex
```

下一步（如果您跳过了入门）：

```bash
moltbot onboard --install-daemon
```

## 系统要求

- **Node >=22**
- macOS, Linux 或通过 WSL2 的 Windows
- 如果您从源码构建，则仅需 `pnpm`

## 选择您的安装路径

### 1) 安装程序脚本（推荐）

通过 npm 全局安装 `moltbot` 并运行入门。

```bash
curl -fsSL https://molt.bot/install.sh | bash
```

安装程序标志：

```bash
curl -fsSL https://molt.bot/install.sh | bash -s -- --help
```

详情：[安装程序内部](/install/installer)。

非交互式（跳过入门）：

```bash
curl -fsSL https://molt.bot/install.sh | bash -s -- --no-onboard
```

### 2) 全局安装（手动）

如果您已经有 Node：

```bash
npm install -g moltbot@latest
```

如果您全局安装了 libvips（通过 Homebrew 在 macOS 上很常见）且 `sharp` 安装失败，请强制使用预构建二进制文件：

```bash
SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install -g moltbot@latest
```

如果您看到 `sharp: Please add node-gyp to your dependencies`，请安装构建工具（macOS：Xcode CLT + `npm install -g node-gyp`）或使用上面的 `SHARP_IGNORE_GLOBAL_LIBVIPS=1` 解决方案跳过本地构建。

或者：

```bash
pnpm add -g moltbot@latest
```

然后：

```bash
moltbot onboard --install-daemon
```

### 3) 从源码（贡献者/开发人员）

```bash
git clone https://github.com/moltbot/moltbot.git
cd moltbot
pnpm install
pnpm ui:build # 首次运行时自动安装 UI 依赖项
pnpm build
moltbot onboard --install-daemon
```

提示：如果您还没有全局安装，请通过 `pnpm moltbot ...` 运行仓库命令。

### 4) 其他安装选项

- Docker: [Docker](/install/docker)
- Nix: [Nix](/install/nix)
- Ansible: [Ansible](/install/ansible)
- Bun（仅 CLI）: [Bun](/install/bun)

## 安装后

- 运行入门：`moltbot onboard --install-daemon`
- 快速检查：`moltbot doctor`
- 检查网关健康状况：`moltbot status` + `moltbot health`
- 打开仪表板：`moltbot dashboard`

## 安装方法：npm vs git（安装程序）

安装程序支持两种方法：

- `npm`（默认）：`npm install -g moltbot@latest`
- `git`：从 GitHub 克隆/构建并从源码 checkout 运行

### CLI 标志

```bash
# 明确使用 npm
curl -fsSL https://molt.bot/install.sh | bash -s -- --install-method npm

# 从 GitHub 安装（源码 checkout）
curl -fsSL https://molt.bot/install.sh | bash -s -- --install-method git
```

常用标志：

- `--install-method npm|git`
- `--git-dir <path>`（默认：`~/moltbot`）
- `--no-git-update`（使用现有 checkout 时跳过 `git pull`）
- `--no-prompt`（禁用提示；在 CI/自动化中必需）
- `--dry-run`（打印将发生的事情；不做更改）
- `--no-onboard`（跳过入门）

### 环境变量

等效环境变量（对自动化有用）：

- `CLAWDBOT_INSTALL_METHOD=git|npm`
- `CLAWDBOT_GIT_DIR=...`
- `CLAWDBOT_GIT_UPDATE=0|1`
- `CLAWDBOT_NO_PROMPT=1`
- `CLAWDBOT_DRY_RUN=1`
- `CLAWDBOT_NO_ONBOARD=1`
- `SHARP_IGNORE_GLOBAL_LIBVIPS=0|1`（默认：`1`；避免 `sharp` 针对系统 libvips 构建）

## 故障排除：`moltbot` 未找到（PATH）

快速诊断：

```bash
node -v
npm -v
npm prefix -g
echo "$PATH"
```

如果 `$(npm prefix -g)/bin`（macOS/Linux）或 `$(npm prefix -g)`（Windows）**不在** `echo "$PATH"` 内部，您的 shell 找不到全局 npm 二进制文件（包括 `moltbot`）。

修复：将其添加到您的 shell 启动文件（zsh：`~/.zshrc`，bash：`~/.bashrc`）：

```bash
# macOS / Linux
export PATH="$(npm prefix -g)/bin:$PATH"
```

在 Windows 上，将 `npm prefix -g` 的输出添加到您的 PATH。

然后打开新终端（或在 zsh 中 `rehash` / 在 bash 中 `hash -r`）。

## 更新 / 卸载

- 更新：[更新](/install/updating)
- 迁移到新机器：[迁移](/install/migrating)
- 卸载：[卸载](/install/uninstall)