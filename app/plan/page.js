import Nav             from '../../components/Nav';
import Footer          from '../../components/Footer';
import LoginModal      from '../../components/LoginModal';
import Toast           from '../../components/Toast';
import TripPlannerPage from '../../components/pages/TripPlannerPage';

export const metadata = {
  title:       'Plan Your Adventure — CoNa Adventures',
  description: 'Build your bespoke expedition itinerary for DR Congo or Namibia.',
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
