import { describe, expect, it } from "vitest";

import { visibleWidth } from "./ansi.js";
import { formatNote } from "./note.js";

describe("formatNote", () => {
  it("aligns borders with CJK content", () => {
    const out = formatNote("first line\n中文一行\n下一行更长的中文", "Title", { columns: 80 });
    const lines = out.trimEnd().split("\n");
    const widths = lines.map((line) => visibleWidth(line));
    expect(new Set(widths).size).toBe(1);
    expect(lines[0]).toContain("┌");
    expect(lines.at(-1)).toContain("┘");
    for (const line of lines.slice(1, -1)) expect(line).toContain("│");
  });

  it("supports CJK titles without breaking width", () => {
    const out = formatNote("a\n中文", "中文标题", { columns: 80 });
    const lines = out.trimEnd().split("\n");
    const widths = lines.map((line) => visibleWidth(line));
    expect(new Set(widths).size).toBe(1);
  });
});
