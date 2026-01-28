# 飞书集成插件

飞书(Feishu/Lark) IM 平台集成插件,支持消息收发、文件传输、群组管理等功能。

## 功能特性

- ✅ 文本消息收发
- ✅ 图片上传和发送
- ✅ 文件上传和发送
- ✅ 群组消息支持
- ✅ @ 提及支持
- ✅ Webhook 事件订阅
- ✅ 用户白名单
- ✅ 群组 @ 过滤

## 快速开始

### 1. 创建飞书应用

1. 访问 [飞书开放平台](https://open.feishu.cn/app)
2. 创建企业自建应用
3. 获取 **App ID** 和 **App Secret**
4. 在"事件订阅"中配置 Webhook URL
5. 添加权限:
   - 获取与发送单聊消息
   - 获取与发送群组消息
   - 获取用户基本信息
6. 发布版本并启用应用

### 2. 配置 WukongBot

使用配置向导:

```bash
wukongbot channels onboard feishu
```

或手动配置 `~/.wukongbot/wukongbot.json`:

```json
{
  "channels": {
    "feishu": {
      "appId": "cli_xxxxx",
      "appSecret": "your_app_secret",
      "verificationToken": "your_verification_token",
      "webhookPort": 3000,
      "webhookPath": "/webhook/feishu",
      "allowFrom": ["*"]
    }
  }
}
```

### 3. 测试连接

```bash
# 检查状态
wukongbot channels status feishu --probe

# 发送测试消息
wukongbot message send --channel feishu --to "chat_id" --message "测试消息"
```

## 配置说明

### 基础配置

| 字段                 | 类型   | 必填 | 说明                         |
| -------------------- | ------ | ---- | ---------------------------- |
| `appId`              | string | 是   | 飞书应用 App ID              |
| `appSecret`          | string | 是   | 飞书应用 App Secret          |
| `verificationToken`  | string | 否   | 验证 Token(用于 Webhook 验证)|
| `encryptKey`         | string | 否   | 加密密钥(用于消息加密)       |
| `webhookPort`        | number | 否   | Webhook 监听端口(默认 3000)  |
| `webhookPath`        | string | 否   | Webhook 路径(默认 /webhook/feishu) |
| `allowFrom`          | array  | 否   | 用户白名单,`["*"]` 表示所有用户 |
| `mediaMaxMb`         | number | 否   | 媒体文件大小限制(MB)         |

### 群组配置

```json
{
  "channels": {
    "feishu": {
      "groups": {
        "chat_xxxxx": {
          "requireMention": true
        }
      }
    }
  }
}
```

- `requireMention`: 是否需要 @ 机器人才响应消息

## Webhook 配置

### 1. 配置事件订阅

在飞书开放平台的应用管理页面:

1. 进入"事件订阅"
2. 请求地址配置: `http://your-server:3000/webhook/feishu`
3. 订阅事件:
   - `im.message.receive_v1` - 接收消息

### 2. 验证 URL

飞书会发送验证请求,插件会自动处理并返回 challenge。

### 3. 内网穿透

如果在本地开发,可以使用内网穿透工具:

- [ngrok](https://ngrok.com/)
- [frp](https://github.com/fatedier/frp)
- [localtunnel](https://localtunnel.github.io/www/)

示例(使用 ngrok):

```bash
ngrok http 3000
```

然后使用 ngrok 提供的 URL 配置到飞书开放平台。

## API 使用

### 发送文本消息

```typescript
import { FeishuClient } from "clawdbot-plugin-feishu";

const client = new FeishuClient({
  appId: "cli_xxxxx",
  appSecret: "your_secret",
});

await client.sendText({
  chatId: "oc_xxxxx",
  text: "你好,这是一条测试消息!",
});
```

### 发送图片

```typescript
import fs from "node:fs";

const imageBuffer = fs.readFileSync("./image.png");

// 上传图片
const { fileKey } = await client.uploadImage({
  imageBuffer,
  fileName: "image.png",
});

// 发送图片消息
await client.sendImage({
  chatId: "oc_xxxxx",
  imageKey: fileKey,
});
```

### 发送文件

```typescript
const fileBuffer = fs.readFileSync("./document.pdf");

const { fileKey } = await client.uploadFile({
  fileBuffer,
  fileName: "document.pdf",
  fileType: "pdf",
});

await client.sendFile({
  chatId: "oc_xxxxx",
  fileKey,
});
```

## 故障排查

### 连接失败

1. 检查 App ID 和 App Secret 是否正确
2. 确认应用已发布并启用
3. 查看日志: `tail -f ~/.wukongbot/logs/feishu.log`

### Webhook 无响应

1. 确认 Webhook 服务器正在运行
2. 检查防火墙和端口配置
3. 验证 URL 是否可以从外网访问
4. 查看飞书开放平台的"日志"页面

### 消息无法发送

1. 确认应用有相应的消息权限
2. 检查 chat_id 是否正确
3. 查看错误日志

## 开发

### 本地开发

```bash
cd extensions/feishu
pnpm install
pnpm build
```

### 运行测试

```bash
pnpm test
```

## 参考资源

- [飞书开放平台文档](https://open.feishu.cn/document)
- [飞书 Node.js SDK](https://github.com/larksuite/node-sdk)
- [事件订阅指南](https://open.feishu.cn/document/ukTMukTMukTM/uUTNz4SN1MjL1UzM)

## 许可证

MIT
