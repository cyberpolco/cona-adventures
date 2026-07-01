import Nav             from '../../../components/Nav';
import Footer          from '../../../components/Footer';
import LoginModal      from '../../../components/LoginModal';
import Toast           from '../../../components/Toast';
import TripPlannerPage from '../../../components/pages/TripPlannerPage';
import { pageAlternates } from '../../../lib/i18n';

const DESCS  = {
  en: 'Build your bespoke expedition itinerary for DR Congo or Namibia — gorilla treks, desert safaris, river expeditions and more.',
  fr: 'Créez votre itinéraire d\'expédition sur mesure au Congo ou en Namibie — safaris, treks, expéditions fluviales et plus.',
};
const TITLES = { en: 'Plan Your Adventure', fr: 'Planifier votre Aventure' };

export async function generateMetadata({ params }) {
  const { lang } = params;
  return {
    title:       TITLES[lang] ?? TITLES.en,
    description: DESCS[lang]  ?? DESCS.en,
    openGraph:   { description: DESCS[lang] ?? DESCS.en, url: `/plan` },
    alternates:  pageAlternates('/plan'),
  };
}

export default function Plan() {
  return (
    <>
      <Nav />
      <TripPlannerPage />
      <Footer />
      <LoginModal />
      <Toast />
    </>
  );
}
