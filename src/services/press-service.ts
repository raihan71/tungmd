import { fileNameFor } from "@/lib/design-md";
import type { Extraction } from "@/lib/extraction-types";

export type { HistoryItem } from "./history-service";

export function downloadDesignMarkdown(markdown: string, extraction: Extraction): void {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = fileNameFor(extraction);
  link.click();
  URL.revokeObjectURL(href);
}
