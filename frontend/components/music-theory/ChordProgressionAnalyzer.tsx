'use client';

import { useEffect, useState } from 'react';
import {
  analyzeChord,
  detectKey,
  type ChordAnalysis,
  type KeyAnalysis,
} from '@/lib/music-theory/intelligentChordEngine';
import { Music2, TrendingUp, Info } from 'lucide-react';

interface ChordProgressionAnalyzerProps {
  chords: string[];
  currentChordIndex?: number;
}

/**
 * 🧠 CHORD PROGRESSION ANALYZER
 *
 * Displays intelligent analysis of chord progressions:
 * - Key detection
 * - Scale information
 * - Chord functions (I, IV, V, etc.)
 * - Harmonic analysis
 * - Related keys
 */
export default function ChordProgressionAnalyzer({
  chords,
  currentChordIndex = 0,
}: ChordProgressionAnalyzerProps) {
  const [keyAnalysis, setKeyAnalysis] = useState<KeyAnalysis | null>(null);
  const [chordAnalyses, setChordAnalyses] = useState<(ChordAnalysis | null)[]>([]);
  const [chordFunctions, setChordFunctions] = useState<string[]>([]);

  useEffect(() => {
    if (!chords || chords.length === 0) return;

    // Detect key
    const key = detectKey(chords);
    setKeyAnalysis(key);

    // Analyze each chord
    const analyses = chords.map((chord) => analyzeChord(chord));
    setChordAnalyses(analyses);

    // Determine chord functions
    if (key) {
      const functions = analyses.map<string>((analysis, i) => {
        if (!analysis) return '?';

        // Find position in key
        const chordSymbol = chords[i];
        if (!chordSymbol) return '?';
        const normalizedChord = chordSymbol.replace(/\s+/g, '');

        const chordIndex = key.chords.findIndex((kc: string) => {
          const normalizedKeyChord = kc.replace(/\s+/g, '');
          return (
            normalizedKeyChord === normalizedChord ||
            normalizedChord.startsWith(kc.split(/[^A-G#b]/)[0] ?? '')
          );
        });

        const romanNumerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
        if (chordIndex >= 0 && chordIndex < romanNumerals.length) {
          const romanNumeral = romanNumerals[chordIndex];
          return romanNumeral ?? '?';
        }

        return '?';
      });
      setChordFunctions(functions);
    } else {
      setChordFunctions([]);
    }
  }, [chords]);

  if (!keyAnalysis) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <p className="text-gray-400 text-sm">Analyzing chord progression...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Key Information */}
      <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-700/50 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Music2 className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-white">Key Analysis</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Detected Key</p>
            <p className="text-2xl font-bold text-white">
              {keyAnalysis.tonic} {keyAnalysis.type === 'minor' ? 'Minor' : 'Major'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">Scale</p>
            <p className="text-sm text-white font-mono">
              {keyAnalysis.scale.join(' - ')}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">Relative Key</p>
            <p className="text-sm text-white font-medium">
              {keyAnalysis.relativeKey}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">Parallel Key</p>
            <p className="text-sm text-white font-medium">
              {keyAnalysis.parallelKey}
            </p>
          </div>
        </div>
      </div>

      {/* Chord Function Analysis */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-bold text-white">Harmonic Function</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {chords.map((chord, i) => {
            const analysis = chordAnalyses[i];
            const isCurrent = i === currentChordIndex;
            const romanNumeral = chordFunctions[i];

            return (
              <div
                key={i}
                className={`
                  px-4 py-3 rounded-lg border-2 transition-all
                  ${isCurrent
                    ? 'bg-yellow-500/20 border-yellow-500 scale-105'
                    : 'bg-gray-700/30 border-gray-600'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-1">
                  <p className="text-xs text-gray-400 font-medium">
                    {romanNumeral}
                  </p>
                  <p className={`text-lg font-bold ${isCurrent ? 'text-yellow-300' : 'text-white'}`}>
                    {chord}
                  </p>
                  {analysis && (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: analysis.quality === 'major' ? '#3B82F6' :
                          analysis.quality === 'minor' ? '#8B5CF6' :
                          analysis.quality === 'dominant' ? '#F59E0B' : '#6B7280'
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chord Details */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Current Chord Details</h3>
        </div>

        {chordAnalyses[currentChordIndex] && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Chord Symbol</p>
              <p className="text-xl font-bold text-white">
                {chordAnalyses[currentChordIndex]!.symbol}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Quality</p>
              <p className="text-sm text-white capitalize">
                {chordAnalyses[currentChordIndex]!.quality}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Notes</p>
              <p className="text-sm text-white font-mono">
                {chordAnalyses[currentChordIndex]!.notes.join(' - ')}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Intervals</p>
              <p className="text-sm text-white font-mono">
                {chordAnalyses[currentChordIndex]!.intervals.join(', ')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Diatonic Chords in Key */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-sm font-bold text-white mb-3">Diatonic Chords in {keyAnalysis.tonic} {keyAnalysis.type}</h3>
        <div className="flex flex-wrap gap-2">
          {keyAnalysis.chords.slice(0, 7).map((chord, i) => (
            <div
              key={i}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg"
            >
              <p className="text-xs text-gray-400 mb-0.5">
                {['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'][i]}
              </p>
              <p className="text-sm font-medium text-white">{chord}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
