# 创建自定义技能 🛠

Moltbot 设计为易于扩展。"技能"是为您的助手添加新功能的主要方式。

## 什么是技能？
技能是一个包含 `SKILL.md` 文件的目录（该文件向 LLM 提供指令和工具定义）以及一些可选的脚本或资源。

## 逐步指南：您的第一个技能

### 1. 创建目录
技能存在于您的工作区中，通常是 `~/clawd/skills/`。为您的技能创建一个新文件夹：
```bash
mkdir -p ~/clawd/skills/hello-world
```

### 2. 定义 `SKILL.md`
在该目录中创建一个 `SKILL.md` 文件。此文件使用 YAML frontmatter 作为元数据，使用 Markdown 作为指令。

```markdown
---
name: hello_world
description: 一个说 hello 的简单技能。
---

# Hello World 技能
当用户要求问候时，使用 `echo` 工具说 "Hello from your custom skill!"。
```

### 3. 添加工具（可选）
您可以在 frontmatter 中定义自定义工具，或指示代理使用现有系统工具（如 `bash` 或 `browser`）。

### 4. 刷新 Moltbot
要求您的代理"刷新技能"或重启网关。Moltbot 将发现新目录并索引 `SKILL.md`。

## 最佳实践
- **简洁明了**：向模型指示要做什么，而不是如何成为 AI。
- **安全第一**：如果您的技能使用 `bash`，请确保提示不允许来自不可信用户输入的任意命令注入。
- **本地测试**：使用 `moltbot agent --message "use my new skill"` 进行测试。

## 共享技能
您还可以浏览并向 [ClawdHub](https://clawdhub.com) 贡献技能。
