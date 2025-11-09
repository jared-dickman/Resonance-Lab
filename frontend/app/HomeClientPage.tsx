'use client';

import { type FormEvent, useState, useMemo } from 'react';
import { Download, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { searchLibrary } from '@/lib/api';
import Link from 'next/link';
import { useSongs, useDownloadSong, useDeleteSong } from '@/app/features/songs/hooks';
import { useAsyncApi } from '@/lib/hooks/useAsyncApi';

interface StatusMessage {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function HomePage() {
  const { data: songs = [] } = useSongs();
  const searchApi = useAsyncApi(searchLibrary, 'Search failed');
  const { mutate: downloadSong, isPending: isDownloading } = useDownloadSong();
  const { mutate: deleteSongMutation, isPending: isDeleting } = useDeleteSong();
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [searchArtist, setSearchArtist] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
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

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    if (!searchTitle.trim()) {
      setStatus({ type: 'error', message: '🎸 Song title is required!' });
      return;
    }

    setStatus({ type: 'info', message: '🔍 Searching Ultimate Guitar...' });
    const results = await searchApi.execute(searchArtist.trim(), searchTitle.trim());

    if (!results) {
      setStatus({ type: 'error', message: searchApi.error || '❌ Search failed' });
      return;
    }

    if (!results.chords.length && !results.tabs.length) {
      setStatus({ type: 'info', message: '🤔 No results found. Try a different search.' });
      return;
    }

    // Auto-download the best rated version
    const bestChord = results.chords[0];
    const bestTab = results.tabs[0];

    setStatus({ type: 'info', message: '⬇️ Downloading best version...' });
    downloadSong(
      {
        artist: bestChord?.artist || bestTab?.artist || searchArtist.trim(),
        title: bestChord?.title || bestTab?.title || searchTitle.trim(),
        chordId: bestChord?.id,
        tabId: bestTab?.id,
      },
      {
        onSuccess: (data) => {
          setStatus({
            type: 'success',
            message: `✨ "${data.summary.title}" by ${data.summary.artist} added to your library! 🎉`
          });
          setSearchArtist('');
          setSearchTitle('');
          setTimeout(() => setStatus(null), 5000);
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
            Import chords and tabs from Ultimate Guitar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSearch}>
            <div className="space-y-2">
              <label className="text-xs font-medium" htmlFor="artist">
                Artist
              </label>
              <Input
                id="artist"
                placeholder="e.g. Ben E. King"
                value={searchArtist}
                onChange={event => setSearchArtist(event.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium" htmlFor="title">
                Song Title
              </label>
              <Input
                id="title"
                placeholder="e.g. Stand By Me"
                value={searchTitle}
                onChange={event => setSearchTitle(event.target.value)}
                required
                autoComplete="off"
              />
            </div>
            <Button type="submit" className="w-full" disabled={searchApi.isLoading || isDownloading}>
              {searchApi.isLoading || isDownloading ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  {searchApi.isLoading ? 'Searching...' : 'Saving...'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Add to Library
                </span>
              )}
            </Button>
          </form>

          {status && (
            <div
              className={`mt-4 rounded-lg border p-4 text-sm ${
                status.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200'
                  : status.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200'
                  : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200'
              }`}
            >
              {status.message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
