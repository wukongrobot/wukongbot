/**
 * 钉钉集成类型定义
 */

export type DingTalkConfig = {
  /** 应用 AppKey */
  appKey: string;
  /** 应用 AppSecret */
  appSecret: string;
  /** 机器人 Webhook 地址 (可选,用于群机器人) */
  webhookUrl?: string;
  /** 机器人签名密钥 (可选,用于群机器人) */
  webhookSecret?: string;
  /** 消息接收服务器配置 */
  server?: {
    /** Token */
    token?: string;
    /** AES Key */
    aesKey?: string;
    /** Webhook 监听端口 */
    port?: number;
    /** Webhook 路径 */
    path?: string;
  };
  /** 允许交互的用户列表 */
  allowFrom?: string[];
  /** 群组配置 */
  groups?: Record<
    string,
    {
      /** 是否需要 @ 机器人 */
      requireMention?: boolean;
      [key: string]: unknown;
    }
  >;
  /** 网络配置 */
  network?: {
    timeoutSeconds?: number;
    proxy?: string;
  };
  /** 媒体文件大小限制(MB) */
  mediaMaxMb?: number;
};

export type DingTalkMessage = {
  /** 消息类型 */
  msgtype: "text" | "markdown" | "image" | "file" | "link";
  /** 消息 ID */
  msgId?: string;
  /** 发送者用户 ID */
  senderId: string;
  /** 发送者昵称 */
  senderNick?: string;
  /** 会话 ID */
  conversationId: string;
  /** 会话类型 */
  conversationType: "1" | "2"; // 1:单聊 2:群聊
  /** 消息内容 */
  content: {
    text?: string;
    title?: string;
    markdown?: string;
    picURL?: string;
    downloadCode?: string;
    [key: string]: unknown;
  };
  /** 创建时间 */
  createAt: number;
  /** 是否被 @ */
  isAtMe?: boolean;
};

export type DingTalkSendMessageParams = {
  /** 接收者用户 ID (多个用逗号分隔) */
  userIds?: string;
  /** 接收者部门 ID (多个用逗号分隔) */
  deptIds?: string;
  /** 是否发送给所有人 */
  toAllUser?: boolean;
  /** 消息类型 */
  msgType: "text" | "markdown" | "link" | "action_card";
  /** 消息内容 */
  msg: Record<string, unknown>;
};

export type DingTalkAccessTokenResponse = {
  errcode: number;
  errmsg: string;
  access_token?: string;
  expires_in?: number;
};

export type DingTalkUploadResult = {
  mediaId: string;
  type: string;
};

export type DingTalkWebhookEvent = {
  /** 加密消息 */
  encrypt?: string;
  /** 时间戳 */
  timestamp?: string;
  /** 随机字符串 */
  nonce?: string;
  /** 签名 */
  signature?: string;
  /** 消息类型 */
  msgtype?: string;
  /** 消息内容 */
  text?: {
    content: string;
  };
  /** 发送者 */
  senderId?: string;
  /** 会话 ID */
  conversationId?: string;
  [key: string]: unknown;
};
