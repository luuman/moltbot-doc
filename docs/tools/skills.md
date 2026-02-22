---
summary: "技能：管理与工作区，门控规则和配置/环境配置"
read_when:
  - 添加或修改技能
  - 更改技能门控或加载规则
---
# 技能（Moltbot）

Moltbot 使用 **[AgentSkills](https://agentskills.io)-兼容** 的技能文件夹来教代理如何使用工具。每个技能是一个包含带有 YAML 前置内容和说明的 `SKILL.md` 的目录。Moltbot 加载 **捆绑技能** 加上可选的本地覆盖，并根据环境、配置和二进制文件存在情况在加载时过滤它们。

## 位置和优先级

技能从 **三个** 位置加载：

1) **捆绑技能**：随安装包一起提供（npm 包或 Moltbot.app）
2) **管理/本地技能**：`~/.clawdbot/skills`
3) **工作区技能**：`<workspace>/skills`

如果技能名称冲突，优先级是：

`<workspace>/skills`（最高）→ `~/.clawdbot/skills` → 捆绑技能（最低）

此外，您可以通过 `~/.clawdbot/moltbot.json` 中的 `skills.load.extraDirs` 配置额外的技能文件夹（最低优先级）。

## 按代理 vs 共享技能

在 **多代理** 设置中，每个代理都有自己的工作区。这意味着：

- **按代理技能** 仅存在于该代理的 `<workspace>/skills` 中。
- **共享技能** 存在于 `~/.clawdbot/skills`（管理/本地）中，对同一台机器上的 **所有代理** 可见。
- **共享文件夹** 也可以通过 `skills.load.extraDirs`（最低优先级）添加，如果您想要多个代理使用的通用技能包。

如果同一个技能名称存在于多个地方，通常的优先级适用：工作区胜出，然后是管理/本地，然后是捆绑的。

## 插件 + 技能

插件可以通过在 `moltbot.plugin.json` 中列出 `skills` 目录来发布自己的技能（相对于插件根目录的路径）。插件技能在插件启用时加载并参与正常的技能优先级规则。您可以通过插件配置条目上的 `metadata.moltbot.requires.config` 来限制它们。参见 [插件](/plugin) 了解发现/配置，参见 [工具](/tools) 了解这些技能教授的工具界面。

## ClawdHub（安装 + 同步）

ClawdHub 是 Moltbot 的公共技能注册表。浏览 https://clawdhub.com。使用它来发现、安装、更新和备份技能。
完整指南：[ClawdHub](/tools/clawdhub)。

常见流程：

- 将技能安装到您的工作区：
  - `clawdhub install <skill-slug>`
- 更新所有已安装的技能：
  - `clawdhub update --all`
- 同步（扫描 + 发布更新）：
  - `clawdhub sync --all`

默认情况下，`clawdhub` 安装到您当前工作目录下的 `./skills`（或回退到配置的 Moltbot 工作区）。Moltbot 在下一个会话中将其作为 `<workspace>/skills` 获取。

## 安全说明

- 将第三方技能视为 **受信任代码**。启用前请阅读。
- 对于不受信任的输入和风险工具，优先使用沙箱运行。参见 [沙箱](/gateway/sandboxing)。
- `skills.entries.*.env` 和 `skills.entries.*.apiKey` 为该代理回合（不是沙箱）将机密注入到 **主机** 进程中。
  请将机密保持在提示和日志之外。
- 有关更广泛的威胁模型和检查表，参见 [安全](/gateway/security)。

## 格式（AgentSkills + Pi 兼容）

`SKILL.md` 必须至少包含：

```markdown
---
name: nano-banana-pro
description: 通过 Gemini 3 Pro 图像生成或编辑图像
---
```

说明：
- 我们遵循 AgentSkills 规范进行布局/意图。
- 嵌入代理使用的解析器仅支持 **单行** 前置内容键。
- `metadata` 应该是 **单行 JSON 对象**。
- 在说明中使用 `{baseDir}` 引用技能文件夹路径。
- 可选前置内容键：
  - `homepage` — 在 macOS 技能 UI 中作为"网站"显示的 URL（也通过 `metadata.moltbot.homepage` 支持）。
  - `user-invocable` — `true|false`（默认：`true`）。当为 `true` 时，技能作为用户斜杠命令暴露。
  - `disable-model-invocation` — `true|false`（默认：`false`）。当为 `true` 时，技能从模型提示中排除（仍可通过用户调用获得）。
  - `command-dispatch` — `tool`（可选）。设置为 `tool` 时，斜杠命令绕过模型并直接调度到工具。
  - `command-tool` — 当设置 `command-dispatch: tool` 时调用的工具名称。
  - `command-arg-mode` — `raw`（默认）。对于工具调度，将原始参数字符串转发到工具（无核心解析）。

    工具使用参数调用：
    `{ command: "<raw args>", commandName: "<slash command>", skillName: "<skill name>" }`。

## 门控（加载时过滤器）

Moltbot 使用 `metadata`（单行 JSON）在加载时**过滤技能**：

```markdown
---
name: nano-banana-pro
description: 通过 Gemini 3 Pro 图像生成或编辑图像
metadata: {"moltbot":{"requires":{"bins":["uv"],"env":["GEMINI_API_KEY"],"config":["browser.enabled"]},"primaryEnv":"GEMINI_API_KEY"}}
---
```

`metadata.moltbot` 下的字段：
- `always: true` — 始终包含技能（跳过其他门控）。
- `emoji` — macOS 技能 UI 使用的可选表情符号。
- `homepage` — 在 macOS 技能 UI 中作为"网站"显示的可选 URL。
- `os` — 可选平台列表（`darwin`、`linux`、`win32`）。如果设置，技能仅在这些操作系统上有资格。
- `requires.bins` — 列表；每个都必须存在于 `PATH` 上。
- `requires.anyBins` — 列表；至少一个必须存在于 `PATH` 上。
- `requires.env` — 列表；环境变量必须存在 **或** 在配置中提供。
- `requires.config` — 必须为真值的 `moltbot.json` 路径列表。
- `primaryEnv` — 与 `skills.entries.<name>.apiKey` 关联的环境变量名称。
- `install` — macOS 技能 UI 使用的安装程序规范的可选数组（brew/node/go/uv/download）。

关于沙箱的说明：
- `requires.bins` 在技能加载时在 **主机** 上检查。
- 如果代理被沙箱化，二进制文件也必须存在于**容器内部**。
  通过 `agents.defaults.sandbox.docker.setupCommand`（或自定义镜像）安装。
  `setupCommand` 在容器创建后运行一次。
  包安装还需要沙箱中的网络出口、可写根文件系统和根用户。
  示例：`summarize` 技能（`skills/summarize/SKILL.md`）需要 `summarize` CLI
  在沙箱容器中运行。

安装程序示例：

```markdown
---
name: gemini
description: 使用 Gemini CLI 进行编码协助和 Google 搜索查询。
metadata: {"moltbot":{"emoji":"♊️","requires":{"bins":["gemini"]},"install":[{"id":"brew","kind":"brew","formula":"gemini-cli","bins":["gemini"],"label":"安装 Gemini CLI (brew)"}]}}
---
```

说明：
- 如果列出多个安装程序，网关会选择一个**首选**选项（可用时为 brew，否则为 node）。
- 如果所有安装程序都是 `download`，Moltbot 会列出每个条目以便您可以看到可用的工件。
- 安装程序规范可以包含 `os: ["darwin"|"linux"|"win32"]` 按平台筛选选项。
- Node 安装遵循 `moltbot.json` 中的 `skills.install.nodeManager`（默认：npm；选项：npm/pnpm/yarn/bun）。
  这仅影响 **技能安装**；网关运行时仍应该是 Node
  （不推荐使用 Bun 用于 WhatsApp/Telegram）。
- Go 安装：如果缺少 `go` 且 `brew` 可用，网关首先通过 Homebrew 安装 Go 并在可能时将 `GOBIN` 设置为 Homebrew 的 `bin`。
 - 下载安装：`url`（必需），`archive`（`tar.gz` | `tar.bz2` | `zip`），`extract`（默认：检测到存档时自动提取），`stripComponents`，`targetDir`（默认：`~/.clawdbot/tools/<skillKey>`）。

如果没有 `metadata.moltbot`，技能始终有资格（除非在配置中禁用或对于捆绑技能被 `skills.allowBundled` 阻止）。

## 配置覆盖（`~/.clawdbot/moltbot.json`）

捆绑/管理的技能可以切换并提供环境值：

```json5
{
  skills: {
    entries: {
      "nano-banana-pro": {
        enabled: true,
        apiKey: "GEMINI_KEY_HERE",
        env: {
          GEMINI_API_KEY: "GEMINI_KEY_HERE"
        },
        config: {
          endpoint: "https://example.invalid",
          model: "nano-pro"
        }
      },
      peekaboo: { enabled: true },
      sag: { enabled: false }
    }
  }
}
```

注意：如果技能名称包含连字符，请引用键（JSON5 允许引用键）。

配置键默认匹配 **技能名称**。如果技能定义了 `metadata.moltbot.skillKey`，请在 `skills.entries` 下使用该键。

规则：
- `enabled: false` 禁用技能，即使它是捆绑/安装的。
- `env`：**仅当** 变量尚未在进程中设置时才注入。
- `apiKey`：为声明 `metadata.moltbot.primaryEnv` 的技能提供便利。
- `config`：自定义每技能字段的可选包；自定义键必须在此处。
- `allowBundled`：仅 **捆绑** 技能的可选允许列表。如果设置，列表中只有捆绑技能才有资格（管理/工作区技能不受影响）。

## 环境注入（按代理运行）

当代理运行开始时，Moltbot：
1) 读取技能元数据。
2) 将任何 `skills.entries.<key>.env` 或 `skills.entries.<key>.apiKey` 应用到
   `process.env`。
3) 使用 **有资格的** 技能构建系统提示。
4) 运行结束后恢复原始环境。

这是**作用域限定到代理运行**的，不是全局 shell 环境。

## 会话快照（性能）

Moltbot 在**会话开始时**对有资格的技能进行快照，并在同一会话的后续回合中重用该列表。技能或配置的更改在下一个新会话中生效。

当技能监视器启用或出现新的有资格的远程节点时（见下文），技能也可以在会话中途刷新。将其视为**热重载**：刷新的列表在下一个代理回合中被获取。

## 远程 macOS 节点（Linux 网关）

如果网关在 Linux 上运行但 **macOS 节点** 已连接 **且允许 `system.run`**（Exec 批准安全未设置为 `deny`），当所需二进制文件存在于该节点上时，Moltbot 可以将仅 macOS 技能视为有资格。代理应该通过 `nodes` 工具（通常是 `nodes.run`）执行这些技能。

这依赖于节点报告其命令支持和通过 `system.run` 的二进制探测。如果 macOS 节点稍后离线，技能仍然可见；调用可能会失败，直到节点重新连接。

## 技能监视器（自动刷新）

默认情况下，Moltbot 监视技能文件夹，并在 `SKILL.md` 文件更改时更新技能快照。在 `skills.load` 下配置：

```json5
{
  skills: {
    load: {
      watch: true,
      watchDebounceMs: 250
    }
  }
}
```

## 令牌影响（技能列表）

当技能有资格时，Moltbot 将可用技能的紧凑 XML 列表注入到系统提示中（通过 `pi-coding-agent` 中的 `formatSkillsForPrompt`）。成本是确定的：

- **基础开销（仅当 ≥1 技能时）：** 195 个字符。
- **每技能：** 97 个字符 + XML 转义的 `<name>`、`<description>` 和 `<location>` 值的长度。

公式（字符）：

```
total = 195 + Σ (97 + len(name_escaped) + len(description_escaped) + len(location_escaped))
```

说明：
- XML 转义将 `& < > " '` 扩展为实体（`&amp;`、`&lt;` 等），增加长度。
- 令牌计数因模型标记器而异。粗略的 OpenAI 风格估算约为 ~4 chars/token，所以 **97 chars ≈ 24 tokens** 每技能加上您的实际字段长度。

## 管理技能生命周期

Moltbot 作为安装的一部分（npm 包或 Moltbot.app）发布一组基线技能作为 **捆绑技能**。`~/.clawdbot/skills` 存在用于本地覆盖（例如，固定/修补技能而不更改捆绑副本）。工作区技能由用户拥有，并在名称冲突时覆盖两者。

## 配置参考

参见 [技能配置](/tools/skills-config) 获取完整配置模式。

## 寻找更多技能？

浏览 https://clawdhub.com。

---
