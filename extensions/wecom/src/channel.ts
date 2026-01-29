/**
 * 企业微信 Channel 插件实现
 */

import type { ChannelPlugin } from "../../../src/plugin-sdk/index.js";
import { WeComClient } from "./sdk.js";
import type { WeComConfig } from "./types.js";
import { wecomOnboardingAdapter } from "./onboarding-adapter.js";

const DEFAULT_ACCOUNT_ID = "default";

export type ResolvedWeComAccount = {
  accountId: string;
  enabled: boolean;
  corpId?: string;
  agentId?: string;
  secret?: string;
  config: WeComConfig;
};

export function createWeComChannelPlugin(): ChannelPlugin<ResolvedWeComAccount> {
  return {
    id: "wecom",
    meta: {
      name: "企业微信",
      label: "企业微信",
      selectionLabel: "企业微信",
      docsPath: "/channels/wecom",
      docsLabel: "wecom",
      blurb: "连接到企业微信进行消息收发",
      order: 11,
    },
    onboarding: wecomOnboardingAdapter,
    config: {
      listAccountIds: () => [DEFAULT_ACCOUNT_ID],
      resolveAccount: (cfg): ResolvedWeComAccount => {
        const wecomConfig = (cfg.channels?.wecom as WeComConfig | undefined) || {};
        return {
          accountId: DEFAULT_ACCOUNT_ID,
          enabled: cfg.channels?.wecom?.enabled !== false,
          corpId: wecomConfig.corpId,
          agentId: wecomConfig.agentId,
          secret: wecomConfig.secret,
          config: wecomConfig,
        };
      },
      defaultAccountId: () => DEFAULT_ACCOUNT_ID,
      isConfigured: (account) => {
        const hasCorpId = typeof account.corpId === "string" && account.corpId.trim().length > 0;
        const hasAgentId = typeof account.agentId === "string" && account.agentId.trim().length > 0;
        const hasSecret = typeof account.secret === "string" && account.secret.trim().length > 0;
        return hasCorpId && hasAgentId && hasSecret;
      },
    },

    async onboard(config, runtime, prompter) {
      prompter.note?.(
        "企业微信集成配置引导\n\n" +
          "你需要先在企业微信管理后台创建应用:\n" +
          "1. 访问 https://work.weixin.qq.com/\n" +
          "2. 进入「应用管理」->「自建」创建应用\n" +
          "3. 获取 Corp ID, Agent ID 和 Secret\n" +
          "4. 配置可信 IP 和接收消息服务器",
        "企业微信配置",
      );

      const corpId = await prompter.text?.({
        message: "请输入企业 ID (Corp ID):",
      });

      if (!corpId || !corpId.trim()) {
        throw new Error("Corp ID 不能为空");
      }

      const agentIdStr = await prompter.text?.({
        message: "请输入应用 ID (Agent ID):",
      });

      const agentId = Number.parseInt(agentIdStr || "");
      if (!agentId || Number.isNaN(agentId)) {
        throw new Error("Agent ID 必须是数字");
      }

      const secret = await prompter.password?.({
        message: "请输入应用 Secret:",
      });

      if (!secret || !secret.trim()) {
        throw new Error("Secret 不能为空");
      }

      const allowAllUsers = await prompter.confirm?.({
        message: "是否允许所有用户与机器人交互?",
        initial: true,
      });

      return {
        ...config,
        channels: {
          ...config.channels,
          wecom: {
            corpId: corpId.trim(),
            agentId,
            secret: secret.trim(),
            allowFrom: allowAllUsers ? ["*"] : [],
          },
        },
      };
    },

    async probe(config) {
      const wecomConfig = config.channels?.wecom as WeComConfig | undefined;

      if (!wecomConfig) {
        return {
          status: "not-configured",
          message: "企业微信未配置",
        };
      }

      const client = new WeComClient(wecomConfig);

      try {
        const isConnected = await client.testConnection();

        if (!isConnected) {
          return {
            status: "error",
            message: "企业微信连接失败: 无法获取 access token",
          };
        }

        return {
          status: "healthy",
          message: "企业微信连接正常",
          details: {
            corpId: wecomConfig.corpId,
            agentId: wecomConfig.agentId,
          },
        };
      } catch (error) {
        return {
          status: "error",
          message: `企业微信连接失败: ${error}`,
        };
      }
    },

    async send(message, config) {
      const wecomConfig = config.channels?.wecom as WeComConfig | undefined;

      if (!wecomConfig) {
        throw new Error("WeChat Work not configured");
      }

      const client = new WeComClient(wecomConfig);

      if (message.text) {
        await client.sendText({
          toUser: message.to,
          text: message.text,
        });
      }

      // TODO: 处理图片和文件
    },

    async monitor(config, runtime) {
      // TODO: 实现 Webhook 监控
      runtime.log?.("[wecom] Monitor not implemented yet");

      return {
        stop: async () => {
          runtime.log?.("[wecom] Monitor stopped");
        },
      };
    },
  };
}
