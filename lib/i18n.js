import { SITE_URL } from './siteUrl';

export const LOCALES         = ['en', 'fr'];
export const DEFAULT_LOCALE  = 'en';

// Returns Next.js alternates metadata for a given page path (e.g. '/gallery').
// Generates hreflang links for both locales + x-default pointing to English.
export function pageAlternates(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return {
    canonical: `${SITE_URL}/en${p}`,
    languages: Object.fromEntries([
      ...LOCALES.map(l => [l, `${SITE_URL}/${l}${p}`]),
      ['x-default', `${SITE_URL}/en${p}`],
    ]),
  };
}
