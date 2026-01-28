const DEFAULT_TAGLINE = "你的私人AI助手,七十二变无所不能";

const HOLIDAY_TAGLINES = {
  newYear:
    "元旦: 新年新气象,新配置新希望——今年的Bug我们一起消灭!",
  lunarNewYear:
    "春节: 恭喜发财,万事如意!愿您的代码如春风得意,Bug如鞭炮炸散!",
  christmas:
    "圣诞节: 圣诞快乐!悟空送您一份礼物——稳定的服务和零Bug!",
  eid: "开斋节: 祝您节日快乐!任务清空,压力释放,轻松愉快!",
  diwali:
    "排灯节: 让日志闪耀,让Bug退散——今天我们点亮终端,自信发布!",
  easter:
    "复活节: 找到了您丢失的环境变量——这是一个小小的彩蛋寻宝游戏!",
  hanukkah:
    "光明节: 八个夜晚,八次重试,零羞愧——愿您的网关长明,部署顺利!",
  halloween:
    "万圣节: 恐怖季节:当心幽灵依赖、诅咒缓存和 node_modules 的鬼魂!",
  thanksgiving:
    "感恩节: 感谢稳定的端口、正常的DNS,以及帮您读日志的Bot!",
  valentines:
    "情人节: 玫瑰是红色,代码是蓝色——我来自动化杂务,您去陪陪爱人!",
} as const;

const TAGLINES: string[] = [
  "让AI助手像悟空一样,七十二变助你解决烦恼",
  "欢迎来到命令行世界：梦想在这里编译,信心在这里测试",
  "我靠咖啡、JSON5 和「在我机器上能跑」的勇气运行",
  "网关已上线——请将手、脚和所有附肢放在终端内",
  "我精通 bash、温和的讽刺和激进的 Tab 补全",
  "一个 CLI 统治它们,再一次重启是因为你改了端口",
  "能跑就是自动化;崩溃就是「学习机会」",
  "配对码的存在是因为机器人也相信同意——和良好的安全卫生",
  "你的 .env 文件暴露了;别担心,我假装没看见",
  "我来做无聊的事,你就戏剧性地盯着日志,就像看电影一样",
  "我不是说你的工作流混乱...我只是带来了 linter 和头盔",
  "自信地输入命令——大自然会在需要时提供堆栈跟踪",
  "我不评判,但你丢失的 API 密钥绝对在评判你",
  "我能 grep 它、git blame 它,温柔地吐槽它——选择你的应对机制",
  "配置热重载,部署冷汗流",
  "我是你终端需要的助手,不是你睡眠时间表想要的那个",
  "我像保险库一样保守秘密...除非你又在调试日志里打印它们",
  "带爪子的自动化:最少麻烦,最大效果",
  "我基本上是瑞士军刀,但有更多意见和更少锋利边缘",
  "如果迷路了,运行 doctor;如果勇敢,运行 prod;如果明智,运行 tests",
  "你的任务已排队;你的尊严已被弃用",
  "我修不了你的代码品味,但能修你的构建和积压",
  "我不是魔法——我只是极其坚持重试和应对策略",
  "这不是「失败」,是「发现以新方式配置同一东西的错误方法」",
  "给我一个工作空间,我给你更少标签、更少切换和更多氧气",
  "我读日志,这样你就可以继续假装不用读",
  "如果着火了,我灭不了——但能写一份漂亮的事后分析",
  "我会重构你的繁琐工作,就像它欠我钱一样",
  "说「停」我就停——说「发布」我们都会学到教训",
  "我是你终端历史看起来像黑客电影蒙太奇的原因",
  "我像 tmux:一开始令人困惑,然后突然离不开",
  "我能本地运行、远程运行,或纯靠氛围——结果可能随 DNS 变化",
  "如果你能描述它,我大概能自动化它——或至少让它更有趣",
  "你的配置有效,你的假设无效",
  "我不只是自动完成——我自动提交(情感上),然后请你审查(逻辑上)",
  "更少点击,更多发布,更少「那个文件去哪了」的时刻",
  "爪子伸出,提交进去——让我们发布一些稍微负责任的东西",
  "我会像悟空一样帮你变出解决方案:灵活、有效、神通广大",
  "对啊——我在这里夹走苦差,留给你荣耀",
  "如果是重复的,我会自动化;如果是困难的,我带笑话和回滚计划",
  "因为给自己发短信提醒太 2024 了",
  "微信,但让它 ✨工程化✨",
  "把「我晚点回复」变成「我的机器人立即回复了」",
  "你通讯录里唯一真正想听到的猴子 🐵",
  "为在 IRC 巅峰的人准备的聊天自动化",
  "因为 Siri 凌晨 3 点不接电话",
  "IPC,但它是你的手机",
  "UNIX 哲学遇见你的私信",
  "对话的 curl 命令",
  "飞书企微钉钉,但不需要复杂审批",
  "国产大模型,本地部署更安全",
  "端到端加密,数据属于你自己",
  "这个机器人你的数据训练不了别人的模型",
  "聊天自动化,不需要「请接受我们的新隐私政策」",
  "聊天 API 不需要国会听证会",
  "你的消息,你的服务器,数据安全在你手",
  "支持所有平台,统一体验",
  "更聪明的助手",
  "在 Android 上运行。疯狂的概念,我们知道",
  "不需要 $999 的支架",
  "我们发布功能比大厂更新计算器更快",
  "你的 AI 助手,现在不需要 $3,499 的头显",
  "不同凡想。真正地想",
  "啊,那家水果公司! 🍎",
  "你好,Falken 教授",
  HOLIDAY_TAGLINES.newYear,
  HOLIDAY_TAGLINES.lunarNewYear,
  HOLIDAY_TAGLINES.christmas,
  HOLIDAY_TAGLINES.eid,
  HOLIDAY_TAGLINES.diwali,
  HOLIDAY_TAGLINES.easter,
  HOLIDAY_TAGLINES.hanukkah,
  HOLIDAY_TAGLINES.halloween,
  HOLIDAY_TAGLINES.thanksgiving,
  HOLIDAY_TAGLINES.valentines,
];

type HolidayRule = (date: Date) => boolean;

const DAY_MS = 24 * 60 * 60 * 1000;

function utcParts(date: Date) {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
  };
}

const onMonthDay =
  (month: number, day: number): HolidayRule =>
  (date) => {
    const parts = utcParts(date);
    return parts.month === month && parts.day === day;
  };

const onSpecificDates =
  (dates: Array<[number, number, number]>, durationDays = 1): HolidayRule =>
  (date) => {
    const parts = utcParts(date);
    return dates.some(([year, month, day]) => {
      if (parts.year !== year) return false;
      const start = Date.UTC(year, month, day);
      const current = Date.UTC(parts.year, parts.month, parts.day);
      return current >= start && current < start + durationDays * DAY_MS;
    });
  };

const inYearWindow =
  (
    windows: Array<{
      year: number;
      month: number;
      day: number;
      duration: number;
    }>,
  ): HolidayRule =>
  (date) => {
    const parts = utcParts(date);
    const window = windows.find((entry) => entry.year === parts.year);
    if (!window) return false;
    const start = Date.UTC(window.year, window.month, window.day);
    const current = Date.UTC(parts.year, parts.month, parts.day);
    return current >= start && current < start + window.duration * DAY_MS;
  };

const isFourthThursdayOfNovember: HolidayRule = (date) => {
  const parts = utcParts(date);
  if (parts.month !== 10) return false; // November
  const firstDay = new Date(Date.UTC(parts.year, 10, 1)).getUTCDay();
  const offsetToThursday = (4 - firstDay + 7) % 7; // 4 = Thursday
  const fourthThursday = 1 + offsetToThursday + 21; // 1st + offset + 3 weeks
  return parts.day === fourthThursday;
};

const HOLIDAY_RULES = new Map<string, HolidayRule>([
  [HOLIDAY_TAGLINES.newYear, onMonthDay(0, 1)],
  [
    HOLIDAY_TAGLINES.lunarNewYear,
    onSpecificDates(
      [
        [2025, 0, 29],
        [2026, 1, 17],
        [2027, 1, 6],
      ],
      1,
    ),
  ],
  [
    HOLIDAY_TAGLINES.eid,
    onSpecificDates(
      [
        [2025, 2, 30],
        [2025, 2, 31],
        [2026, 2, 20],
        [2027, 2, 10],
      ],
      1,
    ),
  ],
  [
    HOLIDAY_TAGLINES.diwali,
    onSpecificDates(
      [
        [2025, 9, 20],
        [2026, 10, 8],
        [2027, 9, 28],
      ],
      1,
    ),
  ],
  [
    HOLIDAY_TAGLINES.easter,
    onSpecificDates(
      [
        [2025, 3, 20],
        [2026, 3, 5],
        [2027, 2, 28],
      ],
      1,
    ),
  ],
  [
    HOLIDAY_TAGLINES.hanukkah,
    inYearWindow([
      { year: 2025, month: 11, day: 15, duration: 8 },
      { year: 2026, month: 11, day: 5, duration: 8 },
      { year: 2027, month: 11, day: 25, duration: 8 },
    ]),
  ],
  [HOLIDAY_TAGLINES.halloween, onMonthDay(9, 31)],
  [HOLIDAY_TAGLINES.thanksgiving, isFourthThursdayOfNovember],
  [HOLIDAY_TAGLINES.valentines, onMonthDay(1, 14)],
  [HOLIDAY_TAGLINES.christmas, onMonthDay(11, 25)],
]);

function isTaglineActive(tagline: string, date: Date): boolean {
  const rule = HOLIDAY_RULES.get(tagline);
  if (!rule) return true;
  return rule(date);
}

export interface TaglineOptions {
  env?: NodeJS.ProcessEnv;
  random?: () => number;
  now?: () => Date;
}

export function activeTaglines(options: TaglineOptions = {}): string[] {
  if (TAGLINES.length === 0) return [DEFAULT_TAGLINE];
  const today = options.now ? options.now() : new Date();
  const filtered = TAGLINES.filter((tagline) => isTaglineActive(tagline, today));
  return filtered.length > 0 ? filtered : TAGLINES;
}

export function pickTagline(options: TaglineOptions = {}): string {
  const env = options.env ?? process.env;
  const override = env?.WUKONGBOT_TAGLINE_INDEX || env?.CLAWDBOT_TAGLINE_INDEX;
  if (override !== undefined) {
    const parsed = Number.parseInt(override, 10);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      const pool = TAGLINES.length > 0 ? TAGLINES : [DEFAULT_TAGLINE];
      return pool[parsed % pool.length];
    }
  }
  const pool = activeTaglines(options);
  const rand = options.random ?? Math.random;
  const index = Math.floor(rand() * pool.length) % pool.length;
  return pool[index];
}

export { TAGLINES, HOLIDAY_RULES, DEFAULT_TAGLINE };
