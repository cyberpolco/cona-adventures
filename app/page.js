import Nav      from '../components/Nav';
import Footer   from '../components/Footer';
import LoginModal from '../components/LoginModal';
import Toast    from '../components/Toast';
import HomePage from '../components/pages/HomePage';

export const metadata = {
  title:       'CoNa Adventures — Congo & Namibia Expeditions',
  description: 'Guided expeditions through the rainforests of DR Congo and the dunes of Namibia. Book your adventure.',
};

export default function Home() {
  return (
    <>
      <Nav />
      <HomePage />
      <Footer />
      <LoginModal />
      <Toast />
    </>
  );
}
