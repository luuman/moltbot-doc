---
summary: "OpenProse：Moltbot 中的 .prose 工作流程、斜杠命令和状态"
read_when:
  - 您想要运行或编写 .prose 工作流程
  - 您想要启用 OpenProse 插件
  - 您需要了解状态存储
---
# OpenProse

OpenProse 是一种便携式的、以 markdown 为主的 AI 会话编排工作流程格式。在 Moltbot 中，它作为一个插件发布，安装 OpenProse 技能包和 `/prose` 斜杠命令。程序存在于 `.prose` 文件中，可以生成多个子代理并具有明确的控制流。

官方网站：https://www.prose.md

## 功能

- 具有明确并行性的多代理研究 + 综合。
- 可重复的审批安全工作流程（代码审查、事件分类、内容管道）。
- 可重用的 `.prose` 程序，您可以在支持的代理运行时中运行。

## 安装 + 启用

捆绑插件默认处于禁用状态。启用 OpenProse：

```bash
moltbot plugins enable open-prose
```

启用插件后重启网关。

开发/本地检出：`moltbot plugins install ./extensions/open-prose`

相关文档：[插件](/plugin)，[插件清单](/plugins/manifest)，[技能](/tools/skills)。

## 斜杠命令

OpenProse 将 `/prose` 注册为用户可调用的技能命令。它路由到 OpenProse VM 指令并在底层使用 Moltbot 工具。

常用命令：

```
/prose help
/prose run <file.prose>
/prose run <handle/slug>
/prose run <https://example.com/file.prose>
/prose compile <file.prose>
/prose examples
/prose update
```

## 示例：简单的 `.prose` 文件

```prose
# 使用两个并行运行的代理进行研究 + 综合。

input topic: "我们应该研究什么？"

agent researcher:
  model: sonnet
  prompt: "你彻底研究并引用来源。"

agent writer:
  model: opus
  prompt: "你写一个简洁的总结。"

parallel:
  findings = session: researcher
    prompt: "研究 {topic}。"
  draft = session: writer
    prompt: "总结 {topic}。"

session "将发现 + 草案合并为最终答案。"
context: { findings, draft }
```

## 文件位置

OpenProse 在您的工作区中的 `.prose/` 下保存状态：

```
.prose/
├── .env
├── runs/
│   └── {YYYYMMDD}-{HHMMSS}-{random}/
│       ├── program.prose
│       ├── state.md
│       ├── bindings/
│       └── agents/
└── agents/
```

用户级持久代理位于：

```
~/.prose/agents/
```

## 状态模式

OpenProse 支持多种状态后端：

- **文件系统**（默认）：`.prose/runs/...`
- **上下文内**：临时的，用于小程序
- **sqlite**（实验性）：需要 `sqlite3` 二进制文件
- **postgres**（实验性）：需要 `psql` 和连接字符串

注意事项：
- sqlite/postgres 是可选的且处于实验阶段。
- postgres 凭据流入子代理日志；使用专用的最低权限数据库。

## 远程程序

`/prose run <handle/slug>` 解析为 `https://p.prose.md/<handle>/<slug>`。
直接 URL 被直接获取。这使用 `web_fetch` 工具（或用于 POST 的 `exec`）。

## Moltbot 运行时映射

OpenProse 程序映射到 Moltbot 原语：

| OpenProse 概念 | Moltbot 工具 |
| --- | --- |
| 生成会话 / 任务工具 | `sessions_spawn` |
| 文件读/写 | `read` / `write` |
| 网络获取 | `web_fetch` |

如果您的工具白名单阻止了这些工具，OpenProse 程序将失败。请参见 [技能配置](/tools/skills-config)。

## 安全 + 审批

将 `.prose` 文件视为代码。运行前审查。使用 Moltbot 工具白名单和审批门控来控制副作用。

对于确定性的、审批门控的工作流程，请与 [Lobster](/tools/lobster) 进行比较。