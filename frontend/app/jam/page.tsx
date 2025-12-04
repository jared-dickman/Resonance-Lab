'use client';

import dynamic from 'next/dynamic';
import { RandomLoader } from '@/components/ui/loaders/RandomLoader';

const JamAssistantClient = dynamic(() => import('@/components/JamAssistantClient'), {
  ssr: false,
  loading: () => <RandomLoader />,
});

export default function JamPage() {
  return <JamAssistantClient />;
}
