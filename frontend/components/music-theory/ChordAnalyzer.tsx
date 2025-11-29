'use client';

import { useState } from 'react';
import {
  analyzeChord,
  detectKey,
  suggestNextChords,
  transposeChord,
  generateWalkingBass,
  type ChordInfo,
  type KeyInfo,
} from '@/lib/music-theory/tonal-helper';
import { getChordPlayer } from '@/lib/audio/chordPlayer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/**
 * ChordAnalyzer - Interactive demo of Tonal.js capabilities
 * Shows chord analysis, key detection, and next-chord suggestions
 */
export function ChordAnalyzer() {
  const [inputChord, setInputChord] = useState('Cmaj7');
  const [chordInfo, setChordInfo] = useState<ChordInfo | null>(null);
  const [progression, setProgression] = useState<string[]>(['C', 'Am', 'F', 'G']);
  const [keyInfo, setKeyInfo] = useState<KeyInfo | null>(null);
  const [suggestions, setSuggestions] = useState<
    Array<{ chord: string; probability: number; reason: string }>
  >([]);

  const handleAnalyze = () => {
    const info = analyzeChord(inputChord);
    setChordInfo(info);

    if (info) {
      const key = detectKey([inputChord]);
      setKeyInfo(key);

      const next = suggestNextChords(inputChord, key?.tonic);
      setSuggestions(next);
    }
  };

  const handlePlayChord = async (chord: string) => {
    const player = getChordPlayer();
    if (!player.initialized) {
      await player.initialize();
    }
    player.playChord(chord, 2);
  };

  const handlePlayProgression = async () => {
    const player = getChordPlayer();
    if (!player.initialized) {
      await player.initialize();
    }

    progression.forEach((chord, i) => {
      setTimeout(() => {
        player.playChord(chord, 2);
      }, i * 2000);
    });
  };

  const handleTranspose = (semitones: number) => {
    const transposed = progression.map(chord => transposeChord(chord, semitones));
    setProgression(transposed.filter((c): c is string => c !== null));
  };

  const handleDetectKey = () => {
    const detected = detectKey(progression);
    setKeyInfo(detected);
  };

  const generateBassLine = () => {
    const bassNotes = generateWalkingBass(progression);
    return bassNotes;
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-sapphire-50 to-sapphire-100 rounded-lg">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-sapphire-900 mb-2">
          🎵 Tonal.js Music Theory Explorer
        </h2>
        <p className="text-sapphire-700">Intelligent chord analysis powered by music theory</p>
      </div>

      {/* Chord Analyzer */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-sapphire-800">Chord Analyzer</h3>

        <div className="flex gap-2 mb-4">
          <Input
            value={inputChord}
            onChange={e => setInputChord(e.target.value)}
            placeholder="Enter chord (e.g., Cmaj7, Am, G7)"
            className="flex-1"
          />
          <Button variant="default" onClick={handleAnalyze}>
            Analyze
          </Button>
          <Button variant="secondary" onClick={() => handlePlayChord(inputChord)}>
            Play
          </Button>
        </div>

        {chordInfo && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-sapphire-50 p-4 rounded-lg">
                <div className="text-sm text-sapphire-600 font-medium">Chord Name</div>
                <div className="text-lg font-bold text-sapphire-900">{chordInfo.name}</div>
              </div>

              <div className="bg-sapphire-50 p-4 rounded-lg">
                <div className="text-sm text-sapphire-600 font-medium">Quality</div>
                <div className="text-lg font-bold text-sapphire-900">
                  {chordInfo.quality || 'Unknown'}
                </div>
              </div>

              <div className="bg-sapphire-50 p-4 rounded-lg">
                <div className="text-sm text-sapphire-600 font-medium">Notes</div>
                <div className="text-lg font-bold text-sapphire-900">
                  {chordInfo.notes.join(' - ')}
                </div>
              </div>

              <div className="bg-sapphire-50 p-4 rounded-lg">
                <div className="text-sm text-sapphire-600 font-medium">Intervals</div>
                <div className="text-lg font-bold text-sapphire-900">
                  {chordInfo.intervals.join(' ')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Next Chord Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-sapphire-800">Suggested Next Chords</h3>

          <div className="space-y-2">
            {suggestions.map((suggestion, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-sapphire-100 to-sapphire-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handlePlayChord(suggestion.chord)}
              >
                <div>
                  <div className="font-bold text-sapphire-900">{suggestion.chord}</div>
                  <div className="text-sm text-sapphire-600">{suggestion.reason}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-sapphire-600">Probability</div>
                  <div className="font-bold text-sapphire-900">
                    {(suggestion.probability * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Detection */}
      {keyInfo && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-sapphire-800">Detected Key</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-sapphire-50 to-sapphire-100 p-4 rounded-lg">
              <div className="text-sm text-sapphire-600 font-medium">Key</div>
              <div className="text-2xl font-bold text-sapphire-900">
                {keyInfo.tonic} {keyInfo.type}
              </div>
            </div>

            <div className="bg-gradient-to-br from-sapphire-50 to-sapphire-100 p-4 rounded-lg">
              <div className="text-sm text-sapphire-600 font-medium">Related Keys</div>
              <div className="text-sm font-bold text-sapphire-900">
                Relative: {keyInfo.relatives.relative}
              </div>
              <div className="text-sm font-bold text-sapphire-900">
                Parallel: {keyInfo.relatives.parallel}
              </div>
            </div>

            <div className="col-span-2 bg-gradient-to-br from-sapphire-50 to-sapphire-100 p-4 rounded-lg">
              <div className="text-sm text-sapphire-600 font-medium mb-2">Diatonic Chords</div>
              <div className="flex flex-wrap gap-2">
                {keyInfo.chords.map((chord, i) => (
                  <button
                    key={i}
                    onClick={() => handlePlayChord(chord)}
                    className="px-3 py-1 bg-sapphire-600 text-white rounded-full hover:bg-sapphire-700 transition-colors text-sm"
                  >
                    {chord}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chord Progression Tools */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-sapphire-800">Chord Progression Tools</h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-sapphire-600 font-medium mb-2 block">
              Current Progression
            </label>
            <div className="flex gap-2 mb-2">
              {progression.map((chord, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-sapphire-100 text-sapphire-900 font-bold rounded-lg"
                >
                  {chord}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePlayProgression}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ▶ Play Progression
            </button>
            <button
              onClick={handleDetectKey}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔍 Detect Key
            </button>
            <button
              onClick={() => handleTranspose(1)}
              className="px-4 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700 transition-colors"
            >
              ↑ Transpose +1
            </button>
            <button
              onClick={() => handleTranspose(-1)}
              className="px-4 py-2 bg-sapphire-600 text-white rounded-lg hover:bg-sapphire-700 transition-colors"
            >
              ↓ Transpose -1
            </button>
          </div>

          <div className="bg-sapphire-50 p-4 rounded-lg">
            <div className="text-sm text-sapphire-600 font-medium mb-2">
              Generated Walking Bass Line
            </div>
            <div className="font-mono text-sm text-sapphire-900">
              {generateBassLine().join(' → ')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
