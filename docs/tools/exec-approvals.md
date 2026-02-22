---
summary: "执行审批、白名单和沙箱逃逸提示"
read_when:
  - 配置执行审批或白名单
  - 在 macOS 应用中实现执行审批用户体验
  - 审查沙箱逃逸提示和影响
---

# 执行审批

执行审批是**配套应用/节点主机**的安全保障，允许沙箱代理在真实主机上运行
命令（`gateway` 或 `node`）。可以将其想象为安全联锁：
仅当策略 + 白名单 +（可选的）用户审批都同意时才允许命令。
执行审批**除了**工具策略和提升权限网关之外（除非提升权限设置为 `full`，这会跳过审批）。
有效策略是 `tools.exec.*` 和审批默认值中**更严格**的那个；如果省略审批字段，则使用 `tools.exec` 值。

如果配套应用 UI **不可用**，任何需要提示的请求都将通过
**询问回退**（默认：拒绝）解决。

## 应用位置

执行审批在执行主机上本地强制执行：
- **网关主机** → 网关机器上的 `moltbot` 进程
- **节点主机** → 节点运行器（macOS 配套应用或无头节点主机）

macOS 分割：
- **节点主机服务** 通过本地 IPC 将 `system.run` 转发到 **macOS 应用**。
- **macOS 应用** 强制审批 + 在 UI 上下文中执行命令。

## 设置和存储

审批存储在执行主机上的本地 JSON 文件中：

`~/.clawdbot/exec-approvals.json`

示例架构：
```json
{
  "version": 1,
  "socket": {
    "path": "~/.clawdbot/exec-approvals.sock",
    "token": "base64url-token"
  },
  "defaults": {
    "security": "deny",
    "ask": "on-miss",
    "askFallback": "deny",
    "autoAllowSkills": false
  },
  "agents": {
    "main": {
      "security": "allowlist",
      "ask": "on-miss",
      "askFallback": "deny",
      "autoAllowSkills": true,
      "allowlist": [
        {
          "id": "B0C8C0B3-2C2D-4F8A-9A3C-5A4B3C2D1E0F",
          "pattern": "~/Projects/**/bin/bird",
          "lastUsedAt": 1737150000000,
          "lastUsedCommand": "rg -n TODO",
          "lastResolvedPath": "/Users/user/Projects/.../bin/rg"
        }
      ]
    }
  }
}
```

## 策略旋钮

### 安全性 (`exec.security`)
- **deny**: 阻止所有主机执行请求。
- **allowlist**: 仅允许列入白名单的命令。
- **full**: 允许所有内容（等同于提升权限）。

### 询问 (`exec.ask`)
- **off**: 从不提示。
- **on-miss**: 仅当白名单不匹配时提示。
- **always**: 每个命令都提示。

### 询问回退 (`askFallback`)
如果需要提示但无法到达 UI，则回退决定：
- **deny**: 阻止。
- **allowlist**: 仅当白名单匹配时允许。
- **full**: 允许。

## 白名单（每个代理）

白名单是**每个代理**的。如果有多个代理，在 macOS 应用中切换您正在
编辑的代理。模式是**不区分大小写的 glob 匹配**。
模式应解析为**二进制路径**（仅 basename 条目被忽略）。
遗留的 `agents.default` 条目在加载时迁移到 `agents.main`。

示例：
- `~/Projects/**/bin/bird`
- `~/.local/bin/*`
- `/opt/homebrew/bin/rg`

每个白名单条目跟踪：
- **id** 用于 UI 身份的稳定 UUID（可选）
- **最后使用** 时间戳
- **最后使用命令**
- **最后解析路径**

## 自动允许技能 CLI

当**自动允许技能 CLI** 启用时，已知技能引用的可执行文件
在节点上被视为已列入白名单（macOS 节点或无头节点主机）。这使用
`skills.bins` 通过网关 RPC 获取技能二进制文件列表。如果您想要严格的手动白名单，请禁用此功能。

## 安全二进制文件（仅 stdin）

`tools.exec.safeBins` 定义了一个小列表的**仅 stdin** 二进制文件（例如 `jq`）
可以在白名单模式下**无需**显式白名单条目运行。安全二进制文件拒绝
位置文件参数和类路径标记，因此只能对传入流进行操作。
在白名单模式下，shell 链接和重定向不会自动允许。

当每个顶级段满足白名单时（包括安全二进制文件或技能自动允许），shell 链接（`&&`、`||`、`;`）是允许的。
在白名单模式下，重定向仍然不受支持。

默认安全二进制文件：`jq`、`grep`、`cut`、`sort`、`uniq`、`head`、`tail`、`tr`、`wc`。

## 控制 UI 编辑

使用**控制 UI → 节点 → 执行审批**卡片编辑默认值、每个代理
覆盖和白名单。选择范围（默认值或代理），调整策略，
添加/删除白名单模式，然后**保存**。UI 显示每个模式的**最后使用**元数据
以便您可以保持列表整洁。

目标选择器选择**网关**（本地审批）或**节点**。节点
必须广播 `system.execApprovals.get/set`（macOS 应用或无头节点主机）。
如果节点尚未广播执行审批，请直接编辑其本地
`~/.clawdbot/exec-approvals.json`。

CLI: `moltbot approvals` 支持网关或节点编辑（参见 [审批 CLI](/cli/approvals)）。

## 审批流程

当需要提示时，网关向操作员客户端广播 `exec.approval.requested`。
控制 UI 和 macOS 应用通过 `exec.approval.resolve` 解决，然后网关将
批准的请求转发到节点主机。

当需要审批时，执行工具立即返回审批 ID。使用该 ID
关联后续系统事件（`Exec finished` / `Exec denied`）。如果在
超时前没有到达决策，则请求被视为审批超时并显示为拒绝原因。

确认对话框包括：
- 命令 + 参数
- 当前工作目录
- 代理 ID
- 解析的可执行文件路径
- 主机 + 策略元数据

操作：
- **允许一次** → 现在运行
- **始终允许** → 添加到白名单 + 运行
- **拒绝** → 阻止

## 审批转发到聊天频道

您可以将执行审批提示转发到任何聊天频道（包括插件频道）并批准
它们与 `/approve`。这使用正常的出站交付管道。

配置：
```json5
{
  approvals: {
    exec: {
      enabled: true,
      mode: "session", // "session" | "targets" | "both"
      agentFilter: ["main"],
      sessionFilter: ["discord"], // 子字符串或正则表达式
      targets: [
        { channel: "slack", to: "U12345678" },
        { channel: "telegram", to: "123456789" }
      ]
    }
  }
}
```

在聊天中回复：
```
/approve <id> allow-once
/approve <id> allow-always
/approve <id> deny
```

### macOS IPC 流程
```
网关 -> 节点服务 (WS)
                 |  IPC (UDS + 令牌 + HMAC + TTL)
                 v
             Mac 应用 (UI + 审批 + system.run)
```

安全注意事项：
- Unix 套接字模式 `0600`，令牌存储在 `exec-approvals.json` 中。
- 相同 UID 对等检查。
- 挑战/响应（随机数 + HMAC 令牌 + 请求哈希）+ 短 TTL。

## 系统事件

执行生命周期显示为系统消息：
- `Exec running`（仅当命令超过运行通知阈值时）
- `Exec finished`
- `Exec denied`

这些在节点报告事件后发布到代理的会话。网关主机执行审批在命令完成时（以及可选地在运行时间超过阈值时）发出相同的生命周期事件。
审批控制的执行在这些消息中重用审批 ID 作为 `runId` 以便轻松关联。

## 影响

- **full** 是强大的；尽可能优先使用白名单。
- **ask** 让您参与其中，同时仍允许快速审批。
- 每个代理的白名单防止一个代理的审批泄露到其他代理。
- 审批仅适用于来自**授权发送者**的主机执行请求。未经授权的发送者无法发出 `/exec`。
- `/exec security=full` 是授权操作员的会话级便利，设计上跳过审批。
  要硬阻塞主机执行，请将审批安全性设置为 `deny` 或通过工具策略拒绝 `exec` 工具。

相关：
- [执行工具](/tools/exec)
- [提升模式](/tools/elevated)
- [技能](/tools/skills)