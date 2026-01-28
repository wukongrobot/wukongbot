/**
 * 飞书入站消息处理
 */

import type { FeishuWebhookEvent, FeishuMessage, FeishuConfig } from "./types.js";

/**
 * 处理 Webhook 事件
 */
export function handleWebhookEvent(
  event: FeishuWebhookEvent,
  config: FeishuConfig,
): {
  type: "verification" | "message" | "unknown";
  challenge?: string;
  message?: FeishuMessage;
} {
  // URL 验证
  if (event.type === "url_verification") {
    return {
      type: "verification",
      challenge: event.challenge,
    };
  }

  // 事件回调
  if (event.type === "event_callback" && event.event) {
    // 消息事件
    if (event.event.type === "im.message.receive_v1") {
      const message = normalizeMessage(event.event);
      if (message) {
        return {
          type: "message",
          message,
        };
      }
    }
  }

  return { type: "unknown" };
}

/**
 * 标准化消息格式
 */
function normalizeMessage(eventData: any): FeishuMessage | null {
  try {
    const message = eventData.message;
    if (!message) return null;

    // 解析消息内容
    let content: string | Record<string, unknown> = "";
    try {
      content = JSON.parse(message.content);
    } catch {
      content = message.content;
    }

    // 提取文本内容
    let text = "";
    if (typeof content === "object" && content !== null) {
      text = (content as any).text || "";
    } else {
      text = String(content);
    }

    // 提取提及信息
    const mentions: Array<{ id: string; name?: string }> = [];
    if (message.mentions && Array.isArray(message.mentions)) {
      for (const mention of message.mentions) {
        mentions.push({
          id: mention.id?.open_id || mention.id?.user_id || "",
          name: mention.name,
        });
      }
    }

    return {
      msgType: message.message_type || "text",
      chatId: message.chat_id,
      content: text,
      sender: {
        id: eventData.sender?.sender_id?.open_id || "",
        name: eventData.sender?.sender_id?.user_id,
        type: eventData.sender?.sender_type === "app" ? "bot" : "user",
      },
      messageId: message.message_id,
      parentId: message.parent_id,
      mentions,
      timestamp: Number.parseInt(message.create_time) || Date.now(),
    };
  } catch (error) {
    console.error("[feishu] Failed to normalize message:", error);
    return null;
  }
}

/**
 * 检查用户是否在白名单中
 */
export function isUserAllowed(userId: string, config: FeishuConfig): boolean {
  const allowFrom = config.allowFrom || [];
  
  // 允许所有用户
  if (allowFrom.includes("*")) {
    return true;
  }

  // 检查用户 ID
  return allowFrom.includes(userId);
}

/**
 * 检查是否提及了机器人
 */
export function isBotMentioned(message: FeishuMessage, botId: string): boolean {
  if (!message.mentions || message.mentions.length === 0) {
    return false;
  }

  return message.mentions.some((mention) => mention.id === botId);
}

/**
 * 移除消息中的 @ 提及
 */
export function stripMentions(text: string): string {
  // 移除飞书的 @用户 格式
  return text.replace(/@[^\s]+\s*/g, "").trim();
}
