# Pamar Enterprises — Website

Revamped website for [Pamar Enterprises](https://www.pamarenterprises.com/): project showcase, careers/applicant funnel, and subcontractor bid portal.

Tracked in Jira epic **SUMMIT-226**.

## Stack

- [Next.js 16](https://nextjs.org/) (App Router, React Server Components, Server Actions)
- TypeScript, Tailwind CSS v4
- Vitest for unit tests, ESLint + Prettier
- Self-hosted fonts via Fontsource (Inter, Oswald). No external font requests at build or run time

## Getting started

```bash
nvm use            # Node 22
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
```

| Script              | What it does                       |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Start the dev server               |
| `npm run build`     | Production build                   |
| `npm run lint`      | ESLint                             |
| `npm run typecheck` | Generate route types and run `tsc` |
| `npm test`          | Unit tests (Vitest)                |
| `npm run format`    | Format everything with Prettier    |

CI (`.github/workflows/ci.yml`) runs lint, typecheck, format check, tests, and build on every PR.

## Project layout

```
src/
  app/                 Routes (App Router)
  components/
    layout/            Header, footer, logo
    ui/                Buttons, headings, placeholders, icons
  lib/                 Site config and utilities
```

## Placeholder content

Brand colors, fonts, logo, contact details, and all copy are **placeholders** until the client delivers brand assets and content (Jira SUMMIT-228). Design tokens live in `src/app/globals.css` (`@theme`) and site-wide details live in `src/lib/site.ts`.

## Preview deployment (for client review)

Deploy to [Vercel](https://vercel.com) (free Hobby plan works):

1. **Add New → Project**, import `ryankolean/pamar`, keep the detected Next.js settings.
2. **Environment variables:** `SITE_MODE=preview` and `PREVIEW_PASSWORD=<something to share>`.
3. Deploy the preview branch. Share the URL and the password; any username works.

Preview mode shows a banner, keeps the site out of search engines, and accepts form submissions
without sending anything. See [`docs/BACKEND.md`](docs/BACKEND.md) for where the backend attaches.
