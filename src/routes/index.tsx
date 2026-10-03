import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { useAuth } from "@clerk/react";
import { useHistory } from "@/hooks/use-history";
import { pressUrl } from "@/lib/press.functions";
import { buildDesignMarkdown } from "@/lib/design-md";
import type { Extraction } from "@/lib/extraction-types";
import { PressPage, type PressTab } from "@/components/elements/PressPage";
import { downloadDesignMarkdown } from "@/services/press-service";
import { Topnav, Footer } from "@/components/elements";
import SyncNotice from "@/components/elements/SyncNotice";
import PressPageSkeleton from "@/components/elements/PressPageSkeleton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TungMD — press any page flat into a design spec" },
      {
        name: "description",
        content:
          "Paste a web address and TungMD returns its colors, type scale and imagery as a clean, downloadable design.md specification.",
      },
      { property: "og:title", content: "TungMD — the extraction press" },
      {
        property: "og:description",
        content:
          "Turn any public web page into an engineering-grade design.md file: palette, type scale, images, copy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Press,
});

function Press() {
  const { isLoaded, userId } = useAuth();
  return (
    <div className="min-h-screen bg-paper text-ink font-sans text-sm antialiased">
      <Topnav />
      {isLoaded ? (
        <PressWorkspace key={userId ?? "guest"} userId={userId ?? null} />
      ) : (
        <PressPageSkeleton />
      )}
      <Footer />
    </div>
  );
}

function PressWorkspace({ userId }: { userId: string | null }) {
  const press = useServerFn(pressUrl);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Extraction | null>(null);
  const [tab, setTab] = useState<PressTab>("preview");
  const { history, addHistory, syncError, syncing, retrySync } = useHistory(userId);

  const markdown = useMemo(() => (result ? buildDesignMarkdown(result) : ""), [result]);

  async function run(target: string) {
    const value = target.trim();
    if (!value) return;
    setStatus("running");
    setError("");
    try {
      const data = (await press({ data: { url: value } })) as Extraction;
      setResult(data);
      setStatus("done");
      setTab("preview");
      addHistory(data);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "The press jammed. Try another address.");
    }
  }

  function download() {
    if (!result) return;
    downloadDesignMarkdown(markdown, result);
  }

  return (
    <>
      <SyncNotice syncError={syncError} syncing={syncing} retrySync={retrySync} />
      <PressPage
        url={url}
        setUrl={setUrl}
        status={status}
        error={error}
        result={result}
        tab={tab}
        setTab={setTab}
        history={history}
        markdown={markdown}
        onPress={(target) => void run(target)}
        onDownload={download}
      />
    </>
  );
}
