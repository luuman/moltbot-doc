---
summary: "`moltbot hooks` 的 CLI 参考（智能体钩子）"
read_when:
  - 您想要管理智能体钩子
  - 您想要安装或更新钩子
---

# `moltbot hooks`

管理智能体钩子（用于 `/new`、`/reset` 和网关启动等命令的事件驱动自动化）。

相关：
- 钩子：[钩子](/hooks)
- 插件钩子：[插件](/plugin#plugin-hooks)

## 列出所有钩子

```bash
moltbot hooks list
```

列出工作空间、托管和捆绑目录中发现的所有钩子。

**选项：**
- `--eligible`: 仅显示符合条件的钩子（满足要求）
- `--json`: 以 JSON 输出
- `-v, --verbose`: 显示详细信息，包括缺失的要求

**示例输出：**

```
钩子 (4/4 就绪)

就绪:
  🚀 boot-md ✓ - 在网关启动时运行 BOOT.md
  📝 command-logger ✓ - 将所有命令事件记录到集中审核文件
  💾 session-memory ✓ - 发出 /new 命令时将会话上下文保存到内存
  😈 soul-evil ✓ - 在清除窗口期间或随机机会期间交换注入的 SOUL 内容
```

**示例（详细）：**

```bash
moltbot hooks list --verbose
```

显示不符合条件钩子的缺失要求。

**示例（JSON）：**

```bash
moltbot hooks list --json
```

返回结构化 JSON 以供编程使用。

## 获取钩子信息

```bash
moltbot hooks info <name>
```

显示特定钩子的详细信息。

**参数：**
- `<name>`: 钩子名称（例如，`session-memory`）

**选项：**
- `--json`: 以 JSON 输出

**示例：**

```bash
moltbot hooks info session-memory
```

**输出：**

```
💾 session-memory ✓ 就绪

发出 /new 命令时将会话上下文保存到内存

详情:
  源: moltbot-bundled
  路径: /path/to/moltbot/hooks/bundled/session-memory/HOOK.md
  处理程序: /path/to/moltbot/hooks/bundled/session-memory/handler.ts
  主页: https://docs.molt.bot/hooks#session-memory
  事件: command:new

要求:
  配置: ✓ workspace.dir
```

## 检查钩子适用性

```bash
moltbot hooks check
```

显示钩子适用性状态摘要（有多少就绪与未就绪）。

**选项：**
- `--json`: 以 JSON 输出

**示例输出：**

```
钩子状态

总钩子数: 4
就绪: 4
未就绪: 0
```

## 启用钩子

```bash
moltbot hooks enable <name>
```

通过添加到您的配置（`~/.clawdbot/config.json`）来启用特定钩子。

**注意：** 插件管理的钩子在 `moltbot hooks list` 中显示为 `plugin:<id>`，
不能在此处启用/禁用。请启用/禁用插件本身。

**参数：**
- `<name>`: 钩子名称（例如，`session-memory`）

**示例：**

```bash
moltbot hooks enable session-memory
```

**输出：**

```
✓ 已启用钩子: 💾 session-memory
```

**功能：**
- 检查钩子是否存在并符合条件
- 在您的配置中更新 `hooks.internal.entries.<name>.enabled = true`
- 将配置保存到磁盘

**启用后：**
- 重启网关以便钩子重新加载（macOS 上的菜单栏应用重启，或在开发环境中重启您的网关进程）。

## 禁用钩子

```bash
moltbot hooks disable <name>
```

通过更新您的配置来禁用特定钩子。

**参数：**
- `<name>`: 钩子名称（例如，`command-logger`）

**示例：**

```bash
moltbot hooks disable command-logger
```

**输出：**

```
⏸ 已禁用钩子: 📝 command-logger
```

**禁用后：**
- 重启网关以便钩子重新加载

## 安装钩子

```bash
moltbot hooks install <path-or-spec>
```

从本地文件夹/存档或 npm 安装钩子包。

**功能：**
- 将钩子包复制到 `~/.clawdbot/hooks/<id>`
- 在 `hooks.internal.entries.*` 中启用已安装的钩子
- 在 `hooks.internal.installs` 下记录安装

**选项：**
- `-l, --link`: 链接本地目录而不是复制（将其添加到 `hooks.internal.load.extraDirs`）

**支持的存档格式：** `.zip`、`.tgz`、`.tar.gz`、`.tar`

**示例：**

```bash
# 本地目录
moltbot hooks install ./my-hook-pack

# 本地存档
moltbot hooks install ./my-hook-pack.zip

# NPM 包
moltbot hooks install @moltbot/my-hook-pack

# 链接本地目录而不复制
moltbot hooks install -l ./my-hook-pack
```

## 更新钩子

```bash
moltbot hooks update <id>
moltbot hooks update --all
```

更新已安装的钩子包（仅限 npm 安装）。

**选项：**
- `--all`: 更新所有跟踪的钩子包
- `--dry-run`: 显示将要更改的内容但不写入

## 捆绑钩子

### session-memory

在您发出 `/new` 时将会话上下文保存到内存。

**启用：**

```bash
moltbot hooks enable session-memory
```

**输出：** `~/clawd/memory/YYYY-MM-DD-slug.md`

**参见：** [session-memory 文档](/hooks#session-memory)

### command-logger

将所有命令事件记录到集中审核文件。

**启用：**

```bash
moltbot hooks enable command-logger
```

**输出：** `~/.clawdbot/logs/commands.log`

**查看日志：**

```bash
# 最近的命令
tail -n 20 ~/.clawdbot/logs/commands.log

# 美化打印
cat ~/.clawdbot/logs/commands.log | jq .

# 按操作筛选
grep '"action":"new"' ~/.clawdbot/logs/commands.log | jq .
```

**参见：** [command-logger 文档](/hooks#command-logger)

### soul-evil

在清除窗口期间或随机机会期间将注入的 `SOUL.md` 内容与 `SOUL_EVIL.md` 交换。

**启用：**

```bash
moltbot hooks enable soul-evil
```

**参见：** [SOUL Evil 钩子](/hooks/soul-evil)

### boot-md

在网关启动时运行 `BOOT.md`（在通道启动后）。

**事件**: `gateway:startup`

**启用**:

```bash
moltbot hooks enable boot-md
```

**参见：** [boot-md 文档](/hooks#boot-md)