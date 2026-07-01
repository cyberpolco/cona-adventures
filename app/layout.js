import '../styles/globals.css';
import Providers from '../components/Providers';
import { SITE_URL } from '../lib/siteUrl';

const SITE_NAME   = 'CoNa Adventures';
const DEFAULT_DESC = 'Guided expeditions through the rainforests of DR Congo and the dunes of Namibia. Africa awaits.';

export const metadata = {
  // Resolves relative og:url / og:image paths against the canonical origin.
  // On Vercel: NEXTAUTH_URL (prod) → VERCEL_URL (preview) → hardcoded fallback.
  metadataBase: new URL(SITE_URL),

  title: {
    template: `%s — ${SITE_NAME}`,
    default:  SITE_NAME,
  },
  description: DEFAULT_DESC,

  openGraph: {
    title: {
      template: `%s — ${SITE_NAME}`,
      default:  SITE_NAME,
    },
    description: DEFAULT_DESC,
    siteName:    SITE_NAME,
    type:        'website',
    locale:      'en_US',
    // og:image auto-populated from app/opengraph-image.js
  },

  // Do NOT split twitter across pages — a partial twitter object on a child
  // page replaces the root object entirely, losing card:'summary_large_image'.
  // Keep the full twitter config here; pages only override title/description
  // via the title template and openGraph.description.
  twitter: {
    card:        'summary_large_image',
    title: {
      template: `%s — ${SITE_NAME}`,
      default:  SITE_NAME,
    },
    description: DEFAULT_DESC,
    // twitter:image auto-populated from app/opengraph-image.js
  },

  robots: {
    index:  true,
    follow: true,
  },
};

export const viewport = {
  themeColor: '#0e1a12',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Archivo:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
