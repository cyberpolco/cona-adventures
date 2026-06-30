// pages/index.js
// Public SPA shell. Staff who are already authenticated are redirected
// server-side to /dashboard so they never see the public homepage after login.
import Head from 'next/head';
import Nav           from '../components/Nav';
import Footer        from '../components/Footer';
import LoginModal    from '../components/LoginModal';
import Toast         from '../components/Toast';
import { useApp }    from '../context/AppContext';

import HomePage        from '../components/pages/HomePage';
import GalleryPage     from '../components/pages/GalleryPage';
import ContactPage     from '../components/pages/ContactPage';
import TripPlannerPage from '../components/pages/TripPlannerPage';
import ItineraryPage   from '../components/pages/ItineraryPage';
import PaymentPage     from '../components/pages/PaymentPage';
import SuccessPage     from '../components/pages/SuccessPage';

import { getServerSession } from 'next-auth/next';
import { authOptions }      from './api/auth/[...nextauth]';

const STAFF_ROLES = ['Super Admin', 'Operations Manager', 'Tour Guide', 'Driver'];

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
  const { page } = useApp();
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

export async function getServerSideProps(ctx) {
  try {
    const session = await getServerSession(ctx.req, ctx.res, authOptions);
    if (session && STAFF_ROLES.includes(session.user?.role)) {
      return { redirect: { destination: '/dashboard', permanent: false } };
    }
  } catch (_) {
    // If session check errors (e.g. during cold start), fall through to homepage
  }
  return { props: {} };
}
