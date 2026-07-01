'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { translations } from '../lib/translations';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Derive lang from the URL [lang] segment; fall back to 'en' for pages
  // outside the [lang] subtree (dashboard, payment/callback).
  const params = useParams();
  const lang = (params?.lang === 'fr') ? 'fr' : 'en';

  const [loginOpen, setLoginOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const t = useCallback((key) => translations[lang]?.[key] ?? translations.en[key] ?? key, [lang]);

  const openLogin  = useCallback(() => setLoginOpen(true), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);

  const showToast = useCallback((msg) => {
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

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
