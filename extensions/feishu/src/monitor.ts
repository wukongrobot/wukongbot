/**
 * 飞书消息监控 (Webhook 服务器)
 */

import express, { type Express, type Request, type Response } from "express";
import type { FeishuClient } from "./sdk.js";
import type { FeishuConfig, FeishuWebhookEvent } from "./types.js";
import { handleWebhookEvent, isUserAllowed, isBotMentioned, stripMentions } from "./inbound.js";

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
 * 启动飞书消息监控
 */
export async function startMonitor(params: {
  client: FeishuClient;
  config: FeishuConfig;
  onMessage: MessageHandler;
  runtime: {
    log: (message: string) => void;
    error: (message: string) => void;
  };
}): Promise<MonitorHandle> {
  const { client, config, onMessage, runtime } = params;

  const app = express();
  
  // 解析 JSON 请求体
  app.use(express.json());

  // Webhook 路径
  const webhookPath = config.webhookPath || "/webhook/feishu";

  // 处理 Webhook 请求
  app.post(webhookPath, async (req: Request, res: Response) => {
    try {
      const event = req.body as FeishuWebhookEvent;

      // 验证 token
      if (config.verificationToken && event.token !== config.verificationToken) {
        runtime.error("[feishu] Invalid verification token");
        res.status(401).json({ error: "Invalid token" });
        return;
      }

      const result = handleWebhookEvent(event, config);

      // URL 验证
      if (result.type === "verification") {
        res.json({ challenge: result.challenge });
        return;
      }

      // 处理消息
      if (result.type === "message" && result.message) {
        const message = result.message;

        // 检查是否是机器人自己发的消息
        if (message.sender.type === "bot") {
          res.json({ success: true });
          return;
        }

        // 检查用户权限
        if (!isUserAllowed(message.sender.id, config)) {
          runtime.log(`[feishu] User ${message.sender.id} not in allowlist, ignoring`);
          res.json({ success: true });
          return;
        }

        // 检查群组消息是否需要 @
        const groupConfig = config.groups?.[message.chatId];
        if (groupConfig?.requireMention) {
          const botId = ""; // TODO: 获取机器人 ID
          if (!isBotMentioned(message, botId)) {
            res.json({ success: true });
            return;
          }
        }

        // 清理消息文本
        let text = typeof message.content === "string" ? message.content : "";
        text = stripMentions(text);

        if (!text) {
          res.json({ success: true });
          return;
        }

        // 异步处理消息
        onMessage({
          chatId: message.chatId,
          text,
          sender: message.sender,
          messageId: message.messageId,
          parentId: message.parentId,
        }).catch((error) => {
          runtime.error(`[feishu] Failed to handle message: ${error}`);
        });

        res.json({ success: true });
      } else {
        res.json({ success: true });
      }
    } catch (error) {
      runtime.error(`[feishu] Webhook error: ${error}`);
      res.status(500).json({ error: "Internal error" });
    }
  });

  // 健康检查
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", service: "feishu-webhook" });
  });

  // 启动服务器
  const port = config.webhookPort || 3000;
  const server = app.listen(port, () => {
    runtime.log(`[feishu] Webhook server listening on port ${port}`);
    runtime.log(`[feishu] Webhook URL: http://localhost:${port}${webhookPath}`);
  });

  return {
    stop: async () => {
      return new Promise((resolve) => {
        server.close(() => {
          runtime.log("[feishu] Webhook server stopped");
          resolve();
        });
      });
    },
  };
}
