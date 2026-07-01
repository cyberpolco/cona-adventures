import Nav         from '../../../../components/Nav';
import Footer      from '../../../../components/Footer';
import LoginModal  from '../../../../components/LoginModal';
import Toast       from '../../../../components/Toast';
import PaymentPage from '../../../../components/pages/PaymentPage';

export const metadata = {
  title:  'Complete Your Booking',
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
