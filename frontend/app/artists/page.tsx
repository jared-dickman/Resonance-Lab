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
import { ANIMATION_DURATION, SLIDE_UP_VARIANTS } from '@/lib/constants/animation.constants';

const DISCOVERY_PLACEHOLDERS = [
  "Tell me about Led Zeppelin's early years",
  'Who influenced Jimi Hendrix?',
  "What's the story behind Pink Floyd?",
  'Compare Beatles and Rolling Stones',
  'Who plays similar to Eric Clapton?',
];

const THINKING_PUNS = [
  'Researching musical history...',
  'Diving into discographies...',
  'Tracing musical lineages...',
  'Connecting the musical dots...',
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ArtistsPageTestIds = {
  container: 'artists-page',
  artistsList: 'artists-list',
  artistItem: 'artist-item',
  chatInput: 'artists-chat-input',
  chatMessages: 'artists-chat-messages',
} as const;

export default function ArtistsPage() {
  const { data: artists = [], isLoading } = useArtists();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [thinkingPun, setThinkingPun] = useState('');
  const [expandedArtist, setExpandedArtist] = useState<string | null>(null);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(() =>
    selectRandom(DISCOVERY_PLACEHOLDERS)
  );
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll within the chat container only, not the page
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useIntervalEffect(
    () => setCurrentPlaceholder(selectRandom(DISCOVERY_PLACEHOLDERS)),
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

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `I'd love to tell you more about "${userMessage}"! This feature is coming soon.`,
        },
      ]);
      setIsChatLoading(false);
    }, 1500);
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
              className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
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
