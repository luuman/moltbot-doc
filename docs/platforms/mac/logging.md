---
summary: "Moltbot 日志记录：滚动诊断文件日志 + 统一日志隐私标志"
read_when:
  - 捕获 macOS 日志或调查私有数据日志记录
  - 调试语音唤醒/会话生命周期问题
---
# 日志记录 (macOS)

## 滚动诊断文件日志（调试窗格）
Moltbot 通过 swift-log 路由 macOS 应用日志（默认为统一日志记录），当您需要持久捕获时可以写入本地滚动文件日志到磁盘。

- 详细程度：**调试窗格 → 日志 → 应用日志 → 详细程度**
- 启用：**调试窗格 → 日志 → 应用日志 → "写入滚动诊断日志 (JSONL)"**
- 位置：`~/Library/Logs/Moltbot/diagnostics.jsonl`（自动轮换；旧文件后缀为 `.1`、`.2`、…）
- 清除：**调试窗格 → 日志 → 应用日志 → "清除"**

说明：
- 这是**默认关闭**的。仅在积极调试时启用。
- 将文件视为敏感；未经审查不要分享。

## macOS 上的统一日志私有数据

统一日志记录会隐藏大部分有效载荷，除非子系统选择加入 `privacy -off`。根据 Peter 关于 macOS [日志隐私诡计](https://steipete.me/posts/2025/logging-privacy-shenanigans)（2025）的撰写，这是由 `/Library/Preferences/Logging/Subsystems/` 中的 plist 控制的，以子系统名称为键。只有新日志条目才会拾取标志，所以在重现问题之前启用它。

## 为 Moltbot (`bot.molt`) 启用
- 首先将 plist 写入临时文件，然后以 root 身份原子安装：

```bash
cat <<'EOF' >/tmp/bot.molt.plist
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>DEFAULT-OPTIONS</key>
    <dict>
        <key>Enable-Private-Data</key>
        <true/>
    </dict>
</dict>
</plist>
EOF
sudo install -m 644 -o root -g wheel /tmp/bot.molt.plist /Library/Preferences/Logging/Subsystems/bot.molt.plist
```

- 不需要重启；logd 很快注意到文件，但只有新日志行将包含私有有效载荷。
- 使用现有助手查看更丰富的输出，例如 `./scripts/clawlog.sh --category WebChat --last 5m`。

## 调试后禁用
- 移除覆盖：`sudo rm /Library/Preferences/Logging/Subsystems/bot.molt.plist`。
- 可选运行 `sudo log config --reload` 以强制 logd 立即删除覆盖。
- 记住这个表面可能包含电话号码和消息正文；仅在您确实需要额外细节时才保留 plist。