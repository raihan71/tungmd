import { useSession } from "@clerk/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Extraction } from "@/lib/extraction-types";
import {
  claimGuestHistory,
  createHistoryItem,
  historyKey,
  loadHistory,
  mergeHistory,
  saveHistory,
  syncHistory,
  type HistoryItem,
} from "@/services/history-service";

export function useHistory(userId: string | null) {
  const { session } = useSession();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [syncError, setSyncError] = useState("");
  const [syncing, setSyncing] = useState(Boolean(userId));
  const active = useRef(false);
  const current = useRef<HistoryItem[]>([]);
  const requestSync = useRef(() => {});

  useEffect(() => {
    active.current = true;
    let disposed = false;
    let running = false;
    let requested = false;
    const controller = new AbortController();
    current.current = mergeHistory(
      current.current,
      userId ? claimGuestHistory(userId) : loadHistory(),
    );
    setHistory(current.current);

    async function synchronize() {
      if (!userId || !session || disposed) return;
      requested = true;
      if (running) return;
      running = true;
      setSyncing(true);
      try {
        const url = import.meta.env["VITE_SUPABASE_URL"];
        const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
        if (!url || !key)
          throw new Error("History sync is not configured. Pages are saved on this device.");
        while (requested && !disposed) {
          requested = false;
          const token = await session.getToken();
          if (disposed) return;
          if (!token) throw new Error("Sign in again to sync your history.");
          const remote = await syncHistory(current.current, token, { url, key }, controller.signal);
          if (disposed) return;
          current.current = mergeHistory(current.current, remote);
          saveHistory(current.current, userId);
          setHistory(current.current);
          setSyncError("");
        }
      } catch (error) {
        if (!disposed)
          setSyncError(error instanceof Error ? error.message : "History sync failed. Try again.");
      } finally {
        running = false;
        if (!disposed) setSyncing(false);
      }
    }

    const refresh = () => {
      current.current = mergeHistory(current.current, loadHistory(userId));
      setHistory(current.current);
      void synchronize();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === historyKey(userId)) refresh();
    };
    requestSync.current = refresh;
    void synchronize();
    window.addEventListener("online", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", onStorage);
    return () => {
      active.current = false;
      disposed = true;
      controller.abort();
      requestSync.current = () => {};
      window.removeEventListener("online", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, [session, userId]);

  const addHistory = useCallback(
    (extraction: Extraction) => {
      if (!active.current) return;
      current.current = mergeHistory(
        [createHistoryItem(extraction)],
        current.current,
        loadHistory(userId),
      );
      const saved = saveHistory(current.current, userId);
      setHistory(current.current);
      if (!saved)
        setSyncError(
          "Browser storage is unavailable. Keep this page open until history has synced.",
        );
      requestSync.current();
    },
    [userId],
  );

  return { history, addHistory, syncError, syncing, retrySync: () => requestSync.current() };
}
