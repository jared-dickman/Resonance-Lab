import type { MetadataRoute } from 'next';
import { APP_NAME } from '@/app/config/app';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_NAME,
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
