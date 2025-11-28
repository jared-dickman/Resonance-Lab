'use client';

import { useState, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AgentChat } from '@/components/AgentChat';
import Link from 'next/link';
import { useSongs, useDownloadSong, useDeleteSong } from '@/app/features/songs/hooks';
import type { SearchResult } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatusMessage {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function HomePage() {
  const router = useRouter();
  const { data: songs = [] } = useSongs();
  const { mutate: downloadSong, isPending: isDownloading } = useDownloadSong();
  const { mutate: deleteSongMutation, isPending: isDeleting } = useDeleteSong();
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKey, setSelectedKey] = useState('all');

  const filteredSongs = useMemo(() => {
    return songs.filter(song => {
      const matchesSearch =
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesKey = selectedKey === 'all' || song.key === selectedKey;
      return matchesSearch && matchesKey;
    });
  }, [songs, searchQuery, selectedKey]);

  const availableKeys = useMemo(() => {
    const keys = new Set(songs.map(song => song.key).filter(Boolean));
    return ['all', ...Array.from(keys)];
  }, [songs]);

  const handleAgentSave = (result: SearchResult, type: 'chord' | 'tab') => {
    setStatus({ type: 'info', message: '⬇️ Downloading...' });
    downloadSong(
      {
        artist: result.artist,
        title: result.title,
        chordId: type === 'chord' ? result.id : undefined,
        tabId: type === 'tab' ? result.id : undefined,
      },
      {
        onSuccess: (data) => {
          setStatus({
            type: 'success',
            message: `✨ "${data.summary.title}" added to your library!`
          });
          router.push(`/songs/${data.summary.artistSlug}/${data.summary.songSlug}`);
        },
        onError: (error) => {
          setStatus({ type: 'error', message: `❌ ${error.message}` });
        },
      }
    );
  };

  const handleDelete = (artistSlug: string, songSlug: string, title: string) => {
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
        onError: (error) => {
          setStatus({ type: 'error', message: error.message || 'Failed to delete song.' });
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Quick Filter</CardTitle>
          <CardDescription className="text-xs">
            Search your library by title, artist, or key
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Search songs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <select
              value={selectedKey}
              onChange={event => setSelectedKey(event.target.value)}
              className="w-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {availableKeys.map(key => (
                <option key={key} value={key}>
                  {key === 'all' ? 'All Keys' : key}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {filteredSongs.map(song => (
              <div
                key={`${song.artistSlug}/${song.songSlug}`}
                className="group rounded-lg border border-border/40 p-3 transition-all hover:border-border hover:bg-accent/30 hover:shadow-sm"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/songs/${song.artistSlug}/${song.songSlug}`}
                      className="font-medium text-sm hover:text-primary transition-colors block truncate"
                    >
                      {song.title}
                    </Link>
                    <Link
                      href={`/songs/${song.artistSlug}`}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {song.artist}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    {song.key && (
                      <div className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                        {song.key}
                      </div>
                    )}
                    <button
                      onClick={() => handleDelete(song.artistSlug, song.songSlug, song.title)}
                      disabled={isDeleting}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded text-destructive disabled:opacity-50"
                      title="Delete song"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Add New Song</CardTitle>
          <CardDescription className="text-xs">
            Chat with the agent to find and import songs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AgentChat onSave={handleAgentSave} isSaving={isDownloading} />

          {status && (
            <div
              className={cn(
                'mt-4 rounded-lg border p-4 text-sm',
                status.type === 'success' && 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200',
                status.type === 'error' && 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200',
                status.type === 'info' && 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200'
              )}
            >
              {status.message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
