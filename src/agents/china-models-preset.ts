/**
 * 国产模型厂商的常见模型预设列表
 *
 * 这些模型会在onboard时作为快速选择项展示，
 * 避免用户需要手动输入模型名称。
 */

export type PresetModel = {
  id: string;
  name: string;
  contextWindow?: number;
  reasoning?: boolean;
};

export type ProviderPreset = {
  provider: string;
  providerName: string;
  models: PresetModel[];
};

/**
 * 国产模型厂商预设列表
 */
export const CHINA_MODEL_PRESETS: ProviderPreset[] = [
  // 通义千问 (Qwen)
  {
    provider: "qwen",
    providerName: "通义千问 (Qwen)",
    models: [
      { id: "qwen-max", name: "Qwen Max", contextWindow: 30000 },
      { id: "qwen-plus", name: "Qwen Plus", contextWindow: 30000 },
      { id: "qwen-turbo", name: "Qwen Turbo", contextWindow: 8000 },
      { id: "qwen2.5-72b-instruct", name: "Qwen 2.5 72B", contextWindow: 32768 },
      { id: "qwen2.5-32b-instruct", name: "Qwen 2.5 32B", contextWindow: 32768 },
      { id: "qwen2.5-14b-instruct", name: "Qwen 2.5 14B", contextWindow: 32768 },
      { id: "qwen2.5-7b-instruct", name: "Qwen 2.5 7B", contextWindow: 32768 },
    ],
  },

  // 硅基流动 (SiliconFlow)
  {
    provider: "siliconflow",
    providerName: "硅基流动 (SiliconFlow)",
    models: [
      { id: "deepseek-ai/DeepSeek-R1", name: "DeepSeek R1", contextWindow: 64000, reasoning: true },
      { id: "deepseek-ai/DeepSeek-V3", name: "DeepSeek V3", contextWindow: 64000 },
      { id: "Qwen/QwQ-32B-Preview", name: "QwQ 32B", contextWindow: 32768, reasoning: true },
      { id: "Qwen/Qwen2.5-72B-Instruct", name: "Qwen 2.5 72B", contextWindow: 32768 },
      { id: "Pro/Qwen/Qwen2.5-7B-Instruct", name: "Qwen 2.5 7B Pro", contextWindow: 32768 },
    ],
  },

  // 豆包 (Doubao/字节跳动)
  {
    provider: "doubao",
    providerName: "豆包 (Doubao)",
    models: [
      { id: "doubao-pro-256k", name: "豆包 Pro 256K", contextWindow: 256000 },
      { id: "doubao-pro-128k", name: "豆包 Pro 128K", contextWindow: 128000 },
      { id: "doubao-pro-32k", name: "豆包 Pro 32K", contextWindow: 32000 },
      { id: "doubao-lite-128k", name: "豆包 Lite 128K", contextWindow: 128000 },
      { id: "doubao-lite-32k", name: "豆包 Lite 32K", contextWindow: 32000 },
    ],
  },

  // 文心一言 (Ernie/百度)
  {
    provider: "ernie",
    providerName: "文心一言 (Ernie)",
    models: [
      { id: "ernie-4.0-turbo-128k", name: "文心 4.0 Turbo 128K", contextWindow: 128000 },
      { id: "ernie-4.0-8k", name: "文心 4.0 8K", contextWindow: 8000 },
      { id: "ernie-3.5-128k", name: "文心 3.5 128K", contextWindow: 128000 },
      { id: "ernie-3.5-8k", name: "文心 3.5 8K", contextWindow: 8000 },
      { id: "ernie-speed-128k", name: "文心 Speed 128K", contextWindow: 128000 },
      { id: "ernie-speed-8k", name: "文心 Speed 8K", contextWindow: 8000 },
      { id: "ernie-lite-8k", name: "文心 Lite 8K", contextWindow: 8000 },
    ],
  },

  // 讯飞星火 (Spark)
  {
    provider: "spark",
    providerName: "讯飞星火 (Spark)",
    models: [
      { id: "spark-max-32k", name: "星火 Max 32K", contextWindow: 32000 },
      { id: "spark-pro-128k", name: "星火 Pro 128K", contextWindow: 128000 },
      { id: "spark-v3.5", name: "星火 V3.5", contextWindow: 8000 },
      { id: "spark-lite", name: "星火 Lite", contextWindow: 8000 },
    ],
  },

  // ChatGLM (智谱AI)
  {
    provider: "zhipu",
    providerName: "智谱AI (GLM)",
    models: [
      { id: "glm-4-plus", name: "GLM-4 Plus", contextWindow: 128000 },
      { id: "glm-4-0520", name: "GLM-4 0520", contextWindow: 128000 },
      { id: "glm-4-air", name: "GLM-4 Air", contextWindow: 128000 },
      { id: "glm-4-airx", name: "GLM-4 AirX", contextWindow: 8000 },
      { id: "glm-4-flash", name: "GLM-4 Flash", contextWindow: 128000 },
      { id: "glm-4v-plus", name: "GLM-4V Plus", contextWindow: 8000 },
    ],
  },

  // 腾讯混元 (Hunyuan)
  {
    provider: "hunyuan",
    providerName: "腾讯混元 (Hunyuan)",
    models: [
      { id: "hunyuan-turbo", name: "混元 Turbo", contextWindow: 32000 },
      { id: "hunyuan-pro", name: "混元 Pro", contextWindow: 32000 },
      { id: "hunyuan-standard", name: "混元 Standard", contextWindow: 4000 },
      { id: "hunyuan-lite", name: "混元 Lite", contextWindow: 4000 },
    ],
  },

  // Moonshot (Kimi/月之暗面)
  {
    provider: "moonshot",
    providerName: "Moonshot (Kimi)",
    models: [
      { id: "moonshot-v1-128k", name: "Kimi 128K", contextWindow: 128000 },
      { id: "moonshot-v1-32k", name: "Kimi 32K", contextWindow: 32000 },
      { id: "moonshot-v1-8k", name: "Kimi 8K", contextWindow: 8000 },
    ],
  },

  // DeepSeek
  {
    provider: "deepseek",
    providerName: "DeepSeek",
    models: [
      { id: "deepseek-chat", name: "DeepSeek Chat", contextWindow: 64000 },
      { id: "deepseek-reasoner", name: "DeepSeek Reasoner", contextWindow: 64000, reasoning: true },
    ],
  },

  // 百川 (Baichuan)
  {
    provider: "baichuan",
    providerName: "百川 (Baichuan)",
    models: [
      { id: "baichuan4", name: "百川 4", contextWindow: 32000 },
      { id: "baichuan3-turbo-128k", name: "百川 3 Turbo 128K", contextWindow: 128000 },
      { id: "baichuan3-turbo", name: "百川 3 Turbo", contextWindow: 32000 },
      { id: "baichuan2-turbo", name: "百川 2 Turbo", contextWindow: 32000 },
    ],
  },

  // MINIMAX
  {
    provider: "minimax",
    providerName: "MINIMAX",
    models: [
      { id: "abab6.5s-chat", name: "ABAB 6.5s Chat", contextWindow: 245760 },
      { id: "abab6.5g-chat", name: "ABAB 6.5g Chat", contextWindow: 8192 },
      { id: "abab6.5t-chat", name: "ABAB 6.5t Chat", contextWindow: 8192 },
      { id: "abab5.5s-chat", name: "ABAB 5.5s Chat", contextWindow: 8192 },
    ],
  },

  // 零一万物 (Yi)
  {
    provider: "yi",
    providerName: "零一万物 (Yi)",
    models: [
      { id: "yi-lightning", name: "Yi Lightning", contextWindow: 16000 },
      { id: "yi-large-turbo", name: "Yi Large Turbo", contextWindow: 16000 },
      { id: "yi-large", name: "Yi Large", contextWindow: 32000 },
      { id: "yi-medium", name: "Yi Medium", contextWindow: 16000 },
    ],
  },

  // 阶跃星辰 (StepFun)
  {
    provider: "stepfun",
    providerName: "阶跃星辰 (StepFun)",
    models: [
      { id: "step-1-128k", name: "Step 1 128K", contextWindow: 128000 },
      { id: "step-1-32k", name: "Step 1 32K", contextWindow: 32000 },
      { id: "step-1-8k", name: "Step 1 8K", contextWindow: 8000 },
      { id: "step-2-16k", name: "Step 2 16K", contextWindow: 16000 },
    ],
  },
];

/**
 * 检查provider是否是国产模型厂商
 */
export function isChinaProvider(provider: string): boolean {
  const normalized = provider.toLowerCase().trim();
  return CHINA_MODEL_PRESETS.some((preset) => preset.provider === normalized);
}

/**
 * 获取指定provider的预设模型列表
 */
export function getChinaModelsForProvider(provider: string): PresetModel[] {
  const normalized = provider.toLowerCase().trim();
  const preset = CHINA_MODEL_PRESETS.find((p) => p.provider === normalized);
  return preset?.models ?? [];
}

/**
 * 获取所有国产模型厂商的provider ID列表
 */
export function getChinaProviderIds(): string[] {
  return CHINA_MODEL_PRESETS.map((preset) => preset.provider);
}

/**
 * 获取provider的显示名称
 */
export function getChinaProviderName(provider: string): string | undefined {
  const normalized = provider.toLowerCase().trim();
  const preset = CHINA_MODEL_PRESETS.find((p) => p.provider === normalized);
  return preset?.providerName;
}
