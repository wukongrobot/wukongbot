import { resolveAgentModelPrimary } from "../agents/agent-scope.js";
import { ensureAuthProfileStore, listProfilesForProvider } from "../agents/auth-profiles.js";
import { DEFAULT_MODEL, DEFAULT_PROVIDER } from "../agents/defaults.js";
import { getCustomProviderApiKey, resolveEnvApiKey } from "../agents/model-auth.js";
import { loadModelCatalog } from "../agents/model-catalog.js";
import { resolveConfiguredModelRef } from "../agents/model-selection.js";
import type { MoltbotConfig } from "../config/config.js";
import type { WizardPrompter } from "../wizard/prompts.js";
import { OPENAI_CODEX_DEFAULT_MODEL } from "./openai-codex-model-default.js";
import { CHINA_MODEL_PRESETS, isChinaProvider } from "../agents/china-models-preset.js";

export async function warnIfModelConfigLooksOff(
  config: MoltbotConfig,
  prompter: WizardPrompter,
  options?: { agentId?: string; agentDir?: string },
) {
  const agentModelOverride = options?.agentId
    ? resolveAgentModelPrimary(config, options.agentId)
    : undefined;
  const configWithModel =
    agentModelOverride && agentModelOverride.length > 0
      ? {
          ...config,
          agents: {
            ...config.agents,
            defaults: {
              ...config.agents?.defaults,
              model: {
                ...(typeof config.agents?.defaults?.model === "object"
                  ? config.agents.defaults.model
                  : undefined),
                primary: agentModelOverride,
              },
            },
          },
        }
      : config;
  const ref = resolveConfiguredModelRef({
    cfg: configWithModel,
    defaultProvider: DEFAULT_PROVIDER,
    defaultModel: DEFAULT_MODEL,
  });
  const warnings: string[] = [];
  let catalog = await loadModelCatalog({
    config: configWithModel,
    useCache: false,
  });

  // 补充国产模型预设到 catalog
  if (isChinaProvider(ref.provider)) {
    const providerPreset = CHINA_MODEL_PRESETS.find((p) => p.provider === ref.provider);
    if (providerPreset) {
      const existingIds = new Set(
        catalog.filter((e) => e.provider === ref.provider).map((e) => e.id.toLowerCase()),
      );
      for (const preset of providerPreset.models) {
        if (!existingIds.has(preset.id.toLowerCase())) {
          catalog.push({
            id: preset.id,
            name: preset.name,
            provider: ref.provider,
            contextWindow: preset.contextWindow,
            reasoning: preset.reasoning,
          });
        }
      }
    }
  }

  if (catalog.length > 0) {
    const known = catalog.some(
      (entry) => entry.provider === ref.provider && entry.id === ref.model,
    );
    if (!known) {
      warnings.push(
        `未找到模型: ${ref.provider}/${ref.model}. 更新 agents.defaults.model 或运行 /models list.`,
      );
    }
  }

  const store = ensureAuthProfileStore(options?.agentDir);

  // 某些国产厂商使用 OpenAI 兼容的 API，需要检查 openai 的认证配置
  const openaiCompatibleProviders = ["deepseek", "siliconflow", "doubao"];
  const authProvider = openaiCompatibleProviders.includes(ref.provider) ? "openai" : ref.provider;

  const hasProfile = listProfilesForProvider(store, authProvider).length > 0;
  const envKey = resolveEnvApiKey(authProvider);
  const customKey = getCustomProviderApiKey(config, authProvider);
  if (!hasProfile && !envKey && !customKey) {
    warnings.push(
      `未配置提供者 "${ref.provider}" 的认证。 代理可能无法正常工作，直到凭证添加为止。`,
    );
  }

  if (ref.provider === "openai") {
    const hasCodex = listProfilesForProvider(store, "openai-codex").length > 0;
    if (hasCodex) {
      warnings.push(
        `检测到 OpenAI Codex OAuth。 考虑将 agents.defaults.model 设置为 ${OPENAI_CODEX_DEFAULT_MODEL}。`,
      );
    }
  }

  if (warnings.length > 0) {
    await prompter.note(warnings.join("\n"), "模型检查");
  }
}
