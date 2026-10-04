import { GitFork } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-4 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-5 py-6 text-xs text-quiet sm:flex-row sm:items-center">
        <span>TungMD · extracted tokens, not opinions</span>
        <div className="flex items-center gap-1">
          <a
            href="https://github.com/raihan71/tungmd"
            aria-label="TungMD on GitHub"
            className="inline-flex shrink-0 items-center rounded-sm transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            title="TungMD on GitHub"
            target="_blank"
          >
            <GitFork className="size-3.5" aria-hidden="true" />
          </a>
          <span>· press · history · sheet · v0.4</span>
        </div>
      </div>
    </footer>
  );
}
