'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  DEMO_SONGS,
  DEMO_RESPONSES,
  DEMO_TIMING,
  DEMO_STORAGE_KEY,
  type DemoState,
  type DemoSong,
} from '@/lib/constants/demo.constants';

interface UseBuddyDemoReturn {
  state: DemoState;
  currentSong: DemoSong;
  typedText: string;
  response1: string;
  response2: string;
  skip: () => void;
  reset: () => void;
  hasSeenDemo: boolean;
}

function getRandomSong(): DemoSong {
  const index = Math.floor(Math.random() * DEMO_SONGS.length);
  const song = DEMO_SONGS[index];
  if (!song) return DEMO_SONGS[0]!;
  return song;
}

function formatResponse(template: string, song: DemoSong): string {
  return template.replace('{title}', song.title).replace('{artist}', song.artist);
}

export function useBuddyDemo(): UseBuddyDemoReturn {
  const [state, setState] = useState<DemoState>('idle');
  const [currentSong] = useState<DemoSong>(() => getRandomSong());
  const [typedText, setTypedText] = useState('');
  const [response1, setResponse1] = useState('');
  const [response2, setResponse2] = useState('');
  const [hasSeenDemo, setHasSeenDemo] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check localStorage on mount
  useEffect(() => {
    const seen = localStorage.getItem(DEMO_STORAGE_KEY);
    if (seen === 'true') {
      setHasSeenDemo(true);
      setState('complete');
    } else {
      // Start demo after brief delay
      timeoutRef.current = setTimeout(() => setState('typing'), 800);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Typewriter effect for user query
  useEffect(() => {
    if (state !== 'typing') return;

    const query = currentSong.query;
    let charIndex = 0;

    const typeChar = () => {
      if (charIndex < query.length) {
        setTypedText(query.slice(0, charIndex + 1));
        charIndex++;
        timeoutRef.current = setTimeout(typeChar, DEMO_TIMING.CHAR_DELAY_MS);
      } else {
        // Done typing, submit after pause
        timeoutRef.current = setTimeout(() => setState('submitted'), 400);
      }
    };

    timeoutRef.current = setTimeout(typeChar, 300);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [state, currentSong.query]);

  // State machine progression
  useEffect(() => {
    if (state === 'submitted') {
      timeoutRef.current = setTimeout(() => setState('thinking_1'), 200);
    } else if (state === 'thinking_1') {
      timeoutRef.current = setTimeout(() => setState('response_1'), DEMO_TIMING.THINKING_DURATION_MS);
    } else if (state === 'response_1') {
      const responses = currentSong.isRickroll ? DEMO_RESPONSES.rickroll : DEMO_RESPONSES.standard;
      setResponse1(formatResponse(responses[0], currentSong));
      timeoutRef.current = setTimeout(() => setState('thinking_2'), DEMO_TIMING.RESPONSE_PAUSE_MS);
    } else if (state === 'thinking_2') {
      timeoutRef.current = setTimeout(() => setState('response_2'), DEMO_TIMING.THINKING_DURATION_MS);
    } else if (state === 'response_2') {
      const responses = currentSong.isRickroll ? DEMO_RESPONSES.rickroll : DEMO_RESPONSES.standard;
      setResponse2(formatResponse(responses[1], currentSong));
      timeoutRef.current = setTimeout(() => setState('cta'), DEMO_TIMING.CTA_DELAY_MS);
    } else if (state === 'cta') {
      localStorage.setItem(DEMO_STORAGE_KEY, 'true');
      setHasSeenDemo(true);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [state, currentSong]);

  const skip = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setState('complete');
    localStorage.setItem(DEMO_STORAGE_KEY, 'true');
    setHasSeenDemo(true);
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    setHasSeenDemo(false);
    setTypedText('');
    setResponse1('');
    setResponse2('');
    setState('idle');
    timeoutRef.current = setTimeout(() => setState('typing'), 500);
  }, []);

  return {
    state,
    currentSong,
    typedText,
    response1,
    response2,
    skip,
    reset,
    hasSeenDemo,
  };
}
