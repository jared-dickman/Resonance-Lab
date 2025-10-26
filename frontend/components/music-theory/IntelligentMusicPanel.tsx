'use client';

import { useState } from 'react';
import ChordWheel from './ChordWheel';
import ChordProgressionAnalyzer from './ChordProgressionAnalyzer';
import ChordSuggestions from './ChordSuggestions';
import { suggestNextChords, detectKey } from '@/lib/music-theory/intelligentChordEngine';
import { Eye, EyeOff, Sparkles } from 'lucide-react';

interface IntelligentMusicPanelProps {
  chords: string[];
  currentChordIndex: number;
  onChordClick?: (chord: string) => void;
  onPlayChord?: (chord: string) => void;
}

/**
 * 🎯 INTELLIGENT MUSIC PANEL
 *
 * The ultimate music theory visualization combining:
 * - Circle of Fifths (D3.js)
 * - Chord progression analyzer (Tonal.js)
 * - AI chord suggestions
 * - Real-time harmonic analysis
 *
 * This is THE feature that makes Resonance Lab unprecedented.
 */
export default function IntelligentMusicPanel({
  chords,
  currentChordIndex,
  onChordClick,
  onPlayChord,
}: IntelligentMusicPanelProps) {
  const [showWheel, setShowWheel] = useState(true);

  const currentChord = chords[currentChordIndex];
  const key = detectKey(chords);
  const suggestions = key ? suggestNextChords(chords, key) : [];
  const suggestedChords = suggestions.map(s => s.chord);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-700/50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Intelligent Music Engine</h2>
              <p className="text-sm text-gray-400">
                AI-powered music theory analysis & visualization
              </p>
            </div>
          </div>

          {/* Toggle Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowWheel(!showWheel)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                showWheel
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                  : 'bg-gray-700 text-gray-400 border border-gray-600'
              }`}
            >
              {showWheel ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Circle of Fifths Wheel */}
      {showWheel && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Interactive Circle of Fifths</h3>
          <div className="flex justify-center">
            <ChordWheel
              currentChord={currentChord}
              suggestedChords={suggestedChords}
              onChordClick={onPlayChord}
              width={600}
              height={600}
            />
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              🎵 Click any chord to preview it • Current chord pulses in gold • Suggested chords glow green
            </p>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chord Progression Analyzer */}
        <div>
          <ChordProgressionAnalyzer
            chords={chords}
            currentChordIndex={currentChordIndex}
          />
        </div>

        {/* AI Chord Suggestions */}
        <div>
          <ChordSuggestions
            currentChords={chords.slice(0, currentChordIndex + 1)}
            onChordSelect={onChordClick}
            onPlaySuggestion={onPlayChord}
          />
        </div>
      </div>

      {/* Feature Showcase */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-lg p-6">
        <h3 className="text-sm font-bold text-white mb-3">✨ Powered By</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">🎼</span>
            </div>
            <p className="text-xs font-medium text-white">Tonal.js</p>
            <p className="text-xs text-gray-400">Music Theory</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-xs font-medium text-white">D3.js</p>
            <p className="text-xs text-gray-400">Visualization</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">🤖</span>
            </div>
            <p className="text-xs font-medium text-white">AI Engine</p>
            <p className="text-xs text-gray-400">Smart Suggestions</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">🎸</span>
            </div>
            <p className="text-xs font-medium text-white">Tone.js</p>
            <p className="text-xs text-gray-400">Audio Engine</p>
          </div>
        </div>
      </div>
    </div>
  );
}
