import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/siteUrl';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow:     ['/', '/gallery', '/contact', '/plan'],
        disallow:  ['/dashboard', '/api/', '/plan/itinerary', '/plan/payment', '/plan/success', '/payment/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
