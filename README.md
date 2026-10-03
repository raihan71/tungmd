# TungMD

<p align="center">
<img width="300"  alt="TungMD Wooden Mascot Logo" src="https://github.com/user-attachments/assets/fcd2251c-9c57-44c0-a7ca-937ae31ed930" />
</p>

Design evidence, made legible.

TungMD (named after the phenomenal `tung tung tung sahur`) is a local-first web app that takes a public URL and turns it into a clean, engineering-friendly design specification. It extracts a page's dominant colors, type scale, headings, key copy, and image references, then formats everything as a downloadable Markdown handoff.

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

## Account history setup

Sign-in and registration use Clerk. Signed-in users sync page history to Supabase;
guests keep history in their browser. Configure this before enabling account sync:

1. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to `.env`
   (see `.env.example`). Use the public publishable key, never a service-role key.
2. Enable Supabase in Clerk's dashboard, then add your Clerk instance under
   Supabase **Authentication → Third-Party Auth**. Clerk session tokens must include
   `role: "authenticated"`. See the [official integration guide](https://supabase.com/docs/guides/auth/third-party/clerk).
3. Run `supabase/migrations/202610030001_page_history.sql` in the Supabase SQL editor
   or apply it with your Supabase migration workflow. It creates the history table,
   per-user row-level security policies, and the atomic merge function.
4. Restart the dev server (or rebuild the deployed app) after configuring environment variables.

On login or registration, existing guest history moves into an account-specific
browser cache and uploads to Supabase. The cache is retained for failed/offline
syncs and is never shown to another account. History retries on window focus,
reconnection, new extractions, or the Retry button. New devices load the same
account's history after sign-in. Visits merge by URL, with the newest timestamp
winning; older local caches cannot overwrite newer cloud visits.

The old browser format retained only six links, so only those surviving entries
can be imported. History now has no six-entry cap. It stores URLs, titles, visit
times, and asset counts; selecting a page extracts it again, rather than restoring
a saved extraction snapshot. Legacy clock-only entries retain their original order
and sort below visits with known dates.

Validate history behavior with `node --test tests/history-service.test.mjs`
(Node.js 22.18+). For live verification, sign in with existing guest history, open
the same account in a second browser, and verify the pages appear. Check that a
different account has separate history, and that offline visits sync on reconnect.

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
