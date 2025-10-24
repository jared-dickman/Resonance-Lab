import type { Metadata } from 'next';
import SongwriterClient from '@/components/songwriter/SongwriterClient';

export const metadata: Metadata = {
  title: 'Songwriter Assistant | Resonance Lab',
  description: 'AI-powered songwriting assistant for crafting lyrics, chords, and structure',
};

export default function SongwriterPage() {
  return <SongwriterClient />;
}
