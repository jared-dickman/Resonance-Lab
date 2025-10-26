'use client';

import dynamic from 'next/dynamic';

const PedalboardClient = dynamic(() => import('./PedalboardClient'), {
  ssr: false,
});

export default function PedalboardPage() {
  return <PedalboardClient />;
}
