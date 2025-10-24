import type { Metadata } from 'next';
import JamAssistantClient from '@/components/JamAssistantClient';

export const metadata: Metadata = {
  title: 'Jam Assistant | Resonance Lab',
  description:
    'Get chord progression recommendations, build jam sessions, and practice with adaptive difficulty',
};

export default function JamPage() {
  return <JamAssistantClient />;
}
