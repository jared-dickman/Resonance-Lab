import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Resonance Lab',
    short_name: 'Resonance',
    description: 'Your musical laboratory for creation and discovery',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0f',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
