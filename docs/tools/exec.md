---
summary: "Exec 工具使用、stdin 模式和 TTY 支持"
read_when:
  - 使用或修改 exec 工具
  - 调试 stdin 或 TTY 行为
---

# Exec 工具

在工作区中运行 shell 命令。通过 `process` 支持前台 + 后台执行。
如果 `process` 不被允许，`exec` 同步运行并忽略 `yieldMs`/`background`。
后台会话按代理范围划分；`process` 只能看到来自同一代理的会话。

## 参数

- `command` (必需)
- `workdir` (默认为当前工作目录)
- `env` (键/值覆盖)
- `yieldMs` (默认 10000): 延迟后自动后台化
- `background` (布尔值): 立即后台化
- `timeout` (秒，默认 1800): 到期时终止
- `pty` (布尔值): 在可用时在伪终端中运行 (仅 TTY CLIs、编码代理、终端 UI)
- `host` (`sandbox | gateway | node`): 执行位置
- `security` (`deny | allowlist | full`): `gateway`/`node` 的强制模式
- `ask` (`off | on-miss | always`): `gateway`/`node` 的审批提示
- `node` (字符串): `host=node` 的节点 ID/名称
- `elevated` (布尔值): 请求提升模式 (网关主机); 仅当提升解析为 `full` 时才强制 `security=full`

注意事项:
- `host` 默认为 `sandbox`。
- 当沙盒化关闭时，`elevated` 被忽略 (exec 已在主机上运行)。
- `gateway`/`node` 审批由 `~/.clawdbot/exec-approvals.json` 控制。
- `node` 需要配对节点 (伴侣应用或无头节点主机)。
- 如果有多个节点可用，设置 `exec.node` 或 `tools.exec.node` 来选择一个。
- 在非 Windows 主机上，exec 使用 `SHELL` (如果设置); 如果 `SHELL` 是 `fish`，它优先使用 `PATH` 中的 `bash` (或 `sh`)
  以避免与 fish 不兼容的脚本，如果两者都不存在则回退到 `SHELL`。
- 重要: 沙盒化默认是**关闭的**。如果沙盒化关闭，`host=sandbox` 直接在
  网关主机上运行 (无容器) 并且**不需要审批**。要需要审批，请使用
  `host=gateway` 并配置 exec 审批 (或启用沙盒化)。

## 配置

- `tools.exec.notifyOnExit` (默认: true): 为真时，后台 exec 会话在退出时加入系统事件队列并请求心跳。
- `tools.exec.approvalRunningNoticeMs` (默认: 10000): 当需要审批的 exec 运行时间超过此值时发出单个"运行中"通知 (0 禁用)。
- `tools.exec.host` (默认: `sandbox`)
- `tools.exec.security` (默认: 沙盒为 `deny`，网关 + 节点未设置时为 `allowlist`)
- `tools.exec.ask` (默认: `on-miss`)
- `tools.exec.node` (默认: 未设置)
- `tools.exec.pathPrepend`: 为 exec 运行预添加到 `PATH` 的目录列表。
- `tools.exec.safeBins`: 可在没有显式白名单条目的情况下运行的仅 stdin 安全二进制文件。

示例:
```json5
{
  tools: {
    exec: {
      pathPrepend: ["~/bin", "/opt/oss/bin"]
    }
  }
}
```

### PATH 处理

- `host=gateway`: 将您的登录 shell `PATH` 合并到 exec 环境中 (除非 exec 调用
  已经设置了 `env.PATH`)。守护进程本身仍使用最小 `PATH` 运行:
  - macOS: `/opt/homebrew/bin`, `/usr/local/bin`, `/usr/bin`, `/bin`
  - Linux: `/usr/local/bin`, `/usr/bin`, `/bin`
- `host=sandbox`: 在容器内运行 `sh -lc` (登录 shell)，所以 `/etc/profile` 可能重置 `PATH`。
  Moltbot 在配置文件源后通过内部环境变量预添加 `env.PATH` (无 shell 插值);
  `tools.exec.pathPrepend` 在这里也适用。
- `host=node`: 只有您传递的环境覆盖被发送到节点。`tools.exec.pathPrepend` 仅在
  exec 调用已设置 `env.PATH` 时适用。无头节点主机仅在接受 `PATH` 时预添加
  节点主机 PATH (无替换)。macOS 节点完全丢弃 `PATH` 覆盖。

每代理节点绑定 (在配置中使用代理列表索引):

```bash
moltbot config get agents.list
moltbot config set agents.list[0].tools.exec.node "node-id-or-name"
```

控制界面: 节点标签页包含一个小的"Exec 节点绑定"面板用于相同设置。

## 会话覆盖 (`/exec`)

使用 `/exec` 为 `host`、`security`、`ask` 和 `node` 设置**每会话**默认值。
发送不带参数的 `/exec` 以显示当前值。

示例:
```
/exec host=gateway security=allowlist ask=on-miss node=mac-1
```

## 授权模型

`/exec` 仅适用于**授权发送者** (渠道白名单/配对加上 `commands.useAccessGroups`)。
它仅更新**会话状态**，不写入配置。要硬禁用 exec，请通过工具
策略拒绝它 (`tools.deny: ["exec"]` 或按代理)。主机审批仍然适用，除非您显式设置
`security=full` 并且 `ask=off`。

## Exec 审批 (伴侣应用 / 节点主机)

沙盒代理可以在 exec 在网关或节点主机上运行前要求每请求审批。
参见 [Exec 审批](/tools/exec-approvals) 了解策略、白名单和 UI 流程。

当需要审批时，exec 工具立即返回
`status: "approval-pending"` 和一个审批 ID。一旦批准 (或拒绝 / 超时)，
网关发出系统事件 (`Exec finished` / `Exec denied`)。如果命令在
`tools.exec.approvalRunningNoticeMs` 后仍在运行，会发出单个 `Exec running` 通知。

## 白名单 + 安全二进制文件

白名单强制仅匹配**解析的二进制路径** (无基本名称匹配)。当
`security=allowlist` 时，shell 命令仅在每个管道段都是
白名单或安全二进制文件时自动允许。链式 (`;`, `&&`, `||`) 和重定向在
白名单模式下被拒绝。

## 示例

前台:
```json
{"tool":"exec","command":"ls -la"}
```

后台 + 轮询:
```json
{"tool":"exec","command":"npm run build","yieldMs":1000}
{"tool":"process","action":"poll","sessionId":"<id>"}
```

发送按键 (tmux 风格):
```json
{"tool":"process","action":"send-keys","sessionId":"<id>","keys":["Enter"]}
{"tool":"process","action":"send-keys","sessionId":"<id>","keys":["C-c"]}
{"tool":"process","action":"send-keys","sessionId":"<id>","keys":["Up","Up","Enter"]}
```

提交 (仅发送回车):
```json
{"tool":"process","action":"submit","sessionId":"<id>"}
```

粘贴 (默认带括号):
```json
{"tool":"process","action":"paste","sessionId":"<id>","text":"line1\nline2\n"}
```

## apply_patch (实验性)

`apply_patch` 是用于结构化多文件编辑的 `exec` 子工具。
显式启用它:

```json5
{
  tools: {
    exec: {
      applyPatch: { enabled: true, allowModels: ["gpt-5.2"] }
    }
  }
}
```

注意事项:
- 仅适用于 OpenAI/OpenAI Codex 模型。
- 工具策略仍然适用；`allow: ["exec"]` 隐式允许 `apply_patch`。
- 配置位于 `tools.exec.applyPatch` 下。
