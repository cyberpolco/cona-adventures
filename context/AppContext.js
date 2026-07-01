'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import { translations } from '../lib/translations';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lang, setLangState] = useState('en');
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
      lang, setLang: setLangState, t,
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
