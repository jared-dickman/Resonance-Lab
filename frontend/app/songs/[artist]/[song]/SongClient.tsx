'use client';

import { KEY_SIGNATURES, SongToolbar } from '@/components/SongToolbar';
import type { Song } from '@/lib/types';
import { transposeChord } from '@/lib/utils';
import { calculateScrollSpeed } from '@/lib/utils/song/scrollSpeed';
import type { ChordElementInfo } from '@/lib/utils/song/chordTracking';
import { findClosestVisibleChord } from '@/lib/utils/song/chordTracking';
import { detectKey } from '@/lib/music-theory/tonal-helper';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './SongClient.module.css';
import { ChordDisplay } from '@/components/ChordDisplay';
import { PianoDisplay } from '@/components/PianoDisplay';
import { ChordJourneyVisualization } from '@/components/ChordJourneyVisualization';
import { ChordRhythmGame } from '@/components/ChordRhythmGame';
import { LoopPracticeMode } from '@/components/LoopPracticeMode';
import { Button } from '@/components/ui/button';
import { Guitar, Piano } from 'lucide-react';
import { useGuitarPlayback } from '@/lib/hooks';
import IntelligentMusicPanel from '@/components/music-theory/IntelligentMusicPanel';
import { useDeleteSong } from '@/app/features/songs/hooks';
import { useRouter } from 'next/navigation';
import { CollapsibleSongSection } from '@/components/CollapsibleSongSection';

interface SongClientProps {
  song: Song;
  artistSlug: string;
  songSlug: string;
}

const getNormalizedKey = (key?: string) => {
  if (!key) return null;
  const match = key.match(/^([A-G][#b]?)/);
  return match ? match[1] : null;
};

const getKeyIndex = (key: string) => {
  const index = KEY_SIGNATURES.indexOf(key as (typeof KEY_SIGNATURES)[number]);
  return index === -1 ? KEY_SIGNATURES.indexOf('C') : index;
};

// Extract all chords from song sections for key detection
const extractChordsFromSong = (song: Song): string[] => {
  const chords: string[] = [];
  for (const section of song.sections) {
    for (const line of section.lines) {
      if (line.chord?.name) {
        chords.push(line.chord.name);
      }
    }
  }
  return chords;
};

export function SongClient({ song, artistSlug, songSlug }: SongClientProps): React.JSX.Element {
  const router = useRouter();

  // Detect key from chords if not provided or unreliable
  const detectedKey = useMemo(() => {
    const chords = extractChordsFromSong(song);
    if (chords.length === 0) return null;
    const result = detectKey(chords);
    // Return tonic with 'm' suffix for minor keys
    if (result) {
      return result.type === 'minor' ? `${result.tonic}m` : result.tonic;
    }
    return null;
  }, [song]);

  // Use detected key, falling back to song.key, then 'C'
  const effectiveKey = detectedKey || getNormalizedKey(song.key) || 'C';
  const originalKeyIndex = getKeyIndex(effectiveKey.replace('m', ''));

  const [transpose, setTranspose] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(false);
  const [currentChord, setCurrentChord] = useState<string | null>(null);
  const [instrument, setInstrument] = useState<'guitar' | 'piano'>('guitar');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [showChords, setShowChords] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem(`show-chords-${artistSlug}-${songSlug}`);
    return saved === null ? true : saved === 'true';
  });

  const { mutate: deleteSongMutation, isPending: isDeleting } = useDeleteSong();

  // Persist showChords to localStorage
  useEffect(() => {
    localStorage.setItem(`show-chords-${artistSlug}-${songSlug}`, String(showChords));
  }, [showChords, artistSlug, songSlug]);

  // Initialize guitar playback
  useGuitarPlayback({
    enabled: isAutoScrollEnabled && isAudioEnabled,
    currentChord,
    preset: 'strumming',
    volume: -6,
  });

  const transposeForKey = ((transpose % 12) + 12) % 12;
  const currentKey = KEY_SIGNATURES[(originalKeyIndex + transposeForKey) % 12];

  const transposedSections = useMemo(() => {
    if (transpose === 0) {
      return song.sections;
    }

    return song.sections.map(section => ({
      ...section,
      lines: section.lines.map(line => {
        if (!line.chord?.name) {
          return { ...line };
        }

        return {
          ...line,
          chord: {
            ...line.chord,
            name: transposeChord(line.chord.name, transpose),
          },
        };
      }),
    }));
  }, [song.sections, transpose]);

  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const chordElementsRef = useRef<Map<string, ChordElementInfo>>(new Map());

  useEffect(() => {
    const firstChord = transposedSections
      .flatMap(section => section.lines)
      .find(line => line.chord?.name)?.chord?.name;
    setCurrentChord(firstChord ?? null);
  }, [transposedSections]);

  useEffect(() => {
    if (!isAutoScrollEnabled || !lyricsContainerRef.current) return;

    const container = lyricsContainerRef.current;
    const checkInterval = setInterval(() => {
      const containerRect = container.getBoundingClientRect();
      const centerY = containerRect.top + 100;

      const closestChordName = findClosestVisibleChord(
        chordElementsRef.current,
        containerRect,
        centerY
      );

      if (closestChordName !== null && closestChordName !== currentChord) {
        setCurrentChord(closestChordName);
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, [isAutoScrollEnabled, currentChord]);

  useEffect(() => {
    if (!isAutoScrollEnabled || typeof window === 'undefined' || !lyricsContainerRef.current) {
      return;
    }

    let frameId: number;
    let lastTimestamp: number | null = null;

    const step = (timestamp: number): void => {
      if (!isAutoScrollEnabled || !lyricsContainerRef.current) return;

      if (lastTimestamp === null) {
        lastTimestamp = timestamp;
        frameId = requestAnimationFrame(step);
        return;
      }

      const elapsedSeconds = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;
      const pixelsPerSecond = calculateScrollSpeed(
        lyricsContainerRef.current,
        transposedSections,
        bpm
      );
      const scrollDelta = pixelsPerSecond * elapsedSeconds;

      const maxScroll =
        lyricsContainerRef.current.scrollHeight - lyricsContainerRef.current.clientHeight;
      const nextScroll = Math.min(lyricsContainerRef.current.scrollTop + scrollDelta, maxScroll);
      lyricsContainerRef.current.scrollTop = nextScroll;

      if (nextScroll >= maxScroll) {
        setIsAutoScrollEnabled(false);
        return;
      }

      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      lastTimestamp = null;
    };
  }, [isAutoScrollEnabled, bpm, transposedSections]);

  const handleTransposeChange = (next: number) => {
    setIsAutoScrollEnabled(false);
    setTranspose(next);
  };

  const handleKeyChange = (key: string) => {
    const nextIndex = getKeyIndex(key);
    let diff = nextIndex - originalKeyIndex;
    if (diff > 6) diff -= 12;
    if (diff < -6) diff += 12;
    handleTransposeChange(diff);
  };

  const toggleAutoScroll = () => {
    setIsAutoScrollEnabled(prev => !prev);
  };

  const toggleChords = () => {
    setShowChords(prev => !prev);
  };

  const handleDelete = () => {
    if (!confirm(`Are you sure you want to delete "${song.title}"? This cannot be undone.`)) {
      return;
    }

    deleteSongMutation(
      { artistSlug, songSlug },
      {
        onSuccess: () => {
          router.push('/');
        },
      }
    );
  };

  return (
    <div className={styles.songContainer}>
      {/* Compact Toolbar - Linear/Stripe inspired */}
      <SongToolbar
        transpose={transpose}
        onTransposeChange={handleTransposeChange}
        currentKey={currentKey ?? 'C'}
        onKeyChange={handleKeyChange}
        originalKey={effectiveKey}
        bpm={bpm}
        onBpmChange={setBpm}
        isAutoScrollEnabled={isAutoScrollEnabled}
        onToggleAutoScroll={toggleAutoScroll}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={() => setIsAudioEnabled(!isAudioEnabled)}
        onDelete={handleDelete}
        isDeleting={isDeleting}
        showChords={showChords}
        onToggleChords={toggleChords}
      />

      {/* Lyrics Container */}
      <div ref={lyricsContainerRef} className={styles.lyricsContainer}>
        {transposedSections.map((section, sectionIndex) => {
          // Group lines that should appear together (Ultimate Guitar style)
          const groupedLines: Array<typeof section.lines> = [];
          let currentGroup: typeof section.lines = [];

          section.lines.forEach((line, idx) => {
            currentGroup.push(line);

            // Start a new group if this line ends with punctuation or is the last line
            // or if the next line starts with a capital letter (new sentence)
            const isLastLine = idx === section.lines.length - 1;
            const nextLine = section.lines[idx + 1];
            const endsWithPunctuation = /[.!?,;\n]$/.test(line.lyric.trim());
            const nextStartsCapital = nextLine && /^[A-Z]/.test(nextLine.lyric.trim());

            if (isLastLine || endsWithPunctuation || nextStartsCapital) {
              groupedLines.push([...currentGroup]);
              currentGroup = [];
            }
          });

          return (
            <CollapsibleSongSection
              key={`${section.name}-${sectionIndex}`}
              sectionName={section.name}
              sectionIndex={sectionIndex}
              songId={`${artistSlug}-${songSlug}`}
              className="mb-4"
            >
              {groupedLines.map((lineGroup, groupIndex) => {
                // Calculate chord positions and build combined lyric
                let combinedLyric = '';
                const chordPositions: Array<{ position: number; chord: string; lineIdx: number }> = [];

                lineGroup.forEach((line, localIdx) => {
                  if (line.chord?.name) {
                    chordPositions.push({
                      position: combinedLyric.length,
                      chord: line.chord.name,
                      lineIdx: groupIndex * 10 + localIdx, // Unique index for refs
                    });
                  }
                  combinedLyric += line.lyric;
                });

                return (
                  <div key={`group-${groupIndex}`} className={styles.lineGroup}>
                    {/* Chord line with positioned chords (Ultimate Guitar style) */}
                    {showChords && chordPositions.length > 0 && (
                      <div className={styles.chordLine}>
                        {chordPositions.map((chordPos, idx) => {
                          const isActive = chordPos.chord === currentChord;
                          const chordKey = `${sectionIndex}-${chordPos.lineIdx}`;

                          return (
                            <span
                              key={idx}
                              ref={el => {
                                if (el) {
                                  chordElementsRef.current.set(chordKey, {
                                    element: el,
                                    chordName: chordPos.chord,
                                  });
                                }
                              }}
                              className={`${styles.chord} ${isActive ? styles.chordActive : ''}`}
                              onClick={() => setCurrentChord(chordPos.chord)}
                              title="Click to view chord diagram"
                              style={{
                                position: 'absolute',
                                left: `${chordPos.position * 0.6}ch`, // Approximate character width
                              }}
                            >
                              {chordPos.chord}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    {/* Lyric line */}
                    <div className={styles.lyricLine}>{combinedLyric}</div>
                  </div>
                );
              })}
            </CollapsibleSongSection>
          );
        })}
      </div>

      {/* Instrument Toggle and Display */}
      <div className="mt-6">
        {/* Instrument Toggle */}
        <div className="flex gap-2 justify-center bg-[#0a1744]/30 p-3 rounded-lg border border-sapphire-500/15 max-w-md mx-auto mb-4">
          <Button
            variant={instrument === 'guitar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInstrument('guitar')}
            className="gap-2 flex-1"
          >
            <Guitar className="h-4 w-4" />
            Guitar
          </Button>
          <Button
            variant={instrument === 'piano' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInstrument('piano')}
            className="gap-2 flex-1"
          >
            <Piano className="h-4 w-4" />
            Piano
          </Button>
        </div>

        {/* Instrument Display */}
        {instrument === 'guitar' ? (
          <ChordDisplay chordName={currentChord} />
        ) : (
          <PianoDisplay chordName={currentChord} />
        )}
      </div>

      {/* 🎯 INTELLIGENT MUSIC ENGINE - THE UNIVERSE-SAVING FEATURE */}
      <IntelligentMusicPanel
        chords={transposedSections
          .flatMap(s => s.lines)
          .filter(l => l.chord?.name)
          .map(l => l.chord!.name)}
        currentChordIndex={transposedSections
          .flatMap(s => s.lines)
          .filter(l => l.chord?.name)
          .findIndex(l => l.chord!.name === currentChord)}
        onChordClick={chord => {
          setCurrentChord(chord);
          setIsAutoScrollEnabled(false);
        }}
        onPlayChord={chord => {
          setCurrentChord(chord);
        }}
      />

      {/* Loop Practice Mode */}
      <LoopPracticeMode
        song={song}
        bpm={bpm}
        onBpmChange={setBpm}
        isAutoScrollEnabled={isAutoScrollEnabled}
        onToggleAutoScroll={toggleAutoScroll}
        lyricsContainerRef={lyricsContainerRef as React.RefObject<HTMLDivElement>}
        className="mt-6"
      />

      {/* Chord Journey Visualization */}
      <ChordJourneyVisualization
        song={song}
        currentChord={currentChord}
        onChordClick={chord => {
          setCurrentChord(chord);
          setIsAutoScrollEnabled(false);
        }}
        className="mt-6"
      />

      {/* Chord Hero Rhythm Game */}
      <ChordRhythmGame
        song={song}
        bpm={bpm}
        onChordHit={chord => {
          setCurrentChord(chord);
        }}
        className="mt-6"
      />
    </div>
  );
}

export default SongClient;
