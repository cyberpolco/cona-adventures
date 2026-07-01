import Nav         from '../../components/Nav';
import Footer      from '../../components/Footer';
import LoginModal  from '../../components/LoginModal';
import Toast       from '../../components/Toast';
import GalleryPage from '../../components/pages/GalleryPage';

export const metadata = {
  title:       'Gallery — CoNa Adventures',
  description: 'Photos and stories from CoNa Adventures expeditions in DR Congo and Namibia.',
};

export default function Gallery() {
  return (
    <>
      <Nav />
      <GalleryPage />
      <Footer />
      <LoginModal />
      <Toast />
    </>
  );
}
