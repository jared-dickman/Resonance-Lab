'use client';

import { type FormEvent, useState, useMemo } from 'react';
import { Download, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { downloadSong, searchLibrary } from '@/lib/api';
import type { SearchResult, SearchResponse } from '@/lib/types';
import Link from 'next/link';
import { useSongs } from '@/lib/SongsContext';
import { useAsyncApi } from '@/lib/hooks/useAsyncApi';
import { PAGINATION } from '@/lib/constants/timing.constants';

interface StatusMessage {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function HomePage() {
  const { songs, refreshSongs } = useSongs();
  const searchApi = useAsyncApi(searchLibrary, 'Search failed');
  const downloadApi = useAsyncApi(downloadSong, 'Download failed');
  const [_status, setStatus] = useState<StatusMessage | null>(null);
  const [searchArtist, setSearchArtist] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [selectedChord, setSelectedChord] = useState<SearchResult | null>(null);
  const [selectedTab, setSelectedTab] = useState<SearchResult | null>(null);
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
    if (!searchTitle.trim() && !searchArtist.trim()) {
      setStatus({ type: 'error', message: 'Either artist or song title is required for search.' });
      return;
    }
    setStatus({ type: 'info', message: 'Searching Ultimate Guitar...' });
    const results = await searchApi.execute(searchArtist.trim(), searchTitle.trim());
    if (results) {
      setSearchResults(results);
      setSelectedChord(null);
      setSelectedTab(null);
      if (!results.chords.length && !results.tabs.length) {
        setStatus({ type: 'info', message: 'No results found. Try a different query.' });
      } else {
        setStatus(null);
      }
    } else if (searchApi.error) {
      setStatus({ type: 'error', message: searchApi.error });
    }
  };

  const handleDownload = async () => {
    if (!searchTitle.trim() && !selectedChord && !selectedTab) {
      setStatus({
        type: 'error',
        message: 'Provide a search query and select at least a chord result.',
      });
      return;
    }

    const artist = selectedChord?.artist || selectedTab?.artist || searchArtist.trim();
    const title = selectedChord?.title || selectedTab?.title || searchTitle.trim();

    if (!artist || !title) {
      setStatus({
        type: 'error',
        message: 'Select a chord result or provide both artist and title.',
      });
      return;
    }

    setStatus({ type: 'info', message: 'Downloading song and saving locally...' });
    const detail = await downloadApi.execute({
      artist,
      title,
      chordId: selectedChord?.id,
      tabId: selectedTab?.id,
    });
    if (detail) {
      setStatus({ type: 'success', message: `${detail.summary.title} saved successfully.` });
      await refreshSongs();
    } else if (downloadApi.error) {
      setStatus({ type: 'error', message: downloadApi.error });
    }
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
                  {song.key && (
                    <div className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                      {song.key}
                    </div>
                  )}
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
            Search by artist, song title, or both to find chords and tabs
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
                autoComplete="off"
              />
            </div>
            <Button type="submit" className="w-full" disabled={searchApi.isLoading}>
              {searchApi.isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  Searching...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </span>
              )}
            </Button>
          </form>

          {searchApi.isLoading && (
            <div className="mt-6 space-y-4">
              <div className="space-y-3">
                <Skeleton className="h-3.5 w-24" />
                {[...Array(PAGINATION.SONGS_PER_PAGE)].map((_, i) => (
                  <div key={i} className="rounded-lg border px-3 py-3">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          )}
          {!searchApi.isLoading && searchResults && (
            <div className="mt-6 space-y-5">
              <ResultList
                title="Chord Charts"
                results={searchResults.chords}
                selected={selectedChord?.id}
                onSelect={setSelectedChord}
              />
              <ResultList
                title="Tabs"
                results={searchResults.tabs}
                selected={selectedTab?.id}
                onSelect={setSelectedTab}
              />
              <Button
                className="w-full"
                size="lg"
                onClick={handleDownload}
                disabled={downloadApi.isLoading || (!selectedChord && !selectedTab)}
              >
                {downloadApi.isLoading ? (
                  <span className="flex items-center gap-2">
                    <Spinner />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Save to Library
                  </span>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ResultList({
  title,
  results,
  selected,
  onSelect,
}: {
  title: string;
  results: SearchResult[];
  selected: number | null | undefined;
  onSelect: (result: SearchResult | null) => void;
}) {
  if (!results.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      <div className="space-y-2">
        {results.map(result => {
          const isActive = selected === result.id;
          return (
            <button
              key={result.id}
              onClick={() => onSelect(isActive ? null : result)}
              className={`w-full rounded-lg border px-3.5 py-3 text-left text-sm transition-all ${
                isActive
                  ? 'border-primary bg-accent/50 shadow-sm'
                  : 'border-border/40 hover:border-border hover:bg-accent/30 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium text-foreground flex-1">{result.title}</span>
                <span className="text-xs text-muted-foreground shrink-0">{result.artist}</span>
              </div>
              <div className="mt-1.5 flex gap-3 text-xs text-muted-foreground">
                <span>★ {result.rating.toFixed(1)}</span>
                <span>•</span>
                <span>{result.votes} votes</span>
                <span>•</span>
                <span>Score {result.score.toFixed(2)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
