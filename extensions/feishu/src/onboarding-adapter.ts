/**
 * 飞书 Onboarding Adapter (新版)
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
import type { FeishuConfig } from "./types.js";

const channel = "feishu" as const;

export const feishuOnboardingAdapter: ChannelOnboardingAdapter = {
  channel,

  async getStatus({ cfg }): Promise<ChannelOnboardingStatus> {
    const feishuConfig = cfg.channels?.feishu as FeishuConfig | undefined;
    const appId = feishuConfig?.appId;
    const appSecret = feishuConfig?.appSecret;
    const configured = Boolean(
      typeof appId === "string" && appId.trim().length > 0 &&
      typeof appSecret === "string" && appSecret.trim().length > 0,
    );

    return {
      channel,
      configured,
      statusLines: [`飞书: ${configured ? "已配置" : "需要配置 App ID 和 App Secret"}`],
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
        "飞书集成配置引导",
        "",
        "你需要先在飞书开放平台创建应用:",
        "1. 访问 https://open.feishu.cn/app",
        "2. 创建企业自建应用",
        "3. 获取 App ID 和 App Secret",
        "4. 配置事件订阅和消息权限",
      ].join("\n"),
      "飞书配置",
    );

    // App ID
    const appId = String(
      await prompter.text({
        message: "请输入飞书应用 App ID",
        validate: (value) => (value?.trim() ? undefined : "App ID 不能为空"),
      }),
    ).trim();

    // App Secret
    const appSecret = String(
      await prompter.text({
        message: "请输入飞书应用 App Secret",
        validate: (value) => (value?.trim() ? undefined : "App Secret 不能为空"),
      }),
    ).trim();

    // Verification Token (可选)
    const needsToken = await prompter.confirm({
      message: "是否配置 Verification Token? (用于 Webhook 验证)",
      initialValue: true,
    });

    let verificationToken: string | undefined;
    if (needsToken) {
      verificationToken = String(
        await prompter.text({
          message: "请输入 Verification Token",
        }),
      ).trim();
    }

    // Encrypt Key (可选)
    const needsEncrypt = await prompter.confirm({
      message: "是否配置 Encrypt Key? (用于消息加密)",
      initialValue: false,
    });

    let encryptKey: string | undefined;
    if (needsEncrypt) {
      encryptKey = String(
        await prompter.text({
          message: "请输入 Encrypt Key",
        }),
      ).trim();
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
        feishu: {
          appId,
          appSecret,
          verificationToken,
          encryptKey,
          allowFrom: allowAllUsers ? ["*"] : [],
        },
      },
    };

    await prompter.note(
      [
        "配置完成!",
        "",
        "下一步:",
        "1. 在飞书开放平台配置事件订阅 URL",
        "2. 添加权限: 获取与发送单聊消息、获取与发送群组消息",
        "3. 发布版本并启用应用",
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
        feishu: {
          ...cfg.channels?.feishu,
          enabled: false,
        } as FeishuConfig,
      },
    };
  },
};
