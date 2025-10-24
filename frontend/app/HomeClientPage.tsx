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
    if (!searchTitle.trim()) {
      setStatus({ type: 'error', message: 'Song title is required for search.' });
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
          <CardTitle className="text-lg">Filter Songs</CardTitle>
          <CardDescription>Filter songs by key and search by title or artist.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search by title or artist..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <select
              value={selectedKey}
              onChange={event => setSelectedKey(event.target.value)}
              className="w-[180px] rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {availableKeys.map(key => (
                <option key={key} value={key}>
                  {key === 'all' ? 'All Keys' : key}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            {filteredSongs.map(song => (
              <div key={`${song.artistSlug}/${song.songSlug}`} className="rounded-md border p-3">
                <div className="flex justify-between">
                  <div>
                    <Link
                      href={`/songs/${song.artistSlug}/${song.songSlug}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {song.title}
                    </Link>
                    <div className="text-sm text-muted-foreground">
                      <Link
                        href={`/songs/${song.artistSlug}`}
                        className="hover:text-foreground transition-colors"
                      >
                        {song.artist}
                      </Link>
                    </div>
                  </div>
                  {song.key && <div className="text-sm text-muted-foreground">Key: {song.key}</div>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Ultimate Guitar</CardTitle>
          <CardDescription>
            Pick a chord and optional tab to import into your library.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSearch}>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="artist">
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
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="title">
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
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                {[...Array(PAGINATION.SONGS_PER_PAGE)].map((_, i) => (
                  <div key={i} className="rounded-md border px-3 py-2">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          )}
          {!searchApi.isLoading && searchResults && (
            <div className="mt-6 space-y-4">
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
                variant="secondary"
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
                    Download Selection
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
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase text-muted-foreground">{title}</div>
      <div className="space-y-2">
        {results.map(result => {
          const isActive = selected === result.id;
          return (
            <button
              key={result.id}
              onClick={() => onSelect(isActive ? null : result)}
              className={`w-full rounded-md border px-3 py-2 text-left text-sm transition hover:border-primary hover:bg-muted ${
                isActive ? 'border-primary bg-muted' : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{result.title}</span>
                <span className="text-xs text-muted-foreground">{result.artist}</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Rating {result.rating.toFixed(1)} • Votes {result.votes} • Score{' '}
                {result.score.toFixed(2)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

