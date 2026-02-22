---
slug: first-blog-post
title: Clawdbot保姆级教程
authors: [luuman]
# tags: [hola, docusaurus]
---

## 一、安全警告⚠️

**强烈建议使用备用机或虚拟机部署！**

- 该工具拥有极高系统权限
- 可能误删重要文件或执行危险操作
- 不要在主电脑上直接部署
- 建议使用：新电脑、虚拟机或云服务器

## 二、基础环境准备

### 1. 安装Node.js

- 版本要求：v22.0.0 或更高
- 下载地址：https://nodejs.org/
- 安装后验证：`node --version`

### 2. 系统要求

- Windows 10/11
- macOS 10.15+
- Linux (Ubuntu/Debian等)

## 三、安装Clawdbot

### Windows系统安装：

```powershell
iwr -useb https://molt.bot/install.ps1 | iex
```

### macOS/Linux系统安装：

```bash
curl -fsSL https://molt.bot/install.sh | bash -s -- --install-method git
```

## 四、初始配置流程

### 1. 启动配置

安装完成后按提示操作：

```
Do you want to continue? [yes/no] → 输入 yes

选择配置方式：
1. Quick start (recommended) → 选择此项
2. Manual configuration
```

### 2. API配置

选择AI模型服务商：

- **OpenAI GPT/Codex**（推荐，但需要API额度）
- **Claude**（注意：可能被封号）
- **国产模型**：MiniMax、智谱GLM、通义千问等

**重要提醒**：

- 避免使用Claude Max额度，可能导致封号
- 该工具消耗Token极快，注意监控使用量

### 3. 通信渠道配置

跳过海外聊天软件，选择：

```
Skip channel setup for now
```

### 4. 技能安装

```
Install skills? [yes/no] → 输入 yes
选择包管理器：npm (推荐)
```

### 5. 插件配置

建议开启以下三个hooks：

- `boot-md`：启动时加载自定义引导内容
- `command-logger`：记录操作日志
- `session-memory`：保存会话记忆

## 五、启动Clawdbot

### 1. 启动命令

```bash
clawdbot gateway --verbose
```

### 2. 访问Web界面

- 默认地址：http://127.0.0.1:18789/chat
- 端口可能不同，按终端显示为准

## 六、飞书集成配置（国内用户推荐）

### 1. 安装飞书插件

在Clawdbot Web界面中输入：

```
给我安装Clawdbot plugins install @m1heng-clawd/feishu
```

### 2. 创建飞书应用

1. 访问飞书开放平台：https://open.feishu.cn
2. 创建企业自建应用
3. 获取并保存：
   - App ID
   - App Secret

### 3. 配置飞书插件

在Clawdbot对话框中输入：

```
我的App ID是：[你的App ID]，App Secret是：[你的App Secret]
```

Clawdbot会自动完成剩余配置

### 4. 飞书应用设置

在开放平台配置：

1. **权限管理**开启：
   - 获取用户userID
   - 以应用身份读取通讯录
   - 获取用户邮箱信息
   - 获取用户手机号
   - 获取用户基本信息
   - 获取用户头像
   - 用户发送消息

2. **事件订阅**添加：
   - im.message.receive_v1

3. **安全设置**添加：
   - IP白名单（如果需要）

4. **版本管理与发布**：
   - 创建版本
   - 申请发布

## 七、使用技巧与注意事项

### 1. 成本控制

- 监控API使用量（消耗极快）
- 考虑使用国产模型降低成本
- 设置使用额度限制

### 2. 安全建议

- 限制文件访问范围
- 定期备份重要数据
- 监控操作日志
- 避免赋予过高权限

### 3. 实用技能

- 文件处理：自动整理、转换格式
- 数据录入：Excel自动填充
- 邮件处理：自动分类、回复
- 日常任务：定时提醒、信息整理

## 八、故障排除

### 常见问题：

1. **安装失败**：检查Node.js版本和网络
2. **API错误**：检查API密钥和额度
3. **飞书连接失败**：检查权限配置和网络

### 获取帮助：

- 官方文档：https://github.com/clawdbot/clawdbot
- 飞书插件：https://github.com/m1heng/Clawdbot-feishu
- 社区讨论：GitHub Issues

## 九、总结

Clawdbot代表了AI Agent发展的一个重要方向，但**安全永远是第一位的**。在享受自动化便利的同时，务必：

1. **隔离环境**：使用专用设备或虚拟机
2. **权限最小化**：只开放必要的访问权限
3. **持续监控**：定期检查操作日志
4. **备份重要数据**：防止意外损失

记住：你交给AI的不仅是任务，还有系统的控制权。在追求效率的同时，保持必要的警惕和理性。
