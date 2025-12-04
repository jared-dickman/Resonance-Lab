'use client';

import dynamic from 'next/dynamic';
import { RandomLoader } from '@/components/ui/loaders/RandomLoader';

const PedalboardClient = dynamic(() => import('./PedalboardClient'), {
  ssr: false,
  loading: () => <RandomLoader />,
});

export default function PedalboardPage() {
  return <PedalboardClient />;
}
