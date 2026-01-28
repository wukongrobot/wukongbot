/**
 * 飞书 SDK 封装
 */

import * as lark from "@larksuiteoapi/node-sdk";
import type { FeishuConfig, FeishuSendMessageParams, FeishuUploadResult } from "./types.js";

export class FeishuClient {
  private client: lark.Client;
  private config: FeishuConfig;

  constructor(config: FeishuConfig) {
    this.config = config;
    this.client = new lark.Client({
      appId: config.appId,
      appSecret: config.appSecret,
      appType: lark.AppType.SelfBuild,
      domain: lark.Domain.Feishu,
    });
  }

  /**
   * 发送消息
   */
  async sendMessage(params: FeishuSendMessageParams): Promise<{ messageId: string }> {
    try {
      const response = await this.client.im.message.create({
        params: {
          receive_id_type: params.receiveIdType || "chat_id",
        },
        data: {
          receive_id: params.receiveId,
          msg_type: params.msgType,
          content: typeof params.content === "string"
            ? params.content
            : JSON.stringify(params.content),
          ...(params.replyTo ? { reply_to: params.replyTo } : {}),
        },
      });

      if (!response.success) {
        throw new Error(`Failed to send message: ${response.msg}`);
      }

      return {
        messageId: response.data?.message_id || "",
      };
    } catch (error) {
      throw new Error(`Feishu send message error: ${error}`);
    }
  }

  /**
   * 发送文本消息
   */
  async sendText(params: {
    chatId: string;
    text: string;
    replyTo?: string;
  }): Promise<{ messageId: string }> {
    return this.sendMessage({
      receiveId: params.chatId,
      receiveIdType: "chat_id",
      msgType: "text",
      content: JSON.stringify({ text: params.text }),
      replyTo: params.replyTo,
    });
  }

  /**
   * 上传图片
   */
  async uploadImage(params: {
    imageBuffer: Buffer;
    fileName?: string;
  }): Promise<FeishuUploadResult> {
    try {
      const formData = new FormData();
      const blob = new Blob([params.imageBuffer]);
      formData.append("image_type", "message");
      formData.append("image", blob, params.fileName || "image.png");

      const response = await this.client.im.image.create({
        data: formData as any,
      });

      if (!response.success) {
        throw new Error(`Failed to upload image: ${response.msg}`);
      }

      return {
        fileKey: response.data?.image_key || "",
      };
    } catch (error) {
      throw new Error(`Feishu upload image error: ${error}`);
    }
  }

  /**
   * 发送图片消息
   */
  async sendImage(params: {
    chatId: string;
    imageKey: string;
    replyTo?: string;
  }): Promise<{ messageId: string }> {
    return this.sendMessage({
      receiveId: params.chatId,
      receiveIdType: "chat_id",
      msgType: "image",
      content: JSON.stringify({ image_key: params.imageKey }),
      replyTo: params.replyTo,
    });
  }

  /**
   * 上传文件
   */
  async uploadFile(params: {
    fileBuffer: Buffer;
    fileName: string;
    fileType: "stream" | "opus" | "mp4" | "pdf" | "doc" | "xls" | "ppt";
  }): Promise<FeishuUploadResult> {
    try {
      const formData = new FormData();
      const blob = new Blob([params.fileBuffer]);
      formData.append("file_type", params.fileType);
      formData.append("file_name", params.fileName);
      formData.append("file", blob, params.fileName);

      const response = await this.client.im.file.create({
        data: formData as any,
      });

      if (!response.success) {
        throw new Error(`Failed to upload file: ${response.msg}`);
      }

      return {
        fileKey: response.data?.file_key || "",
        fileName: params.fileName,
      };
    } catch (error) {
      throw new Error(`Feishu upload file error: ${error}`);
    }
  }

  /**
   * 发送文件消息
   */
  async sendFile(params: {
    chatId: string;
    fileKey: string;
    replyTo?: string;
  }): Promise<{ messageId: string }> {
    return this.sendMessage({
      receiveId: params.chatId,
      receiveIdType: "chat_id",
      msgType: "file",
      content: JSON.stringify({ file_key: params.fileKey }),
      replyTo: params.replyTo,
    });
  }

  /**
   * 获取群组信息
   */
  async getChatInfo(chatId: string): Promise<{
    name?: string;
    description?: string;
    ownerId?: string;
  }> {
    try {
      const response = await this.client.im.chat.get({
        path: {
          chat_id: chatId,
        },
      });

      if (!response.success) {
        throw new Error(`Failed to get chat info: ${response.msg}`);
      }

      return {
        name: response.data?.name,
        description: response.data?.description,
        ownerId: response.data?.owner_id,
      };
    } catch (error) {
      throw new Error(`Feishu get chat info error: ${error}`);
    }
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(userId: string): Promise<{
    name?: string;
    avatar?: string;
  }> {
    try {
      const response = await this.client.contact.user.get({
        path: {
          user_id: userId,
        },
        params: {
          user_id_type: "open_id",
        },
      });

      if (!response.success) {
        throw new Error(`Failed to get user info: ${response.msg}`);
      }

      return {
        name: response.data?.user?.name,
        avatar: response.data?.user?.avatar?.avatar_origin,
      };
    } catch (error) {
      throw new Error(`Feishu get user info error: ${error}`);
    }
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.auth.tenantAccessToken.internal({
        data: {
          app_id: this.config.appId,
          app_secret: this.config.appSecret,
        },
      });

      return response.success && Boolean(response.data?.tenant_access_token);
    } catch (error) {
      return false;
    }
  }
}
