import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { pressUrl } from "@/lib/press.functions";
import { buildDesignMarkdown, fileNameFor } from "@/lib/design-md";
import type { Extraction } from "@/lib/extraction-types";
import { MarkdownSheet } from "@/components/MarkdownSheet";

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

type HistoryItem = { url: string; title: string; at: string; assets: number };

const HISTORY_KEY = "tungmd.history";

function Press() {
  const press = useServerFn(pressUrl);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Extraction | null>(null);
  const [tab, setTab] = useState<"preview" | "raw">("preview");
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw) as HistoryItem[]);
    } catch {
      /* ignore */
    }
  }, []);

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
      const item: HistoryItem = {
        url: data.url,
        title: data.title,
        at: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        assets: data.images.length,
      };
      setHistory((prev) => {
        const next = [item, ...prev.filter((p) => p.url !== item.url)].slice(0, 6);
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "The press jammed. Try another address.");
    }
  }

  function download() {
    if (!result) return;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = fileNameFor(result);
    a.click();
    URL.revokeObjectURL(href);
  }

  const running = status === "running";

  return (
    <div className="min-h-screen bg-paper text-ink font-mono text-sm antialiased">
      <header className="sticky top-0 z-10 border-b border-line bg-paper">
        <div className="flex h-14 items-center justify-between px-5">
          <div className="flex items-baseline gap-2">
            <span className="font-grotesk text-lg font-bold leading-none tracking-tight">
              TungMD
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-quiet">
              extraction press
            </span>
          </div>
          <nav className="hidden items-center gap-5 text-[11px] uppercase tracking-[0.15em] text-quiet sm:flex">
            <span className="text-ink">Press</span>
            <a href="#history" className="hover:text-ink">
              History
            </a>
            <a href="#sheet" className="hover:text-ink">
              Sheet
            </a>
          </nav>
          <button
            type="button"
            onClick={() => setError("Accounts aren't open yet — everything runs locally for now.")}
            className="border border-ink px-3 py-1 text-[11px] uppercase tracking-[0.15em] transition-colors hover:bg-ink hover:text-paper"
          >
            Sign in
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5">
        <section className="pt-14 pb-8">
          <p
            className="press text-[11px] uppercase tracking-[0.25em] text-signal"
            style={{ animationDelay: "40ms" }}
          >
            Spec sheet — 01 · Extraction press
          </p>
          <h1
            className="press mt-4 max-w-[16ch] text-balance font-grotesk text-[clamp(2.5rem,6.5vw,5rem)] font-bold leading-[0.95] tracking-tight"
            style={{ animationDelay: "120ms" }}
          >
            Press any page flat into a spec.
          </h1>
          <p
            className="press mt-5 max-w-[52ch] text-pretty text-quiet"
            style={{ animationDelay: "200ms" }}
          >
            Drop a URL. TungMD runs the page through the plate and returns its dominant colors, type
            scale, and imagery as printed, engineering-grade tokens.
          </p>

          <form
            className="press mt-8 max-w-3xl"
            style={{ animationDelay: "300ms" }}
            onSubmit={(e) => {
              e.preventDefault();
              void run(url);
            }}
          >
            <div className="flex items-stretch border border-ink bg-sheet">
              <span className="flex select-none items-center pl-4 pr-3 text-signal">›</span>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                aria-label="Page address to press"
                className="min-w-0 flex-1 bg-transparent px-1 py-3 text-[15px] placeholder:text-quiet focus:outline-none"
                placeholder="https://your-page.com"
              />
              <button
                type="submit"
                disabled={running}
                className="bg-ink px-6 text-[12px] uppercase tracking-[0.18em] text-paper transition-colors hover:bg-signal disabled:opacity-60"
              >
                {running ? "Pressing" : "Press"}
              </button>
            </div>
            <div className="relative mt-3 h-px overflow-hidden bg-line">
              {running ? (
                <>
                  <span className="bar absolute inset-y-0 left-0 bg-signal" />
                  <span className="scan absolute inset-y-0 w-1/3 bg-signal/15" />
                </>
              ) : status === "done" ? (
                <span className="absolute inset-y-0 left-0 w-full bg-ink/40" />
              ) : null}
            </div>
            <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-quiet">
              {running
                ? "Extracting · colors → type → images"
                : status === "done" && result
                  ? `Pressed · ${result.colors.length} colors · ${result.type.length} type rules · ${result.images.length} images`
                  : "Public web pages only · nothing is stored on a server"}
            </p>
            {error ? (
              <p className="mt-2 border-l-2 border-signal pl-3 text-[12px] text-signal">{error}</p>
            ) : null}
          </form>
        </section>

        <section className="border-t border-line">
          <div className="grid grid-cols-12">
            <aside className="col-span-12 space-y-6 border-b border-line p-5 md:col-span-3 md:border-b-0 md:border-r">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-quiet">(a) · palette</p>
                {result?.colors.length ? (
                  <ul className="mt-3 divide-y divide-line">
                    {result.colors.map((c, i) => (
                      <li
                        key={c.hex}
                        className="press flex items-center gap-3 py-2"
                        style={{ animationDelay: `${360 + i * 60}ms` }}
                      >
                        <span
                          className="size-6 shrink-0 outline-1 -outline-offset-1 outline-black/10"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-[12px]">{c.hex}</span>
                        <span className="ml-auto text-[10px] text-quiet">{c.role}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-[11px] text-quiet">Awaiting a page.</p>
                )}
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-quiet">
                  (b) · type scale
                </p>
                {result?.type.length ? (
                  <table className="mt-3 w-full text-[11px]">
                    <thead>
                      <tr className="text-[9px] uppercase tracking-[0.15em] text-quiet">
                        <th className="pb-1 text-left font-normal">family</th>
                        <th className="pb-1 text-right font-normal">size</th>
                        <th className="pb-1 text-right font-normal">wt</th>
                        <th className="pb-1 text-right font-normal">lh</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {result.type.map((t, i) => (
                        <tr
                          key={`${t.family}-${t.size}-${i}`}
                          className="press"
                          style={{ animationDelay: `${600 + i * 60}ms` }}
                        >
                          <td className="max-w-[10ch] truncate py-1.5">{t.family}</td>
                          <td className="text-right">{t.size}</td>
                          <td className="text-right">{t.weight}</td>
                          <td className="text-right">{t.lineHeight}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="mt-3 text-[11px] text-quiet">Awaiting a page.</p>
                )}
              </div>

              <div id="history">
                <p className="text-[10px] uppercase tracking-[0.2em] text-quiet">(c) · recent</p>
                {history.length ? (
                  <ul className="mt-3 divide-y divide-line text-[11px]">
                    {history.map((h) => (
                      <li key={h.url} className="py-2">
                        <button
                          type="button"
                          onClick={() => {
                            setUrl(h.url);
                            void run(h.url);
                          }}
                          className="block w-full text-left hover:text-signal"
                        >
                          <span className="block truncate">{h.title}</span>
                          <span className="block text-[10px] text-quiet">
                            {h.at} · {h.assets} assets
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-[11px] text-quiet">Nothing pressed yet.</p>
                )}
              </div>
            </aside>

            <div id="sheet" className="col-span-12 p-5 md:col-span-9">
              <div className="mb-5 flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-1 text-[11px] uppercase tracking-[0.1em]">
                  <button
                    type="button"
                    onClick={() => setTab("preview")}
                    className={
                      tab === "preview" ? "bg-ink px-2 py-1 text-paper" : "px-2 py-1 text-quiet"
                    }
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("raw")}
                    className={
                      tab === "raw" ? "bg-ink px-2 py-1 text-paper" : "px-2 py-1 text-quiet"
                    }
                  >
                    Raw
                  </button>
                </div>
                <button
                  type="button"
                  onClick={download}
                  disabled={!result}
                  className="bg-signal px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-paper ring-1 ring-black/5 transition-colors hover:bg-ink disabled:opacity-40"
                >
                  Download .md
                </button>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 border border-line bg-sheet p-6 font-grotesk lg:col-span-7">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-quiet">
                    Rendered markdown
                  </p>
                  {result ? (
                    tab === "preview" ? (
                      <MarkdownSheet markdown={markdown} />
                    ) : (
                      <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-ink/80">
                        {markdown}
                      </pre>
                    )
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold tracking-tight">
                        The quiet voice of a page
                      </h3>
                      <p className="mt-3 text-[14px] leading-relaxed text-ink/85">
                        Every page carries a voice. Some shout in gradients; some whisper in a
                        single weight. We press the whisper into something you can hold — a scale, a
                        palette, a sheet.
                      </p>
                      <blockquote className="my-4 border-l-2 border-signal pl-4 text-[15px] italic text-ink/75">
                        Precision is a form of respect for the reader's eye.
                      </blockquote>
                      <p className="text-[14px] leading-relaxed text-ink/85">
                        The result is not decoration. It is a spec you can ship against, line by
                        line.
                      </p>
                    </>
                  )}
                </div>

                <div className="col-span-12 overflow-hidden border border-ink bg-plate p-6 text-[12px] leading-relaxed text-plate-foreground lg:col-span-5">
                  <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-quiet">
                    Raw source
                  </p>
                  <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap">
                    {result
                      ? markdown
                      : `# The quiet voice\n## of a page\n\nEvery page carries a **voice**.\n\n> Precision is a form\n> of respect…\n\n- a scale\n- a palette\n- a sheet`}
                  </pre>
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-quiet">
                  (d) · extracted images · {result?.images.length ?? 0}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {(result?.images.slice(0, 3) ?? [null, null, null]).map((img, i) =>
                    img ? (
                      <a
                        key={img.src}
                        href={img.src}
                        target="_blank"
                        rel="noreferrer"
                        className="block aspect-square overflow-hidden bg-sheet outline-1 -outline-offset-1 outline-black/5"
                      >
                        <img
                          src={img.src}
                          alt={img.alt || "Extracted asset"}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      </a>
                    ) : (
                      <div
                        key={i}
                        className="grid aspect-square place-items-center bg-sheet outline-1 -outline-offset-1 outline-black/5"
                      >
                        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-quiet">
                          Image
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-4 border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-5 py-6 text-[10px] uppercase tracking-[0.15em] text-quiet sm:flex-row sm:items-center">
          <span>TungMD · extracted tokens, not opinions</span>
          <span>press · history · sheet · v0.4</span>
        </div>
      </footer>
    </div>
  );
}
