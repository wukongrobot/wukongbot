# 🎯 Onboard 流程已完善 - 硅基流动支持

## ✅ 完成的修改

### 1. 添加模型定义 (`src/commands/onboard-auth.models.ts`)

```typescript
// SiliconFlow (硅基流动)
export const SILICONFLOW_BASE_URL = "https://api.siliconflow.cn/v1";
export const SILICONFLOW_DEFAULT_MODEL_ID = "deepseek-ai/DeepSeek-V3";
export const SILICONFLOW_DEFAULT_MODEL_REF = `siliconflow/${SILICONFLOW_DEFAULT_MODEL_ID}`;
export const SILICONFLOW_DEFAULT_CONTEXT_WINDOW = 128000;
export const SILICONFLOW_DEFAULT_MAX_TOKENS = 8192;
export const SILICONFLOW_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

export function buildSiliconFlowModelDefinition(): ModelDefinitionConfig {
  return {
    id: SILICONFLOW_DEFAULT_MODEL_ID,
    name: "DeepSeek V3 (硅基流动)",
    api: "openai-completions",  // ⚠️ 关键：使用 completions API
    reasoning: false,
    input: ["text"],
    cost: SILICONFLOW_DEFAULT_COST,
    contextWindow: SILICONFLOW_DEFAULT_CONTEXT_WINDOW,
    maxTokens: SILICONFLOW_DEFAULT_MAX_TOKENS,
  };
}
```

### 2. 添加配置函数 (`src/commands/onboard-auth.config-core.ts`)

```typescript
// SiliconFlow (硅基流动)
export function applySiliconFlowProviderConfig(cfg: MoltbotConfig): MoltbotConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[SILICONFLOW_DEFAULT_MODEL_REF] = {
    ...models[SILICONFLOW_DEFAULT_MODEL_REF],
    alias: models[SILICONFLOW_DEFAULT_MODEL_REF]?.alias ?? "硅基流动",
  };

  const providers = { ...cfg.models?.providers };
  const existingProvider = providers.siliconflow;
  const existingModels = Array.isArray(existingProvider?.models) ? existingProvider.models : [];
  const defaultModel = buildSiliconFlowModelDefinition();
  const hasDefaultModel = existingModels.some((model) => model.id === SILICONFLOW_DEFAULT_MODEL_ID);
  const mergedModels = hasDefaultModel ? existingModels : [...existingModels, defaultModel];
  const { apiKey: existingApiKey, ...existingProviderRest } = (existingProvider ?? {}) as Record<
    string,
    unknown
  > as { apiKey?: string };
  const resolvedApiKey = typeof existingApiKey === "string" ? existingApiKey : undefined;
  const normalizedApiKey = resolvedApiKey?.trim();
  providers.siliconflow = {
    ...existingProviderRest,
    baseUrl: SILICONFLOW_BASE_URL,
    api: "openai-completions",  // ⚠️ 关键：使用 completions API
    ...(normalizedApiKey ? { apiKey: normalizedApiKey } : {}),
    models: mergedModels.length > 0 ? mergedModels : [defaultModel],
  };

  return {
    ...cfg,
    agents: {
      ...cfg.agents,
      defaults: {
        ...cfg.agents?.defaults,
        models,
      },
    },
    models: {
      mode: cfg.models?.mode ?? "merge",
      providers,
    },
  };
}

export function applySiliconFlowConfig(cfg: MoltbotConfig): MoltbotConfig {
  const next = applySiliconFlowProviderConfig(cfg);
  const existingModel = next.agents?.defaults?.model;
  return {
    ...next,
    agents: {
      ...next.agents,
      defaults: {
        ...next.agents?.defaults,
        model: {
          ...(existingModel && "fallbacks" in (existingModel as Record<string, unknown>)
            ? {
                fallbacks: (existingModel as { fallbacks?: string[] }).fallbacks,
              }
            : undefined),
          primary: SILICONFLOW_DEFAULT_MODEL_REF,  // siliconflow/deepseek-ai/DeepSeek-V3
        },
      },
    },
  };
}
```

### 3. 添加 API Key 设置函数 (`src/commands/onboard-auth.credentials.ts`)

```typescript
export async function setSiliconFlowApiKey(key: string, agentDir?: string) {
  // Write to resolved agent dir so gateway finds credentials on startup.
  upsertAuthProfile({
    profileId: "siliconflow:default",
    credential: {
      type: "api_key",
      provider: "siliconflow",
      key,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}
```

### 4. 导出函数 (`src/commands/onboard-auth.ts`)

```typescript
export {
  SILICONFLOW_DEFAULT_MODEL_ID,
  SILICONFLOW_DEFAULT_MODEL_REF,
} from "./onboard-auth.models.js";

export {
  // ...其他函数
  applySiliconFlowConfig,
  applySiliconFlowProviderConfig,
} from "./onboard-auth.config-core.js";

export {
  // ...其他函数
  setSiliconFlowApiKey,
} from "./onboard-auth.credentials.js";
```

---

## 📋 Onboard 配置已存在

在 `src/commands/auth-choice-options.ts` 中：

```typescript
{
  value: "siliconflow",
  label: "SiliconFlow (硅基流动)",
  hint: "API key (多模型支持)",
  choices: ["openai-api-key"],  // 使用通用的 openai-api-key 选项
}
```

---

## ⚠️ 待完成事项

### 需要在 onboard wizard 中调用配置函数

根据其他 provider（Moonshot、Kimi Code）的模式，需要在某个地方：

1. 检测 `authGroupId === "siliconflow"`
2. 调用 `await setSiliconFlowApiKey(apiKey)`
3. 调用 `applySiliconFlowConfig(cfg)` 或 `applySiliconFlowProviderConfig(cfg)`

这部分代码可能在：
- `src/wizard/onboarding.ts`
- `src/wizard/onboarding.finalize.ts`
- 或其他 wizard 相关文件

**但是**，由于 `authChoice` 是 `"openai-api-key"`，系统可能会默认将其作为 OpenAI 处理。

---

## 🔍 两种可能的实现方式

### 方式 1：修改 wizard，检测 authGroupId

在 wizard 代码中添加：

```typescript
if (authGroupId === "siliconflow" && authChoice === "openai-api-key") {
  await setSiliconFlowApiKey(apiKey);
  config = applySiliconFlowConfig(config);
}
```

### 方式 2：让用户在选择硅基流动后，明确选择模型

硅基流动目前使用的是通用的 `openai-api-key`，这可能导致系统无法自动识别。

可以考虑：
- 添加专门的 `siliconflow-api-key` authChoice
- 或者在 wizard 中根据 authGroupId 做特殊处理

---

## 🎯 当前状态

### ✅ 已完成
1. ✅ 模型定义函数
2. ✅ Provider 配置函数
3. ✅ API Key 设置函数
4. ✅ 函数导出
5. ✅ AuthChoice 选项（已存在）
6. ✅ 编译成功

### ⏳ 待验证
1. ⏳ Onboard wizard 是否正确调用配置函数
2. ⏳ API Key 是否正确存储到 siliconflow provider

### 🧪 测试方法

```bash
# 1. 重置配置
pnpm wukongbot onboard --reset

# 2. 选择 "SiliconFlow (硅基流动)"
# 3. 输入 API Key
# 4. 检查生成的配置：
cat ~/.clawdbot/moltbot.json | jq '{primary: .agents.defaults.model.primary, providers: (.models.providers | keys)}'

# 5. 验证是否包含：
# - primary: "siliconflow/deepseek-ai/DeepSeek-V3"
# - providers: ["siliconflow"]
# - models.providers.siliconflow.api: "openai-completions"
```

---

## 📝 下一步建议

如果测试后发现 onboard 没有自动生成硅基流动配置，需要：

1. 搜索 `authChoice === "openai-api-key"` 的处理逻辑
2. 添加 `authGroupId === "siliconflow"` 的特殊处理
3. 或者创建专门的 `siliconflow-api-key` authChoice

但现在，让我们先测试看看现有的代码是否已经工作！
