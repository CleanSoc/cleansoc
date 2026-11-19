# CleanSoc Frontend

React 19 single-page application for CleanSoc: review, filter, select, and safely delete X content. Built with Vite, TypeScript, and Tailwind CSS v4.

## Stack

- React 19, React Router 7
- Vite 6, TypeScript 5.7 (strict)
- Tailwind CSS v4 (`@tailwindcss/vite`)
- TanStack Query 5 for server state
- lucide-react icons, date-fns, clsx
- Inter Variable + Instrument Serif fonts

## Folder structure

```
src/
  App.tsx           routes + boot screen
  main.tsx          providers (QueryClient, theme, toast, router)
  index.css         design tokens, base styles, animations
  components/       shared UI, AppShell, charts, PostCard, FilterPanel, CleanupDialog, JobBits
  pages/            Welcome, Dashboard, Activity, Cleanup, JobDetail, Rules, History, Archive, Settings
  lib/              api client, format helpers, theme, types
```

## Prerequisites

- Node.js 20+
- npm 10+
- The backend running on `http://localhost:8787` (Vite proxies `/api`)

## Running locally

```bash
npm install
npm run dev          # http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:8787`.

## Scripts

- `npm run dev` — Vite dev server.
- `npm run build` — `tsc -b && vite build` (outputs `dist/`).
- `npm run preview` — preview the production build.
- `npm run typecheck` — `tsc -b --noEmit`.

## Design notes

- Theme tokens live in `src/index.css` under `@theme inline` and the `:root`/`.dark` blocks; the palette is ink/paper/emerald with an acid-lime accent and a coral destructive tone.
- Layout: fixed sidebar on desktop, sticky header, responsive main column up to 1440px.
- Loading states use content-shaped skeletons; no fullscreen blocking spinners beyond the initial boot.
- Modals, toasts, and confirmations are portal-based and keyboard accessible.
- Overscroll bounce is disabled globally for a controlled scroll feel; normal scrolling and touch interactions are unaffected.

## Building for production

```bash
npm run build
```

Output goes to `dist/`. The backend serves `dist/` automatically when `NODE_ENV=production`.

## Accessibility

- Semantic landmarks, focus-visible outlines, keyboard-operable modals and menus.
- `aria-*` attributes on interactive controls; colour contrast checked against WCAG AA.
- `prefers-reduced-motion` is respected by the animation utilities where applicable.
