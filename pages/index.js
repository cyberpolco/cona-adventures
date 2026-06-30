// pages/index.js
// Single-page application shell. All "pages" are React components
// mounted based on AppContext `page` state, preserving the original SPA behaviour.

import Head from 'next/head';
import Nav          from '../components/Nav';
import Footer       from '../components/Footer';
import LoginModal   from '../components/LoginModal';
import Toast        from '../components/Toast';
import { useApp }   from '../context/AppContext';

import HomePage       from '../components/pages/HomePage';
import GalleryPage    from '../components/pages/GalleryPage';
import ContactPage    from '../components/pages/ContactPage';
import TripPlannerPage from '../components/pages/TripPlannerPage';
import ItineraryPage  from '../components/pages/ItineraryPage';
import PaymentPage    from '../components/pages/PaymentPage';
import SuccessPage    from '../components/pages/SuccessPage';

const PAGE_MAP = {
  home:       HomePage,
  gallery:    GalleryPage,
  contact:    ContactPage,
  planner:    TripPlannerPage,
  itinerary:  ItineraryPage,
  payment:    PaymentPage,
  success:    SuccessPage,
};

export default function App() {
  const { page } = useApp();

  const ActivePage = PAGE_MAP[page] ?? HomePage;
  const showFooter = true;

  return (
    <>
      <Head>
        <title>CoNa Adventures</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Nav />
      <ActivePage />
      {showFooter && <Footer />}
      <LoginModal />
      <Toast />
    </>
  );
}
