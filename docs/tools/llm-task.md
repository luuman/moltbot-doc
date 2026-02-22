---
summary: "工作流的纯 JSON LLM 任务（可选插件工具）"
read_when:
  - 您想要在工作流中添加纯 JSON LLM 步骤
  - 您需要模式验证的 LLM 输出用于自动化
---

# LLM 任务

`llm-task` 是一个**可选插件工具**，运行纯 JSON LLM 任务并
返回结构化输出（可选地根据 JSON 模式验证）。

这对于像 Lobster 这样的工作流引擎来说是理想的：您可以添加单个 LLM 步骤
而无需为每个工作流编写自定义 Moltbot 代码。

## 启用插件

1) 启用插件：

```json
{
  "plugins": {
    "entries": {
      "llm-task": { "enabled": true }
    }
  }
}
```

2) 白名单该工具（它以 `optional: true` 注册）：

```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "tools": { "allow": ["llm-task"] }
      }
    ]
  }
}
```

## 配置（可选）

```json
{
  "plugins": {
    "entries": {
      "llm-task": {
        "enabled": true,
        "config": {
          "defaultProvider": "openai-codex",
          "defaultModel": "gpt-5.2",
          "defaultAuthProfileId": "main",
          "allowedModels": ["openai-codex/gpt-5.2"],
          "maxTokens": 800,
          "timeoutMs": 30000
        }
      }
    }
  }
}
```

`allowedModels` 是 `provider/model` 字符串的白名单。如果设置，任何
列表外的请求将被拒绝。

## 工具参数

- `prompt`（字符串，必需）
- `input`（任意，可选）
- `schema`（对象，可选 JSON 模式）
- `provider`（字符串，可选）
- `model`（字符串，可选）
- `authProfileId`（字符串，可选）
- `temperature`（数字，可选）
- `maxTokens`（数字，可选）
- `timeoutMs`（数字，可选）

## 输出

返回包含解析 JSON 的 `details.json`（并在提供时根据
`schema` 进行验证）。

## 示例：Lobster 工作流步骤

```lobster
clawd.invoke --tool llm-task --action json --args-json '{
  "prompt": "给定输入邮件，返回意图和草稿。",
  "input": {
    "subject": "Hello",
    "body": "Can you help?"
  },
  "schema": {
    "type": "object",
    "properties": {
      "intent": { "type": "string" },
      "draft": { "type": "string" }
    },
    "required": ["intent", "draft"],
    "additionalProperties": false
  }
}'
```

## 安全注意事项

- 该工具是**纯 JSON** 并指示模型仅输出 JSON（无
  代码块，无评论）。
- 此次运行中没有工具暴露给模型。
- 除非用 `schema` 验证，否则将输出视为不可信。
- 在任何有副作用的步骤（发送、发布、执行）之前放置审批。
