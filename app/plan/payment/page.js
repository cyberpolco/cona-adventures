import Nav         from '../../../components/Nav';
import Footer      from '../../../components/Footer';
import LoginModal  from '../../../components/LoginModal';
import Toast       from '../../../components/Toast';
import PaymentPage from '../../../components/pages/PaymentPage';

export const metadata = {
  title:       'Complete Your Booking',
  description: 'Secure your CoNa Adventures expedition with a full payment or 40% deposit.',
  robots: { index: false, follow: false },
};

export default function Payment() {
  return (
    <>
      <Nav />
      <PaymentPage />
      <Footer />
      <LoginModal />
      <Toast />
    </>
  );
}
