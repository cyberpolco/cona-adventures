import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Cinzel, Archivo } from 'next/font/google';
import '../styles/globals.css';
import { SITE_URL } from '../lib/siteUrl';

// Self-hosted via next/font — no Google Fonts CDN request, no render-blocking
// <link>, no font-swap layout shift (next/font inlines a matched fallback).
const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  variable: '--font-cinzel',
  display: 'swap',
});
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-archivo',
  display: 'swap',
});

// Minimal root layout — just the HTML shell and fonts.
// All page-level metadata lives in app/[lang]/layout.tsx.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
};

export const viewport: Viewport = {
  themeColor: '#0e1a12',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${archivo.variable}`}>
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
