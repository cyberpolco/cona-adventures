import Nav         from '../../components/Nav';
import Footer      from '../../components/Footer';
import LoginModal  from '../../components/LoginModal';
import Toast       from '../../components/Toast';
import ContactPage from '../../components/pages/ContactPage';

const DESC = 'Get in touch with CoNa Adventures to plan your bespoke expedition to DR Congo or Namibia.';

export const metadata = {
  title:       'Contact',
  description: DESC,
  openGraph: { description: DESC, url: '/contact' },
};

export default function Contact() {
  return (
    <>
      <Nav />
      <ContactPage />
      <Footer />
      <LoginModal />
      <Toast />
    </>
  );
}
