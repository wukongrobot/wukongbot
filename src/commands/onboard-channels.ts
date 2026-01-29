import { resolveAgentWorkspaceDir, resolveDefaultAgentId } from "../agents/agent-scope.js";
import { listChannelPluginCatalogEntries } from "../channels/plugins/catalog.js";
import { listChannelPlugins, getChannelPlugin } from "../channels/plugins/index.js";
import type { ChannelMeta } from "../channels/plugins/types.js";
import {
  formatChannelPrimerLine,
  formatChannelSelectionLine,
  listChatChannels,
} from "../channels/registry.js";
import type { MoltbotConfig } from "../config/config.js";
import { isChannelConfigured } from "../config/plugin-auto-enable.js";
import type { DmPolicy } from "../config/types.js";
import { resolveChannelDefaultAccountId } from "../channels/plugins/helpers.js";
import { DEFAULT_ACCOUNT_ID, normalizeAccountId } from "../routing/session-key.js";
import type { RuntimeEnv } from "../runtime.js";
import { formatDocsLink } from "../terminal/links.js";
import { formatCliCommand } from "../cli/command-format.js";
import { enablePluginInConfig } from "../plugins/enable.js";
import type { WizardPrompter, WizardSelectOption } from "../wizard/prompts.js";
import type { ChannelChoice } from "./onboard-types.js";
import {
  getChannelOnboardingAdapter,
  listChannelOnboardingAdapters,
} from "./onboarding/registry.js";
import {
  ensureOnboardingPluginInstalled,
  reloadOnboardingPluginRegistry,
} from "./onboarding/plugin-install.js";
import type {
  ChannelOnboardingDmPolicy,
  ChannelOnboardingStatus,
  SetupChannelsOptions,
} from "./onboarding/types.js";

type ConfiguredChannelAction = "update" | "disable" | "delete" | "skip";

type ChannelStatusSummary = {
  installedPlugins: ReturnType<typeof listChannelPlugins>;
  catalogEntries: ReturnType<typeof listChannelPluginCatalogEntries>;
  statusByChannel: Map<ChannelChoice, ChannelOnboardingStatus>;
  statusLines: string[];
};

function formatAccountLabel(accountId: string): string {
  return accountId === DEFAULT_ACCOUNT_ID ? "default (primary)" : accountId;
}

async function promptConfiguredAction(params: {
  prompter: WizardPrompter;
  label: string;
  supportsDisable: boolean;
  supportsDelete: boolean;
}): Promise<ConfiguredChannelAction> {
  const { prompter, label, supportsDisable, supportsDelete } = params;
  const updateOption: WizardSelectOption<ConfiguredChannelAction> = {
    value: "update",
    label: "Modify settings",
  };
  const disableOption: WizardSelectOption<ConfiguredChannelAction> = {
    value: "disable",
    label: "Disable (keeps config)",
  };
  const deleteOption: WizardSelectOption<ConfiguredChannelAction> = {
    value: "delete",
    label: "Delete config",
  };
  const skipOption: WizardSelectOption<ConfiguredChannelAction> = {
    value: "skip",
    label: "Skip (leave as-is)",
  };
  const options: Array<WizardSelectOption<ConfiguredChannelAction>> = [
    updateOption,
    ...(supportsDisable ? [disableOption] : []),
    ...(supportsDelete ? [deleteOption] : []),
    skipOption,
  ];
  return (await prompter.select({
    message: `${label} already configured. What do you want to do?`,
    options,
    initialValue: "update",
  })) as ConfiguredChannelAction;
}

async function promptRemovalAccountId(params: {
  cfg: MoltbotConfig;
  prompter: WizardPrompter;
  label: string;
  channel: ChannelChoice;
}): Promise<string> {
  const { cfg, prompter, label, channel } = params;
  const plugin = getChannelPlugin(channel);
  if (!plugin) return DEFAULT_ACCOUNT_ID;
  const accountIds = plugin.config.listAccountIds(cfg).filter(Boolean);
  const defaultAccountId = resolveChannelDefaultAccountId({ plugin, cfg, accountIds });
  if (accountIds.length <= 1) return defaultAccountId;
  const selected = (await prompter.select({
    message: `${label} account`,
    options: accountIds.map((accountId) => ({
      value: accountId,
      label: formatAccountLabel(accountId),
    })),
    initialValue: defaultAccountId,
  })) as string;
  return normalizeAccountId(selected) ?? defaultAccountId;
}

async function collectChannelStatus(params: {
  cfg: MoltbotConfig;
  options?: SetupChannelsOptions;
  accountOverrides: Partial<Record<ChannelChoice, string>>;
}): Promise<ChannelStatusSummary> {
  const installedPlugins = listChannelPlugins();
  const installedIds = new Set(installedPlugins.map((plugin) => plugin.id));
  const workspaceDir = resolveAgentWorkspaceDir(params.cfg, resolveDefaultAgentId(params.cfg));
  const catalogEntries = listChannelPluginCatalogEntries({ workspaceDir }).filter(
    (entry) => !installedIds.has(entry.id),
  );
  const statusEntries = await Promise.all(
    listChannelOnboardingAdapters().map((adapter) =>
      adapter.getStatus({
        cfg: params.cfg,
        options: params.options,
        accountOverrides: params.accountOverrides,
      }),
    ),
  );
  const statusByChannel = new Map(statusEntries.map((entry) => [entry.channel, entry]));
  const fallbackStatuses = listChatChannels()
    .filter((meta) => !statusByChannel.has(meta.id))
    .map((meta) => {
      const configured = isChannelConfigured(params.cfg, meta.id);
      const statusLabel = configured ? "configured (plugin disabled)" : "not configured";
      return {
        channel: meta.id,
        configured,
        statusLines: [`${meta.label}: ${statusLabel}`],
        selectionHint: configured ? "configured · plugin disabled" : "not configured",
        quickstartScore: 0,
      };
    });
  const catalogStatuses = catalogEntries.map((entry) => ({
    channel: entry.id,
    configured: false,
    statusLines: [`${entry.meta.label}: install plugin to enable`],
    selectionHint: "plugin · install",
    quickstartScore: 0,
  }));
  const combinedStatuses = [...statusEntries, ...fallbackStatuses, ...catalogStatuses];
  const mergedStatusByChannel = new Map(combinedStatuses.map((entry) => [entry.channel, entry]));
  const statusLines = combinedStatuses.flatMap((entry) => entry.statusLines);
  return {
    installedPlugins,
    catalogEntries,
    statusByChannel: mergedStatusByChannel,
    statusLines,
  };
}

export async function noteChannelStatus(params: {
  cfg: MoltbotConfig;
  prompter: WizardPrompter;
  options?: SetupChannelsOptions;
  accountOverrides?: Partial<Record<ChannelChoice, string>>;
}): Promise<void> {
  const { statusLines } = await collectChannelStatus({
    cfg: params.cfg,
    options: params.options,
    accountOverrides: params.accountOverrides ?? {},
  });
  if (statusLines.length > 0) {
    await params.prompter.note(statusLines.join("\n"), "频道状态");
  }
}

async function noteChannelPrimer(
  prompter: WizardPrompter,
  channels: Array<{ id: ChannelChoice; blurb: string; label: string }>,
): Promise<void> {
  const channelLines = channels.map((channel) =>
    formatChannelPrimerLine({
      id: channel.id,
      label: channel.label,
      selectionLabel: channel.label,
      docsPath: "/",
      blurb: channel.blurb,
    }),
  );
  await prompter.note(
    [
      "DM 安全: 默认是配对; 未知 DM 会得到一个配对码。",
      `批准方式: ${formatCliCommand("wukongbot pairing approve <channel> <code>")}`,
      '公共 DM 需要 dmPolicy="open" + allowFrom=["*"]。',
      '多用户 DM: 设置 session.dmScope="per-channel-peer" 以隔离会话。',
      `文档: ${formatDocsLink("/start/pairing", "start/pairing")}`,
      "",
      ...channelLines,
    ].join("\n"),
    "聊天频道工作原理",
  );
}

function resolveQuickstartDefault(
  statusByChannel: Map<ChannelChoice, { quickstartScore?: number }>,
): ChannelChoice | undefined {
  let best: { channel: ChannelChoice; score: number } | null = null;
  for (const [channel, status] of statusByChannel) {
    if (status.quickstartScore == null) continue;
    if (!best || status.quickstartScore > best.score) {
      best = { channel, score: status.quickstartScore };
    }
  }
  return best?.channel;
}

async function maybeConfigureDmPolicies(params: {
  cfg: MoltbotConfig;
  selection: ChannelChoice[];
  prompter: WizardPrompter;
  accountIdsByChannel?: Map<ChannelChoice, string>;
}): Promise<MoltbotConfig> {
  const { selection, prompter, accountIdsByChannel } = params;
  const dmPolicies = selection
    .map((channel) => getChannelOnboardingAdapter(channel)?.dmPolicy)
    .filter(Boolean) as ChannelOnboardingDmPolicy[];
  if (dmPolicies.length === 0) return params.cfg;

  const wants = await prompter.confirm({
    message: "现在配置 DM 访问策略吗? (默认: 配对)",
    initialValue: false,
  });
  if (!wants) return params.cfg;

  let cfg = params.cfg;
  const selectPolicy = async (policy: ChannelOnboardingDmPolicy) => {
    await prompter.note(
      [
        "默认: 配对 (未知 DM 会得到一个配对码).",
        `批准: ${formatCliCommand(`wukongbot pairing approve ${policy.channel} <code>`)}`,
        `白名单 DM: ${policy.policyKey}="allowlist" + ${policy.allowFromKey} entries.`,
        `公共 DM: ${policy.policyKey}="open" + ${policy.allowFromKey} includes "*".`,
        '多用户 DM: 设置 session.dmScope="per-channel-peer" 以隔离会话.',
        `文档: ${formatDocsLink("/start/pairing", "start/pairing")}`,
      ].join("\n"),
      `${policy.label} DM access`,
    );
    return (await prompter.select({
      message: `${policy.label} DM policy`,
      options: [
        { value: "pairing", label: "配对 (推荐)" },
        { value: "allowlist", label: "白名单 (仅特定用户)" },
        { value: "open", label: "公共 (公共入站 DM)" },
        { value: "disabled", label: "禁用 (忽略 DM)" },
      ],
    })) as DmPolicy;
  };

  for (const policy of dmPolicies) {
    const current = policy.getCurrent(cfg);
    const nextPolicy = await selectPolicy(policy);
    if (nextPolicy !== current) {
      cfg = policy.setPolicy(cfg, nextPolicy);
    }
    if (nextPolicy === "allowlist" && policy.promptAllowFrom) {
      cfg = await policy.promptAllowFrom({
        cfg,
        prompter,
        accountId: accountIdsByChannel?.get(policy.channel),
      });
    }
  }

  return cfg;
}

// Channel-specific prompts moved into onboarding adapters.

export async function setupChannels(
  cfg: MoltbotConfig,
  runtime: RuntimeEnv,
  prompter: WizardPrompter,
  options?: SetupChannelsOptions,
): Promise<MoltbotConfig> {
  let next = cfg;
  const forceAllowFromChannels = new Set(options?.forceAllowFromChannels ?? []);
  const accountOverrides: Partial<Record<ChannelChoice, string>> = {
    ...options?.accountIds,
  };
  if (options?.whatsappAccountId?.trim()) {
    accountOverrides.whatsapp = options.whatsappAccountId.trim();
  }

  const { installedPlugins, catalogEntries, statusByChannel, statusLines } =
    await collectChannelStatus({ cfg: next, options, accountOverrides });
  if (!options?.skipStatusNote && statusLines.length > 0) {
    await prompter.note(statusLines.join("\n"), "频道状态");
  }

  const shouldConfigure = options?.skipConfirm
    ? true
    : await prompter.confirm({
        message: "现在配置聊天频道吗?",
        initialValue: true,
      });
  if (!shouldConfigure) return cfg;

  const corePrimer = listChatChannels().map((meta) => ({
    id: meta.id as ChannelChoice,
    label: meta.label,
    blurb: meta.blurb,
  }));
  const coreIds = new Set(corePrimer.map((entry) => entry.id));

  // 国产IM频道（优先显示）
  const chinaChannels = ["feishu", "wecom", "dingtalk"];
  const pluginChannels = [
    ...installedPlugins
      .filter((plugin) => !coreIds.has(plugin.id as ChannelChoice))
      .map((plugin) => ({
        id: plugin.id as ChannelChoice,
        label: plugin.meta.label,
        blurb: plugin.meta.blurb,
      })),
    ...catalogEntries
      .filter((entry) => !coreIds.has(entry.id as ChannelChoice))
      .map((entry) => ({
        id: entry.id as ChannelChoice,
        label: entry.meta.label,
        blurb: entry.meta.blurb,
      })),
  ];

  // 分离国产频道和其他频道
  const chinaPlugins = pluginChannels.filter((ch) => chinaChannels.includes(ch.id));
  const otherPlugins = pluginChannels.filter((ch) => !chinaChannels.includes(ch.id));

  // 🇨🇳 国产频道优先，然后核心频道，最后其他插件频道
  const primerChannels = [...chinaPlugins, ...corePrimer, ...otherPlugins];
  await noteChannelPrimer(prompter, primerChannels);

  const quickstartDefault =
    options?.initialSelection?.[0] ?? resolveQuickstartDefault(statusByChannel);

  const shouldPromptAccountIds = options?.promptAccountIds === true;
  const accountIdsByChannel = new Map<ChannelChoice, string>();
  const recordAccount = (channel: ChannelChoice, accountId: string) => {
    options?.onAccountId?.(channel, accountId);
    const adapter = getChannelOnboardingAdapter(channel);
    adapter?.onAccountRecorded?.(accountId, options);
    accountIdsByChannel.set(channel, accountId);
  };

  const selection: ChannelChoice[] = [];
  const addSelection = (channel: ChannelChoice) => {
    if (!selection.includes(channel)) selection.push(channel);
  };

  const resolveDisabledHint = (channel: ChannelChoice): string | undefined => {
    const plugin = getChannelPlugin(channel);
    if (!plugin) {
      if (next.plugins?.entries?.[channel]?.enabled === false) return "插件禁用";
      if (next.plugins?.enabled === false) return "插件禁用";
      return undefined;
    }
    const accountId = resolveChannelDefaultAccountId({ plugin, cfg: next });
    const account = plugin.config.resolveAccount(next, accountId);
    let enabled: boolean | undefined;
    if (plugin.config.isEnabled) {
      enabled = plugin.config.isEnabled(account, next);
    } else if (typeof (account as { enabled?: boolean })?.enabled === "boolean") {
      enabled = (account as { enabled?: boolean }).enabled;
    } else if (
      typeof (next.channels as Record<string, { enabled?: boolean }> | undefined)?.[channel]
        ?.enabled === "boolean"
    ) {
      enabled = (next.channels as Record<string, { enabled?: boolean }>)[channel]?.enabled;
    }
    return enabled === false ? "禁用" : undefined;
  };

  const buildSelectionOptions = (
    entries: Array<{
      id: ChannelChoice;
      meta: { id: string; label: string; selectionLabel?: string };
    }>,
  ) =>
    entries.map((entry) => {
      const status = statusByChannel.get(entry.id);
      const disabledHint = resolveDisabledHint(entry.id);
      const hint = [status?.selectionHint, disabledHint].filter(Boolean).join(" · ") || undefined;
      return {
        value: entry.id,
        label: entry.meta.selectionLabel ?? entry.meta.label,
        ...(hint ? { hint } : {}),
      };
    });

  const getChannelEntries = () => {
    const core = listChatChannels();
    const installed = listChannelPlugins();
    const installedIds = new Set(installed.map((plugin) => plugin.id));
    const workspaceDir = resolveAgentWorkspaceDir(next, resolveDefaultAgentId(next));
    const catalog = listChannelPluginCatalogEntries({ workspaceDir }).filter(
      (entry) => !installedIds.has(entry.id),
    );
    const metaById = new Map<string, ChannelMeta>();
    for (const meta of core) {
      metaById.set(meta.id, meta);
    }
    for (const plugin of installed) {
      metaById.set(plugin.id, plugin.meta);
    }
    for (const entry of catalog) {
      if (!metaById.has(entry.id)) {
        metaById.set(entry.id, entry.meta);
      }
    }
    const allEntries = Array.from(metaById, ([id, meta]) => ({
      id: id as ChannelChoice,
      meta,
    }));

    // 国产IM频道优先排序
    const chinaChannels = ["feishu", "dingtalk", "wecom"];
    const chinaEntries = allEntries.filter((entry) => chinaChannels.includes(entry.id));
    const otherEntries = allEntries.filter((entry) => !chinaChannels.includes(entry.id));

    // 🇨🇳 国产频道排在最前面
    const entries = [...chinaEntries, ...otherEntries];

    return {
      entries,
      catalog,
      catalogById: new Map(catalog.map((entry) => [entry.id as ChannelChoice, entry])),
    };
  };

  const refreshStatus = async (channel: ChannelChoice) => {
    const adapter = getChannelOnboardingAdapter(channel);
    if (!adapter) return;
    const status = await adapter.getStatus({ cfg: next, options, accountOverrides });
    statusByChannel.set(channel, status);
  };

  const ensureBundledPluginEnabled = async (channel: ChannelChoice): Promise<boolean> => {
    if (getChannelPlugin(channel)) return true;
    const result = enablePluginInConfig(next, channel);
    next = result.config;
    if (!result.enabled) {
      await prompter.note(`无法启用 ${channel}: ${result.reason ?? "插件禁用"}.`, "频道设置");
      return false;
    }
    const workspaceDir = resolveAgentWorkspaceDir(next, resolveDefaultAgentId(next));
    reloadOnboardingPluginRegistry({
      cfg: next,
      runtime,
      workspaceDir,
    });
    if (!getChannelPlugin(channel)) {
      await prompter.note(`${channel} 插件不可用。`, "频道设置");
      return false;
    }
    await refreshStatus(channel);
    return true;
  };

  const configureChannel = async (channel: ChannelChoice) => {
    const adapter = getChannelOnboardingAdapter(channel);
    if (!adapter) {
      await prompter.note(`${channel} 不支持 onboarding 。`, "频道设置");
      return;
    }
    const result = await adapter.configure({
      cfg: next,
      runtime,
      prompter,
      options,
      accountOverrides,
      shouldPromptAccountIds,
      forceAllowFrom: forceAllowFromChannels.has(channel),
    });
    next = result.cfg;
    if (result.accountId) {
      recordAccount(channel, result.accountId);
    }
    addSelection(channel);
    await refreshStatus(channel);
  };

  const handleConfiguredChannel = async (channel: ChannelChoice, label: string) => {
    const plugin = getChannelPlugin(channel);
    const adapter = getChannelOnboardingAdapter(channel);
    const supportsDisable = Boolean(
      options?.allowDisable && (plugin?.config.setAccountEnabled || adapter?.disable),
    );
    const supportsDelete = Boolean(options?.allowDisable && plugin?.config.deleteAccount);
    const action = await promptConfiguredAction({
      prompter,
      label,
      supportsDisable,
      supportsDelete,
    });

    if (action === "skip") return;
    if (action === "update") {
      await configureChannel(channel);
      return;
    }
    if (!options?.allowDisable) return;

    if (action === "delete" && !supportsDelete) {
      await prompter.note(`${label} 不支持删除配置项。`, "移除频道");
      return;
    }

    const shouldPromptAccount =
      action === "delete"
        ? Boolean(plugin?.config.deleteAccount)
        : Boolean(plugin?.config.setAccountEnabled);
    const accountId = shouldPromptAccount
      ? await promptRemovalAccountId({
          cfg: next,
          prompter,
          label,
          channel,
        })
      : DEFAULT_ACCOUNT_ID;
    const resolvedAccountId =
      normalizeAccountId(accountId) ??
      (plugin ? resolveChannelDefaultAccountId({ plugin, cfg: next }) : DEFAULT_ACCOUNT_ID);
    const accountLabel = formatAccountLabel(resolvedAccountId);

    if (action === "delete") {
      const confirmed = await prompter.confirm({
        message: `Delete ${label} account "${accountLabel}"?`,
        initialValue: false,
      });
      if (!confirmed) return;
      if (plugin?.config.deleteAccount) {
        next = plugin.config.deleteAccount({ cfg: next, accountId: resolvedAccountId });
      }
      await refreshStatus(channel);
      return;
    }

    if (plugin?.config.setAccountEnabled) {
      next = plugin.config.setAccountEnabled({
        cfg: next,
        accountId: resolvedAccountId,
        enabled: false,
      });
    } else if (adapter?.disable) {
      next = adapter.disable(next);
    }
    await refreshStatus(channel);
  };

  const handleChannelChoice = async (channel: ChannelChoice) => {
    const { catalogById } = getChannelEntries();
    const catalogEntry = catalogById.get(channel);

    // 首先检查 plugin 是否已经加载（bundled plugin）
    const existingPlugin = getChannelPlugin(channel);
    if (existingPlugin) {
      // Plugin 已经加载，直接使用
      await refreshStatus(channel);
    } else {
      // Plugin 未加载，检查是否在 catalog 中（需要安装）
      if (catalogEntry) {
        const workspaceDir = resolveAgentWorkspaceDir(next, resolveDefaultAgentId(next));
        const result = await ensureOnboardingPluginInstalled({
          cfg: next,
          entry: catalogEntry,
          prompter,
          runtime,
          workspaceDir,
        });
        next = result.cfg;
        if (!result.installed) return;
        reloadOnboardingPluginRegistry({
          cfg: next,
          runtime,
          workspaceDir,
        });
        await refreshStatus(channel);
      } else {
        // 既不在 catalog 也未加载，尝试启用
        const enabled = await ensureBundledPluginEnabled(channel);
        if (!enabled) return;
      }
    }

    const plugin = getChannelPlugin(channel);
    const label = plugin?.meta.label ?? catalogEntry?.meta.label ?? channel;
    const status = statusByChannel.get(channel);
    const configured = status?.configured ?? false;
    if (configured) {
      await handleConfiguredChannel(channel, label);
      return;
    }
    await configureChannel(channel);
  };

  if (options?.quickstartDefaults) {
    const { entries } = getChannelEntries();
    const choice = (await prompter.select({
      message: "选择通道 (快速开始)",
      options: [
        ...buildSelectionOptions(entries),
        {
          value: "__skip__",
          label: "现在跳过",
          hint: `稍后可以通过 \`${formatCliCommand("wukongbot channels add")}\` 添加通道`,
        },
      ],
      initialValue: quickstartDefault,
    })) as ChannelChoice | "__skip__";
    if (choice !== "__skip__") {
      await handleChannelChoice(choice);
    }
  } else {
    const doneValue = "__done__" as const;
    const initialValue = options?.initialSelection?.[0] ?? quickstartDefault;
    while (true) {
      const { entries } = getChannelEntries();
      const choice = (await prompter.select({
        message: "选择一个通道",
        options: [
          ...buildSelectionOptions(entries),
          {
            value: doneValue,
            label: "完成",
            hint: selection.length > 0 ? "完成" : "现在跳过",
          },
        ],
        initialValue,
      })) as ChannelChoice | typeof doneValue;
      if (choice === doneValue) break;
      await handleChannelChoice(choice);
    }
  }

  options?.onSelection?.(selection);

  const selectionNotes = new Map<string, string>();
  const { entries: selectionEntries } = getChannelEntries();
  for (const entry of selectionEntries) {
    selectionNotes.set(entry.id, formatChannelSelectionLine(entry.meta, formatDocsLink));
  }

  const selectedLines = selection
    .map((channel) => selectionNotes.get(channel))
    .filter((line): line is string => Boolean(line));
  if (selectedLines.length > 0) {
    await prompter.note(selectedLines.join("\n"), "已选择通道");
  }

  if (!options?.skipDmPolicyPrompt) {
    next = await maybeConfigureDmPolicies({
      cfg: next,
      selection,
      prompter,
      accountIdsByChannel,
    });
  }

  return next;
}
