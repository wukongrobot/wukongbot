/**
 * 钉钉 SDK 封装
 */

import axios, { type AxiosInstance } from "axios";
import CryptoJS from "crypto-js";
import type {
  DingTalkConfig,
  DingTalkAccessTokenResponse,
  DingTalkSendMessageParams,
  DingTalkUploadResult,
} from "./types.js";

const DINGTALK_API_BASE = "https://oapi.dingtalk.com";

export class DingTalkClient {
  private config: DingTalkConfig;
  private http: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpireTime: number = 0;

  constructor(config: DingTalkConfig) {
    this.config = config;
    this.http = axios.create({
      baseURL: DINGTALK_API_BASE,
      timeout: (config.network?.timeoutSeconds || 30) * 1000,
    });
  }

  /**
   * 获取 access_token
   */
  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    try {
      const response = await this.http.get<DingTalkAccessTokenResponse>("/gettoken", {
        params: {
          appkey: this.config.appKey,
          appsecret: this.config.appSecret,
        },
      });

      if (response.data.errcode !== 0 || !response.data.access_token) {
        throw new Error(`Failed to get access token: ${response.data.errmsg}`);
      }

      this.accessToken = response.data.access_token;
      this.tokenExpireTime = Date.now() + (response.data.expires_in || 7200 - 300) * 1000;

      return this.accessToken;
    } catch (error) {
      throw new Error(`DingTalk get access token error: ${error}`);
    }
  }

  /**
   * 发送工作通知消息
   */
  async sendMessage(params: DingTalkSendMessageParams): Promise<{ taskId?: string }> {
    const accessToken = await this.getAccessToken();

    try {
      const payload: Record<string, unknown> = {
        agent_id: this.config.appKey,
        userid_list: params.userIds,
        dept_id_list: params.deptIds,
        to_all_user: params.toAllUser || false,
        msg: {
          msgtype: params.msgType,
          [params.msgType]: params.msg,
        },
      };

      const response = await this.http.post("/topapi/message/corpconversation/asyncsend_v2", payload, {
        params: { access_token: accessToken },
      });

      if (response.data.errcode !== 0) {
        throw new Error(`Error ${response.data.errcode}: ${response.data.errmsg}`);
      }

      return {
        taskId: response.data.task_id,
      };
    } catch (error) {
      throw new Error(`DingTalk send message error: ${error}`);
    }
  }

  /**
   * 发送文本消息
   */
  async sendText(params: {
    userId: string;
    text: string;
  }): Promise<{ taskId?: string }> {
    return this.sendMessage({
      userIds: params.userId,
      msgType: "text",
      msg: {
        content: params.text,
      },
    });
  }

  /**
   * 发送 Markdown 消息
   */
  async sendMarkdown(params: {
    userId: string;
    title: string;
    text: string;
  }): Promise<{ taskId?: string }> {
    return this.sendMessage({
      userIds: params.userId,
      msgType: "markdown",
      msg: {
        title: params.title,
        text: params.text,
      },
    });
  }

  /**
   * 上传媒体文件
   */
  async uploadMedia(params: {
    type: "image" | "voice" | "video" | "file";
    buffer: Buffer;
    fileName?: string;
  }): Promise<DingTalkUploadResult> {
    const accessToken = await this.getAccessToken();

    try {
      const formData = new FormData();
      const blob = new Blob([params.buffer]);
      formData.append("type", params.type);
      formData.append("media", blob, params.fileName || "file");

      const response = await this.http.post("/media/upload", formData, {
        params: { access_token: accessToken },
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
      };
    } catch (error) {
      throw new Error(`DingTalk upload media error: ${error}`);
    }
  }

  /**
   * 获取用户详情
   */
  async getUserInfo(userId: string): Promise<{
    name?: string;
    mobile?: string;
    email?: string;
    avatar?: string;
  }> {
    const accessToken = await this.getAccessToken();

    try {
      const response = await this.http.post(
        "/topapi/v2/user/get",
        { userid: userId },
        {
          params: { access_token: accessToken },
        },
      );

      if (response.data.errcode !== 0) {
        throw new Error(`Error ${response.data.errcode}: ${response.data.errmsg}`);
      }

      const user = response.data.result;
      return {
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        avatar: user.avatar,
      };
    } catch (error) {
      throw new Error(`DingTalk get user info error: ${error}`);
    }
  }

  /**
   * 发送群机器人消息 (Webhook)
   */
  async sendWebhookMessage(params: {
    msgType: "text" | "markdown" | "link";
    content: Record<string, unknown>;
    at?: {
      atMobiles?: string[];
      atUserIds?: string[];
      isAtAll?: boolean;
    };
  }): Promise<void> {
    if (!this.config.webhookUrl) {
      throw new Error("Webhook URL not configured");
    }

    try {
      let url = this.config.webhookUrl;

      // 添加签名
      if (this.config.webhookSecret) {
        const timestamp = Date.now();
        const sign = this.calculateSign(timestamp, this.config.webhookSecret);
        url += `&timestamp=${timestamp}&sign=${encodeURIComponent(sign)}`;
      }

      const payload: Record<string, unknown> = {
        msgtype: params.msgType,
        [params.msgType]: params.content,
      };

      if (params.at) {
        payload.at = params.at;
      }

      await axios.post(url, payload);
    } catch (error) {
      throw new Error(`DingTalk send webhook message error: ${error}`);
    }
  }

  /**
   * 计算钉钉签名
   */
  private calculateSign(timestamp: number, secret: string): string {
    const stringToSign = `${timestamp}\n${secret}`;
    const hmac = CryptoJS.HmacSHA256(stringToSign, secret);
    return CryptoJS.enc.Base64.stringify(hmac);
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
