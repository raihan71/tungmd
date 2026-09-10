import { useMemo } from "react";
import { marked } from "marked";

function sanitize(html: string): string {
  return html
    .replace(/<\s*(script|iframe|object|embed|style)[\s\S]*?<\/\s*\1\s*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

export function MarkdownSheet({ markdown }: { markdown: string }) {
  const html = useMemo(
    () => sanitize(marked.parse(markdown, { async: false }) as string),
    [markdown],
  );

  return (
    <div
      className="tung-sheet font-grotesk text-[14px] leading-relaxed text-ink/85"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
