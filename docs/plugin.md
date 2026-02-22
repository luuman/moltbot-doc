---
summary: "Moltbot 插件/扩展：发现、配置和安全性"
read_when:
  - 添加或修改插件/扩展
  - 记录插件安装或加载规则
---
# 插件（扩展）

## 快速入门（插件新手？）

插件只是一个 **小型代码模块**，通过额外功能（命令、工具和网关 RPC）扩展 Moltbot。

大多数时候，当您想要一个尚未内置到核心 Moltbot 中的功能时（或者您想将可选功能保留在主安装之外），您会使用插件。

快速路径：

1) 查看已加载的内容：

```bash
moltbot plugins list
```

2) 安装官方插件（示例：语音通话）：

```bash
moltbot plugins install @moltbot/voice-call
```

3) 重启网关，然后在 `plugins.entries.<id>.config` 下配置。

请参见 [语音通话](/plugins/voice-call) 了解具体的插件示例。

## 可用插件（官方）

- Microsoft Teams 从 2026.1.15 开始仅作为插件；如果您使用 Teams，请安装 `@moltbot/msteams`。
- Memory（核心）— 捆绑的内存搜索插件（默认通过 `plugins.slots.memory` 启用）
- Memory（LanceDB）— 捆绑的长期内存插件（自动回忆/捕获；设置 `plugins.slots.memory = "memory-lancedb"`）
- [语音通话](/plugins/voice-call) — `@moltbot/voice-call`
- [Zalo 个人](/plugins/zalouser) — `@moltbot/zalouser`
- [Matrix](/channels/matrix) — `@moltbot/matrix`
- [Nostr](/channels/nostr) — `@moltbot/nostr`
- [Zalo](/channels/zalo) — `@moltbot/zalo`
- [Microsoft Teams](/channels/msteams) — `@moltbot/msteams`
- Google Antigravity OAuth（提供者认证）— 捆绑为 `google-antigravity-auth`（默认禁用）
- Gemini CLI OAuth（提供者认证）— 捆绑为 `google-gemini-cli-auth`（默认禁用）
- Qwen OAuth（提供者认证）— 捆绑为 `qwen-portal-auth`（默认禁用）
- Copilot Proxy（提供者认证）— 本地 VS Code Copilot Proxy 桥接；与内置的 `github-copilot` 设备登录不同（捆绑，但默认禁用）

Moltbot 插件是通过 jiti 在运行时加载的 **TypeScript 模块**。**配置验证不会执行插件代码**；而是使用插件清单和 JSON Schema。请参见 [插件清单](/plugins/manifest)。

插件可以注册：

- 网关 RPC 方法
- 网关 HTTP 处理器
- 代理工具
- CLI 命令
- 后台服务
- 可选配置验证
- **技能**（通过在插件清单中列出 `skills` 目录）
- **自动回复命令**（无需调用 AI 代理即可执行）

插件与网关在 **进程中** 运行，因此将它们视为可信代码。
工具编写指南：[插件代理工具](/plugins/agent-tools)。

## 运行时助手

插件可以通过 `api.runtime` 访问选定的核心助手。对于电话 TTS：

```ts
const result = await api.runtime.tts.textToSpeechTelephony({
  text: "Hello from Moltbot",
  cfg: api.config,
});
```

注意事项：
- 使用核心 `messages.tts` 配置（OpenAI 或 ElevenLabs）。
- 返回 PCM 音频缓冲区 + 采样率。插件必须为提供者重新采样/编码。
- 边缘 TTS 不支持电话。

## 发现与优先级

Moltbot 按顺序扫描：

1) 配置路径
- `plugins.load.paths`（文件或目录）

2) 工作区扩展
- `<workspace>/.clawdbot/extensions/*.ts`
- `<workspace>/.clawdbot/extensions/*/index.ts`

3) 全球扩展
- `~/.clawdbot/extensions/*.ts`
- `~/.clawdbot/extensions/*/index.ts`

4) 捆绑扩展（随 Moltbot 一起发布，**默认禁用**）
- `<moltbot>/extensions/*`

必须通过 `plugins.entries.<id>.enabled` 或 `moltbot plugins enable <id>` 明确启用捆绑插件。安装的插件默认启用，但可以通过相同方式禁用。

每个插件必须在其根目录包含 `moltbot.plugin.json` 文件。如果路径指向文件，插件根目录是文件的目录，且必须包含清单。

如果多个插件解析为相同的 id，上述顺序中的第一个匹配项获胜，较低优先级的副本将被忽略。

### 包集合

插件目录可能包含带有 `moltbot.extensions` 的 `package.json`：

```json
{
  "name": "my-pack",
  "moltbot": {
    "extensions": ["./src/safety.ts", "./src/tools.ts"]
  }
}
```

每个条目成为一个插件。如果包列出了多个扩展，插件 id 变为 `name/<fileBase>`。

如果您的插件导入 npm 依赖项，请在该目录中安装它们，以便 `node_modules` 可用（`npm install` / `pnpm install`）。

### 频道目录元数据

频道插件可以通过 `moltbot.channel` 广告入职元数据，并通过 `moltbot.install` 提供安装提示。这使核心目录保持无数据状态。

示例：

```json
{
  "name": "@moltbot/nextcloud-talk",
  "moltbot": {
    "extensions": ["./index.ts"],
    "channel": {
      "id": "nextcloud-talk",
      "label": "Nextcloud Talk",
      "selectionLabel": "Nextcloud Talk (self-hosted)",
      "docsPath": "/channels/nextcloud-talk",
      "docsLabel": "nextcloud-talk",
      "blurb": "通过 Nextcloud Talk webhook 机器人进行自托管聊天。",
      "order": 65,
      "aliases": ["nc-talk", "nc"]
    },
    "install": {
      "npmSpec": "@moltbot/nextcloud-talk",
      "localPath": "extensions/nextcloud-talk",
      "defaultChoice": "npm"
    }
  }
}
```

Moltbot 还可以合并 **外部频道目录**（例如，MPM 注册表导出）。在以下位置之一放置 JSON 文件：
- `~/.clawdbot/mpm/plugins.json`
- `~/.clawdbot/mpm/catalog.json`
- `~/.clawdbot/plugins/catalog.json`

或指向 `CLAWDBOT_PLUGIN_CATALOG_PATHS`（或 `CLAWDBOT_MPM_CATALOG_PATHS`）的一个或多个 JSON 文件（逗号/分号/`PATH` 分隔）。每个文件应包含 `{ "entries": [ { "name": "@scope/pkg", "moltbot": { "channel": {...}, "install": {...} } } ] }`。

## 插件 ID

默认插件 ID：

- 包集合：`package.json` `name`
- 独立文件：文件基本名称（`~/.../voice-call.ts` → `voice-call`）

如果插件导出 `id`，Moltbot 使用它，但如果与配置的 ID 不匹配则会发出警告。

## 配置

```json5
{
  plugins: {
    enabled: true,
    allow: ["voice-call"],
    deny: ["untrusted-plugin"],
    load: { paths: ["~/Projects/oss/voice-call-extension"] },
    entries: {
      "voice-call": { enabled: true, config: { provider: "twilio" } }
    }
  }
}
```

字段：
- `enabled`：主开关（默认：true）
- `allow`：白名单（可选）
- `deny`：黑名单（可选；拒绝优先）
- `load.paths`：额外的插件文件/目录
- `entries.<id>`：每个插件的开关 + 配置

配置更改 **需要重启网关**。

验证规则（严格）：
- `entries`、`allow`、`deny` 或 `slots` 中的未知插件 ID 是 **错误**。
- 未知的 `channels.<id>` 键是 **错误**，除非插件清单声明频道 ID。
- 插件配置使用嵌入在 `moltbot.plugin.json`（`configSchema`）中的 JSON Schema 进行验证。
- 如果插件被禁用，其配置将被保留并发出 **警告**。

## 插件槽（独占类别）

某些插件类别是 **独占的**（一次只能激活一个）。使用 `plugins.slots` 选择哪个插件拥有该槽：

```json5
{
  plugins: {
    slots: {
      memory: "memory-core" // 或 "none" 以禁用内存插件
    }
  }
}
```

如果多个插件声明 `kind: "memory"`，只有选定的插件会加载。其他插件被禁用并显示诊断信息。

## 控制界面（模式 + 标签）

控制界面使用 `config.schema`（JSON Schema + `uiHints`）来渲染更好的表单。

Moltbot 在运行时根据发现的插件增强 `uiHints`：

- 为 `plugins.entries.<id>` / `.enabled` / `.config` 添加每个插件的标签
- 在以下位置合并插件提供的可选配置字段提示：
  `plugins.entries.<id>.config.<field>`

如果您希望插件配置字段显示良好的标签/占位符（并将秘密标记为敏感），请在插件清单中提供 `uiHints` 与 JSON Schema 一起。

示例：

```json
{
  "id": "my-plugin",
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "apiKey": { "type": "string" },
      "region": { "type": "string" }
    }
  },
  "uiHints": {
    "apiKey": { "label": "API Key", "sensitive": true },
    "region": { "label": "Region", "placeholder": "us-east-1" }
  }
}
```

## CLI

```bash
moltbot plugins list
moltbot plugins info <id>
moltbot plugins install <path>                 # 将本地文件/目录复制到 ~/.clawdbot/extensions/<id>
moltbot plugins install ./extensions/voice-call # 相对路径可以
moltbot plugins install ./plugin.tgz           # 从本地 tarball 安装
moltbot plugins install ./plugin.zip           # 从本地 zip 安装
moltbot plugins install -l ./extensions/voice-call # 链接（无复制）用于开发
moltbot plugins install @moltbot/voice-call # 从 npm 安装
moltbot plugins update <id>
moltbot plugins update --all
moltbot plugins enable <id>
moltbot plugins disable <id>
moltbot plugins doctor
```

`plugins update` 仅适用于在 `plugins.installs` 下跟踪的 npm 安装。

插件还可以注册自己的顶级命令（示例：`moltbot voicecall`）。

## 插件 API（概述）

插件导出以下任一项：

- 函数：`(api) => { ... }`
- 对象：`{ id, name, configSchema, register(api) { ... } }`

## 插件钩子

插件可以分发钩子并在运行时注册它们。这允许插件捆绑事件驱动的自动化，而无需单独的钩子包安装。

### 示例

```
import { registerPluginHooksFromDir } from "moltbot/plugin-sdk";

export default function register(api) {
  registerPluginHooksFromDir(api, "./hooks");
}
```

注意事项：
- 钩子目录遵循正常的钩子结构（`HOOK.md` + `handler.ts`）。
- 钩子资格规则仍然适用（操作系统/二进制文件/环境/配置要求）。
- 插件管理的钩子在 `moltbot hooks list` 中显示为 `plugin:<id>`。
- 您无法通过 `moltbot hooks` 启用/禁用插件管理的钩子；而是启用/禁用插件。

## 提供者插件（模型认证）

插件可以注册 **模型提供者认证** 流程，以便用户可以在 Moltbot 内部运行 OAuth 或 API 密钥设置（无需外部脚本）。

通过 `api.registerProvider(...)` 注册提供者。每个提供者公开一个或多个认证方法（OAuth、API 密钥、设备代码等）。这些方法支持：

- `moltbot models auth login --provider <id> [--method <id>]`

示例：

```ts
api.registerProvider({
  id: "acme",
  label: "AcmeAI",
  auth: [
    {
      id: "oauth",
      label: "OAuth",
      kind: "oauth",
      run: async (ctx) => {
        // 运行 OAuth 流程并返回认证配置文件。
        return {
          profiles: [
            {
              profileId: "acme:default",
              credential: {
                type: "oauth",
                provider: "acme",
                access: "...",
                refresh: "...",
                expires: Date.now() + 3600 * 1000,
              },
            },
          ],
          defaultModel: "acme/opus-1",
        };
      },
    },
  ],
});
```

注意事项：
- `run` 接收带有 `prompter`、`runtime`、`openUrl` 和 `oauth.createVpsAwareHandlers` 助手的 `ProviderAuthContext`。
- 当您需要添加默认模型或提供者配置时返回 `configPatch`。
- 返回 `defaultModel` 以便 `--set-default` 可以更新代理默认值。

### 注册消息通道

插件可以注册行为类似于内置通道的 **通道插件**（WhatsApp、Telegram 等）。通道配置位于 `channels.<id>` 下，并由您的通道插件代码验证。

```ts
const myChannel = {
  id: "acmechat",
  meta: {
    id: "acmechat",
    label: "AcmeChat",
    selectionLabel: "AcmeChat (API)",
    docsPath: "/channels/acmechat",
    blurb: "演示通道插件。",
    aliases: ["acme"],
  },
  capabilities: { chatTypes: ["direct"] },
  config: {
    listAccountIds: (cfg) => Object.keys(cfg.channels?.acmechat?.accounts ?? {}),
    resolveAccount: (cfg, accountId) =>
      (cfg.channels?.acmechat?.accounts?.[accountId ?? "default"] ?? { accountId }),
  },
  outbound: {
    deliveryMode: "direct",
    sendText: async () => ({ ok: true }),
  },
};

export default function (api) {
  api.registerChannel({ plugin: myChannel });
}
```

注意事项：
- 将配置放在 `channels.<id>` 下（不在 `plugins.entries` 中）。
- `meta.label` 用于 CLI/UI 列表中的标签。
- `meta.aliases` 添加备用 ID 用于规范化和 CLI 输入。
- `meta.preferOver` 列出当两者都配置时要跳过的通道 ID。
- `meta.detailLabel` 和 `meta.systemImage` 让 UI 显示更丰富的通道标签/图标。

### 编写新消息通道（逐步指南）

当您想要 **新聊天界面**（"消息通道"）而不是模型提供者时使用此方法。
模型提供者文档位于 `/providers/*` 下。

1) 选择 ID + 配置形状
- 所有通道配置都位于 `channels.<id>` 下。
- 对于多账户设置，优先使用 `channels.<id>.accounts.<accountId>`。

2) 定义通道元数据
- `meta.label`、`meta.selectionLabel`、`meta.docsPath`、`meta.blurb` 控制 CLI/UI 列表。
- `meta.docsPath` 应指向像 `/channels/<id>` 这样的文档页面。
- `meta.preferOver` 让插件替换另一个通道（自动启用优先考虑它）。
- `meta.detailLabel` 和 `meta.systemImage` 由 UI 用于详细文本/图标。

3) 实现必需的适配器
- `config.listAccountIds` + `config.resolveAccount`
- `capabilities`（聊天类型、媒体、线程等）
- `outbound.deliveryMode` + `outbound.sendText`（用于基本发送）

4) 根据需要添加可选适配器
- `setup`（向导）、`security`（DM 策略）、`status`（健康/诊断）
- `gateway`（启动/停止/登录）、`mentions`、`threading`、`streaming`
- `actions`（消息操作）、`commands`（原生命令行为）

5) 在您的插件中注册通道
- `api.registerChannel({ plugin })`

最小配置示例：

```json5
{
  channels: {
    acmechat: {
      accounts: {
        default: { token: "ACME_TOKEN", enabled: true }
      }
    }
  }
}
```

最小通道插件（仅出站）：

```ts
const plugin = {
  id: "acmechat",
  meta: {
    id: "acmechat",
    label: "AcmeChat",
    selectionLabel: "AcmeChat (API)",
    docsPath: "/channels/acmechat",
    blurb: "AcmeChat 消息通道。",
    aliases: ["acme"],
  },
  capabilities: { chatTypes: ["direct"] },
  config: {
    listAccountIds: (cfg) => Object.keys(cfg.channels?.acmechat?.accounts ?? {}),
    resolveAccount: (cfg, accountId) =>
      (cfg.channels?.acmechat?.accounts?.[accountId ?? "default"] ?? { accountId }),
  },
  outbound: {
    deliveryMode: "direct",
    sendText: async ({ text }) => {
      // 在此处将 `text` 交付到您的通道
      return { ok: true };
    },
  },
};

export default function (api) {
  api.registerChannel({ plugin });
}
```

加载插件（扩展目录或 `plugins.load.paths`），重启网关，
然后在配置中配置 `channels.<id>`。

### 代理工具

请参见专用指南：[插件代理工具](/plugins/agent-tools)。

### 注册网关 RPC 方法

```ts
export default function (api) {
  api.registerGatewayMethod("myplugin.status", ({ respond }) => {
    respond(true, { ok: true });
  });
}
```

### 注册 CLI 命令

```ts
export default function (api) {
  api.registerCli(({ program }) => {
    program.command("mycmd").action(() => {
      console.log("Hello");
    });
  }, { commands: ["mycmd"] });
}
```

### 注册自动回复命令

插件可以注册在 **不调用 AI 代理** 的情况下执行的自定义斜杠命令。这对于切换命令、状态检查或不需要 LLM 处理的快速操作很有用。

```ts
export default function (api) {
  api.registerCommand({
    name: "mystatus",
    description: "显示插件状态",
    handler: (ctx) => ({
      text: `插件正在运行！通道：${ctx.channel}`,
    }),
  });
}
```

命令处理程序上下文：

- `senderId`：发送者 ID（如果可用）
- `channel`：发送命令的通道
- `isAuthorizedSender`：发送者是否为授权用户
- `args`：命令后传递的参数（如果 `acceptsArgs: true`）
- `commandBody`：完整的命令文本
- `config`：当前 Moltbot 配置

命令选项：

- `name`：命令名称（不带前导 `/`）
- `description`：在命令列表中显示的帮助文本
- `acceptsArgs`：命令是否接受参数（默认：false）。如果为 false 并提供了参数，则命令不会匹配，消息会传递给其他处理程序
- `requireAuth`：是否需要授权发送者（默认：true）
- `handler`：返回 `{ text: string }` 的函数（可以是异步的）

带授权和参数的示例：

```ts
api.registerCommand({
  name: "setmode",
  description: "设置插件模式",
  acceptsArgs: true,
  requireAuth: true,
  handler: async (ctx) => {
    const mode = ctx.args?.trim() || "default";
    await saveMode(mode);
    return { text: `模式设置为：${mode}` };
  },
});
```

注意事项：
- 插件命令在 **内置命令和 AI 代理之前** 处理
- 命令是全局注册的，在所有通道中都有效
- 命令名称不区分大小写（`/MyStatus` 匹配 `/mystatus`）
- 命令名称必须以字母开头，只能包含字母、数字、连字符和下划线
- 保留命令名称（如 `help`、`status`、`reset` 等）不能被插件覆盖
- 跨插件的重复命令注册将因诊断错误而失败

### 注册后台服务

```ts
export default function (api) {
  api.registerService({
    id: "my-service",
    start: () => api.logger.info("ready"),
    stop: () => api.logger.info("bye"),
  });
}
```

## 命名约定

- 网关方法：`pluginId.action`（示例：`voicecall.status`）
- 工具：`snake_case`（示例：`voice_call`）
- CLI 命令：连字符或驼峰，但避免与核心命令冲突

## 技能

插件可以在仓库中分发技能（`skills/<name>/SKILL.md`）。
使用 `plugins.entries.<id>.enabled`（或其他配置门）启用它，并确保它存在于您的工作区/管理技能位置。

## 分发（npm）

推荐的打包：

- 主包：`moltbot`（此仓库）
- 插件：在 `@moltbot/*` 下的单独 npm 包（示例：`@moltbot/voice-call`）

发布合同：

- 插件 `package.json` 必须包含 `moltbot.extensions` 和一个或多个入口文件。
- 入口文件可以是 `.js` 或 `.ts`（jiti 在运行时加载 TS）。
- `moltbot plugins install <npm-spec>` 使用 `npm pack`，提取到 `~/.clawdbot/extensions/<id>/`，并在配置中启用它。
- 配置键稳定性：作用域包被规范化为 **无作用域** ID 用于 `plugins.entries.*`。

## 示例插件：语音通话

此仓库包含一个语音通话插件（Twilio 或日志回退）：

- 源码：`extensions/voice-call`
- 技能：`skills/voice-call`
- CLI：`moltbot voicecall start|status`
- 工具：`voice_call`
- RPC：`voicecall.start`, `voicecall.status`
- 配置（twilio）：`provider: "twilio"` + `twilio.accountSid/authToken/from`（可选 `statusCallbackUrl`, `twimlUrl`）
- 配置（开发）：`provider: "log"`（无网络）

请参见 [语音通话](/plugins/voice-call) 和 `extensions/voice-call/README.md` 了解设置和使用。

## 安全注意事项

插件与网关在进程中运行。将它们视为可信代码：

- 只安装您信任的插件。
- 优先使用 `plugins.allow` 白名单。
- 更改后重启网关。

## 测试插件

插件可以（并且应该）分发测试：

- 仓库内的插件可以在 `src/**` 下保留 Vitest 测试（示例：`src/plugins/voice-call.plugin.test.ts`）。
- 单独发布的插件应运行自己的 CI（lint/build/test）并验证 `moltbot.extensions` 指向构建的入口点（`dist/index.js`）。