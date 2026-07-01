import Nav         from '../../../../components/Nav';
import Footer      from '../../../../components/Footer';
import Toast       from '../../../../components/Toast';
import SuccessPage from '../../../../components/pages/SuccessPage';

export const metadata = {
  title:  'Booking Confirmed',
  robots: { index: false, follow: false },
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
