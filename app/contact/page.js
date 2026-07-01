import Nav         from '../../components/Nav';
import Footer      from '../../components/Footer';
import LoginModal  from '../../components/LoginModal';
import Toast       from '../../components/Toast';
import ContactPage from '../../components/pages/ContactPage';

export const metadata = {
  title:       'Contact — CoNa Adventures',
  description: 'Get in touch with CoNa Adventures to plan your expedition to DR Congo or Namibia.',
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
