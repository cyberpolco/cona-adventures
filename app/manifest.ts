import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CoNa Adventures',
    short_name: 'CoNa',
    description: 'Guided expeditions through the rainforests of DR Congo and the dunes of Namibia.',
    start_url: '/en',
    display: 'standalone',
    background_color: '#0e1a12',
    theme_color: '#0e1a12',
    icons: [
      { src: '/icon', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
