import { Show, SignInButton, UserButton } from "@clerk/react";
import { Link } from "@tanstack/react-router";

export default function Topnav() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-sheet/20 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-5">
        <div className="flex items-baseline gap-2">
          <Link to="/" className="text-signal hover:text-signal/80">
            <span className="text-lg font-semibold">TungMD</span>
          </Link>
          <span className="text-quiet text-sm">v0.4</span>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-quiet sm:flex">
          <span className="text-signal">Press</span>
          <a href="#history" className="hover:text-ink">
            History
          </a>
          <a href="#sheet" className="hover:text-ink">
            Sheet
          </a>
        </nav>
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button
              type="button"
              className="rounded-sm border border-line bg-sheet px-4 py-2 text-sm font-medium transition-colors hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Sign in
            </button>
          </SignInButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>
  );
}
