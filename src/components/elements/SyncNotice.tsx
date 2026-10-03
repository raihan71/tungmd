import { useAuth } from "@clerk/react";
import { useEffect, useRef, useState } from "react";

type SyncNoticeProps = {
  syncError: string;
  syncing: boolean;
  retrySync: () => void;
};

export default function SyncNotice({ syncError, syncing, retrySync }: SyncNoticeProps) {
  const { sessionId } = useAuth();
  const [visible, setVisible] = useState(false);
  const checkedSession = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      checkedSession.current = null;
      setVisible(false);
      return;
    }

    if (checkedSession.current !== sessionId) {
      checkedSession.current = sessionId;
      const key = `tungmd.sync-notice.${sessionId}`;
      let shown = false;
      try {
        shown = sessionStorage.getItem(key) === "shown";
        sessionStorage.setItem(key, "shown");
      } catch {
        // Still allow dismissal when browser storage is unavailable.
      }
      setVisible(!shown);
    }
  }, [sessionId]);

  if (!visible) return null;

  return (
    <div className="mx-auto mt-4 flex max-w-6xl items-center gap-3 rounded-lg border border-line bg-sheet px-5 py-3 text-xs text-quiet">
      <span role="status">
        {syncError || (syncing ? "Syncing your pages…" : "Your pages are synced to your account.")}
      </span>
      {syncError && (
        <button type="button" onClick={retrySync} className="underline" disabled={syncing}>
          Retry
        </button>
      )}
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="ml-auto px-2 text-base hover:text-ink"
        aria-label="Dismiss sync notice"
      >
        ×
      </button>
    </div>
  );
}
