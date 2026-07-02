'use client';
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { translations } from '../lib/translations';

export type Lang = 'en' | 'fr';

export interface AppContextValue {
  lang: Lang;
  t: (key: string) => string;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  toast: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // Derive lang from the URL [lang] segment; fall back to 'en' for pages
  // outside the [lang] subtree (dashboard, payment/callback).
  const params = useParams<{ lang?: string }>();
  const lang: Lang = (params?.lang === 'fr') ? 'fr' : 'en';

  const [loginOpen, setLoginOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const t = useCallback((key: string) => translations[lang]?.[key] ?? translations.en[key] ?? key, [lang]);

  const openLogin  = useCallback(() => setLoginOpen(true), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3800);
  }, []);

  return (
    <AppContext.Provider value={{
      lang, t,
      loginOpen, openLogin, closeLogin,
      toast, showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
