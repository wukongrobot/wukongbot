import type { MoltbotConfig } from "../config/config.js";
import type { RuntimeEnv } from "../runtime.js";
import type { WizardPrompter } from "../wizard/prompts.js";
import { buildWorkspaceHookStatus } from "../hooks/hooks-status.js";
import { resolveAgentWorkspaceDir, resolveDefaultAgentId } from "../agents/agent-scope.js";
import { formatCliCommand } from "../cli/command-format.js";

export async function setupInternalHooks(
  cfg: MoltbotConfig,
  runtime: RuntimeEnv,
  prompter: WizardPrompter,
): Promise<MoltbotConfig> {
  await prompter.note(
    [
      "钩子让你在 agent 命令被发出时自动执行操作。",
      "例子: 当你发出 /new 时保存会话上下文到记忆。",
      "",
      "了解更多: https://docs.wukongbot.com/hooks",
    ].join("\n"),
    "钩子介绍",
  );

  // Discover available hooks using the hook discovery system
  const workspaceDir = resolveAgentWorkspaceDir(cfg, resolveDefaultAgentId(cfg));
  const report = buildWorkspaceHookStatus(workspaceDir, { config: cfg });

  // Show every eligible hook so users can opt in during onboarding.
  const eligibleHooks = report.hooks.filter((h) => h.eligible);

  if (eligibleHooks.length === 0) {
    await prompter.note("没有可用的钩子。你可以在配置中稍后配置钩子。", "没有可用的钩子");
    return cfg;
  }

  const toEnable = await prompter.multiselect({
    message: "启用钩子?",
    options: [
      { value: "__skip__", label: "现在跳过" },
      ...eligibleHooks.map((hook) => ({
        value: hook.name,
        label: `${hook.emoji ?? "🔗"} ${hook.name}`,
        hint: hook.description,
      })),
    ],
  });

  const selected = toEnable.filter((name) => name !== "__skip__");
  if (selected.length === 0) {
    return cfg;
  }

  // Enable selected hooks using the new entries config format
  const entries = { ...cfg.hooks?.internal?.entries };
  for (const name of selected) {
    entries[name] = { enabled: true };
  }

  const next: MoltbotConfig = {
    ...cfg,
    hooks: {
      ...cfg.hooks,
      internal: {
        enabled: true,
        entries,
      },
    },
  };

  await prompter.note(
    [
      `已启用 ${selected.length} 个钩子: ${selected.join(", ")}`,
      "",
      "你可以稍后使用:",
      `  ${formatCliCommand("wukongbot hooks list")}`,
      `  ${formatCliCommand("wukongbot hooks enable <name>")}`,
      `  ${formatCliCommand("wukongbot hooks disable <name>")}`,
    ].join("\n"),
    "钩子配置完成",
  );

  return next;
}
