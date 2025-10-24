'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Music, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSongs } from '@/lib/SongsContext';
import { pageRoutes } from '@/lib/routes';

interface ArtistClientProps {
  artistSlug: string;
}

export default function ArtistClient({ artistSlug }: ArtistClientProps) {
  const { songs, isLoadingSongs } = useSongs();

  const artistData = useMemo(() => {
    const artistSongs = songs.filter(song => song.artistSlug === artistSlug);

    if (artistSongs.length === 0) {
      return null;
    }

    const artistName = artistSongs[0]?.artist ?? 'Unknown Artist';
    const sortedSongs = [...artistSongs].sort((a, b) => a.title.localeCompare(b.title));

    const keys = new Set(artistSongs.map(s => s.key).filter(Boolean));
    const lastUpdated = new Date(
      Math.max(...artistSongs.map(s => new Date(s.updatedAt).getTime()))
    );

    return {
      name: artistName,
      songs: sortedSongs,
      totalSongs: sortedSongs.length,
      keys: Array.from(keys),
      lastUpdated,
    };
  }, [songs, artistSlug]);

  if (isLoadingSongs) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-32" />
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-md border p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!artistData) {
    return (
      <div className="space-y-6">
        <Link href={pageRoutes.home}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Artist not found. They may not have any saved songs yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href={pageRoutes.home}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{artistData.name}</CardTitle>
              <CardDescription>
                {artistData.totalSongs} {artistData.totalSongs === 1 ? 'song' : 'songs'} in your
                library
              </CardDescription>
            </div>
            <Music className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Keys</h3>
              <div className="flex flex-wrap gap-2">
                {artistData.keys.length > 0 ? (
                  artistData.keys.map(key => (
                    <span
                      key={key}
                      className="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 text-sm font-medium"
                    >
                      {key}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No keys specified</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
              <p className="text-sm">{artistData.lastUpdated.toLocaleDateString()}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Songs</h3>
            <div className="space-y-2">
              {artistData.songs.map(song => (
                <Link
                  key={`${song.artistSlug}/${song.songSlug}`}
                  href={`/songs/${song.artistSlug}/${song.songSlug}`}
                  className="block rounded-md border p-4 transition hover:border-primary hover:bg-muted"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">{song.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Updated {new Date(song.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    {song.key && (
                      <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 text-xs font-medium">
                        {song.key}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
