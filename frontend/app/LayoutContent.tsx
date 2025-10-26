'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RefreshCcw, Menu, Library } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { initializeApp } from '@/lib/init';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useSongs } from '@/app/features/songs/hooks';
import type { SavedSongView } from '@/app/features/songs/transformers/song-view.transformer';
import { pageRoutes } from '@/lib/routes';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { data: songs = [], isLoading: isLoadingSongs, refetch: refreshSongs, error } = useSongs();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileLibraryOpen, setMobileLibraryOpen] = useState(false);
  const [loadingSongSlug, setLoadingSongSlug] = useState<string | null>(null);
  const pathname = usePathname();

  // Library collapsed by default on songwriter page
  const isSongwriterPage = pathname === '/songwriter';

  useEffect(() => {
    initializeApp();
  }, []);

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

  const LibraryContent = () => (
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
          className="h-10 w-10 -mt-1"
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
                    {items.map(song => {
                      const songKey = `${song.artistSlug}-${song.songSlug}`;
                      const songPath = `/songs/${song.artistSlug}/${song.songSlug}`;
                      const isCurrentSong = pathname === songPath;
                      const isLoadingSong = loadingSongSlug === songKey;

                      return (
                        <Link
                          href={songPath}
                          key={songKey}
                          className={`group relative block rounded-lg border px-3 py-2.5 text-left text-sm transition-all hover:border-border/50 hover:bg-accent/50 hover:shadow-sm ${
                            isCurrentSong ? 'border-primary/50 bg-accent/30' : 'border-transparent'
                          } ${isLoadingSong ? 'opacity-60' : ''}`}
                          onClick={() => {
                            setLoadingSongSlug(songKey);
                            setMobileLibraryOpen(false);
                            setTimeout(() => setLoadingSongSlug(null), 2000);
                          }}
                        >
                          <div className="font-medium group-hover:text-foreground transition-colors flex items-center gap-2">
                            {song.title}
                            {isLoadingSong && <Spinner className="h-3 w-3" />}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {new Date(song.updatedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </Link>
                      );
                    })}
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
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4 py-3 md:py-4 max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Resonance Lab
              </h1>
              <p className="text-xs text-muted-foreground leading-tight">
                Professional music workspace
              </p>
            </div>
            <div className="flex md:hidden gap-2">
              <Sheet open={mobileLibraryOpen} onOpenChange={setMobileLibraryOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10">
                    <Library className="h-4 w-4" />
                    <span className="sr-only">Open library</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85%] sm:w-[385px]">
                  <SheetHeader className="mb-4">
                    <SheetTitle>Library</SheetTitle>
                  </SheetHeader>
                  <LibraryContent />
                </SheetContent>
              </Sheet>
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10">
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader className="mb-6">
                    <SheetTitle>Navigation</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-2">
                    <Link href={pageRoutes.songwriter} onClick={() => setMobileNavOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start h-11 text-base">
                        Songwriter
                      </Button>
                    </Link>
                    <Link href={pageRoutes.jam} onClick={() => setMobileNavOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start h-11 text-base">
                        Jam
                      </Button>
                    </Link>
                    <Link href={pageRoutes.musicTheory} onClick={() => setMobileNavOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start h-11 text-base">
                        Music Theory
                      </Button>
                    </Link>
                    <Link href={pageRoutes.metronome} onClick={() => setMobileNavOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start h-11 text-base">
                        Metronome
                      </Button>
                    </Link>
                    <Link href={pageRoutes.composer} onClick={() => setMobileNavOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start h-11 text-base">
                        Composer
                      </Button>
                    </Link>
                    <Link href={pageRoutes.pedalboard} onClick={() => setMobileNavOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start h-11 text-base">
                        Pedalboard
                      </Button>
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <nav className="hidden md:flex gap-1.5">
            <Link href={pageRoutes.songwriter}>
              <Button variant="ghost" size="sm" className="font-medium h-10">
                Songwriter
              </Button>
            </Link>
            <Link href={pageRoutes.jam}>
              <Button variant="ghost" size="sm" className="font-medium h-10">
                Jam
              </Button>
            </Link>
            <Link href={pageRoutes.musicTheory}>
              <Button variant="ghost" size="sm" className="font-medium h-10">
                Music Theory
              </Button>
            </Link>
            <Link href={pageRoutes.metronome}>
              <Button variant="ghost" size="sm" className="font-medium h-10">
                Metronome
              </Button>
            </Link>
            <Link href={pageRoutes.composer}>
              <Button variant="ghost" size="sm" className="font-medium h-10">
                Composer
              </Button>
            </Link>
            <Link href={pageRoutes.pedalboard}>
              <Button variant="ghost" size="sm" className="font-medium h-10">
                Pedalboard
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <div className="container mx-auto px-4 md:px-6 pt-4 max-w-7xl">
        <Breadcrumbs />
      </div>
      {isSongwriterPage ? (
        // Songwriter page manages its own layout
        <main className="w-full">{children}</main>
      ) : (
        // Other pages use grid layout with library sidebar
        <main className="container mx-auto px-4 md:px-6 max-w-7xl grid gap-6 py-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="hidden lg:block space-y-4 w-full">
            <LibraryContent />
          </aside>
          <div className="min-h-[calc(100vh-12rem)] w-full">{children}</div>
        </main>
      )}
    </div>
  );
}
