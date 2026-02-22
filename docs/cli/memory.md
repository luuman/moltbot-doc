---
summary: "`moltbot memory` 的 CLI 参考（状态/索引/搜索）"
read_when:
  - 您想索引或搜索语义记忆
  - 您正在调试记忆可用性或索引
---

# `moltbot memory`

管理语义记忆索引和搜索。
由活动的记忆插件提供（默认：`memory-core`；设置 `plugins.slots.memory = "none"` 以禁用）。

相关：
- 记忆概念：[记忆](/concepts/memory)
 - 插件：[插件](/plugins)

## 示例

```bash
moltbot memory status
moltbot memory status --deep
moltbot memory status --deep --index
moltbot memory status --deep --index --verbose
moltbot memory index
moltbot memory index --verbose
moltbot memory search "发布清单"
moltbot memory status --agent main
moltbot memory index --agent main --verbose
```

## 选项

通用：

- `--agent <id>`: 限定为单个智能体（默认：所有配置的智能体）。
- `--verbose`: 在探测和索引期间输出详细日志。

注意事项：
- `memory status --deep` 探测向量 + 嵌入可用性。
- `memory status --deep --index` 在存储库脏时运行重新索引。
- `memory index --verbose` 打印每阶段详细信息（提供程序、模型、来源、批处理活动）。
