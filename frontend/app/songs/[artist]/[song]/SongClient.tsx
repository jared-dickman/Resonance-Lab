"use client";

import { KEY_SIGNATURES, SongControls } from "@/components/SongControls";
import { Song } from "@/lib/types";
import { transposeChord } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import styles from "./SongClient.module.css";

interface SongClientProps {
  song: Song;
  artistSlug: string;
}

const SCROLL_PIXELS_PER_BEAT = 40;

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

  const lyricsContainerRef = useRef<HTMLDivElement>(null); // Ref for the lyrics container

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
      const pixelsPerSecond = bpm > 0 ? (bpm / 60) * SCROLL_PIXELS_PER_BEAT : 0;
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
  }, [isAutoScrollEnabled, bpm]);

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

      <div ref={lyricsContainerRef} className={styles.lyricsContainer}>
        {transposedSections.map((section, sectionIndex) => (
          <div key={`${section.name}-${sectionIndex}`} className={styles.section}>
            <h3 className={styles.sectionTitle}>{section.name}</h3>
            {section.lines.map((line, lineIndex) => (
              <div key={`${sectionIndex}-${lineIndex}`} className={styles.line}>
                {line.chord?.name && (
                  <span className={styles.chord}>{line.chord.name}</span>
                )}
                <span className={styles.lyric}>{line.lyric}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SongClient;
