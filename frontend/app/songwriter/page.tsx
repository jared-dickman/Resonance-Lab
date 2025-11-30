import type { Metadata } from 'next';
import SongwriterClient from '@/components/songwriter/SongwriterClient';
import { APP_NAME } from '@/app/config/app';

export const metadata: Metadata = {
  title: `Songwriter Assistant | ${APP_NAME}`,
  description: 'AI-powered songwriting assistant for crafting lyrics, chords, and structure',
};

export default function SongwriterPage() {
  return <SongwriterClient />;
}
