import Nav         from '../../../components/Nav';
import Footer      from '../../../components/Footer';
import Toast       from '../../../components/Toast';
import SuccessPage from '../../../components/pages/SuccessPage';

export const metadata = {
  title:       'Booking Confirmed — CoNa Adventures',
  description: 'Your CoNa Adventures expedition has been booked. Get ready for your adventure.',
};

export default function Success() {
  return (
    <>
      <Nav />
      <SuccessPage />
      <Footer />
      <Toast />
    </>
  );
}
