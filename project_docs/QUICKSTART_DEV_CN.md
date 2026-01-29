# 🚀 悟空Bot 开发快速入门

## 📋 前置要求

- **Node.js**: ≥22 (推荐使用 nvm 管理版本)
- **pnpm**: ≥8 (推荐的包管理器)
- **Git**: 用于版本控制
- **编辑器**: VS Code (推荐) + 插件:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features

## 🏁 快速开始

### 1. 克隆和设置

```bash
# 克隆仓库
git clone https://github.com/yourusername/wukongbot.git
cd wukongbot

# 安装 pnpm (如果还没安装)
npm install -g pnpm

# 安装依赖
pnpm install

# 构建项目
pnpm build

# 构建 Web UI
pnpm ui:build
```

### 2. 开发环境配置

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件,添加必要的配置
# 例如: DEEPSEEK_API_KEY=sk-xxx
```

### 3. 运行开发服务器

```bash
# 启动 Gateway (开发模式,自动重载)
pnpm gateway:watch

# 在另一个终端,启动 Web UI (可选)
cd ui
pnpm dev
```

### 4. 测试安装

```bash
# 在另一个终端
pnpm wukongbot --help

# 测试配置
pnpm wukongbot config list

# 测试代理(使用 DeepSeek 或其他已配置的模型)
pnpm wukongbot agent --message "你好,悟空!" --thinking low
```

## 🔧 开发常用命令

### 构建和测试

```bash
# 完整构建
pnpm build

# 类型检查
pnpm type-check

# 代码检查
pnpm lint

# 自动修复
pnpm lint:fix

# 代码格式化
pnpm format

# 运行测试
pnpm test

# 运行特定测试
pnpm test src/agents/

# 测试覆盖率
pnpm test:coverage

# 监视模式测试
pnpm test:watch
```

### 开发服务器

```bash
# Gateway 开发模式
pnpm gateway:watch

# Web UI 开发模式
cd ui && pnpm dev

# 完整开发环境
pnpm dev  # 同时启动 Gateway 和 UI
```

## 📝 开发一个新的 IM 平台集成(以飞书为例)

### 步骤 1: 创建插件结构

```bash
# 创建扩展目录
mkdir -p extensions/feishu/src

# 创建必要文件
touch extensions/feishu/clawdbot.plugin.json
touch extensions/feishu/package.json
touch extensions/feishu/index.ts
touch extensions/feishu/src/channel.ts
touch extensions/feishu/src/runtime.ts
touch extensions/feishu/src/sdk.ts
touch extensions/feishu/src/types.ts
```

### 步骤 2: 定义插件元数据

**`extensions/feishu/clawdbot.plugin.json`**:
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

### 步骤 3: 创建 package.json

**`extensions/feishu/package.json`**:
```json
{
  "name": "clawdbot-plugin-feishu",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@larksuiteoapi/node-sdk": "^1.0.0"
  },
  "devDependencies": {
    "clawdbot": "workspace:*",
    "typescript": "^5.0.0"
  }
}
```

### 步骤 4: 实现类型定义

**`extensions/feishu/src/types.ts`**:
```typescript
export type FeishuConfig = {
  appId: string;
  appSecret: string;
  encryptKey?: string;
  verificationToken?: string;
  allowFrom?: string[];
  groups?: Record<string, {
    requireMention?: boolean;
  }>;
};

export type FeishuMessage = {
  msgType: "text" | "image" | "file";
  chatId: string;
  content: string;
  sender: {
    id: string;
    name?: string;
  };
};
```

### 步骤 5: 封装 SDK

**`extensions/feishu/src/sdk.ts`**:
```typescript
import * as lark from "@larksuiteoapi/node-sdk";
import type { FeishuConfig } from "./types.js";

export class FeishuClient {
  private client: lark.Client;

  constructor(config: FeishuConfig) {
    this.client = new lark.Client({
      appId: config.appId,
      appSecret: config.appSecret,
    });
  }

  async sendMessage(params: {
    chatId: string;
    msgType: "text" | "image";
    content: string;
  }): Promise<void> {
    await this.client.im.message.create({
      receive_id_type: "chat_id",
      receive_id: params.chatId,
      msg_type: params.msgType,
      content: JSON.stringify({
        text: params.content,
      }),
    });
  }

  async uploadFile(file: Buffer): Promise<string> {
    // 实现文件上传
    throw new Error("Not implemented");
  }
}
```

### 步骤 6: 实现 Channel 插件

**`extensions/feishu/src/channel.ts`**:
```typescript
import type { ChannelPlugin } from "clawdbot/plugin-sdk";
import { FeishuClient } from "./sdk.js";
import type { FeishuConfig } from "./types.js";

export function createFeishuChannelPlugin(): ChannelPlugin {
  return {
    id: "feishu",
    meta: {
      name: "飞书",
      order: 10,
    },

    async onboard(config, runtime, prompter) {
      // 引导用户配置
      const appId = await prompter.text({
        message: "请输入飞书应用 App ID:",
      });

      const appSecret = await prompter.password({
        message: "请输入飞书应用 App Secret:",
      });

      return {
        ...config,
        channels: {
          ...config.channels,
          feishu: {
            appId,
            appSecret,
            allowFrom: ["*"],
          },
        },
      };
    },

    async probe(config) {
      const feishuConfig = config.channels?.feishu as FeishuConfig | undefined;
      if (!feishuConfig?.appId || !feishuConfig?.appSecret) {
        return {
          status: "not-configured",
          message: "飞书未配置",
        };
      }

      try {
        const client = new FeishuClient(feishuConfig);
        // 测试连接
        return {
          status: "healthy",
          message: "飞书连接正常",
        };
      } catch (error) {
        return {
          status: "error",
          message: `飞书连接失败: ${error}`,
        };
      }
    },

    async send(message, config) {
      const feishuConfig = config.channels?.feishu as FeishuConfig;
      const client = new FeishuClient(feishuConfig);

      await client.sendMessage({
        chatId: message.to,
        msgType: "text",
        content: message.text || "",
      });
    },

    async monitor(config, runtime) {
      // 实现消息监控 (Webhook 或长轮询)
      return {
        stop: async () => {
          // 清理资源
        },
      };
    },
  };
}
```

### 步骤 7: 创建插件入口

**`extensions/feishu/index.ts`**:
```typescript
import type { PluginApi } from "clawdbot/plugin-sdk";
import { createFeishuChannelPlugin } from "./src/channel.js";

export default {
  id: "feishu",
  register(api: PluginApi) {
    api.registerChannel(createFeishuChannelPlugin());
  },
};
```

### 步骤 8: 安装依赖

```bash
cd extensions/feishu
pnpm install
cd ../..
```

### 步骤 9: 测试插件

```bash
# 重新构建
pnpm build

# 测试插件加载
pnpm wukongbot plugins list

# 测试配置引导
pnpm wukongbot channels onboard feishu

# 测试连接
pnpm wukongbot channels status feishu --probe

# 测试发送消息
pnpm wukongbot message send --channel feishu --to "chat_id_xxx" --message "测试消息"
```

### 步骤 10: 编写测试

**`extensions/feishu/src/channel.test.ts`**:
```typescript
import { describe, it, expect, vi } from "vitest";
import { createFeishuChannelPlugin } from "./channel.js";

describe("Feishu Channel Plugin", () => {
  it("should create plugin with correct id", () => {
    const plugin = createFeishuChannelPlugin();
    expect(plugin.id).toBe("feishu");
  });

  it("should onboard with valid credentials", async () => {
    const plugin = createFeishuChannelPlugin();
    const config = {};
    const runtime = { log: console.log };
    const prompter = {
      text: vi.fn().mockResolvedValue("test-app-id"),
      password: vi.fn().mockResolvedValue("test-secret"),
    };

    const result = await plugin.onboard(config, runtime, prompter);
    
    expect(result.channels?.feishu).toBeDefined();
    expect(result.channels?.feishu?.appId).toBe("test-app-id");
  });

  // 更多测试...
});
```

运行测试:
```bash
pnpm test extensions/feishu/
```

## 🔍 调试技巧

### 1. 查看日志

```bash
# Gateway 日志
tail -f ~/.wukongbot/logs/gateway.log

# 频道日志
tail -f ~/.wukongbot/logs/channels.log
```

### 2. 使用调试器

**VS Code `launch.json`**:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Gateway",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["gateway:watch"],
      "console": "integratedTerminal"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["test", "--run", "${file}"],
      "console": "integratedTerminal"
    }
  ]
}
```

### 3. 查看配置

```bash
# 显示当前配置
pnpm wukongbot config show

# 验证配置
pnpm wukongbot config validate

# 运行诊断
pnpm wukongbot doctor
```

## 📚 参考资源

### 代码参考
- Telegram 实现: `src/telegram/bot.ts`
- Discord 实现: `src/discord/`
- Teams 扩展: `extensions/msteams/`
- 模型配置: `src/agents/models-config.ts`

### 文档
- [架构文档](ARCHITECTURE_CN.md)
- [任务清单](TODO_CN.md)
- [贡献指南](CONTRIBUTING.md)

### 外部资源
- [飞书开放平台](https://open.feishu.cn/)
- [Pi Coding Agent](https://github.com/badlogic/pi-mono)
- [TypeScript 文档](https://www.typescriptlang.org/)

## 🐛 常见问题

### Q: pnpm install 失败怎么办?

A: 尝试:
```bash
# 清理缓存
pnpm store prune

# 删除 node_modules
rm -rf node_modules
rm -rf ui/node_modules
rm -rf extensions/*/node_modules

# 重新安装
pnpm install
```

### Q: 测试失败怎么办?

A: 检查:
1. 是否运行了 `pnpm build`
2. 是否设置了必要的环境变量
3. 查看详细错误日志

### Q: 如何添加新的依赖?

A:
```bash
# 根项目依赖
pnpm add <package-name>

# 扩展插件依赖
cd extensions/your-plugin
pnpm add <package-name>
```

### Q: 如何重置开发环境?

A:
```bash
# 清理所有构建产物
pnpm clean

# 重新构建
pnpm build

# 重启 Gateway
pnpm wukongbot gateway restart
```

## 🎉 下一步

1. 查看 [TODO_CN.md](TODO_CN.md) 认领任务
2. 阅读 [ARCHITECTURE_CN.md](ARCHITECTURE_CN.md) 了解架构
3. 参考现有代码实现你的功能
4. 编写测试确保质量
5. 提交 PR 等待 Review

祝你开发愉快! 🚀
