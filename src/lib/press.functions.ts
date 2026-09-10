import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ColorToken, Extraction, ImageToken, TypeToken } from "./extraction-types";

const inputSchema = z.object({ url: z.string().min(3) });
/* prettier-ignore */
function normalizeUrl(raw: string): URL {
  const trimmed = raw.trim();
  const withProtocol =
    /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return new URL(withProtocol);
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCharCode(Number(d)));
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function toHex(r: number, g: number, b: number): string {
  const h = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

function expandHex(hex: string): string | null {
  const v = hex.replace("#", "");
  if (v.length === 3)
    return `#${v
      .split("")
      .map((c) => c + c)
      .join("")}`.toUpperCase();
  if (v.length === 6) return `#${v}`.toUpperCase();
  if (v.length === 8) return `#${v.slice(0, 6)}`.toUpperCase();
  return null;
}

function luminance(hex: string): number {
  const v = hex.slice(1);
  const r = parseInt(v.slice(0, 2), 16) / 255;
  const g = parseInt(v.slice(2, 4), 16) / 255;
  const b = parseInt(v.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function saturation(hex: string): number {
  const v = hex.slice(1);
  const r = parseInt(v.slice(0, 2), 16) / 255;
  const g = parseInt(v.slice(2, 4), 16) / 255;
  const b = parseInt(v.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

function roleFor(hex: string): string {
  const l = luminance(hex);
  const s = saturation(hex);
  if (s > 0.35 && l > 0.12 && l < 0.85) return "signal";
  if (l < 0.2) return "ink";
  if (l > 0.9) return "paper";
  if (l > 0.75) return "sheet";
  if (l < 0.45) return "shade";
  return "slate";
}

function collectColors(css: string): ColorToken[] {
  const counts = new Map<string, number>();
  const bump = (hex: string | null) => {
    if (!hex) return;
    counts.set(hex, (counts.get(hex) ?? 0) + 1);
  };

  for (const m of css.matchAll(/#([0-9a-fA-F]{3,8})\b/g)) bump(expandHex(m[1]!));
  for (const m of css.matchAll(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/g)) {
    bump(toHex(Number(m[1]), Number(m[2]), Number(m[3])));
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([hex, count]) => ({ hex, count, role: roleFor(hex) }));
}

function cleanFamily(value: string): string {
  const first = value.split(",")[0] ?? "";
  return first.replace(/["']/g, "").trim();
}

function collectType(css: string): TypeToken[] {
  const families = new Map<string, number>();
  for (const m of css.matchAll(/font-family\s*:\s*([^;}{]+)/gi)) {
    const fam = cleanFamily(m[1]!);
    if (!fam || fam.startsWith("var(") || fam.length > 32) continue;
    families.set(fam, (families.get(fam) ?? 0) + 1);
  }

  const rules: TypeToken[] = [];
  for (const m of css.matchAll(/font\s*:\s*([^;}{]+)/gi)) {
    const shorthand = m[1]!;
    const size = shorthand.match(/(\d+(?:\.\d+)?)(px|rem|em)/);
    if (size) {
      rules.push({
        family: cleanFamily(shorthand.split(",")[0]!.split(" ").slice(-1)[0] ?? "—"),
        size: `${size[1]}${size[2]}`,
        weight: shorthand.match(/\b([1-9]00)\b/)?.[1] ?? "400",
        lineHeight: shorthand.match(/\/\s*([\d.]+)/)?.[1] ?? "—",
      });
    }
  }

  const sizes = [...css.matchAll(/font-size\s*:\s*([\d.]+)(px|rem|em)/gi)]
    .map((m) => ({
      n: Number(m[1]) * (m[2] === "px" ? 1 : 16),
      label: `${m[1]}${m[2]}`,
    }))
    .sort((a, b) => b.n - a.n);

  const weights = [...css.matchAll(/font-weight\s*:\s*(\d{3}|bold|normal)/gi)].map((m) => m[1]!);
  const heights = [...css.matchAll(/line-height\s*:\s*([\d.]+)(px|rem|em)?/gi)].map(
    (m) => `${m[1]}${m[2] ?? ""}`,
  );

  const topFamilies = [...families.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const uniqueSizes = [...new Map(sizes.map((s) => [s.label, s])).values()].slice(0, 5);

  const out: TypeToken[] = uniqueSizes.map((size, i) => ({
    family: topFamilies[Math.min(i, Math.max(topFamilies.length - 1, 0))]?.[0] ?? "—",
    size: size.label,
    weight: weights[i] ?? weights[0] ?? "400",
    lineHeight: heights[i] ?? heights[0] ?? "—",
  }));

  return out.length ? out : rules.slice(0, 5);
}

async function fetchText(url: string, ms = 12000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; TungMD/1.0; +https://tungmd.app) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        accept: "text/html,text/css,*/*",
      },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

export const pressUrl = createServerFn({ method: "POST" })
  .validator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<Extraction> => {
    let target: URL;
    try {
      target = normalizeUrl(data.url);
    } catch {
      throw new Error("That doesn't look like a valid address.");
    }

    if (/(^|\.)figma\.com$/i.test(target.hostname)) {
      throw new Error(
        "Figma files need a Figma access token, which isn't wired up yet. Paste a public web address for now.",
      );
    }

    let html: string;
    try {
      html = await fetchText(target.toString());
    } catch (err) {
      throw new Error(
        `Couldn't read that page (${err instanceof Error ? err.message : "network error"}). It may block automated readers.`,
      );
    }

    const head = html.slice(0, 400000);

    const title =
      stripTags(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "") || target.hostname;
    const description =
      decodeEntities(
        head.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] ??
          head.match(
            /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i,
          )?.[1] ??
          "",
      ).trim() || "No meta description found on this page.";

    const headings = [...html.matchAll(/<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi)]
      .map((m) => ({ level: Number(m[1]), text: stripTags(m[2]!) }))
      .filter((h) => h.text.length > 1 && h.text.length < 160)
      .slice(0, 12);

    const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((m) => stripTags(m[1]!))
      .filter((p) => p.length > 40)
      .slice(0, 5);

    const images: ImageToken[] = [];
    for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
      const tag = m[0];
      const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1];
      if (!src || src.startsWith("data:")) continue;
      let abs: string;
      try {
        abs = new URL(src, target).toString();
      } catch {
        continue;
      }
      if (images.some((i) => i.src === abs)) continue;
      images.push({
        src: abs,
        alt: decodeEntities(tag.match(/\balt=["']([^"']*)["']/i)?.[1] ?? ""),
      });
      if (images.length >= 9) break;
    }

    let css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]!).join("\n");
    css += [...html.matchAll(/\bstyle=["']([^"']+)["']/gi)].map((m) => m[1]!).join(";\n");

    const sheetHrefs: string[] = [];
    for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
      const tag = m[0];
      if (!/rel=["']?stylesheet/i.test(tag)) continue;
      const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
      if (!href) continue;
      try {
        sheetHrefs.push(new URL(href, target).toString());
      } catch {
        /* ignore */
      }
      if (sheetHrefs.length >= 3) break;
    }

    const sheets = await Promise.allSettled(sheetHrefs.map((h) => fetchText(h, 8000)));
    for (const s of sheets) {
      if (s.status === "fulfilled") css += `\n${s.value.slice(0, 300000)}`;
    }

    return {
      url: target.toString(),
      source: "web",
      title,
      description,
      headings,
      paragraphs,
      colors: collectColors(css),
      type: collectType(css),
      images,
      stats: {
        stylesheets: sheets.filter((s) => s.status === "fulfilled").length,
        bytes: html.length,
        extractedAt: new Date().toISOString(),
      },
    };
  });
