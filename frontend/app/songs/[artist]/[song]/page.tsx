'use client';

import { useSongDetail } from '@/app/features/songs/hooks';
import SongClient from './SongClient';
import { Spinner } from '@/components/ui/spinner';
import { use } from 'react';

interface SongPageProps {
  params: Promise<{
    artist: string;
    song: string;
  }>;
}

export default function SongPage({ params }: SongPageProps) {
  const { artist, song } = use(params);
  const { data: songData, isLoading, error } = useSongDetail(artist, song);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[32rem]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive">
        Failed to load song: {error.message}
      </div>
    );
  }

  if (!songData || !songData.sections) {
    return <div>Song not found.</div>;
  }

  return (
    <SongClient
      song={{
        artist: songData.artist,
        title: songData.title,
        key: songData.key,
        sections: songData.sections,
      }}
      artistSlug={artist}
    />
  );
}
