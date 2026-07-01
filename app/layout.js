import '../styles/globals.css';
import Providers from '../components/Providers';

export const metadata = {
  title:       'CoNa Adventures',
  description: 'CoNa Adventures — Guided expeditions through the rainforests of DR Congo and the dunes of Namibia.',
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
