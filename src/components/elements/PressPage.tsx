import type { Dispatch, FormEvent, SetStateAction } from "react";
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

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onPress(url);
  }

  return (
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
          onSubmit={submit}
        >
          <div className="flex items-stretch border border-ink bg-sheet">
            <span className="flex select-none items-center pl-4 pr-3 text-signal">›</span>
            <input
              type="text"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
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
                  {result.colors.map((color, index) => (
                    <li
                      key={color.hex}
                      className="press flex items-center gap-3 py-2"
                      style={{ animationDelay: `${360 + index * 60}ms` }}
                    >
                      <span
                        className="size-6 shrink-0 outline-1 -outline-offset-1 outline-black/10"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-[12px]">{color.hex}</span>
                      <span className="ml-auto text-[10px] text-quiet">{color.role}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-[11px] text-quiet">Awaiting a page.</p>
              )}
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-quiet">(b) · type scale</p>
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
              ) : (
                <p className="mt-3 text-[11px] text-quiet">Awaiting a page.</p>
              )}
            </div>

            <div id="history">
              <p className="text-[10px] uppercase tracking-[0.2em] text-quiet">(c) · recent</p>
              {history.length ? (
                <ul className="mt-3 divide-y divide-line text-[11px]">
                  {history.map((item) => (
                    <li key={item.url} className="py-2">
                      <button
                        type="button"
                        onClick={() => {
                          setUrl(item.url);
                          onPress(item.url);
                        }}
                        className="block w-full text-left hover:text-signal"
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
            </div>
          </aside>

          <div id="sheet" className="col-span-12 p-5 md:col-span-9">
            <div className="mb-5 flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-1 text-[11px] uppercase tracking-[0.1em]">
                {(["preview", "raw", "ui"] as const).map((view) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => setTab(view)}
                    className={
                      tab === view ? "bg-ink px-2 py-1 text-paper" : "px-2 py-1 text-quiet"
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
                className="bg-signal px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-paper ring-1 ring-black/5 transition-colors hover:bg-ink disabled:opacity-40"
              >
                Download .md
              </button>
            </div>

            {tab === "ui" ? (
              result ? (
                <UiPreview colors={result.colors} />
              ) : (
                <p className="border border-line bg-sheet p-6 text-[11px] text-quiet">
                  Awaiting a page.
                </p>
              )
            ) : (
              <div className="grid grid-cols-1 gap-4">
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
              </div>
            )}

            <div className="mt-5">
              <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-quiet">
                (d) · extracted images · {result?.images.length ?? 0}
              </p>
              <div className="grid grid-cols-3 gap-3">
                {(result?.images.slice(0, 3) ?? [null, null, null]).map((image, index) =>
                  image ? (
                    <a
                      key={image.src}
                      href={image.src}
                      target="_blank"
                      rel="noreferrer"
                      className="block aspect-square overflow-hidden bg-sheet outline-1 -outline-offset-1 outline-black/5"
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
  );
}
