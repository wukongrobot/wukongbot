/**
 * 飞书集成类型定义
 */

export type FeishuConfig = {
  /** 飞书应用 App ID */
  appId: string;
  /** 飞书应用 App Secret */
  appSecret: string;
  /** 加密密钥 (可选,用于消息加密) */
  encryptKey?: string;
  /** 验证 Token (可选,用于事件订阅验证) */
  verificationToken?: string;
  /** Webhook 监听端口 */
  webhookPort?: number;
  /** Webhook 路径 */
  webhookPath?: string;
  /** 允许交互的用户列表 (为 "*" 则允许所有用户) */
  allowFrom?: string[];
  /** 群组配置 */
  groups?: Record<
    string,
    {
      /** 是否需要 @ 机器人 */
      requireMention?: boolean;
      /** 自定义配置 */
      [key: string]: unknown;
    }
  >;
  /** 网络配置 */
  network?: {
    /** 超时时间(秒) */
    timeoutSeconds?: number;
    /** 代理设置 */
    proxy?: string;
  };
  /** 媒体文件大小限制(MB) */
  mediaMaxMb?: number;
};

export type FeishuMessage = {
  /** 消息类型 */
  msgType: "text" | "image" | "file" | "post" | "interactive";
  /** 会话 ID */
  chatId: string;
  /** 消息内容 */
  content: string | Record<string, unknown>;
  /** 发送者信息 */
  sender: {
    /** 用户 ID */
    id: string;
    /** 用户名称 */
    name?: string;
    /** 用户类型 */
    type?: "user" | "bot";
  };
  /** 消息 ID */
  messageId?: string;
  /** 父消息 ID (用于回复) */
  parentId?: string;
  /** 提及的用户 */
  mentions?: Array<{
    id: string;
    name?: string;
  }>;
  /** 时间戳 */
  timestamp?: number;
};

export type FeishuWebhookEvent = {
  /** 事件类型 */
  type: "url_verification" | "event_callback";
  /** 事件内容 */
  event?: {
    type: string;
    message?: FeishuMessage;
    [key: string]: unknown;
  };
  /** 验证 token */
  token?: string;
  /** 挑战码 (url_verification 用) */
  challenge?: string;
};

export type FeishuSendMessageParams = {
  /** 接收者 ID */
  receiveId: string;
  /** 接收者 ID 类型 */
  receiveIdType?: "open_id" | "user_id" | "union_id" | "email" | "chat_id";
  /** 消息类型 */
  msgType: "text" | "image" | "file" | "post" | "interactive";
  /** 消息内容 */
  content: string | Record<string, unknown>;
  /** 回复的消息 ID */
  replyTo?: string;
};

export type FeishuUploadResult = {
  /** 文件 key */
  fileKey: string;
  /** 文件名 */
  fileName?: string;
  /** 文件大小 */
  fileSize?: number;
  /** 文件类型 */
  fileType?: string;
};
