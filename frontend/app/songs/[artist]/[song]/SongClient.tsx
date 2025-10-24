"use client";

import { KEY_SIGNATURES, SongControls } from "@/components/SongControls";
import { Song } from "@/lib/types";
import { transposeChord } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import styles from "./SongClient.module.css";
import { ChordDisplay } from "@/components/ChordDisplay";
import { PianoDisplay } from "@/components/PianoDisplay";
import { ChordJourneyVisualization } from "@/components/ChordJourneyVisualization";
import { ChordRhythmGame } from "@/components/ChordRhythmGame";
import { LoopPracticeMode } from "@/components/LoopPracticeMode";
import { Button } from "@/components/ui/button";
import { Guitar, Piano } from "lucide-react";

interface SongClientProps {
  song: Song;
  artistSlug: string;
}

const getNormalizedKey = (key?: string) => {
  if (!key) return "C";
  const match = key.match(/^([A-G][#b]?)/);
  return match ? match[1] : "C";
};

const getKeyIndex = (key: string) => {
  const index = KEY_SIGNATURES.indexOf(key as typeof KEY_SIGNATURES[number]);
  return index === -1 ? KEY_SIGNATURES.indexOf("C") : index;
};

export function SongClient({ song, artistSlug }: SongClientProps) {
  const normalizedOriginalKey = getNormalizedKey(song.key);
  const originalKeyIndex = getKeyIndex(normalizedOriginalKey);

  const [transpose, setTranspose] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(false);
  const [currentChord, setCurrentChord] = useState<string | null>(null);
  const [instrument, setInstrument] = useState<"guitar" | "piano">("guitar");

  const transposeForKey = ((transpose % 12) + 12) % 12;
  const currentKey = KEY_SIGNATURES[(originalKeyIndex + transposeForKey) % 12];

  const transposedSections = useMemo(() => {
    if (transpose === 0) {
      return song.sections;
    }

    return song.sections.map((section) => ({
      ...section,
      lines: section.lines.map((line) => {
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
  const chordElementsRef = useRef<Map<string, { element: HTMLSpanElement; chordName: string }>>(new Map());

  /**
   * Calculate precise scroll speed based on song structure and BPM
   *
   * Algorithm:
   * 1. Count total chord changes (each represents a musical measure/beat progression)
   * 2. Measure actual scrollable height in pixels
   * 3. Calculate pixels per chord change
   * 4. Convert BPM to pixels per second
   *
   * Assumptions:
   * - Each chord change represents ~2 beats (typical measure)
   * - BPM is beats per minute
   * - We want smooth continuous scroll that matches song tempo
   */
  const calculateScrollSpeed = (currentBpm: number): number => {
    if (!lyricsContainerRef.current || currentBpm <= 0) return 0;

    // Count total chord changes in the song
    const totalChordChanges = transposedSections.reduce((total, section) => {
      return total + section.lines.filter(line => line.chord?.name).length;
    }, 0);

    if (totalChordChanges === 0) return 0;

    // Measure scrollable height
    const container = lyricsContainerRef.current;
    const totalScrollableHeight = container.scrollHeight - container.clientHeight;

    if (totalScrollableHeight <= 0) return 0;

    // Calculate pixels per chord change
    const pixelsPerChordChange = totalScrollableHeight / totalChordChanges;

    // Assume each chord change represents 2 beats (typical measure)
    const beatsPerChordChange = 2;

    // Convert BPM to beats per second
    const beatsPerSecond = currentBpm / 60;

    // Calculate chord changes per second
    const chordChangesPerSecond = beatsPerSecond / beatsPerChordChange;

    // Finally: pixels per second
    const pixelsPerSecond = pixelsPerChordChange * chordChangesPerSecond;

    return pixelsPerSecond;
  };

  // Set the first chord as default
  useEffect(() => {
    const firstChord = transposedSections
      .flatMap((section) => section.lines)
      .find((line) => line.chord?.name)?.chord?.name;
    setCurrentChord(firstChord || null);
  }, [transposedSections]);

  // Track visible chords during auto-scroll
  useEffect(() => {
    if (!isAutoScrollEnabled || !lyricsContainerRef.current) return;

    const container = lyricsContainerRef.current;
    const checkInterval = setInterval(() => {
      const containerRect = container.getBoundingClientRect();
      const centerY = containerRect.top + 100; // Check slightly below top

      // Find the chord element closest to the center
      let closestChord: { name: string; distance: number } | null = null;

      chordElementsRef.current.forEach(({ element, chordName }) => {
        const rect = element.getBoundingClientRect();
        const distance = Math.abs(rect.top - centerY);

        if (
          rect.top >= containerRect.top &&
          rect.bottom <= containerRect.bottom &&
          (!closestChord || distance < closestChord.distance)
        ) {
          closestChord = { name: chordName, distance };
        }
      });

      if (closestChord && closestChord.name !== currentChord) {
        setCurrentChord(closestChord.name);
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, [isAutoScrollEnabled, currentChord]);

  useEffect(() => {
    if (!isAutoScrollEnabled || typeof window === "undefined" || !lyricsContainerRef.current) {
      return;
    }

    let frameId: number;
    let lastTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (!isAutoScrollEnabled || !lyricsContainerRef.current) return;

      if (lastTimestamp === null) {
        lastTimestamp = timestamp;
        frameId = requestAnimationFrame(step);
        return;
      }

      const elapsedSeconds = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;
      const pixelsPerSecond = calculateScrollSpeed(bpm);
      const scrollDelta = pixelsPerSecond * elapsedSeconds;

      const maxScroll = lyricsContainerRef.current.scrollHeight - lyricsContainerRef.current.clientHeight;
      const nextScroll = Math.min(lyricsContainerRef.current.scrollTop + scrollDelta, maxScroll);
      lyricsContainerRef.current.scrollTop = nextScroll; // Scroll the container

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
    setIsAutoScrollEnabled((prev) => !prev);
  };

  return (
    <div className={styles.songContainer}>
      <h1 className={styles.songTitle}>{song.title}</h1>
      <h2 className={styles.songArtist}>
        <Link href={`/songs/${artistSlug}`} className="hover:underline">
          {song.artist}
        </Link>
      </h2>

      <SongControls
        transpose={transpose}
        onTransposeChange={handleTransposeChange}
        currentKey={currentKey}
        onKeyChange={handleKeyChange}
        bpm={bpm}
        onBpmChange={setBpm}
        isAutoScrollEnabled={isAutoScrollEnabled}
        onToggleAutoScroll={toggleAutoScroll}
        originalKey={song.key}
      />

      {/* Lyrics Container */}
      <div ref={lyricsContainerRef} className={styles.lyricsContainer}>
        {transposedSections.map((section, sectionIndex) => (
          <div key={`${section.name}-${sectionIndex}`} className={styles.section}>
            <h3 className={styles.sectionTitle}>{section.name}</h3>
            {section.lines.map((line, lineIndex) => {
              const chordKey = `${sectionIndex}-${lineIndex}`;
              const isActive = line.chord?.name === currentChord;

              return (
                <div key={chordKey} className={styles.line}>
                  {line.chord?.name && (
                    <span
                      ref={(el) => {
                        if (el && line.chord?.name) {
                          chordElementsRef.current.set(chordKey, { element: el, chordName: line.chord.name });
                        }
                      }}
                      className={`${styles.chord} ${isActive ? styles.chordActive : ""}`}
                      onClick={() => setCurrentChord(line.chord!.name)}
                      style={{ cursor: "pointer" }}
                      title="Click to view chord diagram"
                    >
                      {line.chord.name}
                    </span>
                  )}
                  <span className={styles.lyric}>{line.lyric}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Instrument Toggle and Display */}
      <div className="mt-6">
        {/* Instrument Toggle */}
        <div className="flex gap-2 justify-center bg-muted/40 p-3 rounded-lg border border-border/40 max-w-md mx-auto mb-4">
          <Button
            variant={instrument === "guitar" ? "default" : "outline"}
            size="sm"
            onClick={() => setInstrument("guitar")}
            className="gap-2 flex-1"
          >
            <Guitar className="h-4 w-4" />
            Guitar
          </Button>
          <Button
            variant={instrument === "piano" ? "default" : "outline"}
            size="sm"
            onClick={() => setInstrument("piano")}
            className="gap-2 flex-1"
          >
            <Piano className="h-4 w-4" />
            Piano
          </Button>
        </div>

        {/* Instrument Display */}
        {instrument === "guitar" ? (
          <ChordDisplay chordName={currentChord} />
        ) : (
          <PianoDisplay chordName={currentChord} />
        )}
      </div>

      {/* Loop Practice Mode */}
      <LoopPracticeMode
        song={song}
        bpm={bpm}
        onBpmChange={setBpm}
        isAutoScrollEnabled={isAutoScrollEnabled}
        onToggleAutoScroll={toggleAutoScroll}
        lyricsContainerRef={lyricsContainerRef}
        className="mt-6"
      />

      {/* Chord Journey Visualization */}
      <ChordJourneyVisualization
        song={song}
        currentChord={currentChord}
        onChordClick={(chord, sectionIndex, lineIndex) => {
          setCurrentChord(chord);
          setIsAutoScrollEnabled(false);
        }}
        className="mt-6"
      />

      {/* Chord Hero Rhythm Game */}
      <ChordRhythmGame
        song={song}
        bpm={bpm}
        onChordHit={(chord) => {
          setCurrentChord(chord);
        }}
        className="mt-6"
      />
    </div>
  );
}

export default SongClient;
