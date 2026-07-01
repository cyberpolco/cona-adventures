import Nav         from '../../../components/Nav';
import Footer      from '../../../components/Footer';
import LoginModal  from '../../../components/LoginModal';
import Toast       from '../../../components/Toast';
import GalleryPage from '../../../components/pages/GalleryPage';
import { pageAlternates } from '../../../lib/i18n';

const DESCS = {
  en: 'Photos and stories from CoNa Adventures expeditions in DR Congo and Namibia.',
  fr: 'Photos et récits des expéditions CoNa Adventures au Congo et en Namibie.',
};
const TITLES = { en: 'Gallery', fr: 'Galerie' };

export async function generateMetadata({ params }) {
  const { lang } = params;
  return {
    title:       TITLES[lang] ?? TITLES.en,
    description: DESCS[lang]  ?? DESCS.en,
    openGraph:   { description: DESCS[lang] ?? DESCS.en, url: `/gallery` },
    alternates:  pageAlternates('/gallery'),
  };
}

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
