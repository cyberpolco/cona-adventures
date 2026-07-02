import type { Metadata } from 'next';
import Nav       from '../../components/Nav';
import Footer    from '../../components/Footer';
import LoginModal from '../../components/LoginModal';
import Toast     from '../../components/Toast';
import HomePage  from '../../components/pages/HomePage';
import { pageAlternates } from '../../lib/i18n';
import { SITE_URL } from '../../lib/siteUrl';

const TITLES: Record<string, string> = {
  en: 'CoNa Adventures — Congo & Namibia Expeditions',
  fr: 'CoNa Adventures — Expéditions Congo & Namibie',
};
const DESCS: Record<string, string> = {
  en: 'Guided expeditions through the rainforests of DR Congo and the dunes of Namibia. Book your adventure today.',
  fr: 'Expéditions guidées à travers les forêts du Congo et les dunes de Namibie. Réservez votre aventure.',
};

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const { lang } = params;
  const title = TITLES[lang] ?? TITLES.en;
  const desc  = DESCS[lang]  ?? DESCS.en;
  return {
    title:     { absolute: title },
    description: desc,
    openGraph: { title, description: desc, url: `${SITE_URL}/${lang}` },
    alternates: pageAlternates('/'),
  };
}

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
