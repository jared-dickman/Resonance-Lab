"use client";

import { useEffect, useMemo, useState } from "react";

import { Song } from "@/lib/types";
import { SongControls, KEY_SIGNATURES } from "@/components/SongControls";
import VideoPlayer from "@/components/VideoPlayer";
import { transposeChord } from "@/lib/utils";

interface SongClientProps {
  song: Song;
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

export function SongClient({ song }: SongClientProps) {
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

  useEffect(() => {
    if (!isAutoScrollEnabled || typeof window === "undefined") {
      return;
    }

    let frameId: number;
    let lastTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (!isAutoScrollEnabled) return;

      if (lastTimestamp === null) {
        lastTimestamp = timestamp;
        frameId = requestAnimationFrame(step);
        return;
      }

      const elapsedSeconds = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;
      const pixelsPerSecond = bpm > 0 ? (bpm / 60) * SCROLL_PIXELS_PER_BEAT : 0;
      const scrollDelta = pixelsPerSecond * elapsedSeconds;

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const nextScroll = Math.min(window.scrollY + scrollDelta, maxScroll);
      window.scrollTo({ top: nextScroll });

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
    <div>
      <h1 className="text-3xl font-bold">{song.title}</h1>
      <h2 className="text-xl text-gray-500">{song.artist}</h2>

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

      <VideoPlayer artist={song.artist} title={song.title} initialVideoId={song.videoId} />

      <div className="mt-4">
        {transposedSections.map((section, sectionIndex) => (
          <div key={`${section.name}-${sectionIndex}`} className="mt-4">
            <h3 className="text-lg font-semibold">{section.name}</h3>
            {section.lines.map((line, lineIndex) => (
              <div key={`${sectionIndex}-${lineIndex}`} className="relative mb-4">
                {line.chord?.name && (
                  <div className="font-bold text-purple-400">{line.chord.name}</div>
                )}
                <div className="text-lg">{line.lyric}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SongClient;
