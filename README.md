# 🐵 悟空Bot — 你的私人AI助手

<p align="center">
  <img src="https://raw.githubusercontent.com/moltbot/moltbot/main/docs/whatsapp-clawd.jpg" alt="WukongBot" width="400">
</p>

<p align="center">
  <strong>七十二变,无所不能!</strong>
</p>

<p align="center">
  <a href="https://github.com/moltbot/moltbot/actions/workflows/ci.yml?branch=main"><img src="https://img.shields.io/github/actions/workflow/status/moltbot/moltbot/ci.yml?branch=main&style=for-the-badge" alt="CI status"></a>
  <a href="https://github.com/moltbot/moltbot/releases"><img src="https://img.shields.io/github/v/release/moltbot/moltbot?include_prereleases&style=for-the-badge" alt="GitHub release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
</p>

**悟空Bot (WukongBot)** 是一个*私人 AI 助手*,运行在你自己的设备上。它可以通过你日常使用的各种通讯平台与你对话(飞书、企业微信、钉钉、微信、QQ、Telegram、Discord 等),支持接入国产大模型(DeepSeek、千问、Kimi、豆包、硅基流动等)。Gateway 只是控制平面 — 产品本身是这个助手。

如果你想要一个私有的、单用户的、感觉本地化、快速且始终在线的助手,这就是它。

[快速开始](#快速开始-tldr) · [文档](#文档) · [安装](#安装推荐) · [从源码构建](#从源码构建开发)

## ✨ 特性亮点

### 🇨🇳 国产化支持
- **国产 IM 平台**: 飞书、企业微信、钉钉、微信(即将支持)
- **国产大模型**: DeepSeek、千问(Qwen)、Kimi、豆包、硅基流动、智谱(GLM)等
- **简化安装**: 一键安装脚本,无需复杂配置
- **中文优先**: 完整的中文文档和社区支持

### 🌟 核心功能
- **本地优先网关** — 会话、频道、工具和事件的统一控制平面
- **多通道收件箱** — 飞书、企业微信、钉钉、微信、QQ、Telegram、Discord、Slack 等
- **多代理路由** — 将入站频道/账户/对等方路由到隔离的代理(工作区 + 每个代理的会话)
- **语音唤醒 + 对话模式** — macOS/iOS/Android 的始终在线语音功能
- **实时画布** — 代理驱动的可视化工作区
- **一流的工具** — 浏览器、画布、节点、定时任务、会话等
- **配套应用** — macOS 菜单栏应用 + iOS/Android 节点
- **向导式安装** — 引导式设置,支持捆绑/托管/工作区技能

## 🚀 快速开始 (TL;DR)

运行环境: **Node ≥22**

完整新手指南(认证、配对、频道):即将推出

```bash
# 全局安装
npm install -g wukongbot@latest
# 或使用 pnpm
pnpm add -g wukongbot@latest

# 运行向导式安装(包含守护进程安装)
wukongbot onboard --install-daemon

# 启动网关
wukongbot gateway --port 18789 --verbose

# 发送消息
wukongbot message send --to +8613800138000 --message "你好,悟空!"

# 与助手对话(可选择发送回任何已连接的频道)
wukongbot agent --message "今天的任务清单" --thinking high
```

升级? 更新指南(即将推出) (并运行 `wukongbot doctor`)。

## 📦 安装(推荐)

运行环境: **Node ≥22**

```bash
npm install -g wukongbot@latest
# 或: pnpm add -g wukongbot@latest

wukongbot onboard --install-daemon
```

向导会安装 Gateway 守护进程(launchd/systemd 用户服务),使其保持运行。

## 🏗️ 从源码构建(开发)

推荐使用 `pnpm` 从源码构建。Bun 可选,用于直接运行 TypeScript。

```bash
git clone https://github.com/yourusername/wukongbot.git
cd wukongbot

pnpm install
pnpm ui:build # 首次运行时自动安装 UI 依赖
pnpm build

pnpm wukongbot onboard --install-daemon

# 开发循环(TS 更改时自动重载)
pnpm gateway:watch
```

注意: `pnpm wukongbot ...` 直接运行 TypeScript(通过 `tsx`)。`pnpm build` 生成 `dist/` 用于通过 Node 运行或打包的 `wukongbot` 二进制文件。

## 🔐 安全默认设置(DM 访问)

悟空Bot 连接到真实的消息平台。将入站 DM 视为**不受信任的输入**。

完整安全指南:即将推出

默认行为:
- **DM 配对** (`dmPolicy="pairing"`): 未知发件人收到一个短配对码,机器人不处理他们的消息。
- 批准: `wukongbot pairing approve <channel> <code>` (然后发件人被添加到本地白名单)。
- 公开入站 DM 需要明确选择加入: 设置 `dmPolicy="open"` 并在频道白名单中包含 `"*"`。

运行 `wukongbot doctor` 以发现有风险/配置错误的 DM 策略。

## 🇨🇳 国产化平台配置

### 飞书 (Lark/Feishu)

即将支持 - 正在开发中

```json5
{
  channels: {
    feishu: {
      appId: "cli_xxx",
      appSecret: "xxx",
      allowFrom: ["*"] // 或指定允许的用户列表
    }
  }
}
```

### 企业微信 (WeCom)

即将支持 - 正在开发中

```json5
{
  channels: {
    wecom: {
      corpId: "ww123456",
      agentId: "1000001",
      secret: "xxx",
      allowFrom: ["*"]
    }
  }
}
```

### 钉钉 (DingTalk)

即将支持 - 正在开发中

```json5
{
  channels: {
    dingtalk: {
      appKey: "xxx",
      appSecret: "xxx",
      allowFrom: ["*"]
    }
  }
}
```

## 🤖 国产大模型配置

### DeepSeek

```json5
{
  models: {
    providers: {
      deepseek: {
        apiKey: "sk-xxx",
        baseUrl: "https://api.deepseek.com",
        models: [
          { id: "deepseek-chat", name: "DeepSeek Chat" },
          { id: "deepseek-coder", name: "DeepSeek Coder" }
        ]
      }
    }
  },
  agent: {
    model: "deepseek/deepseek-chat"
  }
}
```

### 千问 (Qwen/通义千问)

```json5
{
  models: {
    providers: {
      qwen: {
        apiKey: "sk-xxx",
        baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
        models: [
          { id: "qwen-turbo", name: "通义千问 Turbo" },
          { id: "qwen-plus", name: "通义千问 Plus" },
          { id: "qwen-max", name: "通义千问 Max" }
        ]
      }
    }
  },
  agent: {
    model: "qwen/qwen-max"
  }
}
```

### Kimi (月之暗面)

```json5
{
  models: {
    providers: {
      kimi: {
        apiKey: "sk-xxx",
        baseUrl: "https://api.moonshot.cn/v1",
        models: [
          { id: "moonshot-v1-8k", name: "Kimi 8K" },
          { id: "moonshot-v1-32k", name: "Kimi 32K" },
          { id: "moonshot-v1-128k", name: "Kimi 128K" }
        ]
      }
    }
  }
}
```

### 豆包 (字节跳动)

```json5
{
  models: {
    providers: {
      doubao: {
        apiKey: "xxx",
        baseUrl: "https://ark.cn-beijing.volces.com/api/v3",
        models: [
          { id: "doubao-pro", name: "豆包 Pro" },
          { id: "doubao-lite", name: "豆包 Lite" }
        ]
      }
    }
  }
}
```

### 硅基流动 (Silicon Flow)

```json5
{
  models: {
    providers: {
      siliconflow: {
        apiKey: "sk-xxx",
        baseUrl: "https://api.siliconflow.cn/v1",
        models: [
          { id: "Qwen/Qwen2.5-7B-Instruct", name: "千问 2.5-7B" },
          { id: "deepseek-ai/DeepSeek-V2.5", name: "DeepSeek V2.5" }
        ]
      }
    }
  }
}
```

## 📚 配置

最小配置 `~/.clawdbot/wukongbot.json` (模型 + 默认值):

```json5
{
  agent: {
    model: "deepseek/deepseek-chat"
  }
}
```

完整配置参考(所有键 + 示例):即将推出

## 💬 聊天命令

在飞书/企业微信/钉钉/Telegram/Discord 中发送这些命令(群组命令仅限所有者):

- `/status` — 紧凑会话状态(模型 + 令牌,成本(如可用))
- `/new` 或 `/reset` — 重置会话
- `/compact` — 压缩会话上下文(摘要)
- `/think <level>` — off|minimal|low|medium|high|xhigh
- `/verbose on|off`
- `/usage off|tokens|full` — 每次响应的使用情况页脚
- `/restart` — 重启网关(仅群组所有者)
- `/activation mention|always` — 群组激活切换(仅群组)

## 🎯 开发路线图

- [x] 基础框架和架构
- [x] 国际化 IM 平台支持(Telegram, Discord, Slack 等)
- [ ] **国产 IM 平台**
  - [ ] 飞书(Feishu/Lark)集成
  - [ ] 企业微信(WeCom)集成
  - [ ] 钉钉(DingTalk)集成
  - [ ] 微信(WeChat)集成(计划中)
- [x] **国产大模型支持**
  - [x] DeepSeek
  - [x] 千问(Qwen)
  - [x] Kimi
  - [x] 豆包
  - [x] 硅基流动
  - [ ] 智谱(GLM)
  - [ ] 百川
- [ ] **简化安装**
  - [ ] 一键安装脚本
  - [ ] Docker 镜像
  - [ ] Web 管理界面
- [ ] 完整中文文档
- [ ] 中文社区和支持

## 🛠️ 技术栈

- **语言**: TypeScript (ESM)
- **运行时**: Node.js ≥22 / Bun(可选)
- **AI 引擎**: [@mariozechner/pi-coding-agent](https://github.com/badlogic/pi-mono)
- **框架**: Express (HTTP), grammy (Telegram), discord.js (Discord)
- **存储**: SQLite (本地), 文件系统
- **测试**: Vitest

## 📝 许可证

MIT License - 详见 [LICENSE](LICENSE)

## 🤝 贡献

欢迎贡献!请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解指南、维护者以及如何提交 PR。

AI/氛围编码的 PR 欢迎! 🤖

特别感谢 [Mario Zechner](https://mariozechner.at/) 的支持和 [pi-mono](https://github.com/badlogic/pi-mono)。

## 📞 社区与支持

- 💬 讨论: [GitHub Discussions](https://github.com/yourusername/wukongbot/discussions)
- 🐛 问题: [GitHub Issues](https://github.com/yourusername/wukongbot/issues)
- 📧 邮件: support@wukongbot.cn (即将开通)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/wukongbot&type=Date)](https://star-history.com/#yourusername/wukongbot&Date)

---

<p align="center">
  Made with ❤️ by the WukongBot community
</p>

<p align="center">
  基于 <a href="https://github.com/moltbot/moltbot">Moltbot</a> 构建 | Fork from <a href="https://github.com/moltbot/moltbot">moltbot/moltbot</a>
</p>
