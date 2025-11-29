'use client';

import { createContext, useContext, useState, useMemo, useEffect, useCallback, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

type PageContext =
  | 'home'
  | 'artists'
  | 'artist'
  | 'song'
  | 'jam'
  | 'composer'
  | 'theory'
  | 'metronome'
  | 'songwriter'
  | 'pedalboard';

interface BuddyContextState {
  page: PageContext;
  artist?: string;
  song?: string;
  chords?: string[];
  key?: string;
}

interface BuddyContextType {
  context: BuddyContextState;
  setArtist: (artist: string | undefined) => void;
  setSong: (song: string | undefined) => void;
  setChords: (chords: string[] | undefined) => void;
  setKey: (key: string | undefined) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleBuddy: () => void;
}

const BuddyContext = createContext<BuddyContextType | undefined>(undefined);

function derivePageFromPathname(pathname: string): PageContext {
  if (pathname === '/') return 'home';
  if (pathname === '/artists') return 'artists';
  if (pathname.startsWith('/songs/')) {
    const parts = pathname.split('/').filter(Boolean);
    return parts.length === 3 ? 'song' : 'artist';
  }
  if (pathname === '/jam') return 'jam';
  if (pathname === '/composer') return 'composer';
  if (pathname === '/music-theory') return 'theory';
  if (pathname === '/metronome') return 'metronome';
  if (pathname === '/songwriter') return 'songwriter';
  if (pathname === '/pedalboard') return 'pedalboard';
  return 'home';
}

function extractArtistFromPathname(pathname: string): string | undefined {
  if (pathname.startsWith('/songs/')) {
    const parts = pathname.split('/').filter(Boolean);
    const artist = parts[1];
    if (parts.length >= 2 && artist) {
      return decodeURIComponent(artist);
    }
  }
  return undefined;
}

function extractSongFromPathname(pathname: string): string | undefined {
  if (pathname.startsWith('/songs/')) {
    const parts = pathname.split('/').filter(Boolean);
    const song = parts[2];
    if (parts.length >= 3 && song) {
      return decodeURIComponent(song);
    }
  }
  return undefined;
}

export function BuddyProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [manualArtist, setManualArtist] = useState<string>();
  const [manualSong, setManualSong] = useState<string>();
  const [chords, setChords] = useState<string[]>();
  const [key, setKey] = useState<string>();
  const [isOpen, setIsOpen] = useState(true); // Open by default

  const context = useMemo<BuddyContextState>(() => {
    const page = derivePageFromPathname(pathname);
    const pathArtist = extractArtistFromPathname(pathname);
    const pathSong = extractSongFromPathname(pathname);

    return {
      page,
      artist: manualArtist ?? pathArtist,
      song: manualSong ?? pathSong,
      chords,
      key,
    };
  }, [pathname, manualArtist, manualSong, chords, key]);

  const toggleBuddy = useCallback(() => setIsOpen(prev => !prev), []);

  // Ctrl+A keyboard shortcut to toggle buddy
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        // Don't trigger if user is typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
        e.preventDefault();
        toggleBuddy();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleBuddy]);

  return (
    <BuddyContext.Provider
      value={{
        context,
        setArtist: setManualArtist,
        setSong: setManualSong,
        setChords,
        setKey,
        isOpen,
        setIsOpen,
        toggleBuddy,
      }}
    >
      {children}
    </BuddyContext.Provider>
  );
}

export function useBuddy() {
  const ctx = useContext(BuddyContext);
  if (ctx === undefined) {
    return {
      context: { page: 'home' as const },
      setArtist: () => {},
      setSong: () => {},
      setChords: () => {},
      setKey: () => {},
      isOpen: false,
      setIsOpen: () => {},
      toggleBuddy: () => {},
    };
  }
  return ctx;
}
