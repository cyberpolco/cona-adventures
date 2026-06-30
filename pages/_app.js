// pages/_app.js
import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import { AppProvider } from '../context/AppContext';

export default function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <AppProvider>
        <Component {...pageProps} />
      </AppProvider>
    </SessionProvider>
  );
}
