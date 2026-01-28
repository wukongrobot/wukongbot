/**
 * 企业微信集成类型定义
 */

export type WeComConfig = {
  /** 企业 ID */
  corpId: string;
  /** 应用 ID */
  agentId: number | string;
  /** 应用 Secret */
  secret: string;
  /** 接收消息服务器配置 */
  server?: {
    /** Token */
    token?: string;
    /** EncodingAESKey */
    encodingAESKey?: string;
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

export type WeComMessage = {
  /** 消息类型 */
  msgType: "text" | "image" | "voice" | "video" | "file" | "news";
  /** 消息 ID */
  msgId: string;
  /** 发送者用户 ID */
  fromUserId: string;
  /** 接收者 */
  toUserId?: string;
  /** 群聊 ID */
  chatId?: string;
  /** 消息内容 */
  content: string | Record<string, unknown>;
  /** 媒体 ID */
  mediaId?: string;
  /** 创建时间 */
  createTime: number;
  /** 应用 ID */
  agentId?: number;
};

export type WeComSendMessageParams = {
  /** 接收者类型 */
  toType: "user" | "party" | "tag";
  /** 接收者 ID (多个用 | 分隔) */
  toIds: string;
  /** 消息类型 */
  msgType: "text" | "image" | "voice" | "video" | "file" | "textcard" | "news";
  /** 应用 ID */
  agentId: number | string;
  /** 消息内容 */
  content: Record<string, unknown>;
  /** 是否安全模式 */
  safe?: number;
};

export type WeComAccessTokenResponse = {
  access_token: string;
  expires_in: number;
};

export type WeComUploadResult = {
  mediaId: string;
  type: string;
  createdAt: number;
};

export type WeComWebhookEvent = {
  /** 接收的 XML 消息 */
  xml: {
    /** 消息类型 */
    MsgType: string[];
    /** 发送者 */
    FromUserName: string[];
    /** 接收者 */
    ToUserName: string[];
    /** 消息 ID */
    MsgId?: string[];
    /** 创建时间 */
    CreateTime: string[];
    /** 内容 */
    Content?: string[];
    /** 媒体 ID */
    MediaId?: string[];
    /** 应用 ID */
    AgentID?: string[];
    /** 事件 */
    Event?: string[];
    [key: string]: unknown;
  };
};
