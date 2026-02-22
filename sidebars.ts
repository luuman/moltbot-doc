import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    {
      type: "category",
      label: "从这里开始",
      items: [
        {
          type: "doc",
          id: "index",
          label: "索引",
          key: "start_index",
        },
        {
          type: "doc",
          key: "start_getting",
          id: "start/getting-started",
          label: "快速入门",
        },
        {
          type: "doc",
          key: "start_wizard",
          id: "start/wizard",
          label: "向导",
        },
        {
          type: "doc",
          key: "start_setup",
          id: "start/setup",
          label: "设置",
        },
        {
          type: "doc",
          key: "start_pairing",
          id: "start/pairing",
          label: "配对",
        },
        {
          type: "doc",
          key: "start_clawd",
          id: "start/clawd",
          label: "Clawd",
        },
        {
          type: "doc",
          key: "start_showcase",
          id: "start/showcase",
          label: "功能展示",
        },
        {
          type: "doc",
          key: "start_hubs",
          id: "start/hubs",
          label: "中心节点",
        },
        {
          type: "doc",
          key: "start_onboarding",
          id: "start/onboarding",
          label: "初始引导",
        },
        {
          type: "doc",
          key: "start_lore",
          id: "start/lore",
          label: "背景设定",
        },
      ],
    },
    {
      type: "category",
      label: "帮助",
      items: [
        {
          type: "doc",
          key: "help_index",
          id: "help/index",
          label: "索引",
        },
        {
          type: "doc",
          key: "help_troubleshooting",
          id: "help/troubleshooting",
          label: "故障排除",
        },
        {
          type: "doc",
          key: "help_faq",
          id: "help/faq",
          label: "常见问题",
        },
      ],
    },
    {
      type: "category",
      label: "安装与更新",
      items: [
        {
          type: "doc",
          key: "install_index",
          id: "install/index",
          label: "索引",
        },
        {
          type: "doc",
          key: "install_installer",
          id: "install/installer",
          label: "安装程序",
        },
        {
          type: "doc",
          key: "install_updating",
          id: "install/updating",
          label: "更新",
        },
        {
          type: "doc",
          key: "install_development",
          id: "install/development-channels",
          label: "开发频道",
        },
        {
          type: "doc",
          key: "install_uninstall",
          id: "install/uninstall",
          label: "卸载",
        },
        {
          type: "doc",
          key: "install_ansible",
          id: "install/ansible",
          label: "Ansible",
        },
        {
          type: "doc",
          key: "install_nix",
          id: "install/nix",
          label: "Nix",
        },
        {
          type: "doc",
          key: "install_docker",
          id: "install/docker",
          label: "Docker",
        },
        {
          type: "doc",
          key: "railway_",
          id: "railway",
          label: "部署到 Railway",
        },
        {
          type: "doc",
          key: "render_",
          id: "render",
          label: "部署到 Render",
        },
        {
          type: "doc",
          key: "northflank_",
          id: "northflank",
          label: "部署到 Northflank",
        },
        {
          type: "doc",
          key: "install_bun",
          id: "install/bun",
          label: "Bun",
        },
      ],
    },
    {
      type: "category",
      label: "命令行界面 (CLI)",
      items: [
        {
          type: "doc",
          key: "cli_index",
          id: "cli/index",
          label: "索引",
        },
        {
          type: "doc",
          key: "cli_setup",
          id: "cli/setup",
          label: "设置",
        },
        {
          type: "doc",
          key: "cli_onboard",
          id: "cli/onboard",
          label: "初始引导",
        },
        {
          type: "doc",
          key: "cli_configure",
          id: "cli/configure",
          label: "配置",
        },
        {
          type: "doc",
          key: "cli_doctor",
          id: "cli/doctor",
          label: "系统诊断",
        },
        {
          type: "doc",
          key: "cli_dashboard",
          id: "cli/dashboard",
          label: "仪表板",
        },
        {
          type: "doc",
          key: "cli_reset",
          id: "cli/reset",
          label: "重置",
        },
        {
          type: "doc",
          key: "cli_uninstall",
          id: "cli/uninstall",
          label: "卸载",
        },
        {
          type: "doc",
          key: "cli_browser",
          id: "cli/browser",
          label: "浏览器",
        },
        {
          type: "doc",
          key: "cli_message",
          id: "cli/message",
          label: "消息",
        },
        {
          type: "doc",
          key: "cli_agent",
          id: "cli/agent",
          label: "代理",
        },
        {
          type: "doc",
          key: "cli_agents",
          id: "cli/agents",
          label: "代理列表",
        },
        {
          type: "doc",
          key: "cli_status",
          id: "cli/status",
          label: "状态",
        },
        {
          type: "doc",
          key: "cli_health",
          id: "cli/health",
          label: "健康状态",
        },
        {
          type: "doc",
          key: "cli_sessions",
          id: "cli/sessions",
          label: "会话",
        },
        {
          type: "doc",
          key: "cli_channels",
          id: "cli/channels",
          label: "频道",
        },
        {
          type: "doc",
          key: "cli_directory",
          id: "cli/directory",
          label: "目录",
        },
        {
          type: "doc",
          key: "cli_skills",
          id: "cli/skills",
          label: "技能",
        },
        {
          type: "doc",
          key: "cli_plugins",
          id: "cli/plugins",
          label: "插件",
        },
        {
          type: "doc",
          key: "cli_memory",
          id: "cli/memory",
          label: "内存",
        },
        {
          type: "doc",
          key: "cli_models",
          id: "cli/models",
          label: "模型",
        },
        { type: "doc", key: "cli_logs", id: "cli/logs", label: "日志" },
        {
          type: "doc",
          key: "cli_system",
          id: "cli/system",
          label: "系统",
        },
        {
          type: "doc",
          key: "cli_nodes",
          id: "cli/nodes",
          label: "节点",
        },
        {
          type: "doc",
          key: "cli_approvals",
          id: "cli/approvals",
          label: "审批",
        },
        {
          type: "doc",
          key: "cli_gateway",
          id: "cli/gateway",
          label: "网关",
        },
        { type: "doc", key: "cli_tui", id: "cli/tui", label: "文本用户界面" },
        {
          type: "doc",
          key: "cli_voicecall",
          id: "cli/voicecall",
          label: "语音通话",
        },
        { type: "doc", key: "cli_cron", id: "cli/cron", label: "定时任务" },
        { type: "doc", key: "cli_dns", id: "cli/dns", label: "域名系统" },
        { type: "doc", key: "cli_docs", id: "cli/docs", label: "文档" },
        {
          type: "doc",
          key: "cli_hooks",
          id: "cli/hooks",
          label: "钩子",
        },
        {
          type: "doc",
          key: "cli_pairing",
          id: "cli/pairing",
          label: "配对",
        },
        {
          type: "doc",
          key: "cli_security",
          id: "cli/security",
          label: "安全",
        },
        {
          type: "doc",
          key: "cli_update",
          id: "cli/update",
          label: "更新",
        },
        {
          type: "doc",
          key: "cli_sandbox",
          id: "cli/sandbox",
          label: "沙盒命令行界面",
        },
      ],
    },
    {
      type: "category",
      label: "核心概念",
      items: [
        {
          type: "doc",
          key: "concepts_architecture",
          id: "concepts/architecture",
          label: "架构",
        },
        {
          type: "doc",
          key: "concepts_agent_main",
          id: "concepts/agent",
          label: "代理",
        },
        {
          type: "doc",
          key: "concepts_agent_loop",
          id: "concepts/agent-loop",
          label: "代理循环",
        },
        {
          type: "doc",
          key: "concepts_agent_workspace",
          id: "concepts/agent-workspace",
          label: "代理工作空间",
        },
        {
          type: "doc",
          key: "concepts_session_main",
          id: "concepts/session",
          label: "会话",
        },
        {
          type: "doc",
          key: "concepts_session_pruning",
          id: "concepts/session-pruning",
          label: "会话清理",
        },
        {
          type: "doc",
          key: "concepts_session_tool",
          id: "concepts/session-tool",
          label: "会话工具",
        },
        {
          type: "doc",
          key: "concepts_model_providers",
          id: "concepts/model-providers",
          label: "模型提供商",
        },
        {
          type: "doc",
          key: "concepts_model_failover",
          id: "concepts/model-failover",
          label: "模型故障转移",
        },
      ],
    },
    {
      type: "category",
      label: "网关运维",
      items: [
        {
          type: "doc",
          key: "gateway_configuration_main",
          id: "gateway/configuration",
          label: "配置",
        },
        {
          type: "doc",
          key: "gateway_configuration_examples",
          id: "gateway/configuration-examples",
          label: "配置示例",
        },
        {
          type: "doc",
          key: "gateway_remote_main",
          id: "gateway/remote",
          label: "远程",
        },
        {
          type: "doc",
          key: "gateway_remote_readme",
          id: "gateway/remote-gateway-readme",
          label: "远程网关说明",
        },
      ],
    },
    {
      type: "category",
      label: "自动化钩子",
      items: [
        {
          type: "doc",
          key: "automation_cron_jobs",
          id: "automation/cron-jobs",
          label: "定时任务",
        },
        {
          type: "doc",
          key: "automation_cron_vs_heartbeat",
          id: "automation/cron-vs-heartbeat",
          label: "定时任务 vs 心跳",
        },
      ],
    },
    {
      type: "category",
      label: "工具与技能",
      items: [
        {
          type: "doc",
          key: "tools_browser_main",
          id: "tools/browser",
          label: "浏览器",
        },
        {
          type: "doc",
          key: "tools_browser_login",
          id: "tools/browser-login",
          label: "浏览器登录",
        },
        {
          type: "doc",
          key: "tools_browser_linux",
          id: "tools/browser-linux-troubleshooting",
          label: "浏览器 Linux 故障排除",
        },
        {
          type: "doc",
          key: "tools_skills_main",
          id: "tools/skills",
          label: "技能",
        },
        {
          type: "doc",
          key: "tools_skills_config",
          id: "tools/skills-config",
          label: "技能配置",
        },
      ],
    },
    {
      type: "category",
      label: "平台",
      items: [
        {
          type: "doc",
          key: "platforms_macos_main",
          id: "platforms/macos",
          label: "macOS",
        },
        {
          type: "doc",
          key: "platforms_macos_vm",
          id: "platforms/macos-vm",
          label: "macOS 虚拟机",
        },
      ],
    },
    {
      type: "category",
      label: "macOS 伴侣应用",
      items: [
        {
          type: "doc",
          key: "platforms_mac_dev_setup",
          id: "platforms/mac/dev-setup",
          label: "开发环境设置",
        },
        {
          type: "doc",
          key: "platforms_mac_menu_bar",
          id: "platforms/mac/menu-bar",
          label: "菜单栏",
        },
        {
          type: "doc",
          key: "platforms_mac_voicewake",
          id: "platforms/mac/voicewake",
          label: "语音唤醒",
        },
        {
          type: "doc",
          key: "platforms_mac_voice_overlay",
          id: "platforms/mac/voice-overlay",
          label: "语音悬浮窗",
        },
        {
          type: "doc",
          key: "platforms_mac_webchat",
          id: "platforms/mac/webchat",
          label: "网页聊天",
        },
        {
          type: "doc",
          key: "platforms_mac_canvas",
          id: "platforms/mac/canvas",
          label: "画布",
        },
        {
          type: "doc",
          key: "platforms_mac_child_process",
          id: "platforms/mac/child-process",
          label: "子进程",
        },
        {
          type: "doc",
          key: "platforms_mac_health",
          id: "platforms/mac/health",
          label: "健康状态",
        },
        {
          type: "doc",
          key: "platforms_mac_icon",
          id: "platforms/mac/icon",
          label: "图标",
        },
        {
          type: "doc",
          key: "platforms_mac_logging",
          id: "platforms/mac/logging",
          label: "日志记录",
        },
        {
          type: "doc",
          key: "platforms_mac_permissions",
          id: "platforms/mac/permissions",
          label: "权限",
        },
        {
          type: "doc",
          key: "platforms_mac_remote",
          id: "platforms/mac/remote",
          label: "远程",
        },
        {
          type: "doc",
          key: "platforms_mac_signing",
          id: "platforms/mac/signing",
          label: "签名",
        },
        {
          type: "doc",
          key: "platforms_mac_release",
          id: "platforms/mac/release",
          label: "发布",
        },
        {
          type: "doc",
          key: "platforms_mac_bundled_gateway",
          id: "platforms/mac/bundled-gateway",
          label: "捆绑网关",
        },
        {
          type: "doc",
          key: "platforms_mac_xpc",
          id: "platforms/mac/xpc",
          label: "XPC",
        },
        {
          type: "doc",
          key: "platforms_mac_skills",
          id: "platforms/mac/skills",
          label: "技能",
        },
        {
          type: "doc",
          key: "platforms_mac_peekaboo",
          id: "platforms/mac/peekaboo",
          label: "Peekaboo",
        },
      ],
    },
    {
      type: "category",
      label: "参考模板",
      items: [
        {
          type: "doc",
          key: "reference_template_agents",
          id: "reference/templates/AGENTS",
          label: "代理模板",
        },
        {
          type: "doc",
          key: "reference_template_boot",
          id: "reference/templates/BOOT",
          label: "启动模板",
        },
        {
          type: "doc",
          key: "reference_template_bootstrap",
          id: "reference/templates/BOOTSTRAP",
          label: "引导程序模板",
        },
        {
          type: "doc",
          key: "reference_template_heartbeat",
          id: "reference/templates/HEARTBEAT",
          label: "心跳模板",
        },
        {
          type: "doc",
          key: "reference_template_identity",
          id: "reference/templates/IDENTITY",
          label: "身份模板",
        },
        {
          type: "doc",
          key: "reference_template_soul",
          id: "reference/templates/SOUL",
          label: "核心模板",
        },
        {
          type: "doc",
          key: "reference_template_tools",
          id: "reference/templates/TOOLS",
          label: "工具模板",
        },
        {
          type: "doc",
          key: "reference_template_user",
          id: "reference/templates/USER",
          label: "用户模板",
        },
      ],
    },
  ],
};

export default sidebars;
