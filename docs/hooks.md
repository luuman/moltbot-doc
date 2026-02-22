---
summary: "钩子：命令和生命周期事件的事件驱动自动化"
read_when:
  - 您想要 /new、/reset、/stop 和代理生命周期事件的事件驱动自动化
  - 您想要构建、安装或调试钩子
---
# 钩子

钩子提供了一个可扩展的事件驱动系统，用于响应代理命令和事件的自动化操作。钩子会从目录中自动发现，可以通过 CLI 命令进行管理，类似于 Moltbot 中技能的工作方式。

## 初步了解

钩子是在某些事情发生时运行的小脚本。有两种类型：

- **钩子**（本页）：当代理事件触发时在网关内部运行，如 `/new`、`/reset`、`/stop` 或生命周期事件。
- **Webhooks**：外部 HTTP webhooks，允许其他系统在 Moltbot 中触发工作。请参见 [Webhook 钩子](/automation/webhook) 或使用 `moltbot webhooks` 获取 Gmail 助手命令。
  
钩子也可以打包在插件中；请参见 [插件](/plugin#plugin-hooks)。

常见用途：
- 在重置会话时保存内存快照
- 保留命令的审计跟踪以进行故障排除或合规性检查
- 在会话开始或结束时触发后续自动化
- 在事件触发时将文件写入代理工作空间或调用外部 API

如果您能编写一个小的 TypeScript 函数，就能编写一个钩子。钩子会自动发现，您可以通过 CLI 启用或禁用它们。

## 概述

钩子系统允许您：
- 在发出 `/new` 时将会话上下文保存到内存
- 记录所有命令以进行审计
- 在代理生命周期事件上触发自定义自动化
- 扩展 Moltbot 的行为而不修改核心代码

## 快速入门

### 内置钩子

Moltbot 附带四个内置钩子，它们会自动发现：

- **💾 session-memory**：在发出 `/new` 时将会话上下文保存到您的代理工作空间（默认 `~/clawd/memory/`）
- **📝 command-logger**：将所有命令事件记录到 `~/.clawdbot/logs/commands.log`
- **🚀 boot-md**：在网关启动时运行 `BOOT.md`（需要启用内部钩子）
- **😈 soul-evil**：在清除窗口期间或随机机会中交换注入的 `SOUL.md` 内容与 `SOUL_EVIL.md`

列出可用钩子：

```bash
moltbot hooks list
```

启用钩子：

```bash
moltbot hooks enable session-memory
```

检查钩子状态：

```bash
moltbot hooks check
```

获取详细信息：

```bash
moltbot hooks info session-memory
```

### 入门

在入门过程中（`moltbot onboard`），系统会提示您启用推荐的钩子。向导会自动发现符合条件的钩子并将它们呈现供选择。

## 钩子发现

钩子会从三个目录中自动发现（按优先级顺序）：

1. **工作空间钩子**：`<workspace>/hooks/`（每个代理，最高优先级）
2. **托管钩子**：`~/.clawdbot/hooks/`（用户安装，跨工作空间共享）
3. **内置钩子**：`<moltbot>/dist/hooks/bundled/`（随 Moltbot 一起发布）

托管钩子目录可以是 **单个钩子** 或 **钩子包**（包目录）。

每个钩子都是一个包含以下内容的目录：

```
my-hook/
├── HOOK.md          # 元数据 + 文档
└── handler.ts       # 处理程序实现
```

## 钩子包（npm/归档）

钩子包是标准 npm 包，通过 `package.json` 中的 `moltbot.hooks` 导出一个或多个钩子。使用以下命令安装：

```bash
moltbot hooks install <path-or-spec>
```

示例 `package.json`：

```json
{
  "name": "@acme/my-hooks",
  "version": "0.1.0",
  "moltbot": {
    "hooks": ["./hooks/my-hook", "./hooks/other-hook"]
  }
}
```

每个条目指向包含 `HOOK.md` 和 `handler.ts`（或 `index.ts`）的钩子目录。
钩子包可以携带依赖项；它们将安装在 `~/.clawdbot/hooks/<id>` 下。

## 钩子结构

### HOOK.md 格式

`HOOK.md` 文件包含 YAML 前置元数据加上 Markdown 文档：

```markdown
---
name: my-hook
description: "关于此钩子功能的简短描述"
homepage: https://docs.molt.bot/hooks#my-hook
metadata: {"moltbot":{"emoji":"🔗","events":["command:new"],"requires":{"bins":["node"]}}}
---

# 我的钩子

详细文档在这里...

## 功能

- 监听 `/new` 命令
- 执行某些操作
- 记录结果

## 要求

- 必须安装 Node.js

## 配置

无需配置。
```

### 元数据字段

`metadata.moltbot` 对象支持：

- **`emoji`**：CLI 显示表情符号（例如 `"💾"`）
- **`events`**：要监听的事件数组（例如 `["command:new", "command:reset"]`）
- **`export`**：使用的命名导出（默认为 `"default"`）
- **`homepage`**：文档 URL
- **`requires`**：可选要求
  - **`bins`**：PATH 上必需的二进制文件（例如 `["git", "node"]`）
  - **`anyBins`**：至少有一个二进制文件必须存在
  - **`env`**：必需的环境变量
  - **`config`**：必需的配置路径（例如 `["workspace.dir"]`）
  - **`os`**：必需的平台（例如 `["darwin", "linux"]`）
- **`always`**：绕过资格检查（布尔值）
- **`install`**：安装方法（对于内置钩子：`[{"id":"bundled","kind":"bundled"}]`）

### 处理程序实现

`handler.ts` 文件导出一个 `HookHandler` 函数：

```typescript
import type { HookHandler } from '../../src/hooks/hooks.js';

const myHandler: HookHandler = async (event) => {
  // 仅在 'new' 命令时触发
  if (event.type !== 'command' || event.action !== 'new') {
    return;
  }

  console.log(`[my-hook] New 命令触发`);
  console.log(`  会话: ${event.sessionKey}`);
  console.log(`  时间戳: ${event.timestamp.toISOString()}`);

  // 您的自定义逻辑在这里

  // 可选地向用户发送消息
  event.messages.push('✨ 我的钩子执行了！');
};

export default myHandler;
```

#### 事件上下文

每个事件包括：

```typescript
{
  type: 'command' | 'session' | 'agent' | 'gateway',
  action: string,              // 例如，'new', 'reset', 'stop'
  sessionKey: string,          // 会话标识符
  timestamp: Date,             // 事件发生的时间
  messages: string[],          // 将消息推送到此处以发送给用户
  context: {
    sessionEntry?: SessionEntry,
    sessionId?: string,
    sessionFile?: string,
    commandSource?: string,    // 例如，'whatsapp', 'telegram'
    senderId?: string,
    workspaceDir?: string,
    bootstrapFiles?: WorkspaceBootstrapFile[],
    cfg?: MoltbotConfig
  }
}
```

## 事件类型

### 命令事件

在代理命令发出时触发：

- **`command`**：所有命令事件（通用监听器）
- **`command:new`**：发出 `/new` 命令时
- **`command:reset`**：发出 `/reset` 命令时
- **`command:stop`**：发出 `/stop` 命令时

### 代理事件

- **`agent:bootstrap`**：在注入工作空间引导文件之前（钩子可能会改变 `context.bootstrapFiles`）

### 网关事件

在网关启动时触发：

- **`gateway:startup`**：在通道启动和钩子加载后

### 工具结果钩子（插件 API）

这些钩子不是事件流监听器；它们让插件在 Moltbot 保留它们之前同步调整工具结果。

- **`tool_result_persist`**：在将工具结果写入会话记录之前转换工具结果。必须是同步的；返回更新的工具结果负载或 `undefined` 以保持不变。请参见 [代理循环](/concepts/agent-loop)。

### 未来事件

计划的事件类型：

- **`session:start`**：当新会话开始时
- **`session:end`**：当会话结束时
- **`agent:error`**：当代理遇到错误时
- **`message:sent`**：当消息发送时
- **`message:received`**：当消息接收时

## 创建自定义钩子

### 1. 选择位置

- **工作空间钩子**（`<workspace>/hooks/`）：每个代理，最高优先级
- **托管钩子**（`~/.clawdbot/hooks/`）：跨工作空间共享

### 2. 创建目录结构

```bash
mkdir -p ~/.clawdbot/hooks/my-hook
cd ~/.clawdbot/hooks/my-hook
```

### 3. 创建 HOOK.md

```markdown
---
name: my-hook
description: "做一些有用的事情"
metadata: {"moltbot":{"emoji":"🎯","events":["command:new"]}}
---

# 我的自定义钩子

此钩子在发出 `/new` 时做一些有用的事情。
```

### 4. 创建 handler.ts

```typescript
import type { HookHandler } from '../../src/hooks/hooks.js';

const handler: HookHandler = async (event) => {
  if (event.type !== 'command' || event.action !== 'new') {
    return;
  }

  console.log('[my-hook] 运行中！');
  // 您的逻辑在这里
};

export default handler;
```

### 5. 启用和测试

```bash
# 验证钩子被发现
moltbot hooks list

# 启用它
moltbot hooks enable my-hook

# 重启您的网关进程（macOS 上的菜单栏应用程序重启，或重启您的开发进程）

# 触发事件
# 通过您的消息通道发送 /new
```

## 配置

### 新配置格式（推荐）

```json
{
  "hooks": {
    "internal": {
      "enabled": true,
      "entries": {
        "session-memory": { "enabled": true },
        "command-logger": { "enabled": false }
      }
    }
  }
}
```

### 每个钩子的配置

钩子可以有自定义配置：

```json
{
  "hooks": {
    "internal": {
      "enabled": true,
      "entries": {
        "my-hook": {
          "enabled": true,
          "env": {
            "MY_CUSTOM_VAR": "value"
          }
        }
      }
    }
  }
}
```

### 额外目录

从额外目录加载钩子：

```json
{
  "hooks": {
    "internal": {
      "enabled": true,
      "load": {
        "extraDirs": ["/path/to/more/hooks"]
      }
    }
  }
}
```

### 旧配置格式（仍受支持）

旧配置格式仍适用于向后兼容性：

```json
{
  "hooks": {
    "internal": {
      "enabled": true,
      "handlers": [
        {
          "event": "command:new",
          "module": "./hooks/handlers/my-handler.ts",
          "export": "default"
        }
      ]
    }
  }
}
```

**迁移**：对新钩子使用新的基于发现的系统。遗留处理器在基于目录的钩子之后加载。

## CLI 命令

### 列出钩子

```bash
# 列出所有钩子
moltbot hooks list

# 仅显示符合条件的钩子
moltbot hooks list --eligible

# 详细输出（显示缺少的要求）
moltbot hooks list --verbose

# JSON 输出
moltbot hooks list --json
```

### 钩子信息

```bash
# 显示关于钩子的详细信息
moltbot hooks info session-memory

# JSON 输出
moltbot hooks info session-memory --json
```

### 检查资格

```bash
# 显示资格摘要
moltbot hooks check

# JSON 输出
moltbot hooks check --json
```

### 启用/禁用

```bash
# 启用钩子
moltbot hooks enable session-memory

# 禁用钩子
moltbot hooks disable command-logger
```

## 内置钩子

### session-memory

在发出 `/new` 时将会话上下文保存到内存。

**事件**：`command:new`

**要求**：必须配置 `workspace.dir`

**输出**：`<workspace>/memory/YYYY-MM-DD-slug.md`（默认为 `~/clawd`）

**功能**：
1. 使用预重置会话条目定位正确的记录
2. 提取最后 15 行对话
3. 使用 LLM 生成描述性文件名片段
4. 将会话元数据保存到带日期的内存文件

**示例输出**：

```markdown
# 会话：2026-01-16 14:30:00 UTC

- **会话密钥**：agent:main:main
- **会话 ID**：abc123def456
- **来源**：telegram
```

**文件名示例**：
- `2026-01-16-vendor-pitch.md`
- `2026-01-16-api-design.md`
- `2026-01-16-1430.md`（如果片段生成失败，则使用备用时间戳）

**启用**：

```bash
moltbot hooks enable session-memory
```

### command-logger

将所有命令事件记录到集中式审计文件。

**事件**：`command`

**要求**：无

**输出**：`~/.clawdbot/logs/commands.log`

**功能**：
1. 捕获事件详细信息（命令操作、时间戳、会话密钥、发送者 ID、来源）
2. 以 JSONL 格式追加到日志文件
3. 在后台静默运行

**示例日志条目**：

```jsonl
{"timestamp":"2026-01-16T14:30:00.000Z","action":"new","sessionKey":"agent:main:main","senderId":"+1234567890","source":"telegram"}
{"timestamp":"2026-01-16T15:45:22.000Z","action":"stop","sessionKey":"agent:main:main","senderId":"user@example.com","source":"whatsapp"}
```

**查看日志**：

```bash
# 查看最近的命令
tail -n 20 ~/.clawdbot/logs/commands.log

# 使用 jq 美化打印
cat ~/.clawdbot/logs/commands.log | jq .

# 按操作筛选
grep '"action":"new"' ~/.clawdbot/logs/commands.log | jq .
```

**启用**：

```bash
moltbot hooks enable command-logger
```

### soul-evil

在清除窗口期间或随机机会中交换注入的 `SOUL.md` 内容与 `SOUL_EVIL.md`。

**事件**：`agent:bootstrap`

**文档**：[SOUL 恶意钩子](/hooks/soul-evil)

**输出**：不写入文件；交换仅在内存中进行。

**启用**：

```bash
moltbot hooks enable soul-evil
```

**配置**：

```json
{
  "hooks": {
    "internal": {
      "enabled": true,
      "entries": {
        "soul-evil": {
          "enabled": true,
          "file": "SOUL_EVIL.md",
          "chance": 0.1,
          "purge": { "at": "21:00", "duration": "15m" }
        }
      }
    }
  }
}
```

### boot-md

在网关启动时运行 `BOOT.md`（在通道启动后）。
必须启用内部钩子才能运行此功能。

**事件**：`gateway:startup`

**要求**：必须配置 `workspace.dir`

**功能**：
1. 从您的工作空间读取 `BOOT.md`
2. 通过代理运行器运行指令
3. 通过消息工具发送任何请求的传出消息

**启用**：

```bash
moltbot hooks enable boot-md
```

## 最佳实践

### 保持处理器快速

钩子在命令处理期间运行。保持它们轻量级：

```typescript
// ✓ 好 - 异步工作，立即返回
const handler: HookHandler = async (event) => {
  void processInBackground(event); // 发送并忘记
};

// ✗ 坏 - 阻塞命令处理
const handler: HookHandler = async (event) => {
  await slowDatabaseQuery(event);
  await evenSlowerAPICall(event);
};
```

### 优雅处理错误

始终包装风险操作：

```typescript
const handler: HookHandler = async (event) => {
  try {
    await riskyOperation(event);
  } catch (err) {
    console.error('[my-handler] 失败:', err instanceof Error ? err.message : String(err));
    // 不要抛出异常 - 让其他处理器运行
  }
};
```

### 早期过滤事件

如果事件不相关，请提前返回：

```typescript
const handler: HookHandler = async (event) => {
  // 仅处理 'new' 命令
  if (event.type !== 'command' || event.action !== 'new') {
    return;
  }

  // 您的逻辑在这里
};
```

### 使用特定事件键

尽可能在元数据中指定确切事件：

```yaml
metadata: {"moltbot":{"events":["command:new"]}}  # 特定
```

而不是：

```yaml
metadata: {"moltbot":{"events":["command"]}}      # 一般 - 更多开销
```

## 调试

### 启用钩子日志记录

网关在启动时记录钩子加载：

```
注册钩子：session-memory -> command:new
注册钩子：command-logger -> command
注册钩子：boot-md -> gateway:startup
```

### 检查发现

列出所有发现的钩子：

```bash
moltbot hooks list --verbose
```

### 检查注册

在您的处理器中，记录何时被调用：

```typescript
const handler: HookHandler = async (event) => {
  console.log('[my-handler] 触发:', event.type, event.action);
  // 您的逻辑
};
```

### 验证资格

检查钩子不符合条件的原因：

```bash
moltbot hooks info my-hook
```

在输出中查找缺少的要求。

## 测试

### 网关日志

监控网关日志以查看钩子执行：

```bash
# macOS
./scripts/clawlog.sh -f

# 其他平台
tail -f ~/.clawdbot/gateway.log
```

### 直接测试钩子

独立测试您的处理器：

```typescript
import { test } from 'vitest';
import { createHookEvent } from './src/hooks/hooks.js';
import myHandler from './hooks/my-hook/handler.js';

test('my handler works', async () => {
  const event = createHookEvent('command', 'new', 'test-session', {
    foo: 'bar'
  });

  await myHandler(event);

  // 断言副作用
});
```

## 架构

### 核心组件

- **`src/hooks/types.ts`**：类型定义
- **`src/hooks/workspace.ts`**：目录扫描和加载
- **`src/hooks/frontmatter.ts`**：HOOK.md 元数据解析
- **`src/hooks/config.ts`**：资格检查
- **`src/hooks/hooks-status.ts`**：状态报告
- **`src/hooks/loader.ts`**：动态模块加载器
- **`src/cli/hooks-cli.ts`**：CLI 命令
- **`src/gateway/server-startup.ts`**：在网关启动时加载钩子
- **`src/auto-reply/reply/commands-core.ts`**：触发命令事件

### 发现流程

```
网关启动
    ↓
扫描目录（工作空间 → 托管 → 内置）
    ↓
解析 HOOK.md 文件
    ↓
检查资格（bin、env、config、os）
    ↓
从符合条件的钩子加载处理器
    ↓
为事件注册处理器
```

### 事件流程

```
用户发送 /new
    ↓
命令验证
    ↓
创建钩子事件
    ↓
触发钩子（所有注册的处理器）
    ↓
命令处理继续
    ↓
会话重置
```

## 故障排除

### 钩子未发现

1. 检查目录结构：
   ```bash
   ls -la ~/.clawdbot/hooks/my-hook/
   # 应该显示：HOOK.md, handler.ts
   ```

2. 验证 HOOK.md 格式：
   ```bash
   cat ~/.clawdbot/hooks/my-hook/HOOK.md
   # 应该有 YAML 前置元数据，包含名称和元数据
   ```

3. 列出所有发现的钩子：
   ```bash
   moltbot hooks list
   ```

### 钩子不符合条件

检查要求：

```bash
moltbot hooks info my-hook
```

查找缺少的：
- 二进制文件（检查 PATH）
- 环境变量
- 配置值
- 操作系统兼容性

### 钩子未执行

1. 验证钩子已启用：
   ```bash
   moltbot hooks list
   # 应该在启用的钩子旁边显示 ✓
   ```

2. 重启您的网关进程以便重新加载钩子。

3. 检查网关日志中的错误：
   ```bash
   ./scripts/clawlog.sh | grep hook
   ```

### 处理器错误

检查 TypeScript/导入错误：

```bash
# 直接测试导入
node -e "import('./path/to/handler.ts').then(console.log)"
```

## 迁移指南

### 从旧配置迁移到发现

**之前**：

```json
{
  "hooks": {
    "internal": {
      "enabled": true,
      "handlers": [
        {
          "event": "command:new",
          "module": "./hooks/handlers/my-handler.ts"
        }
      ]
    }
  }
}
```

**之后**：

1. 创建钩子目录：
   ```bash
   mkdir -p ~/.clawdbot/hooks/my-hook
   mv ./hooks/handlers/my-handler.ts ~/.clawdbot/hooks/my-hook/handler.ts
   ```

2. 创建 HOOK.md：
   ```markdown
   ---
   name: my-hook
   description: "我的自定义钩子"
   metadata: {"moltbot":{"emoji":"🎯","events":["command:new"]}}
   ---

   # 我的钩子

   做一些有用的事情。
   ```

3. 更新配置：
   ```json
   {
     "hooks": {
       "internal": {
         "enabled": true,
         "entries": {
           "my-hook": { "enabled": true }
         }
       }
     }
   }
   ```

4. 验证并重启您的网关进程：
   ```bash
   moltbot hooks list
   # 应该显示：🎯 my-hook ✓
   ```

**迁移的好处**：
- 自动发现
- CLI 管理
- 资格检查
- 更好的文档
- 一致的结构

## 参见

- [CLI 参考：hooks](/cli/hooks)
- [内置钩子 README](https://github.com/moltbot/moltbot/tree/main/src/hooks/bundled)
- [Webhook 钩子](/automation/webhook)
- [配置](/gateway/configuration#hooks)