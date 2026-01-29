import { installSkill } from "../agents/skills-install.js";
import { buildWorkspaceSkillStatus } from "../agents/skills-status.js";
import { formatCliCommand } from "../cli/command-format.js";
import type { MoltbotConfig } from "../config/config.js";
import type { RuntimeEnv } from "../runtime.js";
import type { WizardPrompter } from "../wizard/prompts.js";
import { detectBinary, resolveNodeManagerOptions } from "./onboard-helpers.js";

function summarizeInstallFailure(message: string): string | undefined {
  const cleaned = message.replace(/^Install failed(?:\s*\([^)]*\))?\s*:?\s*/i, "").trim();
  if (!cleaned) return undefined;
  const maxLen = 140;
  return cleaned.length > maxLen ? `${cleaned.slice(0, maxLen - 1)}…` : cleaned;
}

function formatSkillHint(skill: {
  description?: string;
  install: Array<{ label: string }>;
}): string {
  const desc = skill.description?.trim();
  const installLabel = skill.install[0]?.label?.trim();
  const combined = desc && installLabel ? `${desc} — ${installLabel}` : desc || installLabel;
  if (!combined) return "install";
  const maxLen = 90;
  return combined.length > maxLen ? `${combined.slice(0, maxLen - 1)}…` : combined;
}

function upsertSkillEntry(
  cfg: MoltbotConfig,
  skillKey: string,
  patch: { apiKey?: string },
): MoltbotConfig {
  const entries = { ...cfg.skills?.entries };
  const existing = (entries[skillKey] as { apiKey?: string } | undefined) ?? {};
  entries[skillKey] = { ...existing, ...patch };
  return {
    ...cfg,
    skills: {
      ...cfg.skills,
      entries,
    },
  };
}

export async function setupSkills(
  cfg: MoltbotConfig,
  workspaceDir: string,
  runtime: RuntimeEnv,
  prompter: WizardPrompter,
): Promise<MoltbotConfig> {
  const report = buildWorkspaceSkillStatus(workspaceDir, { config: cfg });
  const eligible = report.skills.filter((s) => s.eligible);
  const missing = report.skills.filter((s) => !s.eligible && !s.disabled && !s.blockedByAllowlist);
  const blocked = report.skills.filter((s) => s.blockedByAllowlist);

  const needsBrewPrompt =
    process.platform !== "win32" &&
    report.skills.some((skill) => skill.install.some((option) => option.kind === "brew")) &&
    !(await detectBinary("brew"));

  await prompter.note(
    [
      `Eligible: ${eligible.length}`,
      `Missing requirements: ${missing.length}`,
      `Blocked by allowlist: ${blocked.length}`,
    ].join("\n"),
    "技能状态",
  );

  const shouldConfigure = await prompter.confirm({
    message: "现在配置技能吗? (推荐)",
    initialValue: true,
  });
  if (!shouldConfigure) return cfg;

  if (needsBrewPrompt) {
    await prompter.note(
      ["许多技能依赖是通过 Homebrew 分发的。", "没有 brew, 你需要手动构建或下载发布版本。"].join(
        "\n",
      ),
      "Homebrew recommended",
    );
    const showBrewInstall = await prompter.confirm({
      message: "显示 Homebrew 安装命令?",
      initialValue: true,
    });
    if (showBrewInstall) {
      await prompter.note(
        [
          "Run:",
          '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
        ].join("\n"),
        "Homebrew 安装",
      );
    }
  }

  const nodeManager = (await prompter.select({
    message: "首选的 node 管理器用于技能安装",
    options: resolveNodeManagerOptions(),
  })) as "npm" | "pnpm" | "bun";

  let next: MoltbotConfig = {
    ...cfg,
    skills: {
      ...cfg.skills,
      install: {
        ...cfg.skills?.install,
        nodeManager,
      },
    },
  };

  const installable = missing.filter(
    (skill) => skill.install.length > 0 && skill.missing.bins.length > 0,
  );
  if (installable.length > 0) {
    const toInstall = await prompter.multiselect({
      message: "安装缺少的技能依赖",
      options: [
        {
          value: "__skip__",
          label: "跳过现在",
          hint: "继续不安装依赖",
        },
        ...installable.map((skill) => ({
          value: skill.name,
          label: `${skill.emoji ?? "🧩"} ${skill.name}`,
          hint: formatSkillHint(skill),
        })),
      ],
    });

    const selected = (toInstall as string[]).filter((name) => name !== "__skip__");
    for (const name of selected) {
      const target = installable.find((s) => s.name === name);
      if (!target || target.install.length === 0) continue;
      const installId = target.install[0]?.id;
      if (!installId) continue;
      const spin = prompter.progress(`安装 ${name}…`);
      const result = await installSkill({
        workspaceDir,
        skillName: target.name,
        installId,
        config: next,
      });
      if (result.ok) {
        spin.stop(`安装成功 ${name}`);
      } else {
        const code = result.code == null ? "" : ` (exit ${result.code})`;
        const detail = summarizeInstallFailure(result.message);
        spin.stop(`安装失败: ${name}${code}${detail ? ` — ${detail}` : ""}`);
        if (result.stderr) runtime.log(result.stderr.trim());
        else if (result.stdout) runtime.log(result.stdout.trim());
        runtime.log(`提示: 运行 \`${formatCliCommand("wukongbot doctor")}\` 来查看技能 + 要求。`);
        runtime.log("文档: https://docs.wukongbot.com/skills");
      }
    }
  }

  for (const skill of missing) {
    if (!skill.primaryEnv || skill.missing.env.length === 0) continue;
    const wantsKey = await prompter.confirm({
      message: `设置 ${skill.primaryEnv} 为 ${skill.name}?`,
      initialValue: false,
    });
    if (!wantsKey) continue;
    const apiKey = String(
      await prompter.text({
        message: `输入 ${skill.primaryEnv}`,
        validate: (value) => (value?.trim() ? undefined : "Required"),
      }),
    );
    next = upsertSkillEntry(next, skill.skillKey, { apiKey: apiKey.trim() });
  }

  return next;
}
