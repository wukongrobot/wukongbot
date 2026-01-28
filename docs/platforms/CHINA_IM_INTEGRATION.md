# 国产 IM 平台集成指南

本文档介绍如何接入飞书、企业微信和钉钉三大国产 IM 平台。

## 📋 已实现的平台

| 平台     | 状态 | 基础消息 | 图片/文件 | 群组支持 | Webhook |
| -------- | ---- | -------- | --------- | -------- | ------- |
| 飞书     | ✅   | ✅       | ✅        | ✅       | ✅      |
| 企业微信 | ✅   | ✅       | ✅        | ⏳       | ⏳      |
| 钉钉     | ✅   | ✅       | ✅        | ⏳       | ✅      |

## 🚀 快速开始

### 方式一: 使用向导(推荐)

```bash
# 飞书
wukongbot channels onboard feishu

# 企业微信
wukongbot channels onboard wecom

# 钉钉
wukongbot channels onboard dingtalk
```

### 方式二: 手动配置

编辑 `~/.wukongbot/wukongbot.json`:

```json
{
  "channels": {
    "feishu": {
      "appId": "cli_xxxxx",
      "appSecret": "your_secret",
      "verificationToken": "verification_token",
      "webhookPort": 3000,
      "webhookPath": "/webhook/feishu",
      "allowFrom": ["*"]
    },
    "wecom": {
      "corpId": "ww123456",
      "agentId": 1000001,
      "secret": "your_secret",
      "allowFrom": ["*"]
    },
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

## 📱 平台详细配置

### 1. 飞书 (Feishu/Lark)

#### 创建应用

1. 访问 [飞书开放平台](https://open.feishu.cn/app)
2. 创建"企业自建应用"
3. 获取 **App ID** 和 **App Secret**

#### 配置权限

在"权限管理"中添加:
- ✅ 获取与发送单聊消息
- ✅ 获取与发送群组消息
- ✅ 获取用户基本信息
- ✅ 上传图片或文件

#### 配置事件订阅

1. 进入"事件订阅"
2. 请求地址: `http://your-server:3000/webhook/feishu`
3. 订阅事件:
   - `im.message.receive_v1` - 接收消息
4. 保存配置并验证 URL

#### 发布版本

1. 创建版本
2. 申请发布
3. 启用应用

#### 使用示例

```bash
# 测试连接
wukongbot channels status feishu --probe

# 发送消息
wukongbot message send \
  --channel feishu \
  --to "oc_xxxxx" \
  --message "你好,这是来自悟空Bot的消息!"

# 启动 Gateway
wukongbot gateway --port 18789
```

#### 故障排查

**问题: Webhook 验证失败**
- 检查 verificationToken 是否正确
- 确认 Webhook 服务器可以从外网访问
- 查看日志: `tail -f ~/.wukongbot/logs/feishu.log`

**问题: 无法发送消息**
- 确认应用已发布并启用
- 检查 chat_id 是否正确
- 验证应用权限是否配置完整

---

### 2. 企业微信 (WeCom)

#### 创建应用

1. 访问 [企业微信管理后台](https://work.weixin.qq.com/)
2. 进入"应用管理" -> "自建"
3. 创建应用并获取:
   - **Corp ID** (企业 ID)
   - **Agent ID** (应用 ID)
   - **Secret** (应用 Secret)

#### 配置权限

- ✅ 发送消息到企业
- ✅ 上传临时素材
- ✅ 获取成员信息

#### 配置接收消息

1. 在应用详情中找到"接收消息"
2. 配置 URL 和 Token
3. 保存配置

#### 使用示例

```bash
# 测试连接
wukongbot channels status wecom --probe

# 发送消息
wukongbot message send \
  --channel wecom \
  --to "UserID" \
  --message "你好,这是来自悟空Bot的消息!"
```

#### 故障排查

**问题: 获取 access_token 失败**
- 检查 corpId 和 secret 是否正确
- 确认 IP 在可信 IP 列表中

**问题: 发送消息失败**
- 确认用户 ID 正确
- 检查应用是否对用户可见
- 验证 agentId 是否正确

---

### 3. 钉钉 (DingTalk)

#### 创建应用

1. 访问 [钉钉开放平台](https://open.dingtalk.com/)
2. 创建"企业内部应用"
3. 获取:
   - **AppKey**
   - **AppSecret**

#### 配置权限

- ✅ 企业员工信息读权限
- ✅ 消息通知
- ✅ 上传媒体文件

#### 配置群机器人(可选)

1. 在群聊中添加"自定义机器人"
2. 选择"加签"方式
3. 获取:
   - **Webhook URL**
   - **加签密钥 (Secret)**

#### 使用示例

```bash
# 测试连接
wukongbot channels status dingtalk --probe

# 发送消息
wukongbot message send \
  --channel dingtalk \
  --to "UserID" \
  --message "你好,这是来自悟空Bot的消息!"
```

#### 故障排查

**问题: 获取 access_token 失败**
- 检查 appKey 和 appSecret 是否正确
- 确认应用已启用

**问题: 群机器人消息发送失败**
- 检查 Webhook URL 是否正确
- 验证加签密钥配置
- 确认机器人未被禁用

---

## 🔒 安全配置

### 用户白名单

默认情况下,所有用户都可以与机器人交互。如果需要限制,可以配置白名单:

```json
{
  "channels": {
    "feishu": {
      "allowFrom": ["user_id_1", "user_id_2"]
    },
    "wecom": {
      "allowFrom": ["UserID1", "UserID2"]
    },
    "dingtalk": {
      "allowFrom": ["UserID1", "UserID2"]
    }
  }
}
```

### 群组 @ 过滤

在群聊中,可以要求用户必须 @ 机器人才会响应:

```json
{
  "channels": {
    "feishu": {
      "groups": {
        "oc_xxxxx": {
          "requireMention": true
        }
      }
    }
  }
}
```

## 📊 管理和监控

### 查看状态

```bash
# 查看所有频道状态
wukongbot channels status --all

# 查看特定频道状态并探测连接
wukongbot channels status feishu --probe
wukongbot channels status wecom --probe
wukongbot channels status dingtalk --probe
```

### 查看日志

```bash
# 飞书日志
tail -f ~/.wukongbot/logs/feishu.log

# 企业微信日志
tail -f ~/.wukongbot/logs/wecom.log

# 钉钉日志
tail -f ~/.wukongbot/logs/dingtalk.log

# Gateway 日志
tail -f ~/.wukongbot/logs/gateway.log
```

### 诊断问题

```bash
# 运行诊断
wukongbot doctor

# 查看配置
wukongbot config show
```

## 🔌 API 使用

### TypeScript 示例

```typescript
import { FeishuClient } from "clawdbot-plugin-feishu";
import { WeComClient } from "clawdbot-plugin-wecom";
import { DingTalkClient } from "clawdbot-plugin-dingtalk";

// 飞书
const feishuClient = new FeishuClient({
  appId: "cli_xxxxx",
  appSecret: "your_secret",
});

await feishuClient.sendText({
  chatId: "oc_xxxxx",
  text: "你好!",
});

// 企业微信
const wecomClient = new WeComClient({
  corpId: "ww123456",
  agentId: 1000001,
  secret: "your_secret",
});

await wecomClient.sendText({
  toUser: "UserID",
  text: "你好!",
});

// 钉钉
const dingtalkClient = new DingTalkClient({
  appKey: "dingxxxxx",
  appSecret: "your_secret",
});

await dingtalkClient.sendText({
  userId: "UserID",
  text: "你好!",
});
```

## 🌐 网络配置

### 内网穿透

如果在本地开发,需要使用内网穿透工具让外网可以访问 Webhook:

#### 使用 ngrok

```bash
ngrok http 3000
```

然后将 ngrok 提供的 URL 配置到各平台的 Webhook 地址。

#### 使用 frp

```ini
# frpc.ini
[common]
server_addr = your_server
server_port = 7000

[webhook]
type = http
local_port = 3000
custom_domains = your_domain.com
```

```bash
frpc -c frpc.ini
```

### 代理配置

如果需要通过代理访问平台 API:

```json
{
  "channels": {
    "feishu": {
      "network": {
        "proxy": "http://proxy.example.com:8080",
        "timeoutSeconds": 30
      }
    }
  }
}
```

## 📚 更多资源

### 官方文档

- [飞书开放平台文档](https://open.feishu.cn/document)
- [企业微信 API 文档](https://developer.work.weixin.qq.com/)
- [钉钉开放平台文档](https://open.dingtalk.com/document)

### WukongBot 文档

- [架构文档](../../ARCHITECTURE_CN.md)
- [快速入门](../../QUICKSTART_DEV_CN.md)
- [贡献指南](../../CONTRIBUTING.md)

### 插件源码

- [飞书插件](../../extensions/feishu/)
- [企业微信插件](../../extensions/wecom/)
- [钉钉插件](../../extensions/dingtalk/)

## 🤝 获取帮助

遇到问题?

1. 查看 [故障排查](#故障排查) 章节
2. 查看日志文件
3. 在 [GitHub Issues](https://github.com/yourusername/wukongbot/issues) 提问
4. 加入交流群(待建立)

## 📝 许可证

MIT License - 详见 [LICENSE](../../LICENSE)
