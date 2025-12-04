'use client';

import dynamic from 'next/dynamic';
import { RandomLoader } from '@/components/ui/loaders/RandomLoader';

const SongwriterClient = dynamic(() => import('@/components/songwriter/SongwriterClient'), {
  ssr: false,
  loading: () => <RandomLoader />,
});

export default function SongwriterPage() {
  return <SongwriterClient />;
}
