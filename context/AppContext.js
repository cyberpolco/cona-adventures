// context/AppContext.js
import { createContext, useContext, useState, useCallback } from 'react';
import { translations } from '../lib/translations';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lang, setLangState] = useState('en');
  const [page, setPage] = useState('home'); // home | gallery | contact | planner | itinerary | payment | success | dashboard
  const [loginOpen, setLoginOpen] = useState(false);
  const [tripData, setTripData] = useState(null);   // built by planner
  const [toast, setToast] = useState(null);

  // Booking state lifted here so planner → itinerary → payment → success can share it
  const [booking, setBooking] = useState(null);

  const t = useCallback((key) => translations[lang]?.[key] ?? translations.en[key] ?? key, [lang]);

  const showPage = useCallback((p) => setPage(p), []);
  const openLogin = useCallback(() => setLoginOpen(true), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3800);
  }, []);

  return (
    <AppContext.Provider value={{
      lang, setLang: setLangState, t,
      page, showPage,
      loginOpen, openLogin, closeLogin,
      tripData, setTripData,
      booking, setBooking,
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
