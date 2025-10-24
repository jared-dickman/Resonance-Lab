'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { RefreshCcw } from 'lucide-react';
import './globals.css';
import { Breadcrumbs } from '@/components/Breadcrumbs';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryClientProvider } from '@/app/providers/QueryClientProvider';
import { useSongs } from '@/app/features/songs/hooks';
import type { SavedSongView } from '@/app/features/songs/transformers/song-view.transformer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <QueryClientProvider>
          <LayoutContent>{children}</LayoutContent>
        </QueryClientProvider>
      </body>
    </html>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { data: songs = [], isLoading: isLoadingSongs, refetch: refreshSongs, error } = useSongs();

  const groupedSongs = useMemo(() => {
    const groups = new Map<string, SavedSongView[]>();
    songs.forEach(song => {
      const existing = groups.get(song.artist) || [];
      existing.push(song);
      groups.set(song.artist, existing);
    });
    return Array.from(groups.entries()).map(([artist, items]) => ({
      artist,
      items: items.sort((a, b) => a.title.localeCompare(b.title)),
    }));
  }, [songs]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b overflow-x-hidden">
        <div className="container flex flex-col gap-2 py-6 max-w-full">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Resonance Lab</h1>
            <div className="flex gap-2 flex-wrap">
              <Link href="/songwriter">
                <Button variant="outline" size="sm">
                  Songwriter
                </Button>
              </Link>
              <Link href="/jam">
                <Button variant="outline" size="sm">
                  Jam Assistant
                </Button>
              </Link>
              <Link href="/metronome">
                <Button variant="outline" size="sm">
                  Metronome
                </Button>
              </Link>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage saved songs and pull fresh chords from Ultimate Guitar using the Go backend.
          </p>
        </div>
      </header>
      <div className="container mx-auto p-4 max-w-full overflow-x-hidden">
        <Breadcrumbs />
      </div>
      <main className="container mx-auto px-4 max-w-full overflow-x-hidden grid gap-6 py-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-6 w-full overflow-x-hidden">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">Saved Songs</CardTitle>
                <CardDescription>Choose a song to view its chords and tab.</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => refreshSongs()}
                disabled={isLoadingSongs}
              >
                {isLoadingSongs ? <Spinner /> : <RefreshCcw className="h-4 w-4" />}
                <span className="sr-only">Refresh songs</span>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-[28rem] pr-4">
                {isLoadingSongs ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, groupIndex) => (
                      <div key={groupIndex} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <div className="space-y-2">
                          {[...Array(2)].map((_, songIndex) => (
                            <div
                              key={songIndex}
                              className="rounded-md border border-transparent px-3 py-2"
                            >
                              <Skeleton className="h-4 w-3/4 mb-2" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : songs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No songs saved yet. Use the search below to add one.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {groupedSongs.map(({ artist, items }) => (
                      <div key={artist} className="space-y-2">
                        <Link
                          href={`/songs/${items[0]?.artistSlug ?? ''}`}
                          className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {artist}
                        </Link>
                        <div className="space-y-2">
                          {items.map(song => (
                            <Link
                              href={`/songs/${song.artistSlug}/${song.songSlug}`}
                              key={`${song.artistSlug}-${song.songSlug}`}
                              className="block rounded-md border border-transparent px-3 py-2 text-left text-sm transition hover:border-primary hover:bg-muted"
                            >
                              <div className="font-medium">{song.title}</div>
                              <div className="text-xs text-muted-foreground">
                                Updated {new Date(song.updatedAt).toLocaleDateString()}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              {error && <p className="mt-4 text-sm text-destructive">{error.message}</p>}
            </CardContent>
          </Card>
        </div>
        <div className="min-h-[32rem] w-full overflow-x-hidden">{children}</div>
      </main>
    </div>
  );
}
