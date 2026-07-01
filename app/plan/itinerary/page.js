import Nav           from '../../../components/Nav';
import Footer        from '../../../components/Footer';
import LoginModal    from '../../../components/LoginModal';
import Toast         from '../../../components/Toast';
import ItineraryPage from '../../../components/pages/ItineraryPage';

export const metadata = {
  title:       'Your Itinerary — CoNa Adventures',
  description: 'Review your custom CoNa Adventures expedition itinerary before booking.',
};

export default function Itinerary() {
  return (
    <>
      <Nav />
      <ItineraryPage />
      <Footer />
      <LoginModal />
      <Toast />
    </>
  );
}
