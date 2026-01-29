/**
 * 钉钉 Onboarding Adapter (新版)
 */

import type { MoltbotConfig } from "../../../src/config/config.js";
import type { RuntimeEnv } from "../../../src/runtime.js";
import type { WizardPrompter } from "../../../src/wizard/prompts.js";
import type {
  ChannelOnboardingAdapter,
  ChannelOnboardingConfigureParams,
  ChannelOnboardingConfigureResult,
  ChannelOnboardingStatus,
} from "../../../src/commands/onboarding/types.js";
import type { DingTalkConfig } from "./types.js";

const channel = "dingtalk" as const;

export const dingtalkOnboardingAdapter: ChannelOnboardingAdapter = {
  channel,

  async getStatus({ cfg }): Promise<ChannelOnboardingStatus> {
    const dingtalkConfig = cfg.channels?.dingtalk as DingTalkConfig | undefined;
    const appKey = dingtalkConfig?.appKey;
    const appSecret = dingtalkConfig?.appSecret;
    const configured = Boolean(
      typeof appKey === "string" && appKey.trim().length > 0 &&
      typeof appSecret === "string" && appSecret.trim().length > 0,
    );

    return {
      channel,
      configured,
      statusLines: [`钉钉: ${configured ? "已配置" : "需要配置 AppKey 和 AppSecret"}`],
      selectionHint: configured ? "已配置" : "需要配置",
      quickstartScore: configured ? 2 : 1,
    };
  },

  async configure(
    params: ChannelOnboardingConfigureParams,
  ): Promise<ChannelOnboardingConfigureResult> {
    const { cfg, prompter } = params;
    let next = cfg;

    await prompter.note(
      [
        "钉钉集成配置引导",
        "",
        "你需要先在钉钉开放平台创建应用:",
        "1. 访问 https://open.dingtalk.com/",
        "2. 创建企业内部应用",
        "3. 获取 AppKey 和 AppSecret",
        "4. 配置消息接收地址和权限",
      ].join("\n"),
      "钉钉配置",
    );

    // AppKey
    const appKey = String(
      await prompter.text({
        message: "请输入应用 AppKey",
        validate: (value) => (value?.trim() ? undefined : "AppKey 不能为空"),
      }),
    ).trim();

    // AppSecret
    const appSecret = String(
      await prompter.text({
        message: "请输入应用 AppSecret",
        validate: (value) => (value?.trim() ? undefined : "AppSecret 不能为空"),
      }),
    ).trim();

    // 询问是否配置群机器人
    const useWebhook = await prompter.confirm({
      message: "是否配置群机器人 Webhook? (用于群聊消息)",
      initialValue: false,
    });

    let webhookUrl: string | undefined;
    let webhookSecret: string | undefined;

    if (useWebhook) {
      webhookUrl = String(
        await prompter.text({
          message: "请输入群机器人 Webhook URL",
        }),
      ).trim();

      const useSign = await prompter.confirm({
        message: "是否配置加签密钥?",
        initialValue: true,
      });

      if (useSign) {
        webhookSecret = String(
          await prompter.text({
            message: "请输入加签密钥 (Secret)",
          }),
        ).trim();
      }
    }

    // 用户白名单
    const allowAllUsers = await prompter.confirm({
      message: "是否允许所有用户与机器人交互?",
      initialValue: true,
    });

    next = {
      ...next,
      channels: {
        ...next.channels,
        dingtalk: {
          appKey,
          appSecret,
          webhookUrl,
          webhookSecret,
          allowFrom: allowAllUsers ? ["*"] : [],
        },
      },
    };

    await prompter.note(
      [
        "配置完成!",
        "",
        "下一步:",
        "1. 在钉钉开放平台配置消息接收地址",
        "2. 配置相应的消息接收权限",
        "3. 发布应用并授权",
      ].join("\n"),
      "配置完成",
    );

    return { cfg: next };
  },

  disable(cfg: MoltbotConfig): MoltbotConfig {
    return {
      ...cfg,
      channels: {
        ...cfg.channels,
        dingtalk: {
          ...cfg.channels?.dingtalk,
          enabled: false,
        } as DingTalkConfig,
      },
    };
  },
};
