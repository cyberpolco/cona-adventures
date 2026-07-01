// middleware.js — i18n redirect + dashboard auth guard, combined.
//
// Flow:
//  1. /dashboard paths → NextAuth token check (existing guard).
//  2. Paths that already start with /en or /fr → pass through.
//  3. All other public paths → detect Accept-Language, redirect to /{lang}/path.
//
// Excluded from processing: /api/*, /_next/*, static assets, /payment/*, /opengraph-image.
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const STAFF_ROLES = ['Super Admin', 'Operations Manager', 'Tour Guide', 'Driver'];
const LOCALES     = ['en', 'fr'];

function detectLocale(req) {
  const accept = req.headers.get('accept-language') || '';
  return accept.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    // Skip — already has a locale prefix or is a system path.
    const hasLocale = LOCALES.some(l => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
    if (hasLocale || pathname.startsWith('/dashboard')) return NextResponse.next();

    // Redirect bare public paths to the locale-prefixed equivalent.
    const locale = detectLocale(req);
    const url    = req.nextUrl.clone();
    url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url); // preserves query string
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Only enforce auth on /dashboard — all other paths are public.
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return STAFF_ROLES.includes(token?.role);
        }
        return true;
      },
    },
    pages: { signIn: '/' },
  }
);

// Run on all paths except: API routes, Next.js internals, static files,
// Flutterwave callback, OG image, sitemap, robots, favicon.
export const config = {
  matcher: ['/((?!api|_next|opengraph-image|sitemap|robots|favicon\\.ico|payment).*)'],
};
