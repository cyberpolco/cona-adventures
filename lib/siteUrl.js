// lib/siteUrl.js — canonical base URL, Vercel-aware.
// Priority: NEXTAUTH_URL (explicit canonical) → VERCEL_URL (auto-set on every Vercel deployment,
// including previews) → local fallback.
// VERCEL_URL does NOT include a protocol; NEXTAUTH_URL does.
export const SITE_URL =
  process.env.NEXTAUTH_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  'https://conaadventures.com';
