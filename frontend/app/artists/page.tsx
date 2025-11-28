'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { Send, Sparkles, Bot, ChevronDown, Music, Disc3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, selectRandom, selectRandomWithFallback } from '@/lib/utils';
import { useIntervalEffect } from '@/lib/hooks/useIntervalEffect';
import { useArtists } from '@/app/features/artists/hooks';
import artistPlaceholders from '@/lib/data/artist-placeholders.json';
import { ANIMATION_DURATION, SLIDE_UP_VARIANTS } from '@/lib/constants/animation.constants';
import { apiRoutes } from '@/app/config/apiRoutes';

const THINKING_PUNS = [
  'Researching musical history...',
  'Diving into discographies...',
  'Tracing musical lineages...',
  'Connecting the musical dots...',
];

// Structured response types
interface InfluenceChainData {
  type: 'influence_chain';
  chain: Array<{
    name: string;
    relationship: string;
  }>;
}

interface ArtistCardData {
  type: 'artist_card';
  name: string;
  yearsActive: string;
  genres: string[];
  keyFacts: string[];
  notableWorks: string[];
}

interface ComparisonData {
  type: 'comparison';
  artist1: string;
  artist2: string;
  sharedInfluences: string[];
  differences: string[];
  genreOverlap: string[];
}

interface TimelineData {
  type: 'timeline';
  events: Array<{
    year: number;
    event: string;
    type: 'album' | 'lineup' | 'other';
  }>;
}

interface DiscographyData {
  type: 'discography';
  albums: Array<{
    year: number;
    name: string;
    tracks?: string[];
  }>;
}

type StructuredData =
  | InfluenceChainData
  | ArtistCardData
  | ComparisonData
  | TimelineData
  | DiscographyData;

interface Message {
  role: 'user' | 'assistant';
  content: string;
  structured?: StructuredData;
}

const ArtistsPageTestIds = {
  container: 'artists-page',
  artistsList: 'artists-list',
  artistItem: 'artist-item',
  chatInput: 'artists-chat-input',
  chatMessages: 'artists-chat-messages',
} as const;

// Structured UI Components
function InfluenceChain({ data }: { data: InfluenceChainData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-sapphire-500/20 bg-card/30 p-4 mt-2"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-sapphire-400" />
        <h4 className="text-sm font-semibold">Influence Chain</h4>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {data.chain.map((link, i) => (
          <div key={i} className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-md bg-sapphire-500/10 hover:bg-sapphire-500/20 border border-sapphire-500/30 transition-colors">
              <span className="text-sm font-medium">{link.name}</span>
            </button>
            {i < data.chain.length - 1 && (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xs text-sapphire-400/70">{link.relationship}</span>
                <div className="text-sapphire-400">→</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ArtistCard({ data }: { data: ArtistCardData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-sapphire-500/20 bg-card/30 p-4 mt-2"
    >
      <div className="flex items-center gap-2 mb-3">
        <Music className="h-4 w-4 text-sapphire-400" />
        <h4 className="text-lg font-semibold">{data.name}</h4>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">{data.yearsActive}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {data.genres.map((genre, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-xs rounded-full bg-sapphire-500/10 border border-sapphire-500/30 text-sapphire-300"
            >
              {genre}
            </span>
          ))}
        </div>
        {data.keyFacts.length > 0 && (
          <div className="space-y-1">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Key Facts
            </h5>
            <ul className="space-y-1">
              {data.keyFacts.map((fact, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-sapphire-400 mt-1">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {data.notableWorks.length > 0 && (
          <div className="space-y-1">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Notable Works
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {data.notableWorks.map((work, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs rounded-md bg-background/50 border border-sapphire-500/20"
                >
                  {work}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Comparison({ data }: { data: ComparisonData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-sapphire-500/20 bg-card/30 p-4 mt-2"
    >
      <div className="flex items-center gap-2 mb-4">
        <Disc3 className="h-4 w-4 text-sapphire-400" />
        <h4 className="text-sm font-semibold">Artist Comparison</h4>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h5 className="font-medium text-sm px-3 py-1.5 rounded-md bg-sapphire-500/10 border border-sapphire-500/30">
            {data.artist1}
          </h5>
        </div>
        <div className="space-y-2">
          <h5 className="font-medium text-sm px-3 py-1.5 rounded-md bg-sapphire-500/10 border border-sapphire-500/30">
            {data.artist2}
          </h5>
        </div>
      </div>
      {data.sharedInfluences.length > 0 && (
        <div className="mt-4 space-y-2">
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Shared Influences
          </h5>
          <div className="flex flex-wrap gap-1.5">
            {data.sharedInfluences.map((influence, i) => (
              <span
                key={i}
                className="px-2 py-1 text-xs rounded-md bg-sapphire-500/10 border border-sapphire-500/30"
              >
                {influence}
              </span>
            ))}
          </div>
        </div>
      )}
      {data.genreOverlap.length > 0 && (
        <div className="mt-4 space-y-2">
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Genre Overlap
          </h5>
          <div className="flex flex-wrap gap-1.5">
            {data.genreOverlap.map((genre, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-xs rounded-full bg-sapphire-500/10 border border-sapphire-500/30 text-sapphire-300"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}
      {data.differences.length > 0 && (
        <div className="mt-4 space-y-2">
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Differences
          </h5>
          <ul className="space-y-1">
            {data.differences.map((diff, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="text-sapphire-400 mt-1">•</span>
                <span>{diff}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

function Timeline({ data }: { data: TimelineData }) {
  const eventIcons = {
    album: Disc3,
    lineup: Music,
    other: Sparkles,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-sapphire-500/20 bg-card/30 p-4 mt-2"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-sapphire-400" />
        <h4 className="text-sm font-semibold">Timeline</h4>
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-2 min-w-max">
          {data.events.map((event, i) => {
            const Icon = eventIcons[event.type];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex-shrink-0 w-48 space-y-2 relative"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-3 w-3 text-sapphire-400" />
                  <span className="text-xs font-semibold text-sapphire-300">{event.year}</span>
                </div>
                <div className="px-3 py-2 rounded-md bg-background/50 border border-sapphire-500/20">
                  <p className="text-sm">{event.event}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function Discography({ data }: { data: DiscographyData }) {
  const [expandedAlbum, setExpandedAlbum] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-sapphire-500/20 bg-card/30 p-4 mt-2"
    >
      <div className="flex items-center gap-2 mb-3">
        <Disc3 className="h-4 w-4 text-sapphire-400" />
        <h4 className="text-sm font-semibold">Discography</h4>
      </div>
      <div className="space-y-2">
        {data.albums.map((album, i) => (
          <div key={i} className="rounded-md border border-sapphire-500/20 bg-background/30">
            <button
              onClick={() => setExpandedAlbum(expandedAlbum === i ? null : i)}
              className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-background/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-sapphire-300 min-w-[3rem]">
                  {album.year}
                </span>
                <span className="text-sm font-medium">{album.name}</span>
              </div>
              {album.tracks && (
                <motion.div
                  animate={{ rotate: expandedAlbum === i ? 180 : 0 }}
                  transition={{ duration: ANIMATION_DURATION.FAST }}
                >
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              )}
            </button>
            <AnimatePresence>
              {expandedAlbum === i && album.tracks && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: ANIMATION_DURATION.FAST }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-2 pt-1 border-t border-sapphire-500/10">
                    <ul className="space-y-1">
                      {album.tracks.map((track, j) => (
                        <li
                          key={j}
                          className="text-xs text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-sapphire-400/50">{j + 1}.</span>
                          <span>{track}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function StructuredResponse({ data }: { data: StructuredData }) {
  switch (data.type) {
    case 'influence_chain':
      return <InfluenceChain data={data} />;
    case 'artist_card':
      return <ArtistCard data={data} />;
    case 'comparison':
      return <Comparison data={data} />;
    case 'timeline':
      return <Timeline data={data} />;
    case 'discography':
      return <Discography data={data} />;
  }
}

export default function ArtistsPage() {
  const { data: artists = [], isLoading } = useArtists();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [thinkingPun, setThinkingPun] = useState('');
  const [expandedArtist, setExpandedArtist] = useState<string | null>(null);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(() =>
    selectRandom(artistPlaceholders)
  );
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll within the chat container only, not the page
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useIntervalEffect(
    () => setCurrentPlaceholder(selectRandom(artistPlaceholders)),
    4200,
    messages.length === 0
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || isChatLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setThinkingPun(selectRandomWithFallback(THINKING_PUNS, 'Searching...'));
    setIsChatLoading(true);

    try {
      const newHistory = [...conversationHistory, { role: 'user', content: userMessage }];

      const response = await fetch(apiRoutes.artistChat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from artist chat');
      }

      const data = (await response.json()) as {
        message: string;
        structured?: StructuredData;
      };

      setConversationHistory([...newHistory, { role: 'assistant', content: data.message }]);

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
          structured: data.structured,
        },
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  }

  function toggleArtist(slug: string) {
    setExpandedArtist(prev => (prev === slug ? null : slug));
  }

  return (
    <div className="space-y-6" data-testid={ArtistsPageTestIds.container}>
      {/* Agent Chat - Full Width */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={SLIDE_UP_VARIANTS}
        transition={{ duration: ANIMATION_DURATION.NORMAL }}
        className={cn(
          'rounded-xl border border-sapphire-500/20 bg-card/30 backdrop-blur-sm',
          'shadow-xl shadow-sapphire-500/5'
        )}
      >
        <div className="p-4 border-b border-sapphire-500/10">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bot className="h-5 w-5 text-sapphire-400" />
            Artist Discovery
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Ask about artists, influences, or musical history
          </p>
        </div>

        <div
          ref={chatContainerRef}
          className="h-[200px] overflow-y-auto p-4 space-y-3"
          data-testid={ArtistsPageTestIds.chatMessages}
        >
          <AnimatePresence mode="wait">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <motion.p
                  key={currentPlaceholder}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-muted-foreground italic"
                >
                  &quot;{currentPlaceholder}&quot;
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {messages.map((message, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: ANIMATION_DURATION.FAST }}
              className={cn('flex flex-col', message.role === 'user' ? 'items-end' : 'items-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background/80 border border-sapphire-500/20'
                )}
              >
                {message.content}
              </div>
              {message.structured && message.role === 'assistant' && (
                <div className="w-full max-w-[85%]">
                  <StructuredResponse data={message.structured} />
                </div>
              )}
            </motion.div>
          ))}

          <AnimatePresence>
            {isChatLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="bg-background/80 border border-sapphire-500/20 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="h-4 w-4 text-sapphire-400" />
                    </motion.div>
                    <span className="text-xs text-muted-foreground">{thinkingPun}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-sapphire-500/10">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about an artist..."
              disabled={isChatLoading}
              autoFocus
              className="flex-1 bg-background/50"
              data-testid={ArtistsPageTestIds.chatInput}
            />
            <Button type="submit" size="icon" disabled={isChatLoading || !input.trim()}>
              {isChatLoading ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      </motion.div>

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
                <motion.div
                  key={artist.slug}
                  variants={SLIDE_UP_VARIANTS}
                  className={cn(
                    'rounded-lg border border-sapphire-500/20 bg-card/50 backdrop-blur-sm',
                    'transition-all duration-300',
                    isExpanded && 'border-sapphire-500/40 bg-card/70'
                  )}
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
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
