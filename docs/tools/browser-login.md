---
summary: "浏览器自动化的手动登录 + X/Twitter 发帖"
read_when:
  - 需要登录网站进行浏览器自动化
  - 想要发布更新到 X/Twitter
---

# 浏览器登录 + X/Twitter 发帖

## 手动登录（推荐）

当网站需要登录时，在**主机**浏览器配置文件（clawd 浏览器）中**手动登录**。

**不要**向模型提供您的凭据。自动登录经常触发反机器人防御并可能锁定账户。

回到主要浏览器文档：[浏览器](/tools/browser)。

## 使用哪个 Chrome 配置文件？

Moltbot 控制一个**专用 Chrome 配置文件**（名为 `clawd`，橙色调 UI）。这与您的日常浏览器配置文件分开。

两种简单的访问方式：

1) **要求代理打开浏览器**，然后自己登录。
2) **通过 CLI 打开**：

```bash
moltbot browser start
moltbot browser open https://x.com
```

如果有多个配置文件，传递 `--browser-profile <name>`（默认为 `clawd`）。

## X/Twitter：推荐流程

- **阅读/搜索/帖子：** 使用 **bird** CLI 技能（无浏览器，稳定）。
  - 仓库：https://github.com/steipete/bird
- **发布更新：** 使用**主机**浏览器（手动登录）。

## 沙箱 + 主机浏览器访问

沙箱浏览器会话**更有可能**触发机器人检测。对于 X/Twitter（和其他严格网站），首选**主机**浏览器。

如果代理被沙箱化，浏览器工具默认使用沙箱。要允许主机控制：

```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "non-main",
        browser: {
          allowHostControl: true
        }
      }
    }
  }
}
```

然后定位主机浏览器：

```bash
moltbot browser open https://x.com --browser-profile clawd --target host
```

或者为发布更新的代理禁用沙箱。
