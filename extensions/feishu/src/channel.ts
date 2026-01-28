/**
 * 飞书 Channel 插件实现
 */

import type { ChannelPlugin } from "clawdbot/plugin-sdk";
import { FeishuClient } from "./sdk.js";
import type { FeishuConfig } from "./types.js";
import { onboardFeishu, type Prompter } from "./onboarding.js";
import { probeFeishu } from "./probe.js";
import { sendMessage, type OutboundMessage } from "./outbound.js";
import { startMonitor } from "./monitor.js";

export function createFeishuChannelPlugin(): ChannelPlugin {
  return {
    id: "feishu",
    meta: {
      name: "飞书",
      order: 10,
    },

    /**
     * 引导配置
     */
    async onboard(config, runtime, prompter) {
      const feishuConfig = await onboardFeishu(prompter as Prompter);

      return {
        ...config,
        channels: {
          ...config.channels,
          feishu: {
            appId: feishuConfig.appId,
            appSecret: feishuConfig.appSecret,
            verificationToken: feishuConfig.verificationToken,
            encryptKey: feishuConfig.encryptKey,
            webhookPort: feishuConfig.webhookPort,
            webhookPath: feishuConfig.webhookPath,
            allowFrom: feishuConfig.allowFrom,
          },
        },
      };
    },

    /**
     * 探测状态
     */
    async probe(config) {
      const feishuConfig = config.channels?.feishu as FeishuConfig | undefined;
      
      if (!feishuConfig) {
        return {
          status: "not-configured",
          message: "飞书未配置",
        };
      }

      const client = new FeishuClient(feishuConfig);
      return probeFeishu(client, feishuConfig);
    },

    /**
     * 发送消息
     */
    async send(message, config) {
      const feishuConfig = config.channels?.feishu as FeishuConfig | undefined;
      
      if (!feishuConfig) {
        throw new Error("Feishu not configured");
      }

      const client = new FeishuClient(feishuConfig);

      const outboundMessage: OutboundMessage = {
        to: message.to,
        text: message.text,
      };

      // TODO: 处理图片和文件
      // if (message.image) outboundMessage.image = message.image;
      // if (message.file) outboundMessage.file = message.file;

      await sendMessage(client, outboundMessage, feishuConfig);
    },

    /**
     * 启动监控
     */
    async monitor(config, runtime) {
      const feishuConfig = config.channels?.feishu as FeishuConfig | undefined;
      
      if (!feishuConfig) {
        throw new Error("Feishu not configured");
      }

      const client = new FeishuClient(feishuConfig);

      // 消息处理器
      const handleMessage = async (params: {
        chatId: string;
        text: string;
        sender: { id: string; name?: string };
        messageId?: string;
        parentId?: string;
      }) => {
        // TODO: 集成到 WukongBot 的消息路由系统
        runtime.log?.(
          `[feishu] Received message from ${params.sender.id}: ${params.text}`,
        );
        
        // 这里应该调用 WukongBot 的核心消息处理逻辑
        // 例如: await routeMessage({ channel: 'feishu', ...params });
      };

      const monitor = await startMonitor({
        client,
        config: feishuConfig,
        onMessage: handleMessage,
        runtime: {
          log: runtime.log || console.log,
          error: runtime.error || console.error,
        },
      });

      return {
        stop: async () => {
          await monitor.stop();
        },
      };
    },
  };
}
