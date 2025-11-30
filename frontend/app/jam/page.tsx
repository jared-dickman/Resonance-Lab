import type { Metadata } from 'next';
import JamAssistantClient from '@/components/JamAssistantClient';
import { APP_NAME } from '@/app/config/app';

export const metadata: Metadata = {
  title: `Jam Assistant | ${APP_NAME}`,
  description:
    'Get chord progression recommendations, build jam sessions, and practice with adaptive difficulty',
};

export default function JamPage() {
  return <JamAssistantClient />;
}
