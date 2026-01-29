/**
 * 飞书 Channel 插件实现
 */

import type { ChannelPlugin } from "../../../src/plugin-sdk/index.js";
import { FeishuClient } from "./sdk.js";
import type { FeishuConfig } from "./types.js";
import { onboardFeishu, type Prompter } from "./onboarding.js";
import { probeFeishu } from "./probe.js";
import { sendMessage, type OutboundMessage } from "./outbound.js";
import { startWSMonitor } from "./monitor-ws.js";
import { feishuOnboardingAdapter } from "./onboarding-adapter.js";
import { dispatchReplyWithBufferedBlockDispatcher } from "../../../src/auto-reply/reply/provider-dispatcher.js";
import { finalizeInboundContext } from "../../../src/auto-reply/reply/inbound-context.js";
import { resolveAgentRoute } from "../../../src/routing/resolve-route.js";
import { resolveChunkMode } from "../../../src/auto-reply/chunk.js";
import { recordChannelActivity } from "../../../src/infra/channel-activity.js";

const DEFAULT_ACCOUNT_ID = "default";

export type ResolvedFeishuAccount = {
  accountId: string;
  enabled: boolean;
  appId?: string;
  appSecret?: string;
  config: FeishuConfig;
};

export function createFeishuChannelPlugin(): ChannelPlugin<ResolvedFeishuAccount> {
  return {
    id: "feishu",
    meta: {
      name: "飞书",
      label: "飞书",
      selectionLabel: "飞书",
      docsPath: "/channels/feishu",
      docsLabel: "feishu",
      blurb: "连接到飞书进行消息收发",
      order: 10,
    },
    onboarding: feishuOnboardingAdapter,
    capabilities: {
      chatTypes: ["direct", "group"],
      text: true,
      media: true,
      nativeCommands: false,
      blockStreaming: true,
    },
    messaging: {
      normalizeTarget: (target) => {
        const trimmed = target.trim();
        if (!trimmed) return null;
        // 移除 feishu: 前缀
        return trimmed.replace(/^feishu:/i, "");
      },
      targetResolver: {
        looksLikeId: (id) => {
          const trimmed = id?.trim();
          if (!trimmed) return false;
          // 飞书 chat_id 通常是 oc_ 开头
          return /^(oc_|ou_|om_|feishu:)/i.test(trimmed);
        },
        hint: "<chatId>",
      },
    },
    config: {
      listAccountIds: () => [DEFAULT_ACCOUNT_ID],
      resolveAccount: (cfg): ResolvedFeishuAccount => {
        const feishuConfig = (cfg.channels?.feishu as FeishuConfig | undefined) || {};
        return {
          accountId: DEFAULT_ACCOUNT_ID,
          enabled: cfg.channels?.feishu?.enabled !== false,
          appId: feishuConfig.appId,
          appSecret: feishuConfig.appSecret,
          config: feishuConfig,
        };
      },
      defaultAccountId: () => DEFAULT_ACCOUNT_ID,
      isConfigured: (account) => {
        const hasAppId = typeof account.appId === "string" && account.appId.trim().length > 0;
        const hasAppSecret = typeof account.appSecret === "string" && account.appSecret.trim().length > 0;
        return hasAppId && hasAppSecret;
      },
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
     * Gateway 集成：启动账号监控
     */
    gateway: {
      async startAccount(ctx) {
        const { cfg, account, log, abortSignal } = ctx;
        const feishuConfig = cfg.channels?.feishu as FeishuConfig | undefined;
        
        if (!feishuConfig) {
          throw new Error("Feishu not configured");
        }

        log.info?.("启动飞书 WebSocket 连接...");

        // 消息处理器
        const handleMessage = async (params: {
          chatId: string;
          text: string;
          sender: { id: string; name?: string };
          messageId?: string;
          parentId?: string;
        }) => {
          log.info?.(
            `收到消息 来自 ${params.sender.id}: ${params.text}`,
          );
          
          try {
            // 记录频道活动
            recordChannelActivity({
              channel: "feishu",
              accountId: account.accountId,
              direction: "inbound",
            });

            // 构建路由信息
            const route = resolveAgentRoute({
              cfg,
              channel: "feishu",
              accountId: account.accountId,
              peer: {
                kind: "group", // 或 "dm"，根据 chatType 判断
                id: params.chatId,
              },
            });

            // 构建消息上下文
            const ctxPayload = finalizeInboundContext({
              Body: params.text,
              From: `feishu:${params.chatId}`,
              To: `feishu:${params.chatId}`,
              SessionKey: route.sessionKey,
              AccountId: route.accountId,
              ChatType: "group",
              Provider: "feishu",
              Surface: "feishu",
              MessageSid: params.messageId || String(Date.now()),
              SenderId: params.sender.id,
              SenderName: params.sender.name,
              Timestamp: Date.now(),
            });

            // 创建飞书客户端
            const client = new FeishuClient(feishuConfig);
            
            // 使用 agent 调度器处理消息
            const chunkMode = resolveChunkMode(cfg, "feishu", route.accountId);
            
            await dispatchReplyWithBufferedBlockDispatcher({
              ctx: ctxPayload,
              cfg,
              dispatcherOptions: {
                deliver: async (payload, info) => {
                  // 发送回复
                  const replyText = payload.text || "";
                  log.info?.(`[feishu] Delivering reply (${replyText.length} chars): ${replyText.substring(0, 100)}...`);
                  
                  await client.sendText({
                    chatId: params.chatId,
                    text: replyText,
                    replyTo: params.messageId,
                    markdown: true, // 明确启用 Markdown 支持
                  });

                  recordChannelActivity({
                    channel: "feishu",
                    accountId: route.accountId,
                    direction: "outbound",
                  });
                },
                disableBlockStreaming: true, // 飞书不支持流式传输
                chunkMode,
              },
            });
            
            log.info?.(`已处理并回复消息到 ${params.chatId}`);
          } catch (error) {
            log.error?.(`处理消息失败: ${error}`);
            log.error?.(`Error stack: ${error instanceof Error ? error.stack : String(error)}`);
          }
        };

        const monitor = await startWSMonitor({
          config: feishuConfig,
          onMessage: handleMessage,
          runtime: {
            log: log.info?.bind(log) || console.log,
            error: log.error?.bind(log) || console.error,
          },
        });

        // 监听中止信号
        if (abortSignal) {
          abortSignal.addEventListener("abort", () => {
            monitor.stop().catch((err) => {
              log.error?.(`停止飞书监控失败: ${err}`);
            });
          });
        }

        log.info?.("飞书 WebSocket 连接已启动");
      },
    },
  };
}
