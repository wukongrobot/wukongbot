/**
 * 企业微信 SDK 封装
 */

import axios, { type AxiosInstance } from "axios";
import type {
  WeComConfig,
  WeComAccessTokenResponse,
  WeComSendMessageParams,
  WeComUploadResult,
} from "./types.js";

const WECOM_API_BASE = "https://qyapi.weixin.qq.com/cgi-bin";

export class WeComClient {
  private config: WeComConfig;
  private http: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpireTime: number = 0;

  constructor(config: WeComConfig) {
    this.config = config;
    this.http = axios.create({
      baseURL: WECOM_API_BASE,
      timeout: (config.network?.timeoutSeconds || 30) * 1000,
    });
  }

  /**
   * 获取 access_token
   */
  async getAccessToken(): Promise<string> {
    // 如果 token 还没过期,直接返回
    if (this.accessToken && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    try {
      const response = await this.http.get<WeComAccessTokenResponse>("/gettoken", {
        params: {
          corpid: this.config.corpId,
          corpsecret: this.config.secret,
        },
      });

      if (!response.data.access_token) {
        throw new Error("Failed to get access token");
      }

      this.accessToken = response.data.access_token;
      // 提前 5 分钟过期
      this.tokenExpireTime = Date.now() + (response.data.expires_in - 300) * 1000;

      return this.accessToken;
    } catch (error) {
      throw new Error(`WeChat Work get access token error: ${error}`);
    }
  }

  /**
   * 发送消息
   */
  async sendMessage(params: WeComSendMessageParams): Promise<{ msgId?: string }> {
    const accessToken = await this.getAccessToken();

    try {
      const payload: Record<string, unknown> = {
        touser: params.toType === "user" ? params.toIds : undefined,
        toparty: params.toType === "party" ? params.toIds : undefined,
        totag: params.toType === "tag" ? params.toIds : undefined,
        msgtype: params.msgType,
        agentid: params.agentId,
        safe: params.safe || 0,
      };

      // 添加消息内容
      payload[params.msgType] = params.content;

      const response = await this.http.post("/message/send", payload, {
        params: { access_token: accessToken },
      });

      if (response.data.errcode !== 0) {
        throw new Error(`Error ${response.data.errcode}: ${response.data.errmsg}`);
      }

      return {
        msgId: response.data.msgid,
      };
    } catch (error) {
      throw new Error(`WeChat Work send message error: ${error}`);
    }
  }

  /**
   * 发送文本消息
   */
  async sendText(params: {
    toUser: string;
    text: string;
  }): Promise<{ msgId?: string }> {
    return this.sendMessage({
      toType: "user",
      toIds: params.toUser,
      msgType: "text",
      agentId: this.config.agentId,
      content: {
        content: params.text,
      },
    });
  }

  /**
   * 上传临时素材
   */
  async uploadMedia(params: {
    type: "image" | "voice" | "video" | "file";
    buffer: Buffer;
    fileName?: string;
  }): Promise<WeComUploadResult> {
    const accessToken = await this.getAccessToken();

    try {
      const formData = new FormData();
      const blob = new Blob([params.buffer]);
      formData.append("media", blob, params.fileName || "file");

      const response = await this.http.post("/media/upload", formData, {
        params: {
          access_token: accessToken,
          type: params.type,
        },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.errcode !== 0) {
        throw new Error(`Error ${response.data.errcode}: ${response.data.errmsg}`);
      }

      return {
        mediaId: response.data.media_id,
        type: response.data.type,
        createdAt: response.data.created_at,
      };
    } catch (error) {
      throw new Error(`WeChat Work upload media error: ${error}`);
    }
  }

  /**
   * 发送图片消息
   */
  async sendImage(params: {
    toUser: string;
    mediaId: string;
  }): Promise<{ msgId?: string }> {
    return this.sendMessage({
      toType: "user",
      toIds: params.toUser,
      msgType: "image",
      agentId: this.config.agentId,
      content: {
        media_id: params.mediaId,
      },
    });
  }

  /**
   * 发送文件消息
   */
  async sendFile(params: {
    toUser: string;
    mediaId: string;
  }): Promise<{ msgId?: string }> {
    return this.sendMessage({
      toType: "user",
      toIds: params.toUser,
      msgType: "file",
      agentId: this.config.agentId,
      content: {
        media_id: params.mediaId,
      },
    });
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(userId: string): Promise<{
    name?: string;
    department?: number[];
    mobile?: string;
    email?: string;
  }> {
    const accessToken = await this.getAccessToken();

    try {
      const response = await this.http.get("/user/get", {
        params: {
          access_token: accessToken,
          userid: userId,
        },
      });

      if (response.data.errcode !== 0) {
        throw new Error(`Error ${response.data.errcode}: ${response.data.errmsg}`);
      }

      return {
        name: response.data.name,
        department: response.data.department,
        mobile: response.data.mobile,
        email: response.data.email,
      };
    } catch (error) {
      throw new Error(`WeChat Work get user info error: ${error}`);
    }
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      return Boolean(token);
    } catch {
      return false;
    }
  }
}
