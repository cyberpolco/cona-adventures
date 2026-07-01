import { SITE_URL } from '../lib/siteUrl';

export default function sitemap() {
  return [
    { url: `${SITE_URL}/`,        lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE_URL}/plan`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/gallery`, lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.7 },
  ];
}
