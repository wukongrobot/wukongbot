const ANSI_SGR_PATTERN = "\\x1b\\[[0-9;]*m";
// OSC-8 hyperlinks: ESC ] 8 ; ; url ST ... ESC ] 8 ; ; ST
const OSC8_PATTERN = "\\x1b\\]8;;.*?\\x1b\\\\|\\x1b\\]8;;\\x1b\\\\";

const ANSI_REGEX = new RegExp(ANSI_SGR_PATTERN, "g");
const OSC8_REGEX = new RegExp(OSC8_PATTERN, "g");

export function stripAnsi(input: string): string {
  return input.replace(OSC8_REGEX, "").replace(ANSI_REGEX, "");
}

/**
 * 检测字符是否为全角字符（在终端中占2个字符宽度）
 */
function isFullWidth(char: string): boolean {
  const code = char.codePointAt(0);
  if (!code) return false;

  return (
    // CJK 统一汉字
    (code >= 0x4e00 && code <= 0x9fff) ||
    // CJK 扩展 A
    (code >= 0x3400 && code <= 0x4dbf) ||
    // CJK 扩展 B-F
    (code >= 0x20000 && code <= 0x2a6df) ||
    // 日文假名
    (code >= 0x3040 && code <= 0x30ff) ||
    // 韩文字符
    (code >= 0xac00 && code <= 0xd7af) ||
    // 全角 ASCII、全角标点
    (code >= 0xff00 && code <= 0xff60) ||
    // 全角符号
    (code >= 0xffe0 && code <= 0xffe6) ||
    // CJK 符号和标点
    (code >= 0x3000 && code <= 0x303f) ||
    // 常用全角标点符号（在中文环境中应该是全角）
    code === 0x2014 || // EM DASH —
    code === 0x2015 || // HORIZONTAL BAR ―
    code === 0x2026 || // HORIZONTAL ELLIPSIS …
    code === 0x2018 || // LEFT SINGLE QUOTATION MARK '
    code === 0x2019 || // RIGHT SINGLE QUOTATION MARK '
    code === 0x201c || // LEFT DOUBLE QUOTATION MARK "
    code === 0x201d // RIGHT DOUBLE QUOTATION MARK "
  );
}

/**
 * 计算字符串在终端中的可见宽度（考虑全角字符占2个宽度）
 */
export function visibleWidth(input: string): number {
  const stripped = stripAnsi(input);
  let width = 0;
  for (const char of stripped) {
    width += isFullWidth(char) ? 2 : 1;
  }
  return width;
}
