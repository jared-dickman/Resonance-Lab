
"use client";

import { useState, useMemo } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Song } from "@/lib/types";
import { transposeChord } from "@/lib/utils";

interface SongControlsProps {
  song: Song;
}

const KEY_SIGNATURES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function SongControls({ song }: SongControlsProps) {
  const [transpose, setTranspose] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [currentKey, setCurrentKey] = useState(song.key || 'C');

  const transposedSong = useMemo(() => {
    if (transpose === 0) return song;
    const newSong = JSON.parse(JSON.stringify(song));
    newSong.sections.forEach(section => {
      section.lines.forEach(line => {
        if (line.chord && line.chord.name) {
          line.chord.name = transposeChord(line.chord.name, transpose);
        }
      });
    });
    return newSong;
  }, [song, transpose]);

  const handleKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newKey = e.target.value;
    const originalKeyIndex = KEY_SIGNATURES.indexOf(song.key || 'C');
    const newKeyIndex = KEY_SIGNATURES.indexOf(newKey);
    const diff = newKeyIndex - originalKeyIndex;
    setTranspose(diff);
    setCurrentKey(newKey);
  };

  return (
    <div className="flex items-center space-x-4 my-4">
      <div className="flex items-center space-x-2">
        <Button onClick={() => setTranspose(transpose - 1)}>-</Button>
        <Badge>{transpose}</Badge>
        <Button onClick={() => setTranspose(transpose + 1)}>+</Button>
      </div>
      <div className="flex items-center space-x-2">
        <label htmlFor="key-selector">Key:</label>
        <select id="key-selector" value={currentKey} onChange={handleKeyChange} className="bg-gray-800 text-white p-2 rounded">
          {KEY_SIGNATURES.map(key => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center space-x-2">
        <label htmlFor="bpm-input">BPM:</label>
        <Input
          id="bpm-input"
          type="number"
          value={bpm}
          onChange={(e) => setBpm(parseInt(e.target.value, 10))}
          className="w-24"
        />
      </div>
    </div>
  );
}
