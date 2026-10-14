import { ArrowDownToLine, Globe2, Sparkles } from "lucide-react";

const steps = [
  {
    title: "Paste a web address",
    description: "Find a public page you love, enter its URL above, and hit Press.",
    label: "https://your-inspiration.com",
    icon: Globe2,
  },
  {
    title: "Download your design.md",
    description: "Review the extracted colors, typography, and imagery. Download the .md file.",
    label: "design.md",
    icon: ArrowDownToLine,
  },
  {
    title: "Give it to your agent",
    description:
      "Attach the downloaded file to your coding agent and describe what you want to build.",
    label: "Your next creation",
    icon: Sparkles,
  },
];

export function HowToUse() {
  return (
    <section aria-labelledby="how-to-use-title" className="mb-12 sm:mb-16">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="how-to-use-title" className="text-xl font-semibold tracking-tight">
          From inspiration to creation
        </h2>
        <p className="text-xs text-quiet">How to use TungMD · Three simple steps</p>
      </div>
      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map(({ title, description, label, icon: Icon }, index) => (
          <li key={title} className="group rounded-xl border border-line bg-sheet p-5 sm:p-6">
            <div
              aria-hidden="true"
              className="relative mb-6 flex h-32 items-center justify-center rounded-lg bg-muted/60 [perspective:700px]"
            >
              <div className="absolute h-20 w-40 translate-x-2 translate-y-3 rounded-lg border border-signal/15 bg-signal/10 [transform:rotateX(20deg)_rotateY(-16deg)_rotateZ(-6deg)]" />
              <div className="relative flex h-20 w-40 flex-col justify-between rounded-lg border border-line bg-sheet p-3 shadow-[6px_10px_18px_rgba(0,0,0,0.08)] [transform:rotateX(20deg)_rotateY(-16deg)_rotateZ(-6deg)] motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:[transform:translateY(-4px)_rotateX(10deg)_rotateY(-8deg)_rotateZ(-3deg)]">
                <Icon className="size-5 text-signal" strokeWidth={1.5} />
                <span className="truncate font-mono text-[9px] text-quiet">{label}</span>
              </div>
              <span className="absolute left-3 top-3 font-mono text-[10px] text-quiet">
                0{index + 1}
              </span>
            </div>
            <h3 className="text-sm font-semibold">
              <span className="sr-only">Step {index + 1}: </span>
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-quiet">{description}</p>
          </li>
        ))}
      </ol>
      <div className="mt-4 rounded-lg border border-dashed border-line bg-sheet/50 px-5 py-4 text-sm leading-relaxed sm:flex sm:items-baseline sm:gap-4">
        <p className="shrink-0 text-xs font-medium text-signal">Try this prompt</p>
        <p className="mt-1 text-quiet sm:mt-0">
          “Build a landing page for my project using the attached design.md as the design reference.
          Follow its colors, typography, and visual style.”
        </p>
      </div>
    </section>
  );
}
