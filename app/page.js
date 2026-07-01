import Nav      from '../components/Nav';
import Footer   from '../components/Footer';
import LoginModal from '../components/LoginModal';
import Toast    from '../components/Toast';
import HomePage from '../components/pages/HomePage';

const TITLE = 'CoNa Adventures — Congo & Namibia Expeditions';
const DESC  = 'Guided expeditions through the rainforests of DR Congo and the dunes of Namibia. Book your adventure today.';

export const metadata = {
  title:       { absolute: TITLE }, // bypass the template on the home page
  description: DESC,
  openGraph:   { title: TITLE, description: DESC, url: '/' },
  // No twitter override — root layout's summary_large_image card stays intact.
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
