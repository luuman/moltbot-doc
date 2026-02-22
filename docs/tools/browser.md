---
summary: "集成浏览器控制服务 + 操作命令"
read_when:
  - 添加代理控制的浏览器自动化
  - 调试为什么clawd干扰您的Chrome
  - 在macOS应用中实现浏览器设置+生命周期
---

# 浏览器 (clawd管理)

Moltbot可以运行一个代理控制的**专用Chrome/Brave/Edge/Chromium配置文件**。
它与您的个人浏览器隔离，并通过网关内的一个小本地控制服务进行管理（仅环回）。

初学者视角:
- 将其视为一个**独立的、仅代理浏览器**。
- `clawd` 配置文件**不**触碰您的个人浏览器配置文件。
- 代理可以在安全通道中**打开标签页、读取页面、点击和输入**。
- 默认的 `chrome` 配置文件通过扩展中继使用**系统默认的Chromium浏览器**;
  切换到 `clawd` 以获得隔离的管理浏览器。

## 您得到的功能

- 一个名为 **clawd** 的独立浏览器配置文件（默认橙色强调色）。
- 确定性的标签页控制（列表/打开/聚焦/关闭）。
- 代理操作（点击/输入/拖拽/选择）、快照、截图、PDF。
- 可选的多配置文件支持（`clawd`、`work`、`remote`等）。

这个浏览器**不是**您的日常浏览器。它是用于代理自动化和验证的安全、隔离表面。

## 快速开始

```bash
moltbot browser --browser-profile clawd status
moltbot browser --browser-profile clawd start
moltbot browser --browser-profile clawd open https://example.com
moltbot browser --browser-profile clawd snapshot
```

如果出现"浏览器已禁用"，请在配置中启用它（见下文）并重启网关。

## 配置文件：`clawd` vs `chrome`

- `clawd`: 管理的、隔离的浏览器（不需要扩展）。
- `chrome`: 扩展中继到您的**系统浏览器**（需要将Moltbot扩展附加到标签页）。

如果希望默认使用管理模式，请设置 `browser.defaultProfile: "clawd"`。

## 配置

浏览器设置位于 `~/.clawdbot/moltbot.json`。

```json5
{
  browser: {
    enabled: true,                    // 默认: true
    // cdpUrl: "http://127.0.0.1:18792", // 遗留单配置文件覆盖
    remoteCdpTimeoutMs: 1500,         // 远程CDP HTTP超时（毫秒）
    remoteCdpHandshakeTimeoutMs: 3000, // 远程CDP WebSocket握手超时（毫秒）
    defaultProfile: "chrome",
    color: "#FF4500",
    headless: false,
    noSandbox: false,
    attachOnly: false,
    executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    profiles: {
      clawd: { cdpPort: 18800, color: "#FF4500" },
      work: { cdpPort: 18801, color: "#0066CC" },
      remote: { cdpUrl: "http://10.0.0.42:9222", color: "#00AA00" }
    }
  }
}
```

注意事项:
- 浏览器控制服务绑定到从 `gateway.port` 派生的环回端口
  （默认: `18791`，即网关+2）。中继使用下一个端口（`18792`）。
- 如果您覆盖网关端口（`gateway.port` 或 `CLAWDBOT_GATEWAY_PORT`），
  派生的浏览器端口会移动以保持在同一"家族"中。
- `cdpUrl` 默认为中继端口。
- `remoteCdpTimeoutMs` 适用于远程（非环回）CDP可达性检查。
- `remoteCdpHandshakeTimeoutMs` 适用于远程CDP WebSocket可达性检查。
- `attachOnly: true` 表示"从不启动本地浏览器；仅在已运行时附加。"
- `color` + 每个配置文件的 `color` 为浏览器UI着色，以便您可以看到哪个配置文件处于活动状态。
- 默认配置文件是 `chrome`（扩展中继）。使用 `defaultProfile: "clawd"` 以获得管理浏览器。
- 自动检测顺序：如果是基于Chromium的系统默认浏览器；否则 Chrome → Brave → Edge → Chromium → Chrome Canary。
- 本地 `clawd` 配置文件自动分配 `cdpPort`/`cdpUrl` — 仅为远程CDP设置这些。

## 使用Brave（或其他基于Chromium的浏览器）

如果您的**系统默认**浏览器是基于Chromium的（Chrome/Brave/Edge等），
Moltbot会自动使用它。设置 `browser.executablePath` 以覆盖
自动检测：

CLI示例：

```bash
moltbot config set browser.executablePath "/usr/bin/google-chrome"
```

```json5
// macOS
{
  browser: {
    executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
  }
}

// Windows
{
  browser: {
    executablePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe"
  }
}

// Linux
{
  browser: {
    executablePath: "/usr/bin/brave-browser"
  }
}
```

## 本地 vs 远程控制

- **本地控制（默认）:** 网关启动环回控制服务并可以启动本地浏览器。
- **远程控制（节点主机）:** 在有浏览器的机器上运行节点主机；网关将浏览器操作代理到它。
- **远程CDP:** 设置 `browser.profiles.<name>.cdpUrl`（或 `browser.cdpUrl`）以
  附加到远程基于Chromium的浏览器。在这种情况下，Moltbot不会启动本地浏览器。

远程CDP URL可以包含认证：
- 查询令牌（例如，`https://provider.example?token=<token>`）
- HTTP基本认证（例如，`https://user:pass@provider.example`）

Moltbot在调用 `/json/*` 端点和连接CDP WebSocket时保留认证。
对于令牌，优先使用环境变量或密钥管理器，而不是将其提交到配置文件。

## 节点浏览器代理（零配置默认）

如果在有浏览器的机器上运行**节点主机**，Moltbot可以
在没有任何额外浏览器配置的情况下自动路由浏览器工具调用到该节点。
这是远程网关的默认路径。

注意事项:
- 节点主机通过**代理命令**暴露其本地浏览器控制服务器。
- 配置文件来自节点自己的 `browser.profiles` 配置（与本地相同）。
- 如果您不想要它，请禁用：
  - 在节点上：`nodeHost.browserProxy.enabled=false`
  - 在网关上：`gateway.nodes.browser.mode="off"`

## Browserless（托管远程CDP）

[Browserless](https://browserless.io) 是一个托管的Chromium服务，通过HTTPS暴露
CDP端点。您可以将Moltbot浏览器配置文件指向Browserless
区域端点并使用您的API密钥进行认证。

示例:
```json5
{
  browser: {
    enabled: true,
    defaultProfile: "browserless",
    remoteCdpTimeoutMs: 2000,
    remoteCdpHandshakeTimeoutMs: 4000,
    profiles: {
      browserless: {
        cdpUrl: "https://production-sfo.browserless.io?token=<BROWSERLESS_API_KEY>",
        color: "#00AA00"
      }
    }
  }
}
```

注意事项:
- 将 `<BROWSERLESS_API_KEY>` 替换为您真正的Browserless令牌。
- 选择与您的Browserless账户匹配的区域端点（参见他们的文档）。

## 安全性

关键思路:
- 浏览器控制仅限环回；访问通过网关的认证或节点配对流动。
- 将网关和任何节点主机保持在私有网络（Tailscale）上；避免公开暴露。
- 将远程CDP URL/令牌视为机密；优先使用环境变量或密钥管理器。

远程CDP提示:
- 尽可能优先使用HTTPS端点和短期令牌。
- 避免直接在配置文件中嵌入长期令牌。

## 配置文件（多浏览器）

Moltbot支持多个命名配置文件（路由配置）。配置文件可以是:
- **clawd管理**: 专用的基于Chromium的浏览器实例，具有自己的用户数据目录+CDP端口
- **远程**: 明确的CDP URL（在其他地方运行的基于Chromium的浏览器）
- **扩展中继**: 通过本地中继+Chrome扩展使用您现有的Chrome标签页

默认值:
- 如果缺少，自动创建 `clawd` 配置文件。
- `chrome` 配置文件内置用于Chrome扩展中继（默认指向 `http://127.0.0.1:18792`）。
- 本地CDP端口默认从 **18800–18899** 分配。
- 删除配置文件会将其本地数据目录移动到废纸篓。

所有控制端点接受 `?profile=<name>`；CLI使用 `--browser-profile`。

## Chrome扩展中继（使用您现有的Chrome）

Moltbot还可以通过本地CDP中继+Chrome扩展驱动**您现有的Chrome标签页**（没有单独的"clawd" Chrome实例）。

完整指南：[Chrome扩展](/tools/chrome-extension)

流程:
- 网关在本地（同一台机器）运行，或节点主机在浏览器机器上运行。
- 本地**中继服务器**在环回 `cdpUrl` 上监听（默认：`http://127.0.0.1:18792`）。
- 您在标签页上点击**Moltbot浏览器中继**扩展图标以附加（它不会自动附加）。
- 代理通过正常的 `browser` 工具控制该标签页，通过选择正确的配置文件。

如果网关在其他地方运行，在浏览器机器上运行节点主机，以便网关可以代理浏览器操作。

### 沙盒会话

如果代理会话是沙盒化的，`browser` 工具可能默认为 `target="sandbox"`（沙盒浏览器）。
Chrome扩展中继接管需要主机浏览器控制，因此要么：
- 以非沙盒模式运行会话，或
- 设置 `agents.defaults.sandbox.browser.allowHostControl: true` 并在调用工具时使用 `target="host"`。

### 设置

1) 加载扩展（开发/未打包）：

```bash
moltbot browser extension install
```

- Chrome → `chrome://extensions` → 启用"开发者模式"
- "加载已解压的扩展程序" → 选择 `moltbot browser extension path` 打印的目录
- 固定扩展，然后在要控制的标签页上点击它（徽章显示 `ON`）。

2) 使用它：
- CLI：`moltbot browser --browser-profile chrome tabs`
- 代理工具：`browser` 与 `profile="chrome"`

可选：如果您想要不同的名称或中继端口，创建您自己的配置文件：

```bash
moltbot browser create-profile \
  --name my-chrome \
  --driver extension \
  --cdp-url http://127.0.0.1:18792 \
  --color "#00AA00"
```

注意事项:
- 此模式依赖于CDP上的Playwright进行大部分操作（截图/快照/操作）。
- 通过再次点击扩展图标分离。

## 隔离保证

- **专用用户数据目录**: 永远不接触您的个人浏览器配置文件。
- **专用端口**: 避免 `9222` 以防止与开发工作流冲突。
- **确定性标签页控制**: 按 `targetId` 目标标签页，而不是"最后标签页"。## 浏览器选择

本地启动时，Moltbot选择第一个可用的：
1. Chrome
2. Brave
3. Edge
4. Chromium
5. Chrome Canary

您可以使用 `browser.executablePath` 覆盖。

平台:
- macOS: 检查 `/Applications` 和 `~/Applications`。
- Linux: 查找 `google-chrome`、`brave`、`microsoft-edge`、`chromium` 等。
- Windows: 检查常见安装位置。

## 控制API（可选）

仅用于本地集成，网关暴露一个小的环回HTTP API：

- 状态/启动/停止：`GET /`，`POST /start`，`POST /stop`
- 标签页：`GET /tabs`，`POST /tabs/open`，`POST /tabs/focus`，`DELETE /tabs/:targetId`
- 快照/截图：`GET /snapshot`，`POST /screenshot`
- 操作：`POST /navigate`，`POST /act`
- 钩子：`POST /hooks/file-chooser`，`POST /hooks/dialog`
- 下载：`POST /download`，`POST /wait/download`
- 调试：`GET /console`，`POST /pdf`
- 调试：`GET /errors`，`GET /requests`，`POST /trace/start`，`POST /trace/stop`，`POST /highlight`
- 网络：`POST /response/body`
- 状态：`GET /cookies`，`POST /cookies/set`，`POST /cookies/clear`
- 状态：`GET /storage/:kind`，`POST /storage/:kind/set`，`POST /storage/:kind/clear`
- 设置：`POST /set/offline`，`POST /set/headers`，`POST /set/credentials`，`POST /set/geolocation`，`POST /set/media`，`POST /set/timezone`，`POST /set/locale`，`POST /set/device`

所有端点接受 `?profile=<name>`。

### Playwright要求

某些功能（导航/操作/AI快照/角色快照、元素截图、PDF）需要
Playwright。如果未安装Playwright，这些端点返回明确的501
错误。ARIA快照和基本截图仍可用于clawd管理的Chrome。
对于Chrome扩展中继驱动程序，ARIA快照和截图需要Playwright。

如果您看到 `Playwright is not available in this gateway build`，安装完整
Playwright包（不是 `playwright-core`）并重启网关，或重新安装
支持浏览器的Moltbot。

## 工作原理（内部）

高层流程:
- 一个小**控制服务器**接受HTTP请求。
- 它通过**CDP**连接到基于Chromium的浏览器（Chrome/Brave/Edge/Chromium）。
- 对于高级操作（点击/输入/快照/PDF），它在CDP之上使用**Playwright**。
- 当缺少Playwright时，仅可用非Playwright操作。

此设计使代理保持在稳定、确定的界面上，同时允许
您交换本地/远程浏览器和配置文件。

## CLI快速参考

所有命令接受 `--browser-profile <name>` 以目标特定配置文件。
所有命令还接受 `--json` 以获得机器可读输出（稳定负载）。

基础:
- `moltbot browser status`
- `moltbot browser start`
- `moltbot browser stop`
- `moltbot browser tabs`
- `moltbot browser tab`
- `moltbot browser tab new`
- `moltbot browser tab select 2`
- `moltbot browser tab close 2`
- `moltbot browser open https://example.com`
- `moltbot browser focus abcd1234`
- `moltbot browser close abcd1234`

检查:
- `moltbot browser screenshot`
- `moltbot browser screenshot --full-page`
- `moltbot browser screenshot --ref 12`
- `moltbot browser screenshot --ref e12`
- `moltbot browser snapshot`
- `moltbot browser snapshot --format aria --limit 200`
- `moltbot browser snapshot --interactive --compact --depth 6`
- `moltbot browser snapshot --efficient`
- `moltbot browser snapshot --labels`
- `moltbot browser snapshot --selector "#main" --interactive`
- `moltbot browser snapshot --frame "iframe#main" --interactive`
- `moltbot browser console --level error`
- `moltbot browser errors --clear`
- `moltbot browser requests --filter api --clear`
- `moltbot browser pdf`
- `moltbot browser responsebody "**/api" --max-chars 5000`

操作:
- `moltbot browser navigate https://example.com`
- `moltbot browser resize 1280 720`
- `moltbot browser click 12 --double`
- `moltbot browser click e12 --double`
- `moltbot browser type 12 "hello" --submit`
- `moltbot browser press Enter`
- `moltbot browser hover 44`
- `moltbot browser scrollintoview e12`
- `moltbot browser drag 10 11`
- `moltbot browser select 9 OptionA OptionB`
- `moltbot browser download e12 /tmp/report.pdf`
- `moltbot browser waitfordownload /tmp/report.pdf`
- `moltbot browser upload /tmp/file.pdf`
- `moltbot browser fill --fields '[{"ref":"1","type":"text","value":"Ada"}]'`
- `moltbot browser dialog --accept`
- `moltbot browser wait --text "Done"`
- `moltbot browser wait "#main" --url "**/dash" --load networkidle --fn "window.ready===true"`
- `moltbot browser evaluate --fn '(el) => el.textContent' --ref 7`
- `moltbot browser highlight e12`
- `moltbot browser trace start`
- `moltbot browser trace stop`

状态:
- `moltbot browser cookies`
- `moltbot browser cookies set session abc123 --url "https://example.com"`
- `moltbot browser cookies clear`
- `moltbot browser storage local get`
- `moltbot browser storage local set theme dark`
- `moltbot browser storage session clear`
- `moltbot browser set offline on`
- `moltbot browser set headers --json '{"X-Debug":"1"}'`
- `moltbot browser set credentials user pass`
- `moltbot browser set credentials --clear`
- `moltbot browser set geo 37.7749 -122.4194 --origin "https://example.com"`
- `moltbot browser set geo --clear`
- `moltbot browser set media dark`
- `moltbot browser set timezone America/New_York`
- `moltbot browser set locale en-US`
- `moltbot browser set device "iPhone 14"`

注意事项:
- `upload` 和 `dialog` 是**准备**调用；在触发选择器/对话框的点击/按下之前运行它们。
- `upload` 还可以直接通过 `--input-ref` 或 `--element` 设置文件输入。
- `snapshot`:
  - `--format ai`（安装Playwright时默认）：返回带有数字引用的AI快照（`aria-ref="<n>"`）。
  - `--format aria`：返回无障碍树（无引用；仅检查）。
  - `--efficient`（或 `--mode efficient`）：紧凑角色快照预设（交互式+紧凑+深度+较低的最大字符数）。
  - 配置默认值（仅工具/CLI）：设置 `browser.snapshotDefaults.mode: "efficient"` 以在调用方不传递模式时使用高效快照（参见 [网关配置](/gateway/configuration#browser-clawd-managed-browser)）。
  - 角色快照选项（`--interactive`，`--compact`，`--depth`，`--selector`）强制基于角色的快照，带有如 `ref=e12` 的引用。
  - `--frame "<iframe selector>"` 将角色快照限定到iframe（与如 `e12` 的角色引用配对）。
  - `--interactive` 输出扁平、易于选择的交互元素列表（最适合驱动操作）。
  - `--labels` 添加仅视口截图，带有叠加的引用标签（打印 `MEDIA:<path>`）。
- `click`/`type`/等需要来自 `snapshot` 的 `ref`（数字 `12` 或角色引用 `e12`）。
  CSS选择器故意不支持操作。

## 快照和引用

Moltbot支持两种"快照"样式：

- **AI快照（数字引用）**：`moltbot browser snapshot`（默认；`--format ai`）
  - 输出：包含数字引用的文本快照。
  - 操作：`moltbot browser click 12`，`moltbot browser type 23 "hello"`。
  - 内部，引用通过Playwright的 `aria-ref` 解析。

- **角色快照（角色引用如 `e12`）**：`moltbot browser snapshot --interactive`（或 `--compact`，`--depth`，`--selector`，`--frame`）
  - 输出：基于角色的列表/树，带有 `[ref=e12]`（和可选的 `[nth=1]`）。
  - 操作：`moltbot browser click e12`，`moltbot browser highlight e12`。
  - 内部，引用通过 `getByRole(...)` 解析（加上 `nth()` 用于重复项）。
  - 添加 `--labels` 以包含带有叠加 `e12` 标签的视口截图。

引用行为:
- 引用在导航之间**不稳定**；如果某事失败，重新运行 `snapshot` 并使用新引用。
- 如果角色快照使用 `--frame` 拍摄，角色引用限定到该iframe，直到下次角色快照。## 等待增强功能

您可以等待不仅仅是时间和文本：

- 等待URL（Playwright支持通配符）：
  - `moltbot browser wait --url "**/dash"`
- 等待加载状态：
  - `moltbot browser wait --load networkidle`
- 等待JS谓词：
  - `moltbot browser wait --fn "window.ready===true"`
- 等待选择器变为可见：
  - `moltbot browser wait "#main"`

这些可以组合：

```bash
moltbot browser wait "#main" \
  --url "**/dash" \
  --load networkidle \
  --fn "window.ready===true" \
  --timeout-ms 15000
```

## 调试工作流

当操作失败时（例如"不可见"、"严格模式违规"、"被覆盖"）：

1. `moltbot browser snapshot --interactive`
2. 使用 `click <ref>` / `type <ref>`（在交互模式中优先使用角色引用）
3. 如果仍然失败：`moltbot browser highlight <ref>` 以查看Playwright的目标
4. 如果页面行为异常：
   - `moltbot browser errors --clear`
   - `moltbot browser requests --filter api --clear`
5. 用于深度调试：记录轨迹：
   - `moltbot browser trace start`
   - 重现问题
   - `moltbot browser trace stop`（打印 `TRACE:<path>`）

## JSON输出

`--json` 用于脚本和结构化工具。

示例：

```bash
moltbot browser status --json
moltbot browser snapshot --interactive --json
moltbot browser requests --filter api --json
moltbot browser cookies --json
```

角色快照在JSON中包含 `refs` 加上一个小的 `stats` 块（行/字符/引用/交互），以便工具可以推理负载大小和密度。

## 状态和环境控制

这些对于"使网站表现得像X"工作流很有用：

- Cookie：`cookies`，`cookies set`，`cookies clear`
- 存储：`storage local|session get|set|clear`
- 离线：`set offline on|off`
- 标头：`set headers --json '{"X-Debug":"1"}'`（或 `--clear`）
- HTTP基本认证：`set credentials user pass`（或 `--clear`）
- 地理位置：`set geo <lat> <lon> --origin "https://example.com"`（或 `--clear`）
- 媒体：`set media dark|light|no-preference|none`
- 时区/区域设置：`set timezone ...`，`set locale ...`
- 设备/视口：
  - `set device "iPhone 14"`（Playwright设备预设）
  - `set viewport 1280 720`

## 安全性和隐私

- clawd浏览器配置文件可能包含登录会话；将其视为敏感信息。
- `browser act kind=evaluate` / `moltbot browser evaluate` 和 `wait --fn`
  在页面上下文中执行任意JavaScript。提示注入可以引导
  这一点。如果您不需要它，使用 `browser.evaluateEnabled=false` 禁用它。
- 有关登录和反机器人说明（X/Twitter等），请参见 [浏览器登录 + X/Twitter发布](/tools/browser-login)。
- 保持网关/节点主机私有（仅环回或tailnet）。
- 远程CDP端点很强大；进行隧道和保护。

## 故障排除

有关Linux特定问题（尤其是snap Chromium），请参见
[浏览器故障排除](/tools/browser-linux-troubleshooting)。

## 代理工具+控制工作原理

代理获得用于浏览器自动化的**一个工具**：
- `browser` — 状态/启动/停止/标签页/打开/聚焦/关闭/快照/截图/导航/操作

映射方式：
- `browser snapshot` 返回稳定的UI树（AI或ARIA）。
- `browser act` 使用快照 `ref` ID来点击/输入/拖拽/选择。
- `browser screenshot` 捕获像素（整页或元素）。
- `browser` 接受：
  - `profile` 以选择命名的浏览器配置文件（clawd、chrome或远程CDP）。
  - `target`（`sandbox` | `host` | `node`）以选择浏览器所在的位置。
  - 在沙盒会话中，`target: "host"` 需要 `agents.defaults.sandbox.browser.allowHostControl=true`。
  - 如果省略 `target`：沙盒会话默认为 `sandbox`，非沙盒会话默认为 `host`。
  - 如果连接了支持浏览器的节点，工具可能会自动路由到它，除非您固定 `target="host"` 或 `target="node"`。

这使代理保持确定性并避免脆弱的选择器。