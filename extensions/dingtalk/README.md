# 钉钉集成插件

钉钉(DingTalk) IM 平台集成插件。

## 功能特性

- ✅ 文本消息发送
- ✅ Markdown 消息发送
- ✅ 媒体文件上传
- ✅ 群机器人 Webhook
- ✅ 用户信息查询
- ⏳ 消息接收(开发中)
- ⏳ 群组消息支持(开发中)

## 快速开始

### 1. 创建钉钉应用

1. 访问 [钉钉开放平台](https://open.dingtalk.com/)
2. 创建企业内部应用
3. 获取:
   - **AppKey**
   - **AppSecret**
4. 配置权限:
   - 企业员工信息读权限
   - 消息通知
5. (可选) 创建群机器人并获取 Webhook URL

### 2. 配置 WukongBot

```bash
wukongbot channels onboard dingtalk
```

或手动配置:

```json
{
  "channels": {
    "dingtalk": {
      "appKey": "dingxxxxx",
      "appSecret": "your_secret",
      "webhookUrl": "https://oapi.dingtalk.com/robot/send?access_token=xxx",
      "webhookSecret": "SECxxxxxx",
      "allowFrom": ["*"]
    }
  }
}
```

### 3. 测试连接

```bash
wukongbot channels status dingtalk --probe
wukongbot message send --channel dingtalk --to "UserID" --message "测试消息"
```

## 配置说明

| 字段             | 类型   | 必填 | 说明                             |
| ---------------- | ------ | ---- | -------------------------------- |
| `appKey`         | string | 是   | 应用 AppKey                      |
| `appSecret`      | string | 是   | 应用 AppSecret                   |
| `webhookUrl`     | string | 否   | 群机器人 Webhook URL             |
| `webhookSecret`  | string | 否   | 群机器人加签密钥                 |
| `allowFrom`      | array  | 否   | 用户白名单,`["*"]` 表示所有用户  |
| `mediaMaxMb`     | number | 否   | 媒体文件大小限制(MB)             |

## API 使用

### 发送工作通知

```typescript
import { DingTalkClient } from "clawdbot-plugin-dingtalk";

const client = new DingTalkClient({
  appKey: "dingxxxxx",
  appSecret: "your_secret",
});

// 发送文本消息
await client.sendText({
  userId: "UserID",
  text: "你好!",
});

// 发送 Markdown 消息
await client.sendMarkdown({
  userId: "UserID",
  title: "通知",
  text: "## 重要通知\n\n这是一条测试消息",
});
```

### 发送群机器人消息

```typescript
await client.sendWebhookMessage({
  msgType: "text",
  content: {
    content: "这是群机器人消息",
  },
  at: {
    isAtAll: false,
    atUserIds: ["UserID1", "UserID2"],
  },
});
```

### 上传文件

```typescript
const { mediaId } = await client.uploadMedia({
  type: "file",
  buffer: fileBuffer,
  fileName: "document.pdf",
});
```

## 群机器人配置

### 1. 创建群机器人

1. 在钉钉群聊中,点击"群设置" -> "智能群助手" -> "添加机器人"
2. 选择"自定义"机器人
3. 配置机器人名称和头像
4. 选择"加签"方式(推荐)
5. 获取 Webhook URL 和加签密钥

### 2. 配置到 WukongBot

```json
{
  "channels": {
    "dingtalk": {
      "webhookUrl": "https://oapi.dingtalk.com/robot/send?access_token=xxx",
      "webhookSecret": "SECxxxxxx"
    }
  }
}
```

## 故障排查

### 连接失败

1. 检查 AppKey 和 AppSecret 是否正确
2. 确认应用已启用
3. 查看日志: `tail -f ~/.wukongbot/logs/dingtalk.log`

### Webhook 消息发送失败

1. 检查 Webhook URL 是否正确
2. 验证加签密钥配置
3. 确认群机器人未被禁用
4. 查看钉钉开放平台的错误日志

## 参考资源

- [钉钉开放平台文档](https://open.dingtalk.com/document)
- [服务端 API](https://open.dingtalk.com/document/orgapp/server-api-overview)
- [群机器人指南](https://open.dingtalk.com/document/robots/custom-robot-access)

## 许可证

MIT
