# FF TRUST

Independent account-trust marketplace for Free Fire accounts, panel & services
listings, paid push packages and Instagram views/followers/likes — built around
transparency, buyer proof and buyer safety. Not affiliated with Garena or Free Fire.

## Stack

- Next.js (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui-style components
- Static data architecture (single source of truth + selectors)
- Prisma (dev database only; the site runs on static data)

## Local development

```bash
bun install        # or: npm install
bun run dev        # starts on http://localhost:1111
```

The development server MUST stay on port **1111** (`next dev -p 1111`).

## Environment variables

Copy `.env.example` to `.env.local` for local overrides. Never commit real secrets.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical production URL (Netlify). Drives Open Graph image, canonical links, sitemap, robots and structured data. Unset locally → `http://localhost:1111` is used. Set on Netlify to the real deployed domain. |
| `DATABASE_URL` | Local dev database only. Never set to a remote secret in the repo. |

## Netlify

- Build command: `npm run build` (Next `output: "standalone"`)
- Set `NEXT_PUBLIC_SITE_URL` to the real production domain in Netlify env vars.
- The production OG image automatically resolves to `${NEXT_PUBLIC_SITE_URL}/fftrust.png`.
- Do not hardcode localhost or a temporary domain into production metadata.

## Tests

```bash
npx tsc --noEmit
node tests/p13-data-integrity.ts   # static checks (tsx)
node tests/*.js                    # browser suites (dev server on :1111)
```
