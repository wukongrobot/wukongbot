/**
 * 钉钉 Channel 插件实现
 */

import type { ChannelPlugin } from "../../../src/plugin-sdk/index.js";
import { DingTalkClient } from "./sdk.js";
import type { DingTalkConfig } from "./types.js";
import { dingtalkOnboardingAdapter } from "./onboarding-adapter.js";

const DEFAULT_ACCOUNT_ID = "default";

export type ResolvedDingTalkAccount = {
  accountId: string;
  enabled: boolean;
  appKey?: string;
  appSecret?: string;
  config: DingTalkConfig;
};

export function createDingTalkChannelPlugin(): ChannelPlugin<ResolvedDingTalkAccount> {
  return {
    id: "dingtalk",
    meta: {
      name: "钉钉",
      label: "钉钉",
      selectionLabel: "钉钉",
      docsPath: "/channels/dingtalk",
      docsLabel: "dingtalk",
      blurb: "连接到钉钉进行消息收发",
      order: 12,
    },
    onboarding: dingtalkOnboardingAdapter,
    config: {
      listAccountIds: () => [DEFAULT_ACCOUNT_ID],
      resolveAccount: (cfg): ResolvedDingTalkAccount => {
        const dingtalkConfig = (cfg.channels?.dingtalk as DingTalkConfig | undefined) || {};
        return {
          accountId: DEFAULT_ACCOUNT_ID,
          enabled: cfg.channels?.dingtalk?.enabled !== false,
          appKey: dingtalkConfig.appKey,
          appSecret: dingtalkConfig.appSecret,
          config: dingtalkConfig,
        };
      },
      defaultAccountId: () => DEFAULT_ACCOUNT_ID,
      isConfigured: (account) => {
        const hasAppKey = typeof account.appKey === "string" && account.appKey.trim().length > 0;
        const hasAppSecret = typeof account.appSecret === "string" && account.appSecret.trim().length > 0;
        return hasAppKey && hasAppSecret;
      },
    },

    async onboard(config, runtime, prompter) {
      prompter.note?.(
        "钉钉集成配置引导\n\n" +
          "你需要先在钉钉开放平台创建应用:\n" +
          "1. 访问 https://open.dingtalk.com/\n" +
          "2. 创建企业内部应用\n" +
          "3. 获取 AppKey 和 AppSecret\n" +
          "4. 配置消息接收地址和权限",
        "钉钉配置",
      );

      const appKey = await prompter.text?.({
        message: "请输入应用 AppKey:",
      });

      if (!appKey || !appKey.trim()) {
        throw new Error("AppKey 不能为空");
      }

      const appSecret = await prompter.password?.({
        message: "请输入应用 AppSecret:",
      });

      if (!appSecret || !appSecret.trim()) {
        throw new Error("AppSecret 不能为空");
      }

      // 询问是否配置群机器人
      const useWebhook = await prompter.confirm?.({
        message: "是否配置群机器人 Webhook? (用于群聊消息)",
        initial: false,
      });

      let webhookUrl: string | undefined;
      let webhookSecret: string | undefined;

      if (useWebhook) {
        webhookUrl = await prompter.text?.({
          message: "请输入群机器人 Webhook URL:",
        });

        const useSign = await prompter.confirm?.({
          message: "是否配置加签密钥?",
          initial: true,
        });

        if (useSign) {
          webhookSecret = await prompter.text?.({
            message: "请输入加签密钥 (Secret):",
          });
        }
      }

      const allowAllUsers = await prompter.confirm?.({
        message: "是否允许所有用户与机器人交互?",
        initial: true,
      });

      return {
        ...config,
        channels: {
          ...config.channels,
          dingtalk: {
            appKey: appKey.trim(),
            appSecret: appSecret.trim(),
            webhookUrl: webhookUrl?.trim(),
            webhookSecret: webhookSecret?.trim(),
            allowFrom: allowAllUsers ? ["*"] : [],
          },
        },
      };
    },

    async probe(config) {
      const dingtalkConfig = config.channels?.dingtalk as DingTalkConfig | undefined;

      if (!dingtalkConfig) {
        return {
          status: "not-configured",
          message: "钉钉未配置",
        };
      }

      const client = new DingTalkClient(dingtalkConfig);

      try {
        const isConnected = await client.testConnection();

        if (!isConnected) {
          return {
            status: "error",
            message: "钉钉连接失败: 无法获取 access token",
          };
        }

        const warnings: string[] = [];
        if (!dingtalkConfig.webhookUrl) {
          warnings.push("未配置群机器人 Webhook");
        }

        return {
          status: warnings.length > 0 ? "degraded" : "healthy",
          message: warnings.length > 0 ? "钉钉连接正常,但有配置警告" : "钉钉连接正常",
          details: {
            appKey: dingtalkConfig.appKey,
            hasWebhook: Boolean(dingtalkConfig.webhookUrl),
            warnings,
          },
        };
      } catch (error) {
        return {
          status: "error",
          message: `钉钉连接失败: ${error}`,
        };
      }
    },

    async send(message, config) {
      const dingtalkConfig = config.channels?.dingtalk as DingTalkConfig | undefined;

      if (!dingtalkConfig) {
        throw new Error("DingTalk not configured");
      }

      const client = new DingTalkClient(dingtalkConfig);

      if (message.text) {
        await client.sendText({
          userId: message.to,
          text: message.text,
        });
      }

      // TODO: 处理图片和文件
    },

    async monitor(config, runtime) {
      // TODO: 实现 Webhook 监控
      runtime.log?.("[dingtalk] Monitor not implemented yet");

      return {
        stop: async () => {
          runtime.log?.("[dingtalk] Monitor stopped");
        },
      };
    },
  };
}
