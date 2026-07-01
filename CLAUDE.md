# CLAUDE.md — CoNa Adventures

Project memory for Claude Code. Read this first in every session.

## What this is
A booking + operations platform for expedition tourism in **DR Congo and Namibia** — aiming to be the first integrated platform of its kind for the DRC. **Next.js 14 (Pages Router) + React 18.** Deployed on Vercel. Repo owner: `cyberpolco`.

## Working agreement
- **Security is non-negotiable** — see Guardrails below. Don't undo these to make a feature simpler.
- Verify before claiming done: run `npm run build`; for anything runtime-sensitive, actually run it.
- Prose in docs over heavy bullet-formatting; minimal, focused changes; explain *where* edits go.
- Commit in logical chunks with clear messages; never commit secrets or `.env.local`.

## Current state (built across phases — apply/verify these, then continue)
The work lives in three folders that mirror the repo structure (`p0-1-auth/`, `p0-2-payments/`, `p2-database/`). Overlay their files onto the repo at the same paths, then run the setup below.

**P0.1 — Real auth + RBAC + protected dashboard** ✅ verified (build + runtime)
- NextAuth (Auth.js v4) credentials; passwords hashed (bcrypt); roles assigned **server-side**.
- `/dashboard` is guarded by `getServerSideProps` **and** `middleware.js`. All four staff roles (Admin/Ops/Guide/Driver) can enter; each gets a role-appropriate view. Anon→307. Admin/Ops see booking data; Guide/Driver see their own tour/trip lists.
- Logout in `Nav.js` (public pages) and `DashboardPage.js` (dashboard). `/dashboard` sets `Cache-Control: no-store`.

**P0.2 — Payments (Flutterwave Standard / hosted checkout)** ✅ verified except a live charge
- No card data is ever collected in-app (PCI SAQ A). Price is **recomputed server-side** in `/api/checkout` (client price is ignored — tested).
- Flow: `/api/checkout` → hosted link → `/payment/callback` → `/api/payments/verify` (re-verifies server-side) → `/api/webhooks/flutterwave` (authoritative; `verif-hash` checked — tested 401/200).

**Phase 2a — Database (Prisma + PostgreSQL / SQLite local)** ✅ fully verified (build + runtime, 2026-07-01)
- Pinned to **Prisma 5.22.0** — last version supporting Node 18. Do NOT upgrade to 6+ without upgrading Node first.
- `prisma/dev.db` (SQLite) exists with migration `20260630153215_init` applied. All 4 seed accounts present.
- Auth reads users from DB; checkout persists a Booking before the gateway call (gracefully continues if DB fails); `markBookingPaid` is idempotent; `/api/bookings` is admin/ops-only (403 for guides).
- Models: User, Booking, Traveler, Payment, GallerySubmission, GuideRating.

## Setup (run these first)
```bash
npm install
# .env.local — see Environment below
node_modules/.bin/prisma migrate dev --name init   # use local binary — npx may pull v7+ which needs Node 20
node prisma/seed.js                                 # seeds staff accounts (pw: ChangeMe!2026)
npm run dev
```
**Node version note:** The repo requires Node 18-compatible packages. Prisma is pinned to 5.22.0. If `npx prisma` pulls v7+, use `node_modules/.bin/prisma` directly.
Seed logins: `admin@cona.com` (Super Admin), `ops@cona.com` (Ops), `guide@cona.com` (Guide), `driver@cona.com` (Driver) — all `ChangeMe!2026`. **Change before production.**

## Environment variables
| Var | Purpose |
|---|---|
| `NEXTAUTH_SECRET` | sign sessions (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | site URL (prod = live domain) |
| `DATABASE_URL` | Postgres (Supabase/Neon) connection string |
| `FLW_SECRET_KEY` | Flutterwave secret (TEST keys for staging) |
| `FLW_WEBHOOK_HASH` | must match the secret hash set in the Flutterwave dashboard |
| `PAYMENT_CURRENCY` | `USD` (cards). Local mobile money needs the local currency. |
| `RESEND_API_KEY` | Resend API key — omit locally to use console-log fallback |
| `EMAIL_FROM` | Sender address, e.g. `CoNa Adventures <noreply@conaadventures.com>` |

On Vercel: set all of the above in Settings → Environment Variables. `package.json` runs `prisma generate` in `postinstall` + `build` (don't remove — Prisma deploys fail without it).

## Guardrails (do NOT regress)
1. Never collect raw card data in the app — always the gateway's hosted page.
2. Never trust a client-supplied price or role — recompute price server-side; roles come from the DB/session.
3. Protect `/dashboard` and admin APIs **server-side** (session + role), never by hiding UI.
4. Webhooks verify the `verif-hash` before acting; payment confirmation is idempotent.
5. Passport/minor PII: store files in encrypted object storage, keep only a reference in the DB; capture consent; define retention.

## Backlog (priority order)
**Finish current:** apply the three folders, run migrations + seed, deploy, then end-to-end test the booking→payment→dashboard flow with Flutterwave TEST keys.
1. ~~**Phase 2b — email**~~ ✅ Done (2026-07-01) — Resend; dev console-log fallback; sends once on first paid transition; idempotent. Set `RESEND_API_KEY` + `EMAIL_FROM` in env to go live. Still needed before prod: verified sending domain + SPF/DKIM/DMARC records.
2. Migrate **gallery submissions** and **guide ratings** off in-memory arrays to the existing tables.
3. **P1 routing/SEO (high value):** move from the SPA-in-Next pattern to real routes (App Router), per-page metadata + OG tags, `sitemap.xml`, `robots.txt`, JSON-LD travel schema, `hreflang` for EN/FR.
4. **P1 mobile nav**: add a hamburger menu (nav links are hidden ≤640px with no replacement).
5. **P2:** consistent accessibility (real `<button>`s, `aria-label` on meaningful emoji, skip link), migrate to TypeScript (types already installed), consolidate inline styles, self-host fonts (`next/font`) + map TopoJSON, add tests/CI.

See the per-phase guides (`*-GUIDE.md`) in each folder for details and the original `PHASE-1-AUDIT.md` for the full reasoning.

## Suggested first prompt to Claude Code
> Read CLAUDE.md. Apply the files from the three phase folders if not already present, then install deps, generate the Prisma client, run the migration and seed, start the dev server, and verify: (a) login as admin reaches /dashboard but guide does not, (b) a booking persists and shows in the dashboard. Fix anything broken, then commit in logical chunks. Don't violate the Guardrails.
