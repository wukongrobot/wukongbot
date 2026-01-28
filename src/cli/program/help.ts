import type { Command } from "commander";
import { formatDocsLink } from "../../terminal/links.js";
import { isRich, theme } from "../../terminal/theme.js";
import { formatCliBannerLine, hasEmittedCliBanner } from "../banner.js";
import { replaceCliName, resolveCliName } from "../cli-name.js";
import type { ProgramContext } from "./context.js";

const CLI_NAME = resolveCliName();

const EXAMPLES = [
  ["wukongbot channels login --verbose", "连接个人 WhatsApp Web 并显示二维码和连接日志"],
  [
    'wukongbot message send --target +15555550123 --message "你好" --json',
    "通过你的 Web 会话发送消息并输出 JSON 结果",
  ],
  ["wukongbot gateway --port 18789", "在本地运行 WebSocket 网关"],
  ["wukongbot --dev gateway", "运行开发网关（隔离状态/配置）on ws://127.0.0.1:19001"],
  ["wukongbot gateway --force", "强制关闭占用默认网关端口的进程，然后启动"],
  ["wukongbot gateway ...", "通过 WebSocket 控制网关"],
  [
    'wukongbot agent --to +15555550123 --message "运行摘要" --deliver',
    "使用网关直接与 Agent 对话；可选择发送 WhatsApp 回复",
  ],
  [
    'wukongbot message send --channel telegram --target @mychat --message "你好"',
    "通过你的 Telegram 机器人发送消息",
  ],
  [
    'wukongbot message send --channel feishu --target "chat_id" --message "你好"',
    "通过飞书发送消息",
  ],
] as const;

export function configureProgramHelp(program: Command, ctx: ProgramContext) {
  program
    .name(CLI_NAME)
    .description("")
    .version(ctx.programVersion)
    .option(
      "--dev",
      "开发配置：在 ~/.clawdbot-dev 下隔离状态，默认网关端口 19001，并移动派生端口（浏览器/canvas）",
    )
    .option(
      "--profile <name>",
      "使用命名配置（在 ~/.clawdbot-<name> 下隔离 CLAWDBOT_STATE_DIR/CLAWDBOT_CONFIG_PATH）",
    );

  program.option("--no-color", "禁用 ANSI 颜色", false);

  program.configureHelp({
    optionTerm: (option) => theme.option(option.flags),
    subcommandTerm: (cmd) => theme.command(cmd.name()),
  });

  program.configureOutput({
    writeOut: (str) => {
      const colored = str
        .replace(/^Usage:/gm, theme.heading("使用方法:"))
        .replace(/^Options:/gm, theme.heading("选项:"))
        .replace(/^Commands:/gm, theme.heading("命令:"));
      process.stdout.write(colored);
    },
    writeErr: (str) => process.stderr.write(str),
    outputError: (str, write) => write(theme.error(str)),
  });

  if (
    process.argv.includes("-V") ||
    process.argv.includes("--version") ||
    process.argv.includes("-v")
  ) {
    console.log(ctx.programVersion);
    process.exit(0);
  }

  program.addHelpText("beforeAll", () => {
    if (hasEmittedCliBanner()) return "";
    const rich = isRich();
    const line = formatCliBannerLine(ctx.programVersion, { richTty: rich });
    return `\n${line}\n`;
  });

  const fmtExamples = EXAMPLES.map(
    ([cmd, desc]) => `  ${theme.command(replaceCliName(cmd, CLI_NAME))}\n    ${theme.muted(desc)}`,
  ).join("\n");

  program.addHelpText("afterAll", ({ command }) => {
    if (command !== program) return "";
    const docs = formatDocsLink("/cli", "docs.molt.bot/cli");
    return `\n${theme.heading("示例:")}\n${fmtExamples}\n\n${theme.muted("文档:")} ${docs}\n`;
  });
}
