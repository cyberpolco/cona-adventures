// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Archivo:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="description" content="CoNa Adventures — Guided expeditions through the rainforests of DR Congo and the dunes of Namibia." />
        <meta name="theme-color" content="#0e1a12" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
