'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Trash2, Music, Send, Sparkles, Bot, Disc3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { useSongs, useDownloadSong, useDeleteSong } from '@/app/features/songs/hooks';
import type { SearchResult } from '@/lib/types';
import { cn, selectRandom, selectRandomWithFallback } from '@/lib/utils';
import { useIntervalEffect } from '@/lib/hooks/useIntervalEffect';
import { apiRoutes } from '@/app/config/apiRoutes';
import placeholders from '@/lib/data/placeholders.json';
import { ANIMATION_DURATION, SLIDE_UP_VARIANTS } from '@/lib/constants/animation.constants';

const THINKING_PUNS = [
  'Tuning up the search engines...',
  'Shredding through the database...',
  'Finding your jam...',
  'Strumming through results...',
  'Picking the best tabs...',
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
  results?: { chords: SearchResult[]; tabs: SearchResult[] };
}

interface StatusMessage {
  type: 'success' | 'error' | 'info';
  message: string;
}

const HomePageTestIds = {
  container: 'home-page',
  chatInput: 'home-chat-input',
  chatMessages: 'home-chat-messages',
  songsList: 'songs-list',
  artistGroup: 'artist-group',
} as const;

export default function HomePage() {
  const router = useRouter();
  const { data: songs = [], isLoading } = useSongs();
  const { mutate: downloadSong, isPending: isDownloading } = useDownloadSong();
  const { mutate: deleteSongMutation, isPending: isDeleting } = useDeleteSong();
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [thinkingPun, setThinkingPun] = useState('');
  const [currentPlaceholder, setCurrentPlaceholder] = useState(() => selectRandom(placeholders));
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useIntervalEffect(
    () => setCurrentPlaceholder(selectRandom(placeholders)),
    4200,
    messages.length === 0
  );

  // Sort songs by most recently updated
  const sortedSongs = useMemo(
    () => [...songs].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [songs]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isChatLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setThinkingPun(selectRandomWithFallback(THINKING_PUNS, 'Searching...'));
    setIsChatLoading(true);

    try {
      const newHistory = [...conversationHistory, { role: 'user', content: userMessage }];

      const response = await fetch(apiRoutes.agentChat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory }),
      });

      const data = (await response.json()) as {
        message: string;
        autoDownload?: boolean;
        results?: { chords: SearchResult[]; tabs: SearchResult[] };
      };

      setConversationHistory([...newHistory, { role: 'assistant', content: data.message }]);

      if (data.autoDownload && data.results?.chords?.[0]) {
        handleAgentSave(data.results.chords[0], 'chord');
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: data.message,
            results: data.results,
          },
        ]);
      }
    } catch {
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

  function handleAgentSave(result: SearchResult, type: 'chord' | 'tab') {
    setStatus({ type: 'info', message: '⬇️ Downloading...' });
    downloadSong(
      {
        artist: result.artist,
        title: result.title,
        chordId: type === 'chord' ? result.id : undefined,
        tabId: type === 'tab' ? result.id : undefined,
      },
      {
        onSuccess: data => {
          setStatus({
            type: 'success',
            message: `✨ "${data.summary.title}" added to your library!`,
          });
          router.push(`/songs/${data.summary.artistSlug}/${data.summary.songSlug}`);
        },
        onError: error => {
          setStatus({ type: 'error', message: `❌ ${error.message}` });
        },
      }
    );
  }

  function handleDelete(artistSlug: string, songSlug: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    deleteSongMutation(
      { artistSlug, songSlug },
      {
        onSuccess: () => {
          setStatus({ type: 'success', message: `✨ ${title} deleted successfully.` });
          setTimeout(() => setStatus(null), 3000);
        },
        onError: error => {
          setStatus({ type: 'error', message: error.message || 'Failed to delete song.' });
        },
      }
    );
  }

  return (
    <div className="space-y-6" data-testid={HomePageTestIds.container}>
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
            Find Songs
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Tell me what you want to play</p>
        </div>

        <div
          ref={chatContainerRef}
          className="h-[280px] overflow-y-auto p-4 space-y-3"
          data-testid={HomePageTestIds.chatMessages}
        >
          <AnimatePresence mode="wait">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="inline-flex mb-4"
                >
                  <Music className="h-12 w-12 text-sapphire-400/60" />
                </motion.div>
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
                <p className="whitespace-pre-wrap">{message.content}</p>

                {message.results &&
                  (message.results.chords.length > 0 || message.results.tabs.length > 0) && (
                    <div className="mt-3 space-y-2">
                      {message.results.chords.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1 opacity-70">Chords:</p>
                          {message.results.chords.slice(0, 3).map(result => (
                            <button
                              key={result.id}
                              onClick={() => handleAgentSave(result, 'chord')}
                              disabled={isDownloading}
                              className="w-full text-left p-2 rounded border hover:bg-accent/50 transition-colors mb-1 disabled:opacity-50"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-xs">{result.title}</span>
                                <span className="text-xs text-muted-foreground">
                                  ⭐ {(result.rating ?? 0).toFixed(1)}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">{result.artist}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {message.results.tabs.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1 opacity-70">Tabs:</p>
                          {message.results.tabs.slice(0, 3).map(result => (
                            <button
                              key={result.id}
                              onClick={() => handleAgentSave(result, 'tab')}
                              disabled={isDownloading}
                              className="w-full text-left p-2 rounded border hover:bg-accent/50 transition-colors mb-1 disabled:opacity-50"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-xs">{result.title}</span>
                                <span className="text-xs text-muted-foreground">
                                  ⭐ {(result.rating ?? 0).toFixed(1)}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">{result.artist}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
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
              placeholder="Find a song..."
              disabled={isChatLoading || isDownloading}
              autoFocus
              className="flex-1 bg-background/50"
              data-testid={HomePageTestIds.chatInput}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isChatLoading || isDownloading || !input.trim()}
            >
              {isChatLoading ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </form>

        {status && (
          <div
            className={cn(
              'mx-4 mb-4 rounded-lg border p-3 text-sm',
              status.type === 'success' && 'bg-green-950 border-green-800 text-green-200',
              status.type === 'error' && 'bg-red-950 border-red-800 text-red-200',
              status.type === 'info' && 'bg-blue-950 border-blue-800 text-blue-200'
            )}
          >
            {status.message}
          </div>
        )}
      </motion.div>

      {/* Songs Library - Collapsible by Artist */}
      <div className="space-y-2" data-testid={HomePageTestIds.songsList}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Your Library
            <span className="text-muted-foreground font-normal ml-2 text-base">
              {isLoading ? '' : `(${songs.length} songs)`}
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

        {!isLoading && songs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 rounded-lg border border-sapphire-500/20 bg-card/30"
          >
            <Music className="h-12 w-12 mx-auto text-sapphire-400/40 mb-3" />
            <p className="text-muted-foreground">
              No songs yet. Use the agent above to find and save songs.
            </p>
          </motion.div>
        )}

        {!isLoading && songs.length > 0 && (
          <motion.div
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.03 },
              },
            }}
          >
            {sortedSongs.map(song => (
              <motion.div
                key={`${song.artistSlug}/${song.songSlug}`}
                variants={SLIDE_UP_VARIANTS}
                className={cn(
                  'group rounded-lg border border-sapphire-500/20 bg-card/50 backdrop-blur-sm',
                  'hover:border-sapphire-500/40 hover:bg-card/70 transition-all duration-200'
                )}
              >
                <Link
                  href={`/songs/${song.artistSlug}/${song.songSlug}`}
                  className="block p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-sapphire-500/10 text-sapphire-400">
                      <Disc3 className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate group-hover:text-sapphire-400 transition-colors">
                        {song.title}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {song.key && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-sapphire-500/10 text-sapphire-400">
                            {song.key}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(song.updatedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={e => {
                        e.preventDefault();
                        handleDelete(song.artistSlug, song.songSlug, song.title);
                      }}
                      disabled={isDeleting}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-destructive/10 rounded text-destructive disabled:opacity-50"
                      title="Delete song"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
