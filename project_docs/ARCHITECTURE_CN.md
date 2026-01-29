# 悟空Bot 架构文档

## 🏗️ 整体架构

悟空Bot 采用 **Gateway 模式 + 插件化架构**,核心组件如下:

```
┌─────────────────────────────────────────────────────────┐
│                    IM 平台层                              │
│  飞书 / 企业微信 / 钉钉 / Telegram / Discord / Slack     │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  Channel 插件层                           │
│    统一的 ChannelPlugin 接口                              │
│    src/channels/plugins/ + extensions/                   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                Gateway 网关层                             │
│    WebSocket 控制平面 (ws://127.0.0.1:18789)             │
│    路由、会话管理、工具调度                                │
│    src/gateway/                                          │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                AI 代理层                                  │
│    Pi Agent (基于 @mariozechner/pi-coding-agent)         │
│    src/agents/                                           │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                大模型提供商层                              │
│    DeepSeek / 千问 / Kimi / 豆包 / 硅基流动              │
│    src/agents/models-config.ts                           │
└─────────────────────────────────────────────────────────┘
```

## 📂 核心目录结构

```
wukongbot/
├── src/
│   ├── channels/           # 频道/IM平台核心逻辑
│   │   ├── plugins/        # 插件接口和注册
│   │   │   ├── types.ts    # ChannelPlugin 接口定义 ⭐️
│   │   │   ├── index.ts    # 插件注册表
│   │   │   ├── onboarding/ # 各平台引导配置
│   │   │   ├── normalize/  # 消息格式标准化
│   │   │   └── outbound/   # 消息发送逻辑
│   │   └── registry.ts     # 频道注册和查找
│   │
│   ├── telegram/           # Telegram 实现
│   │   ├── bot.ts          # Bot 创建和配置 ⭐️
│   │   ├── bot-handlers.ts # 消息处理器
│   │   └── ...
│   │
│   ├── discord/            # Discord 实现
│   ├── slack/              # Slack 实现
│   ├── signal/             # Signal 实现
│   │
│   ├── agents/             # AI 代理核心
│   │   ├── models-config.ts           # 模型配置管理 ⭐️
│   │   ├── model-catalog.ts           # 模型目录 ⭐️
│   │   ├── models-config.providers.ts # 提供商配置 ⭐️
│   │   ├── pi-embedded-runner/        # Pi Agent 运行器
│   │   └── tools/                     # 工具定义
│   │
│   ├── gateway/            # Gateway 网关
│   │   ├── server.ts       # WebSocket 服务器
│   │   ├── protocol/       # 协议定义
│   │   └── server-methods/ # RPC 方法
│   │
│   ├── config/             # 配置系统
│   │   ├── types.ts        # 配置类型总索引 ⭐️
│   │   ├── config.ts       # 配置加载
│   │   ├── io.ts           # 配置文件 I/O
│   │   └── types.*.ts      # 分模块类型定义
│   │
│   ├── cli/                # CLI 命令
│   │   └── program.ts      # 命令行程序入口
│   │
│   └── providers/          # 模型提供商 OAuth
│       ├── github-copilot-auth.ts
│       ├── qwen-portal-oauth.ts
│       └── ...
│
├── extensions/             # 扩展插件 ⭐️
│   ├── msteams/           # Microsoft Teams
│   ├── googlechat/        # Google Chat
│   ├── matrix/            # Matrix
│   ├── zalo/              # Zalo
│   └── ...
│
├── docs/                  # 文档
└── ui/                    # Web UI
```

## 🔌 如何添加新的 IM 平台

### 方式一: 作为核心 Channel(内置)

1. **创建目录结构**
   ```
   src/feishu/
   ├── bot.ts              # Bot 创建和配置
   ├── bot-handlers.ts     # 消息处理
   ├── accounts.ts         # 账号管理
   ├── types.ts            # 类型定义
   └── ...
   ```

2. **实现核心逻辑** (`src/feishu/bot.ts`)
   ```typescript
   export function createFeishuBot(opts: FeishuBotOptions) {
     // 1. 初始化 Feishu SDK
     // 2. 注册消息处理器
     // 3. 处理入站消息
     // 4. 转换为统一格式
     // 5. 路由到 AI 代理
     return bot;
   }
   ```

3. **添加 Channel Plugin** (`src/channels/plugins/onboarding/feishu.ts`)
   ```typescript
   import type { ChannelPlugin } from "../types.js";
   
   export const feishuPlugin: ChannelPlugin = {
     id: "feishu",
     meta: {
       name: "飞书",
       order: 10,
     },
     // 实现必需的接口方法
     async onboard(config, runtime, prompter) { /* ... */ },
     async probe(config) { /* ... */ },
     async send(message, config) { /* ... */ },
     // ...
   };
   ```

4. **注册插件** (`src/channels/plugins/index.ts`)
   ```typescript
   import { feishuPlugin } from "./onboarding/feishu.js";
   
   // 在适当位置注册
   ```

5. **添加配置类型** (`src/config/types.feishu.ts`)
   ```typescript
   export type FeishuConfig = {
     appId: string;
     appSecret: string;
     allowFrom?: string[];
     // ...
   };
   ```

6. **添加到主配置** (`src/config/types.ts`)
   ```typescript
   export type ChannelsConfig = {
     // ... 其他平台
     feishu?: FeishuConfig;
   };
   ```

### 方式二: 作为扩展插件(推荐用于快速开发)

1. **创建扩展目录**
   ```
   extensions/feishu/
   ├── clawdbot.plugin.json   # 插件元数据
   ├── package.json            # 依赖管理
   ├── index.ts                # 插件入口
   └── src/
       ├── channel.ts          # Channel 实现
       ├── runtime.ts          # 运行时逻辑
       └── ...
   ```

2. **定义插件元数据** (`clawdbot.plugin.json`)
   ```json
   {
     "id": "feishu",
     "version": "1.0.0",
     "name": "飞书集成",
     "description": "飞书/Lark IM 平台集成",
     "author": "WukongBot Team",
     "type": "channel"
   }
   ```

3. **实现插件接口** (`index.ts`)
   ```typescript
   import type { PluginApi } from "clawdbot/plugin-sdk";
   
   export default {
     id: "feishu",
     register(api: PluginApi) {
       api.registerChannel({
         id: "feishu",
         meta: { name: "飞书", order: 10 },
         // 实现接口
       });
     },
   };
   ```

4. **参考现有扩展**
   - Microsoft Teams: `extensions/msteams/`
   - Google Chat: `extensions/googlechat/`
   - Matrix: `extensions/matrix/`

## 🤖 如何添加新的大模型提供商

### 1. 创建提供商配置 (`src/agents/models-config.providers.ts`)

```typescript
export async function resolveImplicitDeepSeekProvider(params: {
  agentDir: string;
}): Promise<ProviderConfig | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return null;
  
  return {
    apiKey,
    baseUrl: "https://api.deepseek.com",
    models: [
      { id: "deepseek-chat", name: "DeepSeek Chat" },
      { id: "deepseek-coder", name: "DeepSeek Coder" },
    ],
  };
}
```

### 2. 在 `resolveImplicitProviders` 中注册

```typescript
export async function resolveImplicitProviders(params: {
  agentDir: string;
}): Promise<Record<string, ProviderConfig>> {
  const providers: Record<string, ProviderConfig> = {};
  
  // ... 其他提供商
  
  const deepseek = await resolveImplicitDeepSeekProvider(params);
  if (deepseek) providers["deepseek"] = deepseek;
  
  return providers;
}
```

### 3. 添加 OAuth 支持(可选)

如果模型需要 OAuth 认证,在 `src/providers/` 创建:

```typescript
// src/providers/deepseek-oauth.ts
export async function authenticateDeepSeek(params: {
  clientId: string;
  redirectUri: string;
}): Promise<{ accessToken: string }> {
  // 实现 OAuth 流程
}
```

### 4. 配置模型

用户配置文件 (`~/.clawdbot/wukongbot.json`):

```json5
{
  models: {
    providers: {
      deepseek: {
        apiKey: "sk-xxx",
        baseUrl: "https://api.deepseek.com",
        models: [
          { id: "deepseek-chat", name: "DeepSeek Chat" }
        ]
      }
    }
  },
  agent: {
    model: "deepseek/deepseek-chat"
  }
}
```

## 🔧 关键接口说明

### ChannelPlugin 接口

```typescript
export type ChannelPlugin = {
  id: ChannelId;
  meta: {
    name: string;
    order?: number;
  };
  
  // 引导配置
  onboard(
    config: MoltbotConfig,
    runtime: RuntimeEnv,
    prompter: Prompter
  ): Promise<MoltbotConfig>;
  
  // 探测状态
  probe(config: MoltbotConfig): Promise<ProbeResult>;
  
  // 发送消息
  send(
    message: OutboundMessage,
    config: MoltbotConfig
  ): Promise<void>;
  
  // 启动监控
  monitor?(
    config: MoltbotConfig,
    runtime: RuntimeEnv
  ): Promise<MonitorHandle>;
};
```

### ProviderConfig 接口

```typescript
export type ProviderConfig = {
  apiKey?: string;
  baseUrl?: string;
  models: Array<{
    id: string;
    name?: string;
    contextWindow?: number;
    reasoning?: boolean;
    input?: Array<"text" | "image">;
  }>;
};
```

## 📝 开发流程

### 1. 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/yourusername/wukongbot.git
cd wukongbot

# 安装依赖
pnpm install

# 构建
pnpm build

# 开发模式(自动重载)
pnpm gateway:watch
```

### 2. 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试
pnpm test src/channels/plugins/

# 测试覆盖率
pnpm test:coverage
```

### 3. 代码规范

```bash
# 代码检查
pnpm lint

# 代码格式化
pnpm format
```

### 4. 提交代码

```bash
# 使用提交助手
./scripts/committer "feat: 添加飞书集成" src/feishu/

# 或手动提交
git add .
git commit -m "feat: 添加飞书集成"
```

## 🎯 国产化开发优先级

### 第一阶段: IM 平台集成
1. **飞书** - 企业用户最多,API 文档完善
2. **企业微信** - 企业市场重要平台
3. **钉钉** - 中小企业广泛使用

### 第二阶段: 大模型集成
1. ✅ **DeepSeek** - 已支持,性价比高
2. ✅ **千问(Qwen)** - 已支持,阿里云生态
3. ✅ **Kimi** - 已支持,长上下文强
4. ✅ **豆包** - 已支持,字节跳动
5. ✅ **硅基流动** - 已支持,模型聚合平台
6. **智谱(GLM)** - 待支持
7. **百川** - 待支持

### 第三阶段: 简化安装
1. 一键安装脚本
2. Docker 镜像
3. Web 管理界面
4. 中文文档完善

## 📚 参考资源

### IM 平台 API 文档
- [飞书开放平台](https://open.feishu.cn/document)
- [企业微信 API](https://developer.work.weixin.qq.com/)
- [钉钉开放平台](https://open.dingtalk.com/)

### 大模型 API 文档
- [DeepSeek API](https://platform.deepseek.com/docs)
- [千问 API](https://help.aliyun.com/zh/dashscope/)
- [Kimi API](https://platform.moonshot.cn/docs)
- [豆包 API](https://www.volcengine.com/docs/82379)
- [硅基流动](https://docs.siliconflow.cn/)

### 现有代码参考
- Telegram: `src/telegram/bot.ts`
- Discord: `src/discord/`
- Teams: `extensions/msteams/`
- Model Config: `src/agents/models-config.ts`

## 🤝 贡献指南

详见 [CONTRIBUTING.md](CONTRIBUTING.md)

欢迎提交 Issue 和 Pull Request!
