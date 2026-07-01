'use client';
import { SessionProvider } from 'next-auth/react';
import { AppProvider } from '../context/AppContext';

export default function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      <AppProvider>{children}</AppProvider>
    </SessionProvider>
  );
}
