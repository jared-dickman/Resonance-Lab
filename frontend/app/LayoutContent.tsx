'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { RefreshCcw } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { useSongs } from '@/app/features/songs/hooks';
import type { SavedSongView } from '@/app/features/songs/transformers/song-view.transformer';
import { pageRoutes } from '@/lib/routes';

export function LayoutContent({ children }: { children: React.ReactNode }) {
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
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between gap-4 py-4 max-w-7xl mx-auto px-6">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Resonance Lab
            </h1>
            <p className="text-xs text-muted-foreground leading-tight">
              Professional music workspace
            </p>
          </div>
          <nav className="flex gap-1.5">
            <Link href={pageRoutes.songwriter}>
              <Button variant="ghost" size="sm" className="font-medium">
                Songwriter
              </Button>
            </Link>
            <Link href={pageRoutes.jam}>
              <Button variant="ghost" size="sm" className="font-medium">
                Jam
              </Button>
            </Link>
            <Link href={pageRoutes.metronome}>
              <Button variant="ghost" size="sm" className="font-medium">
                Metronome
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <div className="container mx-auto px-6 pt-4 max-w-7xl">
        <Breadcrumbs />
      </div>
      <main className="container mx-auto px-6 max-w-7xl grid gap-6 py-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-4 w-full">
          <Card className="border-border/40">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold">Library</CardTitle>
                <CardDescription className="text-xs">Your saved songs and chords</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => refreshSongs()}
                disabled={isLoadingSongs}
                className="h-8 w-8 -mt-1"
              >
                {isLoadingSongs ? <Spinner /> : <RefreshCcw className="h-3.5 w-3.5" />}
                <span className="sr-only">Refresh songs</span>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-[calc(100vh-16rem)] pr-3">
                {isLoadingSongs ? (
                  <div className="space-y-6">
                    {[...Array(3)].map((_, groupIndex) => (
                      <div key={groupIndex} className="space-y-3">
                        <Skeleton className="h-3.5 w-20" />
                        <div className="space-y-1.5">
                          {[...Array(2)].map((_, songIndex) => (
                            <div key={songIndex} className="rounded-lg px-3 py-2.5">
                              <Skeleton className="h-3.5 w-3/4 mb-1.5" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : songs.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No songs yet. Search below to add.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {groupedSongs.map(({ artist, items }) => (
                      <div key={artist} className="space-y-1.5">
                        <Link
                          href={`/songs/${items[0]?.artistSlug ?? ''}`}
                          className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase"
                        >
                          {artist}
                        </Link>
                        <div className="space-y-1">
                          {items.map(song => (
                            <Link
                              href={`/songs/${song.artistSlug}/${song.songSlug}`}
                              key={`${song.artistSlug}-${song.songSlug}`}
                              className="group block rounded-lg border border-transparent px-3 py-2.5 text-left text-sm transition-all hover:border-border/50 hover:bg-accent/50 hover:shadow-sm"
                            >
                              <div className="font-medium group-hover:text-foreground transition-colors">
                                {song.title}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {new Date(song.updatedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              {error && (
                <p className="mt-3 text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
                  {error.message}
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
        <div className="min-h-[calc(100vh-12rem)] w-full">{children}</div>
      </main>
    </div>
  );
}
