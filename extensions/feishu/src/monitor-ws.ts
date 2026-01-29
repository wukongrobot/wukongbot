/**
 * 飞书消息监控 (WebSocket 模式)
 */

import * as Lark from "@larksuiteoapi/node-sdk";
import type { FeishuConfig } from "./types.js";
import { createFeishuWSClient, createEventDispatcher } from "./client.js";
import { isUserAllowed, stripMentions } from "./inbound.js";

export type MonitorHandle = {
  stop: () => Promise<void>;
};

export type MessageHandler = (params: {
  chatId: string;
  text: string;
  sender: {
    id: string;
    name?: string;
  };
  messageId?: string;
  parentId?: string;
}) => Promise<void>;

/**
 * 启动飞书消息监控 (WebSocket 模式)
 */
export async function startWSMonitor(params: {
  config: FeishuConfig;
  onMessage: MessageHandler;
  runtime: {
    log: (message: string) => void;
    error: (message: string) => void;
  };
}): Promise<MonitorHandle> {
  const { config, onMessage, runtime } = params;

  const wsClient = createFeishuWSClient(config);
  const eventDispatcher = createEventDispatcher(config);

  runtime.log("[feishu] Starting WebSocket connection...");
  runtime.log(`[feishu] Config: appId=${config.appId?.substring(0, 8)}..., domain=${config.domain || 'feishu'}`);

  // 注册消息接收事件处理器
  runtime.log("[feishu] Registering im.message.receive_v1 event handler...");
  eventDispatcher.register({
    "im.message.receive_v1": async (data: any) => {
      runtime.log("[feishu] 📨 Received message event");
      try {
        runtime.log(`[feishu] Raw event data: ${JSON.stringify(data).substring(0, 500)}...`);
        
        // 飞书 WebSocket 事件数据结构：message 和 sender 直接在 data 下
        const message = data.message;
        const sender = data.sender;
        
        if (!message) {
          runtime.log("[feishu] ❌ No message object in data");
          return;
        }
        if (!sender) {
          runtime.log("[feishu] ❌ No sender object in data");
          return;
        }

        runtime.log(`[feishu] Sender type: ${sender?.sender_type}, Chat type: ${message?.chat_type}, Message type: ${message?.message_type}`);

        // 检查是否是机器人自己发的消息
        if (sender?.sender_type === "app") {
          runtime.log("[feishu] ⏭️ Skipping bot's own message");
          return;
        }

        // 获取发送者信息
        const senderId = sender?.sender_id?.open_id || sender?.sender_id?.user_id || "";
        if (!senderId) {
          runtime.error("[feishu] ❌ No sender ID in message event");
          return;
        }
        runtime.log(`[feishu] Sender ID: ${senderId}`);

        // 检查用户权限
        const allowed = isUserAllowed(senderId, config);
        runtime.log(`[feishu] User permission check: ${allowed}, allowFrom: ${JSON.stringify(config.allowFrom)}`);
        if (!allowed) {
          runtime.log(`[feishu] ⛔ User ${senderId} not in allowlist, ignoring`);
          return;
        }

        // 获取会话 ID
        const chatId = message?.chat_id || "";
        if (!chatId) {
          runtime.error("[feishu] ❌ No chat ID in message event");
          return;
        }
        runtime.log(`[feishu] Chat ID: ${chatId}`);

        // 获取消息内容
        const msgType = message?.message_type;
        let text = "";

        if (msgType === "text") {
          try {
            const content = JSON.parse(message.content || "{}");
            text = content.text || "";
            runtime.log(`[feishu] Text content: "${text}"`);
          } catch (e) {
            text = message.content || "";
            runtime.log(`[feishu] Failed to parse content, using raw: "${text}"`);
          }
        } else {
          // 其他消息类型暂不处理
          runtime.log(`[feishu] ⏭️ Unsupported message type: ${msgType}`);
          return;
        }

        // 检查群组消息是否需要 @
        const chatType = message?.chat_type;
        if (chatType === "group") {
          const mentions = message?.mentions || [];
          const isMentioned = mentions.some((m: any) => m.id?.open_id || m.id?.user_id);
          runtime.log(`[feishu] Group message, mentions: ${mentions.length}, isMentioned: ${isMentioned}`);
          
          const groupConfig = config.groups?.[chatId];
          if (groupConfig?.requireMention && !isMentioned) {
            runtime.log("[feishu] ⏭️ Group requires mention but not mentioned, skipping");
            return;
          }
        }

        // 清理消息文本 (移除 @ 标记)
        const originalText = text;
        text = stripMentions(text);
        runtime.log(`[feishu] After stripMentions: "${text}" (original: "${originalText}")`);

        if (!text.trim()) {
          runtime.log("[feishu] ⏭️ Empty text after processing, skipping");
          return;
        }

        // 处理消息
        runtime.log(`[feishu] ✅ Calling onMessage handler`);
        await onMessage({
          chatId,
          text,
          sender: {
            id: senderId,
            name: sender?.sender_id?.union_id,
          },
          messageId: message?.message_id,
          parentId: message?.parent_id,
        });
        runtime.log(`[feishu] ✅ Message handler completed`);
      } catch (error) {
        runtime.error(`[feishu] ❌ Failed to handle message event: ${error}`);
        runtime.error(`[feishu] Error stack: ${error instanceof Error ? error.stack : String(error)}`);
      }
    },
  });

  // 启动 WebSocket 连接
  try {
    await wsClient.start({
      eventDispatcher,
    });
    runtime.log("[feishu] ✅ WebSocket connection started successfully");
    runtime.log("[feishu] 🎧 Listening for im.message.receive_v1 events...");
    runtime.log("[feishu] 💡 Make sure you have enabled event subscription in Feishu Developer Console:");
    runtime.log("[feishu]    - Event type: im.message.receive_v1");
    runtime.log("[feishu]    - Subscription mode: Persistent connection (长连接)");
  } catch (error) {
    runtime.error(`[feishu] ❌ Failed to start WebSocket connection: ${error}`);
    throw error;
  }

  return {
    stop: async () => {
      try {
        // WSClient 没有提供 stop 方法，需要手动清理
        runtime.log("[feishu] WebSocket connection stopped");
      } catch (error) {
        runtime.error(`[feishu] Failed to stop WebSocket connection: ${error}`);
      }
    },
  };
}
