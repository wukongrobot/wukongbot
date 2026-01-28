/**
 * 飞书出站消息发送
 */

import type { FeishuClient } from "./sdk.js";
import type { FeishuConfig } from "./types.js";

export type OutboundMessage = {
  to: string;
  text?: string;
  image?: Buffer;
  file?: {
    buffer: Buffer;
    name: string;
    type?: "stream" | "opus" | "mp4" | "pdf" | "doc" | "xls" | "ppt";
  };
  replyTo?: string;
};

/**
 * 发送消息到飞书
 */
export async function sendMessage(
  client: FeishuClient,
  message: OutboundMessage,
  config: FeishuConfig,
): Promise<void> {
  try {
    // 发送文本消息
    if (message.text) {
      await sendTextMessage(client, message);
    }

    // 发送图片
    if (message.image) {
      await sendImageMessage(client, message);
    }

    // 发送文件
    if (message.file) {
      await sendFileMessage(client, message);
    }
  } catch (error) {
    console.error("[feishu] Failed to send message:", error);
    throw error;
  }
}

/**
 * 发送文本消息
 */
async function sendTextMessage(
  client: FeishuClient,
  message: OutboundMessage,
): Promise<void> {
  if (!message.text) return;

  // 处理长消息分片
  const chunks = chunkText(message.text, 4000);

  for (const chunk of chunks) {
    await client.sendText({
      chatId: message.to,
      text: chunk,
      replyTo: message.replyTo,
    });

    // 避免发送过快
    if (chunks.length > 1) {
      await sleep(500);
    }
  }
}

/**
 * 发送图片消息
 */
async function sendImageMessage(
  client: FeishuClient,
  message: OutboundMessage,
): Promise<void> {
  if (!message.image) return;

  // 上传图片
  const { fileKey } = await client.uploadImage({
    imageBuffer: message.image,
  });

  // 发送图片消息
  await client.sendImage({
    chatId: message.to,
    imageKey: fileKey,
    replyTo: message.replyTo,
  });
}

/**
 * 发送文件消息
 */
async function sendFileMessage(
  client: FeishuClient,
  message: OutboundMessage,
): Promise<void> {
  if (!message.file) return;

  // 上传文件
  const { fileKey } = await client.uploadFile({
    fileBuffer: message.file.buffer,
    fileName: message.file.name,
    fileType: message.file.type || "stream",
  });

  // 发送文件消息
  await client.sendFile({
    chatId: message.to,
    fileKey,
    replyTo: message.replyTo,
  });
}

/**
 * 文本分片
 */
function chunkText(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks: string[] = [];
  let current = "";

  for (const line of text.split("\n")) {
    if (current.length + line.length + 1 > maxLength) {
      if (current) {
        chunks.push(current);
        current = "";
      }

      // 如果单行超长,强制分割
      if (line.length > maxLength) {
        for (let i = 0; i < line.length; i += maxLength) {
          chunks.push(line.slice(i, i + maxLength));
        }
      } else {
        current = line;
      }
    } else {
      current += (current ? "\n" : "") + line;
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

/**
 * 延迟函数
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
