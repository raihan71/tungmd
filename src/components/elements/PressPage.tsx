import { useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import type { Extraction } from "@/lib/extraction-types";
import type { HistoryItem } from "@/services/press-service";
import { MarkdownSheet } from "@/components/elements/MarkdownSheet";
import { UiPreview } from "@/components/elements/UiPreview";

export type PressTab = "preview" | "raw" | "ui";
type PressStatus = "idle" | "running" | "done" | "error";

type PressPageProps = {
  url: string;
  setUrl: Dispatch<SetStateAction<string>>;
  status: PressStatus;
  error: string;
  result: Extraction | null;
  tab: PressTab;
  setTab: Dispatch<SetStateAction<PressTab>>;
  history: HistoryItem[];
  markdown: string;
  onPress: (url: string) => void;
  onDownload: () => void;
};

export function PressPage({
  url,
  setUrl,
  status,
  error,
  result,
  tab,
  setTab,
  history,
  markdown,
  onPress,
  onDownload,
}: PressPageProps) {
  const running = status === "running";
  const [visibleHistoryCount, setVisibleHistoryCount] = useState(10);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onPress(url);
  }

  return (
    <main className="mx-auto max-w-6xl px-5 pb-12">
      <section className="py-12 text-center sm:py-16">
        <img
          src="/assets/tungmd-mascot.webp"
          alt="TungMD mascot"
          width={128}
          height={128}
          className="press mx-auto mb-4 size-28 object-contain sm:size-32"
        />
        <p
          className="press inline-flex rounded-full border border-line bg-sheet/60 px-3.5 py-1.5 text-xs font-medium text-quiet"
          style={{ animationDelay: "40ms" }}
        >
          A little clarity for your next creation
        </p>
        <h1
          className="press mx-auto mt-4 max-w-[18ch] text-balance font-sans text-[clamp(2.5rem,6.5vw,4.5rem)] font-bold leading-[1.08] tracking-[-0.045em]"
          style={{ animationDelay: "120ms" }}
        >
          Press any page into a{" "}
          <span className="rounded-full bg-signal/10 px-4 text-signal">design spec</span>
        </h1>
        <p
          className="press mx-auto mt-4 max-w-[52ch] text-pretty text-base leading-relaxed text-quiet sm:text-lg"
          style={{ animationDelay: "200ms" }}
        >
          Turn any public webpage into an engineering-ready design spec.
        </p>

        <form
          className="press mx-auto mt-6 max-w-2xl text-left"
          style={{ animationDelay: "300ms" }}
          onSubmit={submit}
        >
          <div className="flex items-stretch gap-2 rounded-xl border border-line bg-sheet p-2 focus-within:border-signal">
            <span className="flex select-none items-center pl-4 pr-3 text-signal">›</span>
            <input
              type="text"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              aria-label="Page address to press"
              className="min-w-0 flex-1 bg-transparent px-1 py-3 text-[15px] placeholder:text-quiet focus:outline-none"
              placeholder="Enter a public web page address"
            />
            <button
              type="submit"
              disabled={running}
              className="rounded-lg bg-signal px-5 text-sm font-medium text-white hover:bg-signal/90 disabled:opacity-60"
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
          <p className="mt-3 text-center text-xs text-quiet">
            {running
              ? "Extracting · colors → type → images"
              : status === "done" && result
                ? `Pressed · ${result.colors.length} colors · ${result.type.length} type rules · ${result.images.length} images`
                : "Public web pages only · nothing is stored on a server"}
          </p>
          {error ? (
            <p className="mt-2 border-l-2 border-destructive pl-3 text-[12px] text-destructive">
              {error}
            </p>
          ) : null}
        </form>
      </section>

      <section className="overflow-hidden rounded-xl border border-line bg-sheet">
        <div className="grid grid-cols-12">
          <aside className="col-span-12 space-y-8 border-b border-line bg-paper/50 p-6 md:col-span-3 md:border-b-0 md:border-r">
            {result?.colors.length ? (
              <div>
                <p className="text-xs font-medium text-quiet">palette</p>
                <ul className="mt-3 divide-y divide-line">
                  {result.colors.map((color, index) => (
                    <li
                      key={color.hex}
                      className="press flex items-center gap-3 py-2"
                      style={{ animationDelay: `${360 + index * 60}ms` }}
                    >
                      <span
                        className="size-7 shrink-0 rounded-md outline-1 -outline-offset-1 outline-black/10"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-[12px]">{color.hex}</span>
                      <span className="ml-auto text-[10px] text-quiet">{color.role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {result?.type.length ? (
              <div>
                <p className="text-xs font-medium text-quiet"> type scale</p>
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
                    {result.type.map((type, index) => (
                      <tr
                        key={`${type.family}-${type.size}-${index}`}
                        className="press"
                        style={{ animationDelay: `${600 + index * 60}ms` }}
                      >
                        <td className="max-w-[10ch] truncate py-1.5">{type.family}</td>
                        <td className="text-right">{type.size}</td>
                        <td className="text-right">{type.weight}</td>
                        <td className="text-right">{type.lineHeight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            <div id="history">
              <p className="text-xs font-medium text-quiet">recent</p>
              {history.length ? (
                <ul
                  id="recent-history-list"
                  aria-label="Recent pages"
                  tabIndex={Math.min(visibleHistoryCount, history.length) > 16 ? 0 : undefined}
                  className={`mt-3 divide-y divide-line text-[11px] ${
                    Math.min(visibleHistoryCount, history.length) > 16
                      ? "max-h-[48rem] overflow-y-auto overscroll-contain"
                      : ""
                  }`}
                >
                  {history.slice(0, visibleHistoryCount).map((item) => (
                    <li key={item.url} className="py-2">
                      <button
                        type="button"
                        onClick={() => {
                          setUrl(item.url);
                          onPress(item.url);
                        }}
                        className="block w-full rounded-md p-1 text-left hover:bg-sheet hover:text-signal"
                      >
                        <span className="block truncate">{item.title}</span>
                        <span className="block text-[10px] text-quiet">
                          {item.at} · {item.assets} assets
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-[11px] text-quiet">Nothing pressed yet.</p>
              )}
              {visibleHistoryCount < history.length ? (
                <button
                  type="button"
                  aria-controls="recent-history-list"
                  onClick={() => setVisibleHistoryCount((count) => count + 16)}
                  className="mt-3 text-[10px] uppercase tracking-[0.15em] text-quiet hover:text-signal"
                >
                  Load more ({history.length - visibleHistoryCount} remaining)
                </button>
              ) : null}
            </div>
          </aside>

          <div id="sheet" className="col-span-12 min-w-0 p-4 sm:p-6 md:col-span-9">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <div className="flex items-center gap-1 rounded-lg bg-paper p-1 text-sm">
                {(["preview", "raw", "ui"] as const).map((view) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => setTab(view)}
                    className={
                      tab === view
                        ? "rounded-md bg-sheet px-3 py-1.5 font-medium text-ink"
                        : "rounded-md px-3 py-1.5 text-quiet hover:bg-sheet/60 hover:text-ink"
                    }
                  >
                    {view === "ui" ? "UI" : view === "raw" ? "Raw" : "Preview"}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={onDownload}
                disabled={!result}
                className="rounded-lg bg-signal/10 px-4 py-2 text-sm font-medium text-signal hover:bg-signal/15 disabled:opacity-40"
              >
                Download .md
              </button>
            </div>

            {tab === "ui" ? (
              result ? (
                <UiPreview colors={result.colors} />
              ) : (
                <p className="rounded-xl border border-line bg-paper/40 p-6 text-sm text-quiet">
                  Awaiting a page.
                </p>
              )
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <div className="min-w-0 overflow-x-auto rounded-xl border border-line bg-sheet p-6 font-sans sm:p-8">
                  <p className="mb-3 font-mono text-xs font-medium text-quiet">Rendered markdown</p>
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
              </div>
            )}

            <div className="mt-5">
              <p className="mb-3 text-xs font-medium text-quiet">
                Extracted images · {result?.images.length ?? 0}
              </p>
              <div className="grid grid-cols-3 gap-3">
                {(result?.images.slice(0, 3) ?? [null, null, null]).map((image, index) =>
                  image ? (
                    <a
                      key={image.src}
                      href={image.src}
                      target="_blank"
                      rel="noreferrer"
                      className="block aspect-square overflow-hidden rounded-xl bg-paper outline-1 -outline-offset-1 outline-black/5"
                    >
                      <img
                        src={image.src}
                        alt={image.alt || "Extracted asset"}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </a>
                  ) : (
                    <div
                      key={index}
                      className="grid aspect-square place-items-center rounded-xl bg-paper outline-1 -outline-offset-1 outline-black/5"
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
    </main>
  );
}
