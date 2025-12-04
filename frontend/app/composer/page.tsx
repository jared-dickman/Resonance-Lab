/**
 * Intelligent Composer Demo Page
 * Showcases the composable music intelligence system
 */

'use client';

import dynamic from 'next/dynamic';
import { RandomLoader } from '@/components/ui/loaders/RandomLoader';

const IntelligentComposer = dynamic(() => import('@/components/IntelligentComposer'), {
  ssr: false,
  loading: () => <RandomLoader />,
});

export default function ComposerPage() {
  return <IntelligentComposer />;
}
