import type { ColorToken } from "./extraction-types";

export type ThemeVars = Record<`--${string}`, string>;

function channel(v: number): number {
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const v = hex.slice(1);
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(v.slice(i, i + 2), 16) / 255));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function readableOn(hex: string): string {
  return luminance(hex) > 0.4 ? "#000000" : "#FFFFFF";
}

function pick(colors: ColorToken[], role: string): string | undefined {
  return colors.filter((c) => c.role === role).sort((a, b) => b.count - a.count)[0]?.hex;
}

export function buildThemeVars(colors: ColorToken[]): ThemeVars {
  const vars: ThemeVars = {};
  const set = (name: string, value: string | undefined) => {
    if (value) {
      vars[`--${name}`] = value;
    }
  };

  const paper = pick(colors, "paper");
  const ink = pick(colors, "ink");
  const sheet = pick(colors, "sheet");
  const signal = pick(colors, "signal");
  const shade = pick(colors, "shade");
  const slate = pick(colors, "slate");

  set("background", paper);
  set("foreground", ink);
  set("ring", ink);
  set("card", sheet);
  set("popover", sheet);
  set("secondary", sheet);
  set("muted", sheet);
  set("primary", signal);
  set("accent", signal);
  set("border", shade);
  set("input", shade);
  set("muted-foreground", slate);

  const bg = paper ?? "#F3F1EC";
  const surface = sheet ?? bg;
  set("card-foreground", readableOn(surface));
  set("popover-foreground", readableOn(surface));
  set("secondary-foreground", readableOn(surface));
  if (signal) {
    set("primary-foreground", readableOn(signal));
    set("accent-foreground", readableOn(signal));
  }
  if (!ink) {
    set("foreground", readableOn(bg));
  }

  return vars;
}
