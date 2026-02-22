---
summary: "使用情况跟踪界面和凭证要求"
read_when:
  - 您正在配置提供商使用情况/配额界面时
  - 您需要解释使用情况跟踪行为或身份验证要求时
---
# 使用情况跟踪

## 它是什么
- 直接从提供商的使用情况端点拉取提供商使用情况/配额。
- 无估算成本；只有提供商报告的时间窗口。

## 显示位置
- 聊天中的 `/status`：表情符号丰富的状态卡片，显示会话令牌 + 估算成本（仅限 API 密钥）。提供商使用情况显示 **当前模型提供商** 的信息（如果可用）。
- 聊天中的 `/usage off|tokens|full`：每响应使用情况页脚（OAuth 仅显示令牌）。
- 聊天中的 `/usage cost`：从 Moltbot 会话日志聚合的本地成本摘要。
- CLI：`moltbot status --usage` 打印完整的每提供商细分。
- CLI：`moltbot channels list` 在打印相同使用情况快照的同时显示提供商配置（使用 `--no-usage` 跳过）。
- macOS 菜单栏："使用情况"部分位于上下文下（仅在可用时）。

## 提供商 + 凭证
- **Anthropic (Claude)**：身份验证配置文件中的 OAuth 令牌。
- **GitHub Copilot**：身份验证配置文件中的 OAuth 令牌。
- **Gemini CLI**：身份验证配置文件中的 OAuth 令牌。
- **Antigravity**：身份验证配置文件中的 OAuth 令牌。
- **OpenAI Codex**：身份验证配置文件中的 OAuth 令牌（存在时使用 accountId）。
- **MiniMax**：API 密钥（编码计划密钥；`MINIMAX_CODE_PLAN_KEY` 或 `MINIMAX_API_KEY`）；使用 5 小时编码计划窗口。
- **z.ai**：通过环境变量/配置/身份验证存储的 API 密钥。

如果没有匹配的 OAuth/API 凭证，则隐藏使用情况。