import { fileNameFor } from "@/lib/design-md";
import type { Extraction } from "@/lib/extraction-types";

export type HistoryItem = { url: string; title: string; at: string; assets: number };

const HISTORY_KEY = "tungmd.history";

export function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function addHistoryItem(history: HistoryItem[], extraction: Extraction): HistoryItem[] {
  const item: HistoryItem = {
    url: extraction.url,
    title: extraction.title,
    at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    assets: extraction.images.length,
  };
  const next = [item, ...history.filter((entry) => entry.url !== item.url)].slice(0, 6);

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Storage can be unavailable in private browsing.
  }

  return next;
}

export function downloadDesignMarkdown(markdown: string, extraction: Extraction): void {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = fileNameFor(extraction);
  link.click();
  URL.revokeObjectURL(href);
}
