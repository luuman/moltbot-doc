---
summary: "测试套件：单元/端到端/实时套件、Docker 运行器和每个测试覆盖的内容"
read_when:
  - 在本地或 CI 中运行测试
  - 为模型/提供者错误添加回归测试
  - 调试网关 + 代理行为
---

# 测试

Moltbot 有三个 Vitest 套件（单元/集成、端到端、实时）和一小套 Docker 运行器。

本文档是"我们如何测试"的指南：
- 每个套件涵盖的内容（以及故意*不*涵盖的内容）
- 用于常见工作流程的命令（本地、推送前、调试）
- 实时测试如何发现凭据和选择模型/提供者
- 如何为现实世界的模型/提供者问题添加回归测试

## 快速开始

大部分时间：
- 完整门控（推送前预期）：`pnpm lint && pnpm build && pnpm test`

当您接触测试或想要额外信心时：
- 覆盖门控：`pnpm test:coverage`
- 端到端套件：`pnpm test:e2e`

当调试真实提供者/模型时（需要真实凭据）：
- 实时套件（模型 + 网关工具/图像探测）：`pnpm test:live`

提示：当您只需要一个失败案例时，优先通过下面描述的白名单环境变量缩小实时测试范围。

## 测试套件（在哪里运行）

将套件视为"增加的现实性"（以及增加的不稳定/成本）：

### 单元 / 集成（默认）

- 命令：`pnpm test`
- 配置：`vitest.config.ts`
- 文件：`src/**/*.test.ts`
- 范围：
  - 纯单元测试
  - 进程内集成测试（网关认证、路由、工具、解析、配置）
  - 已知错误的确定性回归
- 期望：
  - 在 CI 中运行
  - 不需要真实密钥
  - 应该快速且稳定

### 端到端（网关冒烟）

- 命令：`pnpm test:e2e`
- 配置：`vitest.e2e.config.ts`
- 文件：`src/**/*.e2e.test.ts`
- 范围：
  - 多实例网关端到端行为
  - WebSocket/HTTP 界面、节点配对和更重的网络
- 期望：
  - 在 CI 中运行（当在流水线中启用时）
  - 不需要真实密钥
  - 比单元测试有更多的活动部件（可能较慢）

### 实时（真实提供者 + 真实模型）

- 命令：`pnpm test:live`
- 配置：`vitest.live.config.ts`
- 文件：`src/**/*.live.test.ts`
- 默认：**启用** 通过 `pnpm test:live`（设置 `CLAWDBOT_LIVE_TEST=1`）
- 范围：
  - "这个提供者/模型今天是否真的能用真实凭据工作？"
  - 捕获提供者格式变化、工具调用怪癖、认证问题和速率限制行为
- 期望：
  - 按设计不是 CI 稳定的（真实网络、真实提供者策略、配额、停机）
  - 花费金钱 / 使用速率限制
  - 优先运行缩小的子集而不是"所有"
  - 实时运行将源 `~/.profile` 以获取缺失的 API 密钥
  - Anthropic 密钥轮换：设置 `CLAWDBOT_LIVE_ANTHROPIC_KEYS="sk-...,sk-..."`（或 `CLAWDBOT_LIVE_ANTHROPIC_KEY=sk-...`）或多个 `ANTHROPIC_API_KEY*` 变量；测试将在速率限制时重试

## 我应该运行哪个套件？

使用此决策表：
- 编辑逻辑/测试：运行 `pnpm test`（如果更改很多则运行 `pnpm test:coverage`）
- 接触网关网络 / WS 协议 / 配对：添加 `pnpm test:e2e`
- 调试"我的机器人宕机了" / 提供者特定故障 / 工具调用：运行缩小的 `pnpm test:live`

## 实时：模型冒烟（配置文件密钥）

实时测试分为两层，以便我们可以隔离故障：
- "直接模型"告诉我们提供者/模型是否能使用给定密钥回答。
- "网关冒烟"告诉我们完整网关+代理管道是否适用于该模型（会话、历史、工具、沙盒策略等）。

### 第一层：直接模型完成（无网关）

- 测试：`src/agents/models.profiles.live.test.ts`
- 目标：
  - 枚举发现的模型
  - 使用 `getApiKeyForModel` 选择您有凭据的模型
  - 每个模型运行一个小的完成（以及需要时的目标回归）
- 如何启用：
  - `pnpm test:live`（或 `CLAWDBOT_LIVE_TEST=1` 如果直接调用 Vitest）
- 设置 `CLAWDBOT_LIVE_MODELS=modern`（或 `all`，现代白名单的别名）以实际运行此套件；否则跳过以保持 `pnpm test:live` 专注于网关冒烟
- 如何选择模型：
  - `CLAWDBOT_LIVE_MODELS=modern` 以运行现代白名单（Opus/Sonnet/Haiku 4.5，GPT-5.x + Codex，Gemini 3，GLM 4.7，MiniMax M2.1，Grok 4）
  - `CLAWDBOT_LIVE_MODELS=all` 是现代白名单的别名
  - 或 `CLAWDBOT_LIVE_MODELS="openai/gpt-5.2,anthropic/claude-opus-4-5,..."`（逗号白名单）
- 如何选择提供者：
  - `CLAWDBOT_LIVE_PROVIDERS="google,google-antigravity,google-gemini-cli"`（逗号白名单）
- 密钥来源：
  - 默认：配置文件存储和环境回退
  - 设置 `CLAWDBOT_LIVE_REQUIRE_PROFILE_KEYS=1` 以仅强制 **配置文件存储**
- 存在原因：
  - 分离"提供者 API 损坏 / 密钥无效"与"网关代理管道损坏"
  - 包含小的、孤立的回归（示例：OpenAI Responses/Codex Responses 推理重播 + 工具调用流程）

### 第二层：网关 + 开发代理冒烟（"@moltbot" 实际做的事情）

- 测试：`src/gateway/gateway-models.profiles.live.test.ts`
- 目标：
  - 启动一个进程内网关
  - 创建/修补一个 `agent:dev:*` 会话（每个运行的模型覆盖）
  - 迭代模型+密钥并断言：
    - "有意义"的响应（无工具）
    - 真实工具调用工作（读取探测）
    - 可选的额外工具探测（exec+read 探测）
    - OpenAI 回归路径（仅工具调用 → 后续）继续工作
- 探测详情（以便您可以快速解释故障）：
  - `read` 探测：测试在工作区中写入一个随机文件并要求代理 `read` 它并回显随机数。
  - `exec+read` 探测：测试要求代理 `exec`-write 一个随机数到临时文件，然后 `read` 回来。
  - 图像探测：测试附加一个生成的 PNG（猫 + 随机代码）并期望模型返回 `cat <CODE>`。
  - 实现参考：`src/gateway/gateway-models.profiles.live.test.ts` 和 `src/gateway/live-image-probe.ts`。
- 如何启用：
  - `pnpm test:live`（或 `CLAWDBOT_LIVE_TEST=1` 如果直接调用 Vitest）
- 如何选择模型：
  - 默认：现代白名单（Opus/Sonnet/Haiku 4.5，GPT-5.x + Codex，Gemini 3，GLM 4.7，MiniMax M2.1，Grok 4）
  - `CLAWDBOT_LIVE_GATEWAY_MODELS=all` 是现代白名单的别名
  - 或设置 `CLAWDBOT_LIVE_GATEWAY_MODELS="provider/model"`（或逗号列表）以缩小范围
- 如何选择提供者（避免"OpenRouter 一切"）：
  - `CLAWDBOT_LIVE_GATEWAY_PROVIDERS="google,google-antigravity,google-gemini-cli,openai,anthropic,zai,minimax"`（逗号白名单）
- 工具 + 图像探测在此实时测试中始终开启：
  - `read` 探测 + `exec+read` 探测（工具压力）
  - 当模型宣传图像输入支持时运行图像探测
  - 流程（高层级）：
    - 测试生成一个带有"CATA" + 随机代码的小 PNG（`src/gateway/live-image-probe.ts`）
    - 通过 `agent` `attachments: [{ mimeType: "image/png", content: "<base64>" }]` 发送它
    - 网关将附件解析为 `images[]`（`src/gateway/server-methods/agent.ts` + `src/gateway/chat-attachments.ts`）
    - 嵌入代理将多模态用户消息转发给模型
    - 断言：回复包含 `cat` + 代码（OCR 容差：允许小错误）

提示：要查看您可以在机器上测试什么（以及确切的 `provider/model` id），运行：

```bash
moltbot models list
moltbot models list --json
```

## 实时：Anthropic 设置令牌冒烟

- 测试：`src/agents/anthropic.setup-token.live.test.ts`
- 目标：验证 Claude Code CLI 设置令牌（或粘贴的设置令牌配置文件）能否完成 Anthropic 提示。
- 启用：
  - `pnpm test:live`（或 `CLAWDBOT_LIVE_TEST=1` 如果直接调用 Vitest）
  - `CLAWDBOT_LIVE_SETUP_TOKEN=1`
- 令牌来源（选择一个）：
  - 配置文件：`CLAWDBOT_LIVE_SETUP_TOKEN_PROFILE=anthropic:setup-token-test`
  - 原始令牌：`CLAWDBOT_LIVE_SETUP_TOKEN_VALUE=sk-ant-oat01-...`
- 模型覆盖（可选）：
  - `CLAWDBOT_LIVE_SETUP_TOKEN_MODEL=anthropic/claude-opus-4-5`

设置示例：

```bash
moltbot models auth paste-token --provider anthropic --profile-id anthropic:setup-token-test
CLAWDBOT_LIVE_SETUP_TOKEN=1 CLAWDBOT_LIVE_SETUP_TOKEN_PROFILE=anthropic:setup-token-test pnpm test:live src/agents/anthropic.setup-token.live.test.ts
```

## 实时：CLI 后端冒烟（Claude Code CLI 或其他本地 CLI）

- 测试：`src/gateway/gateway-cli-backend.live.test.ts`
- 目标：使用本地 CLI 后端验证网关 + 代理管道，不接触您的默认配置。
- 启用：
  - `pnpm test:live`（或 `CLAWDBOT_LIVE_TEST=1` 如果直接调用 Vitest）
  - `CLAWDBOT_LIVE_CLI_BACKEND=1`
- 默认值：
  - 模型：`claude-cli/claude-sonnet-4-5`
  - 命令：`claude`
  - 参数：`["-p","--output-format","json","--dangerously-skip-permissions"]`
- 覆盖（可选）：
  - `CLAWDBOT_LIVE_CLI_BACKEND_MODEL="claude-cli/claude-opus-4-5"`
  - `CLAWDBOT_LIVE_CLI_BACKEND_MODEL="codex-cli/gpt-5.2-codex"`
  - `CLAWDBOT_LIVE_CLI_BACKEND_COMMAND="/full/path/to/claude"`
  - `CLAWDBOT_LIVE_CLI_BACKEND_ARGS='["-p","--output-format","json","--permission-mode","bypassPermissions"]'`
  - `CLAWDBOT_LIVE_CLI_BACKEND_CLEAR_ENV='["ANTHROPIC_API_KEY","ANTHROPIC_API_KEY_OLD"]'`
  - `CLAWDBOT_LIVE_CLI_BACKEND_IMAGE_PROBE=1` 以发送真实图像附件（路径注入到提示中）。
  - `CLAWDBOT_LIVE_CLI_BACKEND_IMAGE_ARG="--image"` 以将图像文件路径作为 CLI 参数传递而不是提示注入。
  - `CLAWDBOT_LIVE_CLI_BACKEND_IMAGE_MODE="repeat"`（或 `"list"`）以控制当设置 `IMAGE_ARG` 时如何传递图像参数。
  - `CLAWDBOT_LIVE_CLI_BACKEND_RESUME_PROBE=1` 以发送第二个回合并验证恢复流程。
- `CLAWDBOT_LIVE_CLI_BACKEND_DISABLE_MCP_CONFIG=0` 以保持 Claude Code CLI MCP 配置启用（默认使用临时空文件禁用 MCP 配置）。

示例：

```bash
CLAWDBOT_LIVE_CLI_BACKEND=1 \
  CLAWDBOT_LIVE_CLI_BACKEND_MODEL="claude-cli/claude-sonnet-4-5" \
  pnpm test:live src/gateway/gateway-cli-backend.live.test.ts
```

### 推荐的实时配方

窄的、明确的白名单最快且最不容易出错：

- 单个模型，直接（无网关）：
  - `CLAWDBOT_LIVE_MODELS="openai/gpt-5.2" pnpm test:live src/agents/models.profiles.live.test.ts`

- 单个模型，网关冒烟：
  - `CLAWDBOT_LIVE_GATEWAY_MODELS="openai/gpt-5.2" pnpm test:live src/gateway/gateway-models.profiles.live.test.ts`

- 跨几个提供者的工具调用：
  - `CLAWDBOT_LIVE_GATEWAY_MODELS="openai/gpt-5.2,anthropic/claude-opus-4-5,google/gemini-3-flash-preview,zai/glm-4.7,minimax/minimax-m2.1" pnpm test:live src/gateway/gateway-models.profiles.live.test.ts`

- Google 重点（Gemini API 密钥 + Antigravity）：
  - Gemini（API 密钥）：`CLAWDBOT_LIVE_GATEWAY_MODELS="google/gemini-3-flash-preview" pnpm test:live src/gateway/gateway-models.profiles.live.test.ts`
  - Antigravity（OAuth）：`CLAWDBOT_LIVE_GATEWAY_MODELS="google-antigravity/claude-opus-4-5-thinking,google-antigravity/gemini-3-pro-high" pnpm test:live src/gateway/gateway-models.profiles.live.test.ts`

注意事项：
- `google/...` 使用 Gemini API（API 密钥）。
- `google-antigravity/...` 使用 Antigravity OAuth 桥接（Cloud Code Assist 风格代理端点）。
- `google-gemini-cli/...` 使用您机器上的本地 Gemini CLI（单独的认证 + 工具怪癖）。
- Gemini API 与 Gemini CLI：
  - API：Moltbot 通过 HTTP 调用 Google 的托管 Gemini API（API 密钥 / 配置文件认证）；这是大多数用户所说的"Gemini"。
  - CLI：Moltbot 调用本地 `gemini` 二进制文件；它有自己的认证，行为可能不同（流/工具支持/版本差异）。

## 实时：模型矩阵（我们涵盖的内容）

没有固定的"CI 模型列表"（实时是可选的），但在有密钥的开发机器上，这些是**推荐**定期覆盖的模型。

### 现代冒烟集（工具调用 + 图像）

这是我们期望保持工作的"常见模型"运行：
- OpenAI（非 Codex）：`openai/gpt-5.2`（可选：`openai/gpt-5.1`）
- OpenAI Codex：`openai-codex/gpt-5.2`（可选：`openai-codex/gpt-5.2-codex`）
- Anthropic：`anthropic/claude-opus-4-5`（或 `anthropic/claude-sonnet-4-5`）
- Google（Gemini API）：`google/gemini-3-pro-preview` 和 `google/gemini-3-flash-preview`（避免较老的 Gemini 2.x 模型）
- Google（Antigravity）：`google-antigravity/claude-opus-4-5-thinking` 和 `google-antigravity/gemini-3-pro-high`
- Z.AI（GLM）：`zai/glm-4.7`
- MiniMax：`minimax/minimax-m2.1`

使用工具 + 图像运行网关冒烟：
`CLAWDBOT_LIVE_GATEWAY_MODELS="openai/gpt-5.2,openai-codex/gpt-5.2,anthropic/claude-opus-4-5,google/gemini-3-pro-preview,google/gemini-3-flash-preview,google-antigravity/claude-opus-4-5-thinking,google-antigravity/gemini-3-pro-high,zai/glm-4.7,minimax/minimax-m2.1" pnpm test:live src/gateway/gateway-models.profiles.live.test.ts`

### 基线：工具调用（读取 + 可选执行）

为每个提供者系列至少选择一个：
- OpenAI：`openai/gpt-5.2`（或 `openai/gpt-5-mini`）
- Anthropic：`anthropic/claude-opus-4-5`（或 `anthropic/claude-sonnet-4-5`）
- Google：`google/gemini-3-flash-preview`（或 `google/gemini-3-pro-preview`）
- Z.AI（GLM）：`zai/glm-4.7`
- MiniMax：`minimax/minimax-m2.1`

可选的额外覆盖（很好有）：
- xAI：`xai/grok-4`（或最新可用）
- Mistral：`mistral/`…（选择一个您已启用的"工具"能力模型）
- Cerebras：`cerebras/`…（如果您有访问权限）
- LM Studio：`lmstudio/`…（本地；工具调用取决于 API 模式）

### 视觉：图像发送（附件 → 多模态消息）

在 `CLAWDBOT_LIVE_GATEWAY_MODELS` 中至少包含一个图像能力模型（Claude/Gemini/OpenAI 视觉能力变体等）以练习图像探测。

### 聚合器 / 替代网关

如果您有启用的密钥，我们也支持通过以下方式进行测试：
- OpenRouter：`openrouter/...`（数百个模型；使用 `moltbot models scan` 查找工具+图像能力候选）
- OpenCode Zen：`opencode/...`（通过 `OPENCODE_API_KEY` / `OPENCODE_ZEN_API_KEY` 认证）

更多您可以在实时矩阵中包含的提供者（如果您有凭据/配置）：
- 内置：`openai`，`openai-codex`，`anthropic`，`google`，`google-vertex`，`google-antigravity`，`google-gemini-cli`，`zai`，`openrouter`，`opencode`，`xai`，`groq`，`cerebras`，`mistral`，`github-copilot`
- 通过 `models.providers`（自定义端点）：`minimax`（云/API），以及任何 OpenAI/Anthropic 兼容代理（LM Studio，vLLM，LiteLLM 等）

提示：不要试图在文档中硬编码"所有模型"。权威列表是您机器上 `discoverModels(...)` 返回的内容以及可用的密钥。

## 凭据（永远不要提交）

实时测试发现凭据的方式与 CLI 相同。实际影响：
- 如果 CLI 工作，实时测试应该找到相同的密钥。
- 如果实时测试说"无凭据"，以调试 `moltbot models list` / 模型选择的方式进行调试。

- 配置文件存储：`~/.clawdbot/credentials/`（首选；测试中"配置文件密钥"的含义）
- 配置：`~/.clawdbot/moltbot.json`（或 `CLAWDBOT_CONFIG_PATH`）

如果您想依赖环境密钥（例如在 `~/.profile` 中导出），在 `source ~/.profile` 后运行本地测试，或使用下面的 Docker 运行器（它们可以将 `~/.profile` 挂载到容器中）。

## Deepgram 实时（音频转录）

- 测试：`src/media-understanding/providers/deepgram/audio.live.test.ts`
- 启用：`DEEPGRAM_API_KEY=... DEEPGRAM_LIVE_TEST=1 pnpm test:live src/media-understanding/providers/deepgram/audio.live.test.ts`

## Docker 运行器（可选的"在 Linux 中工作"检查）

这些在仓库 Docker 镜像内运行 `pnpm test:live`，挂载您的本地配置目录和工作区（并在挂载时源 `~/.profile`）：

- 直接模型：`pnpm test:docker:live-models`（脚本：`scripts/test-live-models-docker.sh`）
- 网关 + 开发代理：`pnpm test:docker:live-gateway`（脚本：`scripts/test-live-gateway-models-docker.sh`）
- 入门向导（TTY，完整脚手架）：`pnpm test:docker:onboard`（脚本：`scripts/e2e/onboard-docker.sh`）
- 网关网络（两个容器，WS 认证 + 健康检查）：`pnpm test:docker:gateway-network`（脚本：`scripts/e2e/gateway-network-docker.sh`）
- 插件（自定义扩展加载 + 注册冒烟）：`pnpm test:docker:plugins`（脚本：`scripts/e2e/plugins-docker.sh`）

有用的环境变量：

- `CLAWDBOT_CONFIG_DIR=...`（默认：`~/.clawdbot`）挂载到 `/home/node/.clawdbot`
- `CLAWDBOT_WORKSPACE_DIR=...`（默认：`~/clawd`）挂载到 `/home/node/clawd`
- `CLAWDBOT_PROFILE_FILE=...`（默认：`~/.profile`）挂载到 `/home/node/.profile` 并在运行测试前源
- `CLAWDBOT_LIVE_GATEWAY_MODELS=...` / `CLAWDBOT_LIVE_MODELS=...` 以缩小运行
- `CLAWDBOT_LIVE_REQUIRE_PROFILE_KEYS=1` 以确保凭据来自配置文件存储（而非环境）

## 文档完整性

在文档编辑后运行文档检查：`pnpm docs:list`。

## 离线回归（CI 安全）

这些是没有真实提供者的"真实管道"回归：
- 网关工具调用（模拟 OpenAI，真实网关 + 代理循环）：`src/gateway/gateway.tool-calling.mock-openai.test.ts`
- 网关向导（WS `wizard.start`/`wizard.next`，写入配置 + 认证强制执行）：`src/gateway/gateway.wizard.e2e.test.ts`

## 代理可靠性评估（技能）

我们已经有一些 CI 安全测试表现得像"代理可靠性评估"：
- 通过真实网关 + 代理循环的模拟工具调用（`src/gateway/gateway.tool-calling.mock-openai.test.ts`）。
- 验证会话布线和配置效果的端到端向导流程（`src/gateway/gateway.wizard.e2e.test.ts`）。

技能方面仍缺少的内容（参见 [技能](/tools/skills)）：
- **决策**：当技能在提示中列出时，代理是否选择正确的技能（或避免无关的）？
- **合规**：代理在使用前是否读取 `SKILL.md` 并遵循必需的步骤/参数？
- **工作流程合同**：多回合场景，断言工具顺序、会话历史继承和沙盒边界。

未来的评估应首先保持确定性：
- 使用模拟提供者的场景运行器来断言工具调用 + 顺序、技能文件读取和会话布线。
- 一套技能重点场景（使用与避免、门控、提示注入）。
- 可选的实时评估（可选，环境门控）仅在 CI 安全套件到位后。

## 添加回归（指导）

当您修复在实时中发现的提供者/模型问题时：
- 如果可能，添加 CI 安全回归（模拟/存根提供者，或捕获确切的请求形状转换）
- 如果本质上只能实时（速率限制、认证策略），保持实时测试狭窄并通过环境变量可选
- 优先针对捕捉错误的最小层：
  - 提供者请求转换/重放错误 → 直接模型测试
  - 网关会话/历史/工具管道错误 → 网关实时冒烟或 CI 安全网关模拟测试