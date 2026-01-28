# 企业微信集成插件

企业微信(WeCom/WeChat Work) IM 平台集成插件。

## 功能特性

- ✅ 文本消息收发
- ✅ 图片上传和发送
- ✅ 文件上传和发送
- ✅ 用户白名单
- ⏳ Webhook 事件订阅(开发中)
- ⏳ 群组消息支持(开发中)

## 快速开始

### 1. 创建企业微信应用

1. 访问 [企业微信管理后台](https://work.weixin.qq.com/)
2. 进入「应用管理」->「自建」创建应用
3. 获取:
   - **Corp ID** (企业 ID)
   - **Agent ID** (应用 ID)
   - **Secret** (应用 Secret)
4. 配置可信 IP
5. 配置接收消息服务器(可选)

### 2. 配置 WukongBot

```bash
wukongbot channels onboard wecom
```

或手动配置:

```json
{
  "channels": {
    "wecom": {
      "corpId": "ww123456",
      "agentId": 1000001,
      "secret": "your_secret",
      "allowFrom": ["*"]
    }
  }
}
```

### 3. 测试连接

```bash
wukongbot channels status wecom --probe
wukongbot message send --channel wecom --to "UserID" --message "测试消息"
```

## 配置说明

| 字段         | 类型   | 必填 | 说明                                 |
| ------------ | ------ | ---- | ------------------------------------ |
| `corpId`     | string | 是   | 企业 ID                              |
| `agentId`    | number | 是   | 应用 ID                              |
| `secret`     | string | 是   | 应用 Secret                          |
| `allowFrom`  | array  | 否   | 用户白名单,`["*"]` 表示所有用户      |
| `mediaMaxMb` | number | 否   | 媒体文件大小限制(MB)                 |

## API 使用

```typescript
import { WeComClient } from "clawdbot-plugin-wecom";

const client = new WeComClient({
  corpId: "ww123456",
  agentId: 1000001,
  secret: "your_secret",
});

// 发送文本消息
await client.sendText({
  toUser: "UserID",
  text: "你好!",
});

// 上传并发送图片
const { mediaId } = await client.uploadMedia({
  type: "image",
  buffer: imageBuffer,
  fileName: "image.png",
});

await client.sendImage({
  toUser: "UserID",
  mediaId,
});
```

## 参考资源

- [企业微信 API 文档](https://developer.work.weixin.qq.com/)
- [消息发送指南](https://developer.work.weixin.qq.com/document/path/90236)

## 许可证

MIT
