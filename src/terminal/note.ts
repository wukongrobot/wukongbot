import { visibleWidth } from "./ansi.js";
import { stylePromptTitle } from "./prompt-style.js";
import { isRich, theme } from "./theme.js";

function splitLongWord(word: string, maxWidth: number): string[] {
  if (maxWidth <= 0) return [word];
  const chars = Array.from(word);
  const parts: string[] = [];
  let currentPart = "";
  let currentWidth = 0;

  for (const char of chars) {
    const charWidth = visibleWidth(char);
    if (currentWidth + charWidth > maxWidth && currentPart.length > 0) {
      parts.push(currentPart);
      currentPart = char;
      currentWidth = charWidth;
    } else {
      currentPart += char;
      currentWidth += charWidth;
    }
  }

  if (currentPart.length > 0) {
    parts.push(currentPart);
  }

  return parts.length > 0 ? parts : [word];
}

function wrapLine(line: string, maxWidth: number): string[] {
  if (line.trim().length === 0) return [line];
  const match = line.match(/^(\s*)([-*\u2022]\s+)?(.*)$/);
  const indent = match?.[1] ?? "";
  const bullet = match?.[2] ?? "";
  const content = match?.[3] ?? "";
  const firstPrefix = `${indent}${bullet}`;
  const nextPrefix = `${indent}${bullet ? " ".repeat(bullet.length) : ""}`;
  const firstWidth = Math.max(10, maxWidth - visibleWidth(firstPrefix));
  const nextWidth = Math.max(10, maxWidth - visibleWidth(nextPrefix));

  const words = content.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  let prefix = firstPrefix;
  let available = firstWidth;

  for (const word of words) {
    if (!current) {
      if (visibleWidth(word) > available) {
        const parts = splitLongWord(word, available);
        const first = parts.shift() ?? "";
        lines.push(prefix + first);
        prefix = nextPrefix;
        available = nextWidth;
        for (const part of parts) lines.push(prefix + part);
        continue;
      }
      current = word;
      continue;
    }

    const candidate = `${current} ${word}`;
    if (visibleWidth(candidate) <= available) {
      current = candidate;
      continue;
    }

    lines.push(prefix + current);
    prefix = nextPrefix;
    available = nextWidth;

    if (visibleWidth(word) > available) {
      const parts = splitLongWord(word, available);
      const first = parts.shift() ?? "";
      lines.push(prefix + first);
      for (const part of parts) lines.push(prefix + part);
      current = "";
      continue;
    }
    current = word;
  }

  if (current || words.length === 0) {
    lines.push(prefix + current);
  }

  return lines;
}

export function wrapNoteMessage(
  message: string,
  options: { maxWidth?: number; columns?: number; padLines?: boolean } = {},
): string {
  const columns = options.columns ?? process.stdout.columns ?? 80;
  const maxWidth = options.maxWidth ?? Math.max(40, columns - 10);
  const lines = message.split("\n").flatMap((line) => wrapLine(line, maxWidth));

  // 如果需要填充行，确保所有行具有相同的可见宽度
  if (options.padLines) {
    return lines
      .map((line) => {
        const width = visibleWidth(line);
        const padding = maxWidth - width;
        return padding > 0 ? line + " ".repeat(padding) : line;
      })
      .join("\n");
  }

  return lines.join("\n");
}

function padEndVisible(text: string, targetWidth: number): string {
  const width = visibleWidth(text);
  const padding = targetWidth - width;
  return padding > 0 ? text + " ".repeat(padding) : text;
}

export function formatNote(
  message: string,
  title?: string,
  options: { columns?: number; maxWidth?: number } = {},
): string {
  const columns = options.columns ?? process.stdout.columns ?? 80;
  const maxWidth = options.maxWidth ?? Math.max(40, columns - 10);
  const rich = isRich();
  const border = (value: string) => (rich ? theme.muted(value) : value);
  const titleText = stylePromptTitle(title) ?? title;
  const titleSegment = titleText ? ` ${titleText} ` : "";
  const wrapped = wrapNoteMessage(message, { columns, maxWidth, padLines: false });
  const bodyLines = wrapped.split("\n");
  const bodyWidth = Math.max(0, ...bodyLines.map((line) => visibleWidth(line)));
  const padding = 1;
  const minInnerWidth = bodyWidth + padding * 2;
  const innerWidth = Math.max(minInnerWidth, visibleWidth(titleSegment));
  const contentWidth = Math.max(0, innerWidth - padding * 2);

  const topLine =
    border("┌") +
    titleSegment +
    border("─".repeat(Math.max(0, innerWidth - visibleWidth(titleSegment)))) +
    border("┐");
  const midLines = bodyLines.map(
    (line) =>
      border("│") +
      " ".repeat(padding) +
      padEndVisible(line, contentWidth) +
      " ".repeat(padding) +
      border("│"),
  );
  const bottomLine = border("└") + border("─".repeat(innerWidth)) + border("┘");

  return [topLine, ...midLines, bottomLine].join("\n");
}

export function note(message: string, title?: string) {
  process.stdout.write(`${formatNote(message, title)}\n`);
}
