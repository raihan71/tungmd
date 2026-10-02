import { Show, SignInButton, UserButton } from "@clerk/react";

type HeaderProps = {
  onSignIn: () => void;
};

export default function Topnav({ onSignIn }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper">
      <div className="flex h-14 items-center justify-between px-5">
        <div className="flex items-baseline gap-2">
          <span className="font-grotesk text-lg font-bold leading-none tracking-tight">TungMD</span>
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
        <Show when="signed-out">
          <SignInButton />
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>
  );
}
