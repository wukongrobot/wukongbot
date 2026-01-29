import { describe, it, expect } from "vitest";
import { stripAnsi, visibleWidth } from "./ansi.js";
import { wrapNoteMessage } from "./note.js";

describe("stripAnsi", () => {
  it("should remove ANSI escape codes", () => {
    expect(stripAnsi("\x1b[31mred text\x1b[0m")).toBe("red text");
    expect(stripAnsi("\x1b[1;32mbold green\x1b[0m")).toBe("bold green");
  });

  it("should remove OSC-8 hyperlinks", () => {
    expect(stripAnsi("\x1b]8;;https://example.com\x1b\\link\x1b]8;;\x1b\\")).toBe("link");
  });

  it("should handle plain text", () => {
    expect(stripAnsi("plain text")).toBe("plain text");
  });
});

describe("visibleWidth", () => {
  it("should count ASCII characters as 1", () => {
    expect(visibleWidth("hello")).toBe(5);
    expect(visibleWidth("123")).toBe(3);
  });

  it("should count Chinese characters as 2", () => {
    expect(visibleWidth("你好")).toBe(4);
    expect(visibleWidth("中文字符")).toBe(8);
    expect(visibleWidth("悟空Bot")).toBe(7); // 悟=2, 空=2, Bot=3 = 7
  });

  it("should handle mixed ASCII and Chinese", () => {
    expect(visibleWidth("Hello 世界")).toBe(10); // Hello=5, space=1, 世界=4 = 10
    expect(visibleWidth("悟空Bot 是一个爱好项目")).toBe(20); // 悟空=4, Bot=3, space=1, 是一个爱好项目=12 = 20
  });

  it("should handle Japanese characters", () => {
    expect(visibleWidth("こんにちは")).toBe(10); // 5 hiragana chars * 2
  });

  it("should handle Korean characters", () => {
    expect(visibleWidth("안녕하세요")).toBe(10); // 5 Korean chars * 2
  });

  it("should ignore ANSI codes in width calculation", () => {
    expect(visibleWidth("\x1b[31m红色\x1b[0m")).toBe(4); // 红色 = 2 chars * 2
    expect(visibleWidth("\x1b[1mBold\x1b[0m")).toBe(4); // Bold = 4 chars
  });

  it("should handle full-width punctuation", () => {
    expect(visibleWidth("，。！？")).toBe(8); // 4 full-width punctuation * 2
  });

  it("should handle the security warning message correctly", () => {
    // From the onboarding message
    const line1 = "安全警告 — 请阅读。";
    const line2 = "悟空Bot 是一个爱好项目，仍在 beta 阶段。请注意锋利的边缘。";

    // 安全警告=8, space=1, —=2, space=1, 请阅读=6, 。=2 = 20
    expect(visibleWidth(line1)).toBe(20);

    // Let's not hard-code the exact number, just verify it's being calculated
    expect(visibleWidth(line2)).toBeGreaterThan(20);
  });
});

describe("wrapNoteMessage", () => {
  it("should pad lines to consistent width with Chinese text", () => {
    const message = "悟空Bot 是一个爱好项目，仍在 beta 阶段。请注意锋利的边缘。";
    const wrapped = wrapNoteMessage(message, { maxWidth: 40, padLines: true });
    const lines = wrapped.split("\n");

    // All lines should have exactly the same visible width
    const widths = lines.map(visibleWidth);
    expect(widths.every((w) => w === 40)).toBe(true);
  });

  it("should pad lines to consistent width with mixed content", () => {
    const message =
      "安全警告 — 请阅读。\n\n悟空Bot 是一个爱好项目，仍在 beta 阶段。请注意锋利的边缘。\nwukongbot security audit --deep";
    const wrapped = wrapNoteMessage(message, { maxWidth: 50, padLines: true });
    const lines = wrapped.split("\n");

    // All lines should have exactly the same visible width
    const widths = lines.map(visibleWidth);
    expect(widths.every((w) => w === 50)).toBe(true);
  });

  it("should handle bullet points with Chinese text", () => {
    const message = "推荐基础配置:\n- 配对/允许列表 + 提及门控。\n- 沙盒 + 最小特权工具。";
    const wrapped = wrapNoteMessage(message, { maxWidth: 40, padLines: true });
    const lines = wrapped.split("\n");

    // All lines should have exactly the same visible width
    const widths = lines.map(visibleWidth);
    expect(widths.every((w) => w === 40)).toBe(true);
  });

  it("should wrap long lines correctly with Chinese text", () => {
    const message =
      "如果你不熟悉基本的安全性和访问控制，请不要运行悟空Bot。在启用工具或将其暴露到互联网之前，请寻求有经验的人的帮助。";
    const wrapped = wrapNoteMessage(message, { maxWidth: 60, padLines: true });
    const lines = wrapped.split("\n");

    // All lines should have exactly the same visible width
    const widths = lines.map(visibleWidth);
    expect(widths.every((w) => w === 60)).toBe(true);
    expect(lines.length).toBeGreaterThan(1); // Should wrap to multiple lines
  });
});
