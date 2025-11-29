'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Music, Disc3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SapphireCard } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useArtists } from '@/app/features/artists/hooks';
import { ANIMATION_DURATION, SLIDE_UP_VARIANTS } from '@/lib/constants/animation.constants';

const ArtistsPageTestIds = {
  container: 'artists-page',
  artistsList: 'artists-list',
  artistItem: 'artist-item',
} as const;

export default function ArtistsPage() {
  const { data: artists = [], isLoading } = useArtists();
  const [expandedArtist, setExpandedArtist] = useState<string | null>(null);

  function toggleArtist(slug: string) {
    setExpandedArtist(prev => (prev === slug ? null : slug));
  }

  return (
    <div className="space-y-6" data-testid={ArtistsPageTestIds.container}>
      {/* Artists List - Collapsible */}
      <div className="space-y-2" data-testid={ArtistsPageTestIds.artistsList}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Your Artists
            <span className="text-muted-foreground font-normal ml-2 text-base">
              {isLoading ? '' : `(${artists.length})`}
            </span>
          </h2>
        </div>

        {isLoading && (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        )}

        {!isLoading && artists.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 rounded-lg border border-sapphire-500/20 bg-card/30"
          >
            <Music className="h-12 w-12 mx-auto text-sapphire-400/40 mb-3" />
            <p className="text-muted-foreground">
              No artists yet. Save some songs to see them here.
            </p>
          </motion.div>
        )}

        {!isLoading && artists.length > 0 && (
          <motion.div
            className="space-y-2"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.05 },
              },
            }}
          >
            {artists.map(artist => {
              const isExpanded = expandedArtist === artist.slug;

              return (
                <motion.div key={artist.slug} variants={SLIDE_UP_VARIANTS}>
                <SapphireCard
                  className={cn(isExpanded && 'border-sapphire-500/40 bg-card/70')}
                  data-testid={ArtistsPageTestIds.artistItem}
                >
                  <button
                    onClick={() => toggleArtist(artist.slug)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Music className="h-5 w-5 text-sapphire-400" />
                      <div>
                        <h3 className="font-medium">{artist.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {artist.songCount} {artist.songCount === 1 ? 'song' : 'songs'}
                        </p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: ANIMATION_DURATION.FAST }}
                    >
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: ANIMATION_DURATION.FAST }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-0 space-y-3 border-t border-sapphire-500/10">
                          <div className="pt-3 flex flex-wrap gap-2">
                            <Link href={artist.songsUrl}>
                              <Button variant="secondary" size="sm" className="gap-2">
                                <Disc3 className="h-4 w-4" />
                                View Songs
                              </Button>
                            </Link>
                          </div>
                          <p className="text-sm text-muted-foreground italic">
                            Ask the agent above about {artist.name}&apos;s influences, style, or
                            history.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </SapphireCard>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
