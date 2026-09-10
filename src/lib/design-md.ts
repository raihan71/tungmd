import type { Extraction } from "./extraction-types";

export function buildDesignMarkdown(x: Extraction): string {
  const date = new Date(x.stats.extractedAt).toISOString().slice(0, 10);
  const lines: string[] = [];

  lines.push(`# ${x.title}`);
  lines.push("");
  lines.push(`_Design specification pressed by TungMD on ${date}._`);
  lines.push("");
  lines.push(`**Source:** ${x.url}`);
  lines.push("");
  lines.push(x.description);
  lines.push("");
  lines.push("---");
  lines.push("");

  lines.push("## Colors");
  lines.push("");
  if (x.colors.length) {
    lines.push("| Hex | Role | Occurrences |");
    lines.push("| --- | --- | --- |");
    for (const c of x.colors) lines.push(`| \`${c.hex}\` | ${c.role} | ${c.count} |`);
  } else {
    lines.push("_No colors detected in the stylesheets read._");
  }
  lines.push("");

  lines.push("## Typography");
  lines.push("");
  if (x.type.length) {
    lines.push("| Family | Size | Weight | Line height |");
    lines.push("| --- | --- | --- | --- |");
    for (const t of x.type)
      lines.push(`| ${t.family} | ${t.size} | ${t.weight} | ${t.lineHeight} |`);
  } else {
    lines.push("_No typography rules detected._");
  }
  lines.push("");

  lines.push("## Content structure");
  lines.push("");
  if (x.headings.length) {
    for (const h of x.headings) lines.push(`${"  ".repeat(h.level - 1)}- H${h.level} — ${h.text}`);
  } else {
    lines.push("_No headings found._");
  }
  lines.push("");

  if (x.paragraphs.length) {
    lines.push("### Key copy");
    lines.push("");
    for (const p of x.paragraphs) lines.push(`> ${p}`);
    lines.push("");
  }

  lines.push("## Images");
  lines.push("");
  if (x.images.length) {
    for (const img of x.images) lines.push(`- ![${img.alt || "untitled"}](${img.src})`);
  } else {
    lines.push("_No images found._");
  }
  lines.push("");

  lines.push("---");
  lines.push("");
  lines.push(
    `Read ${x.stats.stylesheets} stylesheet(s), ${(x.stats.bytes / 1024).toFixed(0)} KB of markup.`,
  );
  lines.push("");

  return lines.join("\n");
}

export function fileNameFor(x: Extraction): string {
  try {
    const host = new URL(x.url).hostname.replace(/^www\./, "").replace(/[^a-z0-9]+/gi, "-");
    return `${host}-design.md`;
  } catch {
    return "design.md";
  }
}
