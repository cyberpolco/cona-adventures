import Providers from '../../components/Providers';
import { LOCALES } from '../../lib/i18n';
import { SITE_URL } from '../../lib/siteUrl';

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

const SITE_NAME = 'CoNa Adventures';

const DESCS = {
  en: 'Guided expeditions through the rainforests of DR Congo and the dunes of Namibia. Africa awaits.',
  fr: "Expéditions guidées à travers les forêts du Congo et les dunes de Namibie. L'Afrique vous attend.",
};

export async function generateMetadata({ params }) {
  const { lang } = params;
  const isFr = lang === 'fr';
  const desc = DESCS[lang] ?? DESCS.en;

  return {
    title: {
      template: `%s — ${SITE_NAME}`,
      default:  SITE_NAME,
    },
    description: desc,
    openGraph: {
      title: {
        template: `%s — ${SITE_NAME}`,
        default:  SITE_NAME,
      },
      description: desc,
      siteName: SITE_NAME,
      type:     'website',
      locale:   isFr ? 'fr_FR' : 'en_US',
    },
    twitter: {
      card:  'summary_large_image',
      title: {
        template: `%s — ${SITE_NAME}`,
        default:  SITE_NAME,
      },
      description: desc,
    },
    alternates: {
      canonical: `${SITE_URL}/${lang}`,
      languages: {
        en:          `${SITE_URL}/en`,
        fr:          `${SITE_URL}/fr`,
        'x-default': `${SITE_URL}/en`,
      },
    },
  };
}

export default function LangLayout({ children, params }) {
  return <Providers>{children}</Providers>;
}
