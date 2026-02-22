---
summary: "Moltbot 沙盒如何工作：模式、范围、工作区访问和镜像"
title: 沙盒
read_when: "您想要沙盒的专门解释或需要调整 agents.defaults.sandbox。"
status: active
---

# 沙盒

Moltbot 可以在 Docker 容器内运行 **工具** 以减少影响范围。
这是 **可选的** 并由配置控制（`agents.defaults.sandbox` 或
`agents.list[].sandbox`）。如果沙盒关闭，工具在主机上运行。
网关保留在主机上；工具执行在启用时在隔离的沙盒中运行。

这不是完美的安全边界，但它在模型做傻事时实质性地限制了文件系统
和进程访问。

## 什么是沙盒化的
- 工具执行（`exec`、`read`、`write`、`edit`、`apply_patch`、`process` 等）。
- 可选的沙盒浏览器（`agents.defaults.sandbox.browser`）。
  - 默认情况下，当浏览器工具需要时，沙盒浏览器自动启动（确保 CDP 可访问）。
    通过 `agents.defaults.sandbox.browser.autoStart` 和 `agents.defaults.sandbox.browser.autoStartTimeoutMs` 配置。
  - `agents.defaults.sandbox.browser.allowHostControl` 允许沙盒会话明确针对主机浏览器。
  - 可选白名单门控 `target: "custom"`：`allowedControlUrls`、`allowedControlHosts`、`allowedControlPorts`。

非沙盒化：
- 网关进程本身。
- 任何明确允许在主机上运行的工具（例如 `tools.elevated`）。
  - **提升的 exec 在主机上运行并绕过沙盒。**
  - 如果沙盒关闭，`tools.elevated` 不改变执行（已在主机上）。参见 [提升模式](/tools/elevated)。

## 模式
`agents.defaults.sandbox.mode` 控制何时使用沙盒：
- `"off"`：无沙盒。
- `"non-main"`：仅沙盒 **非主** 会话（如果您希望在主机上进行正常聊天，默认）。
- `"all"`：每个会话都在沙盒中运行。
注意：`"non-main"` 基于 `session.mainKey`（默认 `"main"`），而不是代理 ID。
群组/频道会话使用它们自己的密钥，所以它们算作非主会话并将被沙盒化。

## 范围
`agents.defaults.sandbox.scope` 控制创建多少容器：
- `"session"`（默认）：每个会话一个容器。
- `"agent"`：每个代理一个容器。
- `"shared"`：所有沙盒会话共享一个容器。

## 工作区访问
`agents.defaults.sandbox.workspaceAccess` 控制沙盒可以看到什么：
- `"none"`（默认）：工具看到 `~/.clawdbot/sandboxes` 下的沙盒工作区。
- `"ro"`：在 `/agent` 处以只读方式挂载代理工作区（禁用 `write`/`edit`/`apply_patch`）。
- `"rw"`：在 `/workspace` 处以读写方式挂载代理工作区。

入站媒体被复制到活动沙盒工作区（`media/inbound/*`）。
技能注意：`read` 工具以沙盒为根。使用 `workspaceAccess: "none"`，
Moltbot 将符合条件的技能镜像到沙盒工作区（`.../skills`）以便
它们可以被读取。使用 `"rw"`，工作区技能可以从
`/workspace/skills` 读取。

## 自定义绑定挂载
`agents.defaults.sandbox.docker.binds` 将额外的主机目录挂载到容器中。
格式：`host:container:mode`（例如，`"/home/user/source:/source:rw"`）。

全局和按代理的绑定是 **合并的**（不是替换）。在 `scope: "shared"` 下，按代理的绑定被忽略。

示例（只读源 + docker 套接字）：

```json5
{
  agents: {
    defaults: {
      sandbox: {
        docker: {
          binds: [
            "/home/user/source:/source:ro",
            "/var/run/docker.sock:/var/run/docker.sock"
          ]
        }
      }
    },
    list: [
      {
        id: "build",
        sandbox: {
          docker: {
            binds: ["/mnt/cache:/cache:rw"]
          }
        }
      }
    ]
  }
}
```

安全注意事项：
- 绑定绕过沙盒文件系统：它们以您设置的任何模式（`:ro` 或 `:rw`）暴露主机路径。
- 敏感挂载（例如，`docker.sock`、密钥、SSH 密钥）应该是 `:ro`，除非绝对需要。
- 如果您只需要对工作区的只读访问，请与 `workspaceAccess: "ro"` 结合使用；绑定模式保持独立。
- 参见 [沙盒 vs 工具策略 vs 提升](/gateway/sandbox-vs-tool-policy-vs-elevated) 了解绑定如何与工具策略和提升 exec 交互。

## 镜像 + 设置
默认镜像：`moltbot-sandbox:bookworm-slim`

构建一次：
```bash
scripts/sandbox-setup.sh
```

注意：默认镜像不包含 Node。如果技能需要 Node（或
其他运行时），要么定制自定义镜像，要么通过
`sandbox.docker.setupCommand` 安装（需要网络出口 + 可写根目录 +
根用户）。

沙盒浏览器镜像：
```bash
scripts/sandbox-browser-setup.sh
```

默认情况下，沙盒容器在 **无网络** 中运行。
使用 `agents.defaults.sandbox.docker.network` 覆盖。

Docker 安装和容器化网关在这里：
[Docker](/install/docker)

## setupCommand（一次性容器设置）
`setupCommand` 在创建沙盒容器后运行 **一次**（不是每次运行）。
它通过 `sh -lc` 在容器内执行。

路径：
- 全局：`agents.defaults.sandbox.docker.setupCommand`
- 按代理：`agents.list[].sandbox.docker.setupCommand`


常见陷阱：
- 默认 `docker.network` 是 `"none"`（无出口），所以包安装将失败。
- `readOnlyRoot: true` 阻止写入；设置 `readOnlyRoot: false` 或定制自定义镜像。
- `user` 必须是根用户才能安装包（省略 `user` 或设置 `user: "0:0"`）。
- 沙盒 exec 不继承主机 `process.env`。使用
  `agents.defaults.sandbox.docker.env`（或自定义镜像）获取技能 API 密钥。

## 工具策略 + 逃生舱口
工具允许/拒绝策略仍在沙盒规则之前应用。如果工具被全局或按代理拒绝，
沙盒不会将其带回。

`tools.elevated` 是在主机上运行 `exec` 的明确逃生舱口。
`/exec` 指令仅适用于授权发送者并按会话持久化；要硬禁用
`exec`，使用工具策略拒绝（参见 [沙盒 vs 工具策略 vs 提升](/gateway/sandbox-vs-tool-policy-vs-elevated)）。

调试：
- 使用 `moltbot sandbox explain` 检查有效的沙盒模式、工具策略和修复配置键。
- 参见 [沙盒 vs 工具策略 vs 提升](/gateway/sandbox-vs-tool-policy-vs-elevated) 获取"为什么被阻止？"的心理模型。
保持锁定。

## 多代理覆盖
每个代理都可以覆盖沙盒 + 工具：
`agents.list[].sandbox` 和 `agents.list[].tools`（加上 `agents.list[].tools.sandbox.tools` 用于沙盒工具策略）。
参见 [多代理沙盒和工具](/multi-agent-sandbox-tools) 了解优先级。

## 最小启用示例
```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "non-main",
        scope: "session",
        workspaceAccess: "none"
      }
    }
  }
}
```

## 相关文档
- [沙盒配置](/gateway/configuration#agentsdefaults-sandbox)
- [多代理沙盒和工具](/multi-agent-sandbox-tools)
- [安全](/gateway/security)
