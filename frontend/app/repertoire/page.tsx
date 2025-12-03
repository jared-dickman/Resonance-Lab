'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Music, Disc3, ChevronDown, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SapphireCard } from '@/components/ui/card';
import { DramaticLoader } from '@/components/ui/loaders/DramaticLoader';
import { cn } from '@/lib/utils';
import { useSongs, useDeleteSong } from '@/app/features/songs/hooks';
import { useArtists } from '@/app/features/artists/hooks';
import { ANIMATION_DURATION, SLIDE_UP_VARIANTS } from '@/lib/constants/animation.constants';

type ViewMode = 'songs' | 'artists';

const RepertoireTestIds = {
  container: 'repertoire-page',
  toggle: 'repertoire-toggle',
  songsList: 'songs-list',
  artistsList: 'artists-list',
} as const;

function ViewToggle({ view, onViewChange }: { view: ViewMode; onViewChange: (v: ViewMode) => void }) {
  return (
    <div className="relative grid grid-cols-2 gap-0.5 bg-muted/50 rounded-md p-0.5" data-testid={RepertoireTestIds.toggle}>
      {/* Sliding indicator */}
      <motion.div
        className="absolute inset-y-0.5 w-[calc(50%-1px)] rounded-[5px] bg-background shadow-sm pointer-events-none"
        animate={{ left: view === 'songs' ? 2 : 'calc(50% + 1px)' }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      />
      <button
        onClick={() => onViewChange('songs')}
        className={cn(
          'relative z-10 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors rounded-[5px]',
          view === 'songs' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Music className="h-3.5 w-3.5" />
        Songs
      </button>
      <button
        onClick={() => onViewChange('artists')}
        className={cn(
          'relative z-10 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors rounded-[5px]',
          view === 'artists' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Users className="h-3.5 w-3.5" />
        Artists
      </button>
    </div>
  );
}

function SongsView() {
  const { data: songs = [], isLoading } = useSongs();
  const { mutate: deleteSongMutation, isPending: isDeleting } = useDeleteSong();

  const sortedSongs = useMemo(
    () => [...songs].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [songs]
  );

  function handleDelete(artistSlug: string, songSlug: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
    deleteSongMutation({ artistSlug, songSlug });
  }

  if (isLoading) {
    return (
      <div className="relative min-h-[300px]">
        <DramaticLoader isLoading={isLoading} size="lg" />
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 rounded-lg border border-sapphire-500/20 bg-card/30">
        <Music className="h-12 w-12 mx-auto text-sapphire-400/40 mb-3" />
        <p className="text-muted-foreground">No songs yet. Use Buddy to find and save songs.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      initial="hidden"
      animate="show"
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.03 } } }}
      data-testid={RepertoireTestIds.songsList}
    >
      {sortedSongs.map(song => (
        <motion.div key={`${song.artistSlug}/${song.songSlug}`} variants={SLIDE_UP_VARIANTS}>
          <SapphireCard className="group">
            <Link href={`/songs/${song.artistSlug}/${song.songSlug}`} className="block p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-sapphire-500/10 text-sapphire-400">
                  <Disc3 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate group-hover:text-sapphire-400 transition-colors">{song.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {song.key && <span className="text-xs px-2 py-0.5 rounded-full bg-sapphire-500/10 text-sapphire-400">{song.key}</span>}
                    <span className="text-xs text-muted-foreground">
                      {new Date(song.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={e => { e.preventDefault(); handleDelete(song.artistSlug, song.songSlug, song.title); }}
                  disabled={isDeleting}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-destructive/10 rounded text-destructive disabled:opacity-50"
                  title="Delete song"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Link>
          </SapphireCard>
        </motion.div>
      ))}
    </motion.div>
  );
}

function ArtistsView() {
  const { data: artists = [], isLoading } = useArtists();
  const [expandedArtist, setExpandedArtist] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="relative min-h-[300px]">
        <DramaticLoader isLoading={isLoading} size="lg" />
      </div>
    );
  }

  if (artists.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 rounded-lg border border-sapphire-500/20 bg-card/30">
        <Music className="h-12 w-12 mx-auto text-sapphire-400/40 mb-3" />
        <p className="text-muted-foreground">No artists yet. Save some songs to see them here.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-2"
      initial="hidden"
      animate="show"
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
      data-testid={RepertoireTestIds.artistsList}
    >
      {artists.map(artist => {
        const isExpanded = expandedArtist === artist.slug;
        return (
          <motion.div key={artist.slug} variants={SLIDE_UP_VARIANTS}>
            <SapphireCard className={cn(isExpanded && 'border-sapphire-500/40 bg-card/70')}>
              <button onClick={() => setExpandedArtist(prev => prev === artist.slug ? null : artist.slug)} className="w-full flex items-center justify-between p-4 text-left">
                <div className="flex items-center gap-3">
                  <Music className="h-5 w-5 text-sapphire-400" />
                  <div>
                    <h3 className="font-medium">{artist.name}</h3>
                    <p className="text-sm text-muted-foreground">{artist.songCount} {artist.songCount === 1 ? 'song' : 'songs'}</p>
                  </div>
                </div>
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: ANIMATION_DURATION.FAST }}>
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                </motion.div>
              </button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: ANIMATION_DURATION.FAST }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-0 space-y-3 border-t border-sapphire-500/10">
                      <div className="pt-3 flex flex-wrap gap-2">
                        <Link href={artist.songsUrl}>
                          <Button variant="secondary" size="sm" className="gap-2">
                            <Disc3 className="h-4 w-4" />
                            View Songs
                          </Button>
                        </Link>
                      </div>
                      <p className="text-sm text-muted-foreground italic">Ask Buddy about {artist.name}&apos;s influences, style, or history.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </SapphireCard>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function RepertoireContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewParam = searchParams.get('view') as ViewMode | null;
  const [view, setView] = useState<ViewMode>(viewParam === 'artists' ? 'artists' : 'songs');

  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
    router.replace(`/repertoire?view=${newView}`, { scroll: false });
  };

  const { data: songs = [] } = useSongs();
  const { data: artists = [] } = useArtists();
  const count = view === 'songs' ? songs.length : artists.length;

  return (
    <div className="space-y-4" data-testid={RepertoireTestIds.container}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">Repertoire</h1>
          <p className="text-muted-foreground text-xs">{count} {view === 'songs' ? 'songs' : 'artists'}</p>
        </div>
        <ViewToggle view={view} onViewChange={handleViewChange} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }}>
          {view === 'songs' ? <SongsView /> : <ArtistsView />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function RepertoirePage() {
  return (
    <Suspense fallback={<div className="relative min-h-[300px]"><DramaticLoader isLoading={true} size="lg" /></div>}>
      <RepertoireContent />
    </Suspense>
  );
}
