import type { Metadata } from 'next';
import Nav         from '../../../components/Nav';
import Footer      from '../../../components/Footer';
import LoginModal  from '../../../components/LoginModal';
import Toast       from '../../../components/Toast';
import ContactPage from '../../../components/pages/ContactPage';
import { pageAlternates } from '../../../lib/i18n';

const DESCS: Record<string, string>   = {
  en: 'Get in touch with CoNa Adventures to plan your bespoke expedition to DR Congo or Namibia.',
  fr: 'Contactez CoNa Adventures pour planifier votre expédition sur mesure au Congo ou en Namibie.',
};
const TITLES: Record<string, string>  = { en: 'Contact', fr: 'Contact' };

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const { lang } = params;
  return {
    title:       TITLES[lang] ?? TITLES.en,
    description: DESCS[lang]  ?? DESCS.en,
    openGraph:   { description: DESCS[lang] ?? DESCS.en, url: `/contact` },
    alternates:  pageAlternates('/contact'),
  };
}

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
