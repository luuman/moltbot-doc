---
summary: "Chrome扩展：让Moltbot驱动您现有的Chrome标签页"
read_when:
  - 您希望代理驱动现有的Chrome标签页（工具栏按钮）
  - 您需要通过Tailscale进行远程网关+本地浏览器自动化
  - 您想了解浏览器接管的安全影响
---

# Chrome扩展（浏览器中继）

Moltbot Chrome扩展允许代理控制您的**现有Chrome标签页**（您的普通Chrome窗口），而不是启动一个单独的clawd管理的Chrome配置文件。

附加/分离通过**单个Chrome工具栏按钮**完成。

## 它是什么（概念）

有三个部分：
- **浏览器控制服务**（网关或节点）：代理/工具调用的API（通过网关）
- **本地中继服务器**（环回CDP）：在控制服务器和扩展之间建立桥梁（默认为`http://127.0.0.1:18792`）
- **Chrome MV3扩展**：使用`chrome.debugger`附加到活动标签页并将CDP消息传输到中继

然后Moltbot通过正常的`browser`工具界面控制附加的标签页（选择正确的配置文件）。

## 安装/加载（未打包）

1) 将扩展安装到稳定的本地路径：

```bash
moltbot browser extension install
```

2) 打印已安装的扩展目录路径：

```bash
moltbot browser extension path
```

3) Chrome → `chrome://extensions`
- 启用“开发者模式”
- “加载已解压的扩展程序” → 选择上面打印的目录

4) 固定扩展。

## 更新（无需构建步骤）

扩展作为静态文件随Moltbot发行版（npm包）一起提供。没有单独的“构建”步骤。

升级Moltbot后：
- 重新运行`moltbot browser extension install`以刷新Moltbot状态目录下的已安装文件。
- Chrome → `chrome://extensions` → 点击扩展上的“重新加载”。

## 使用（无需额外配置）

Moltbot内置了一个名为`chrome`的浏览器配置文件，它针对默认端口上的扩展中继。

使用方法：
- CLI：`moltbot browser --browser-profile chrome tabs`
- 代理工具：带`profile="chrome"`的`browser`

如果您想要不同的名称或不同的中继端口，创建您自己的配置文件：

```bash
moltbot browser create-profile \
  --name my-chrome \
  --driver extension \
  --cdp-url http://127.0.0.1:18792 \
  --color "#00AA00"
```

## 附加/分离（工具栏按钮）

- 打开您希望Moltbot控制的标签页。
- 点击扩展图标。
  - 附加时徽章显示`ON`。
- 再次点击以分离。

## 它控制哪个标签页？

- 它**不**自动控制“您正在查看的任何标签页”。
- 它**仅控制您通过点击工具栏按钮显式附加的标签页**。
- 要切换：打开另一个标签页并在那里点击扩展图标。

## 徽章+常见错误

- `ON`：已附加；Moltbot可以驱动该标签页。
- `…`：正在连接到本地中继。
- `!`：中继不可达（最常见：浏览器中继服务器在此机器上未运行）。

如果看到`!`：
- 确保网关在本地运行（默认设置），或者如果网关在其他地方运行，请在此机器上运行节点主机。
- 打开扩展选项页面；它显示中继是否可达。

## 远程网关（使用节点主机）

### 本地网关（与Chrome在同一台机器上）—通常**无需额外步骤**

如果网关与Chrome在同一台机器上运行，它会在环回上启动浏览器控制服务
并自动启动中继服务器。扩展与本地中继通信；CLI/工具调用转到网关。

### 远程网关（网关在其他地方运行）—**运行节点主机**

如果您的网关在另一台机器上运行，请在运行Chrome的机器上启动节点主机。
网关将把浏览器操作代理到该节点；扩展+中继保持在浏览器机器本地。

如果连接了多个节点，请使用`gateway.nodes.browser.node`固定一个或设置`gateway.nodes.browser.mode`。

## 沙盒（工具容器）

如果您的代理会话是沙盒化的（`agents.defaults.sandbox.mode != "off"`），`browser`工具可能会受到限制：

- 默认情况下，沙盒会话通常针对**沙盒浏览器**（`target="sandbox"`），而不是您的主机Chrome。
- Chrome扩展中继接管需要控制**主机**浏览器控制服务器。

选项：
- 最简单：从**非沙盒**会话/代理使用扩展。
- 或者允许沙盒会话的主机浏览器控制：

```json5
{
  agents: {
    defaults: {
      sandbox: {
        browser: {
          allowHostControl: true
        }
      }
    }
  }
}
```

然后确保工具未被工具策略拒绝，并且（如有需要）使用`target="host"`调用`browser`。

调试：`moltbot sandbox explain`

## 远程访问提示

- 将网关和节点主机保持在同一个tailnet上；避免将中继端口暴露给LAN或公共互联网。
- 有意配对节点；如果您不想要远程控制，请禁用浏览器代理路由（`gateway.nodes.browser.mode="off"`）。

## "扩展路径"的工作原理

`moltbot browser extension path`打印包含扩展文件的**已安装**磁盘目录。

CLI有意**不**打印`node_modules`路径。始终先运行`moltbot browser extension install`将扩展复制到Moltbot状态目录下的稳定位置。

如果您移动或删除该安装目录，Chrome将标记扩展为损坏，直到您从有效路径重新加载它。

## 安全影响（请阅读）

这很强大但也很危险。将其视为给模型"控制您的浏览器的手"。

- 扩展使用Chrome的调试器API（`chrome.debugger`）。附加时，模型可以：
  - 在该标签页中点击/输入/导航
  - 读取页面内容
  - 访问标签页登录会话可以访问的任何内容
- **这不像专用的clawd管理配置文件那样隔离**。
  - 如果您附加到您的日常驱动配置文件/标签页，您就授予了对该账户状态的访问权限。

建议：
- 为扩展中继使用首选专用的Chrome配置文件（与您的个人浏览分开）。
- 将网关和任何节点主机保持仅限tailnet；依赖网关身份验证+节点配对。
- 避免通过LAN（`0.0.0.0`）暴露中继端口，避免使用Funnel（公共）。

相关：
- 浏览器工具概述：[浏览器](/tools/browser)
- 安全审计：[安全](/gateway/security)
- Tailscale设置：[Tailscale](/gateway/tailscale)
