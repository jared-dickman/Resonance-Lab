'use client';

import dynamic from 'next/dynamic';
import { RandomLoader } from '@/components/ui/loaders/RandomLoader';

const MusicTheoryClient = dynamic(() => import('./MusicTheoryClient'), {
  ssr: false,
  loading: () => <RandomLoader />,
});

export default function MusicTheoryPage() {
  return <MusicTheoryClient />;
}
