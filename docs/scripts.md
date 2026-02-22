---
summary: "仓库脚本：用途、范围和安全说明"
read_when:
  - 运行来自仓库的脚本
  - 添加或更改 ./scripts 下的脚本
---
# 脚本

`scripts/` 目录包含用于本地工作流程和运维任务的辅助脚本。
当任务明显与脚本相关时使用这些脚本；否则优先使用 CLI。

## 约定

- 脚本是 **可选的**，除非在文档或发布检查清单中引用。
- 当存在 CLI 界面时优先使用（例如：认证监控使用 `moltbot models status --check`）。
- 假设脚本是主机特定的；在新机器上运行前先阅读它们。

## Git 钩子

- `scripts/setup-git-hooks.js`：在 git 仓库内时对 `core.hooksPath` 的尽力设置。
- `scripts/format-staged.js`：暂存的 `src/` 和 `test/` 文件的提交前格式化程序。

## 认证监控脚本

认证监控脚本在此处记录：
[/automation/auth-monitoring](/automation/auth-monitoring)

## 添加脚本时

- 保持脚本专注并有文档。
- 在相关文档中添加简短条目（如果缺失则创建一个）。