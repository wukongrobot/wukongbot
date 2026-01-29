/**
 * 企业微信 Onboarding Adapter (新版)
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
import type { WeComConfig } from "./types.js";

const channel = "wecom" as const;

export const wecomOnboardingAdapter: ChannelOnboardingAdapter = {
  channel,

  async getStatus({ cfg }): Promise<ChannelOnboardingStatus> {
    const wecomConfig = cfg.channels?.wecom as WeComConfig | undefined;
    const corpId = wecomConfig?.corpId;
    const agentId = wecomConfig?.agentId;
    const secret = wecomConfig?.secret;
    const configured = Boolean(
      typeof corpId === "string" && corpId.trim().length > 0 &&
      typeof agentId === "number" &&
      typeof secret === "string" && secret.trim().length > 0,
    );

    return {
      channel,
      configured,
      statusLines: [`企业微信: ${configured ? "已配置" : "需要配置 Corp ID, Agent ID 和 Secret"}`],
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
        "企业微信集成配置引导",
        "",
        "你需要先在企业微信管理后台创建应用:",
        "1. 访问 https://work.weixin.qq.com/",
        "2. 进入「应用管理」->「自建」创建应用",
        "3. 获取 Corp ID, Agent ID 和 Secret",
        "4. 配置可信 IP 和接收消息服务器",
      ].join("\n"),
      "企业微信配置",
    );

    // Corp ID
    const corpId = String(
      await prompter.text({
        message: "请输入企业 ID (Corp ID)",
        validate: (value) => (value?.trim() ? undefined : "Corp ID 不能为空"),
      }),
    ).trim();

    // Agent ID
    const agentIdStr = String(
      await prompter.text({
        message: "请输入应用 ID (Agent ID)",
        validate: (value) => {
          const num = Number.parseInt(value ?? "");
          return Number.isNaN(num) ? "Agent ID 必须是数字" : undefined;
        },
      }),
    ).trim();

    const agentId = Number.parseInt(agentIdStr);

    // Secret
    const secret = String(
      await prompter.text({
        message: "请输入应用 Secret",
        validate: (value) => (value?.trim() ? undefined : "Secret 不能为空"),
      }),
    ).trim();

    // 用户白名单
    const allowAllUsers = await prompter.confirm({
      message: "是否允许所有用户与机器人交互?",
      initialValue: true,
    });

    next = {
      ...next,
      channels: {
        ...next.channels,
        wecom: {
          corpId,
          agentId,
          secret,
          allowFrom: allowAllUsers ? ["*"] : [],
        },
      },
    };

    await prompter.note(
      [
        "配置完成!",
        "",
        "下一步:",
        "1. 在企业微信管理后台配置接收消息服务器",
        "2. 配置可信IP地址",
        "3. 启用应用并授权",
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
        wecom: {
          ...cfg.channels?.wecom,
          enabled: false,
        } as WeComConfig,
      },
    };
  },
};
