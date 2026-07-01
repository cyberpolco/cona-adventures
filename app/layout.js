import '../styles/globals.css';
import { SITE_URL } from '../lib/siteUrl';

// Minimal root layout — just the HTML shell and fonts.
// All page-level metadata lives in app/[lang]/layout.js.
export const metadata = {
  metadataBase: new URL(SITE_URL),
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
        {children}
      </body>
    </html>
  );
}
