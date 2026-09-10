# TungMD 
Design evidence, made legible.
(named after the phenomenal `tung tung tung sahur`)

TungMD is a local-first web app that takes a public URL and turns it into a clean, engineering-friendly design specification. It extracts a page's dominant colors, type scale, headings, key copy, and image references, then formats everything as a downloadable Markdown handoff.

## What this project does

The app is built for quick design QA and handoff work:

- Paste a public website URL
- Pull the page HTML and stylesheet content
- Detect colors, type rules, headings, paragraphs, and images
- Build a structured `design.md` output
- View the result in the browser and download it as a file

This is especially useful when you want a fast spec from a live reference page without manually copying styles or screenshots.

## Product idea

TungMD focuses on turning a reference page into a usable design token sheet:

- Palette: dominant hex colors and role labels
- Typography: type families, sizes, weights, and line heights
- Structure: headings and paragraph copy
- Assets: extracted images with alt text

The final output is meant to be readable by both designers and engineers.

## Tech stack

- Vite + React
- TanStack Start
- TanStack Router
- TypeScript
- Tailwind CSS
- Radix UI primitives
- Zod validation

## Prerequisites

Before running the app, make sure you have:

- Node.js 20+
- pnpm installed

## Quick start

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start the dev server:

   ```bash
   pnpm dev
   ```

3. Open the local app in the browser using the URL shown by Vite.

## Available scripts

```bash
pnpm dev        # run the app in development mode
pnpm build      # production build
pnpm preview    # preview the production build locally
pnpm lint       # run ESLint
pnpm format     # format the codebase with Prettier
```

## How the app works

The main flow is:

1. User enters a URL in the homepage UI.
2. The server function `pressUrl` validates the input and normalizes it.
3. TungMD fetches the HTML and linked CSS from the page.
4. It extracts:
   - colors from hex values and `rgb()` values
   - typography from CSS font declarations
   - headings and paragraph text from the markup
   - image sources and alt text
5. The extracted data is assembled into a `design.md` string using `buildDesignMarkdown`.
6. The browser renders a preview and allows download.

## Project structure

```text
.
├── src/
│   ├── components/
│   ├── lib/
│   ├── routes/
│   ├── server.ts
│   ├── start.ts
│   └── router.tsx
├── public/
├── package.json
├── pnpm-lock.yaml
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
├── components.json
├── README.md
└── bunfig.toml
```

Important files:

- `src/lib/press.functions.ts`: fetches the URL and extracts page data
- `src/lib/design-md.ts`: converts the extraction result into Markdown
- `src/routes/index.tsx`: main UI for entering URLs and previewing output
- `src/server.ts`: server entry for the app

## Usage notes

- Public URLs only: the app intentionally does not support private or token-gated pages.
- Figma links are blocked unless a proper Figma token flow is added.
- Data is handled in the app flow; the current version is designed for local use and browser-based preview.

## Example output

The generated Markdown includes sections similar to:

```md
# Example Landing Page

_Design specification pressed by TungMD on 2026-09-10._

**Source:** https://example.com

## Colors

| Hex       | Role  | Occurrences |
| --------- | ----- | ----------- |
| `#111111` | ink   | 14          |
| `#F5F5F5` | paper | 9           |

## Typography

| Family | Size | Weight | Line height |
| ------ | ---- | ------ | ----------- |
| Inter  | 48px | 700    | 1.1         |

## Content structure

- H1 — Example Landing Page
- H2 — Product Overview

## Images

- ![Hero image](https://example.com/hero.jpg)
```

## Notes

This project is a lightweight design extraction tool and is intentionally focused on a single workflow: press a public page into a spec sheet. It functions as a fast starting point for design handoff workflows and can be expanded with richer extraction, caching, or API integrations.

## License

This project does not currently declare a license in the repository metadata. Check with the repository owner before using it in production or redistributing it.
