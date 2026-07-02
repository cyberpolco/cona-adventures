/** @type {import('next').NextConfig} */

// Content-Security-Policy notes:
// - script-src: 'unsafe-inline' required by Next.js Pages Router hydration inline scripts.
//   Upgrade path: per-request nonce in _document.js + middleware, then drop unsafe-inline.
// - style-src: 'unsafe-inline' required by inline style props used throughout.
// - Google Fonts entries: remove once next/font (self-hosted) is adopted (backlog item).
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join('; ');

const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection',          value: '1; mode=block' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  // HSTS: 1 year. Add `; preload` and bump to 2yr once the domain is stable on HTTPS.
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'Content-Security-Policy',   value: CSP },
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    // Serves AVIF first, falls back to WebP, then original — protects LCP once
    // real photography replaces the emoji placeholders. No remotePatterns yet
    // since there are no external image hosts in use.
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

module.exports = nextConfig;
