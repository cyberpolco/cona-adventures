// pages/index.js — public SPA shell
// Staff who are already authenticated are sent to /dashboard client-side.
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter }  from 'next/router';
import Head from 'next/head';

import Nav             from '../components/Nav';
import Footer          from '../components/Footer';
import LoginModal      from '../components/LoginModal';
import Toast           from '../components/Toast';
import { useApp }      from '../context/AppContext';

import HomePage        from '../components/pages/HomePage';
import GalleryPage     from '../components/pages/GalleryPage';
import ContactPage     from '../components/pages/ContactPage';
import TripPlannerPage from '../components/pages/TripPlannerPage';
import ItineraryPage   from '../components/pages/ItineraryPage';
import PaymentPage     from '../components/pages/PaymentPage';
import SuccessPage     from '../components/pages/SuccessPage';

const STAFF = ['Super Admin', 'Operations Manager', 'Tour Guide', 'Driver'];

const PAGE_MAP = {
  home:      HomePage,
  gallery:   GalleryPage,
  contact:   ContactPage,
  planner:   TripPlannerPage,
  itinerary: ItineraryPage,
  payment:   PaymentPage,
  success:   SuccessPage,
};

export default function App() {
  const { page }            = useApp();
  const { data: session, status } = useSession();
  const router              = useRouter();

  // If a logged-in staff member somehow lands on the public site, send them
  // straight to their dashboard. (LoginModal already does router.push on
  // sign-in; this covers the back-button / direct-URL / session-refresh case.)
  useEffect(() => {
    if (status === 'authenticated' && STAFF.includes(session?.user?.role)) {
      router.replace('/dashboard');
    }
  }, [status, session, router]);

  const ActivePage = PAGE_MAP[page] ?? HomePage;

  return (
    <>
      <Head>
        <title>CoNa Adventures</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Nav />
      <ActivePage />
      <Footer />
      <LoginModal />
      <Toast />
    </>
  );
}
