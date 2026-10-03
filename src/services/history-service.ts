import type { Extraction } from "../lib/extraction-types";

export type HistoryItem = {
  url: string;
  title: string;
  at: string;
  assets: number;
  updatedAt: string;
};

export const HISTORY_KEY = "tungmd.history";
export const historyKey = (userId?: string | null) =>
  userId ? `${HISTORY_KEY}.${userId}` : HISTORY_KEY;

export function parseHistory(value: unknown): HistoryItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    if (
      !item ||
      typeof item.url !== "string" ||
      typeof item.title !== "string" ||
      typeof item.at !== "string" ||
      !Number.isInteger(item.assets) ||
      item.assets < 0
    )
      return [];
    return [
      {
        url: item.url,
        title: item.title,
        at: item.at,
        assets: item.assets,
        // Legacy entries contain only a clock time. Keep their order without
        // pretending they are newer than dated entries from another computer.
        updatedAt:
          typeof item.updatedAt === "string" && Number.isFinite(Date.parse(item.updatedAt))
            ? new Date(item.updatedAt).toISOString()
            : new Date(Date.UTC(2000, 0, 1) - index).toISOString(),
      },
    ];
  });
}

export function loadHistory(userId?: string | null): HistoryItem[] {
  try {
    return parseHistory(JSON.parse(localStorage.getItem(historyKey(userId)) ?? "[]"));
  } catch {
    return [];
  }
}

export function saveHistory(history: HistoryItem[], userId?: string | null): boolean {
  try {
    localStorage.setItem(historyKey(userId), JSON.stringify(history));
    return true;
  } catch {
    return false;
  }
}

export function mergeHistory(...lists: HistoryItem[][]): HistoryItem[] {
  const entries = new Map<string, HistoryItem>();
  for (const item of lists.flat()) {
    const previous = entries.get(item.url);
    if (!previous || Date.parse(item.updatedAt) > Date.parse(previous.updatedAt)) {
      entries.set(item.url, item);
    }
  }
  return [...entries.values()].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export function claimGuestHistory(userId: string): HistoryItem[] {
  const history = mergeHistory(loadHistory(userId), loadHistory());
  // Transfer ownership only after a durable account-specific copy exists.
  // A failed upload must not cause the next account to claim this history.
  if (saveHistory(history, userId)) {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      /* Storage unavailable. */
    }
  }
  return history;
}

export function createHistoryItem(extraction: Extraction): HistoryItem {
  const now = new Date();
  return {
    url: extraction.url,
    title: extraction.title,
    at: now.toLocaleString([], { dateStyle: "medium", timeStyle: "short" }),
    assets: extraction.images.length,
    updatedAt: now.toISOString(),
  };
}

export async function syncHistory(
  history: HistoryItem[],
  token: string,
  config: { url: string; key: string },
  signal?: AbortSignal,
): Promise<HistoryItem[]> {
  const response = await fetch(`${config.url.replace(/\/$/, "")}/rest/v1/rpc/sync_page_history`, {
    method: "POST",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ entries: history }),
    signal: signal ?? null,
  });
  if (!response.ok)
    throw new Error("History sync failed. Your pages are still available on this device.");
  const result: unknown = await response.json();
  if (!Array.isArray(result)) throw new Error("Could not load saved history.");
  return parseHistory(result);
}
