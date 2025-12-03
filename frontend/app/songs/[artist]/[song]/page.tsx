'use client';

import { useSongDetail } from '@/app/features/songs/hooks';
import SongClient from '@/app/songs/[artist]/[song]/SongClient';
import { DramaticLoader } from '@/components/ui/loaders/DramaticLoader';
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
      <div className="relative min-h-[32rem]">
        <DramaticLoader isLoading={isLoading} size="lg" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-destructive">Failed to load song: {error.message}</div>;
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
      songSlug={song}
    />
  );
}
