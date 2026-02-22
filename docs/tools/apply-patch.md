---
summary: "使用 apply_patch 工具应用多文件补丁"
read_when:
  - 需要在多个文件之间进行结构化文件编辑
  - 想要记录或调试基于补丁的编辑
---

# apply_patch 工具

使用结构化补丁格式应用文件更改。这对于多文件或多区块编辑非常理想，
其中单个 `edit` 调用可能会很脆弱。

该工具接受一个包装一个或多个文件操作的单个 `input` 字符串:

```
*** 开始补丁
*** 添加文件: path/to/file.txt
+line 1
+line 2
*** 更新文件: src/app.ts
@@
-old line
+new line
*** 删除文件: obsolete.txt
*** 结束补丁
```

## 参数

- `input` (必需): 完整补丁内容，包括 `*** 开始补丁` 和 `*** 结束补丁`。

## 注意事项

- 路径相对于工作区根目录解析。
- 在 `*** 更新文件:` 区块中使用 `*** 移动到:` 来重命名文件。
- `*** 文件结束` 在需要时标记仅 EOF 插入。
- 实验性功能，默认禁用。使用 `tools.exec.applyPatch.enabled` 启用。
- 仅限 OpenAI (包括 OpenAI Codex)。可通过
  `tools.exec.applyPatch.allowModels` 按模型限制。
- 配置仅在 `tools.exec` 下。

## 示例

```json
{
  "tool": "apply_patch",
  "input": "*** 开始补丁\n*** 更新文件: src/index.ts\n@@\n-const foo = 1\n+const foo = 2\n*** 结束补丁"
}
```