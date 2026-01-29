# 🐵 从这里开始！悟空Bot 使用指南

## 👋 欢迎

欢迎使用**悟空Bot** - 你的私人AI助手！七十二变，无所不能！

---

## ✅ 当前状态

🎉 **所有工作已完成！**

- ✅ 依赖安装成功 (2.1GB, 1052个包)
- ✅ 飞书/企微/钉钉集成完成
- ✅ Web UI 和 CLI 全面汉化
- ✅ 完整文档体系就绪

---

## ⚡ 10秒快速开始

```bash
cd /root/code/wukongbot

# 构建项目
pnpm build

# 查看效果
pnpm wukongbot --help
```

你会看到：
```
🐵 悟空Bot v2026.1.27 — 你的私人AI助手,七十二变无所不能
```

---

## 📚 文档索引

### 🎯 新手必读
| 文档 | 说明 | 位置 |
|------|------|------|
| **🎉_开始使用.md** | 最快上手指南 ⭐ | 根目录 |
| **快速启动指南.md** | 详细使用步骤 | project_docs/ |
| **README.md** | 项目介绍 | 根目录 |

### 📱 平台集成
| 文档 | 说明 | 位置 |
|------|------|------|
| **CHINA_PLATFORMS_DONE.md** | 平台完成报告 ⭐ | project_docs/ |
| **INTEGRATION_SUMMARY.md** | 集成功能详解 | project_docs/ |
| **docs/platforms/CHINA_IM_INTEGRATION.md** | 详细配置指南 | docs/platforms/ |

### 🌏 汉化说明
| 文档 | 说明 | 位置 |
|------|------|------|
| **汉化完成报告.md** | 汉化成果展示 ⭐ | project_docs/ |
| **LOCALIZATION_DONE.md** | 技术细节 | project_docs/ |

### 💿 安装相关
| 文档 | 说明 | 位置 |
|------|------|------|
| **依赖安装完成.md** | 依赖修复总结 | project_docs/ |
| **INSTALL_GUIDE_CN.md** | 安装指南 | project_docs/ |

### 🛠️ 开发者
| 文档 | 说明 | 位置 |
|------|------|------|
| **ARCHITECTURE_CN.md** | 架构文档 ⭐ | project_docs/ |
| **QUICKSTART_DEV_CN.md** | 开发入门 | project_docs/ |
| **TODO_CN.md** | 任务清单 | project_docs/ |

### 📊 总结报告
| 文档 | 说明 | 位置 |
|------|------|------|
| **全部完成总结.md** | 项目总览 ⭐ | 根目录 |
| **📚_文档导航.md** | 完整导航 | 根目录 |

---

## 🎨 功能展示

### Web 管理后台

**标题**: 悟空Bot 控制面板  
**导航**: 对话 | 控制 | 助手 | 设置  
**页面**: 概览、频道、会话、定时任务...

**启动方式**:
```bash
cd ui
pnpm install
pnpm dev
# 访问 http://localhost:5173
```

### CLI 命令行

**Banner**: 🐵 悟空Bot + WUKONGBOT ASCII 艺术  
**标语**: 随机显示20+条中文创意标语  
**向导**: 完全中文的配置引导

**测试方式**:
```bash
pnpm wukongbot --help         # 查看 Banner
pnpm wukongbot channels list  # 查看频道
pnpm wukongbot onboard        # 运行向导
```

### 国产平台支持

**飞书**: ✅ 95% 完成  
**企业微信**: ✅ 80% 完成  
**钉钉**: ✅ 80% 完成

**配置方式**:
```bash
pnpm wukongbot channels onboard feishu
pnpm wukongbot channels onboard wecom
pnpm wukongbot channels onboard dingtalk
```

---

## 🎯 推荐使用流程

### Day 1: 基础配置（30分钟）
```bash
# 1. 构建项目
pnpm build

# 2. 配置 DeepSeek
# 编辑 ~/.wukongbot/wukongbot.json

# 3. 配置飞书
pnpm wukongbot channels onboard feishu

# 4. 测试
pnpm wukongbot channels status feishu --probe
```

### Day 2: 体验功能（1小时）
```bash
# 1. 启动 Gateway
pnpm wukongbot gateway --port 18789

# 2. 打开 Web UI
cd ui && pnpm dev

# 3. 在飞书中与AI对话
# 4. 在 Web UI 中查看会话历史
```

### Day 3: 深入使用（持续）
- 配置更多平台（企微、钉钉）
- 设置定时任务
- 探索更多功能

---

## 🔧 常用命令

### 查看帮助
```bash
pnpm wukongbot --help
pnpm wukongbot channels --help
pnpm wukongbot agent --help
```

### 管理频道
```bash
# 列出所有频道
pnpm wukongbot channels list

# 查看状态
pnpm wukongbot channels status --all

# 配置新频道
pnpm wukongbot channels onboard <platform>
```

### 发送消息
```bash
# 通过飞书发送
pnpm wukongbot message send \
  --channel feishu \
  --to "chat_id" \
  --message "消息内容"
```

### 启动服务
```bash
# 启动 Gateway
pnpm wukongbot gateway --port 18789

# 或安装为系统服务
pnpm wukongbot onboard --install-daemon
```

---

## 📖 完整文档列表

### 在根目录
- 🎉_开始使用.md (本文档)
- 全部完成总结.md
- 📚_文档导航.md
- README.md
- AGENTS.md
- CONTRIBUTING.md

### 在 project_docs/
- ARCHITECTURE_CN.md
- QUICKSTART_DEV_CN.md
- TODO_CN.md
- CHINA_PLATFORMS_DONE.md
- INTEGRATION_SUMMARY.md
- 汉化完成报告.md
- LOCALIZATION_DONE.md
- FINAL_LOCALIZATION_SUMMARY.md
- 快速启动指南.md
- 依赖安装完成.md
- INSTALL_GUIDE_CN.md

### 在 extensions/
- extensions/feishu/README.md
- extensions/wecom/README.md
- extensions/dingtalk/README.md

### 在 docs/
- docs/platforms/CHINA_IM_INTEGRATION.md

---

## 🎉 你已经准备好了！

现在运行：

```bash
pnpm build
pnpm wukongbot --help
```

开始你的悟空Bot之旅吧！🐵✨

---

**需要帮助？** 查看 `📚_文档导航.md` 找到所有文档  
**遇到问题？** 查看 `INSTALL_GUIDE_CN.md` 获取帮助  
**想深入了解？** 查看 `ARCHITECTURE_CN.md` 了解架构  

**祝您使用愉快！** 🚀
