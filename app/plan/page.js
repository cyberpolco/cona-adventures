import Nav             from '../../components/Nav';
import Footer          from '../../components/Footer';
import LoginModal      from '../../components/LoginModal';
import Toast           from '../../components/Toast';
import TripPlannerPage from '../../components/pages/TripPlannerPage';

const DESC = 'Build your bespoke expedition itinerary for DR Congo or Namibia — gorilla treks, desert safaris, river expeditions and more.';

export const metadata = {
  title:       'Plan Your Adventure',
  description: DESC,
  openGraph: { description: DESC, url: '/plan' },
};

export default function Plan() {
  return (
    <>
      <Nav />
      <TripPlannerPage />
      <Footer />
      <LoginModal />
      <Toast />
    </>
  );
}
