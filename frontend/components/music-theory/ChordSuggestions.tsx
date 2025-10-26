'use client';

import { useEffect, useState } from 'react';
import {
  suggestNextChords,
  detectKey,
  analyzeChord,
  type ChordSuggestion,
} from '@/lib/music-theory/intelligentChordEngine';
import { Sparkles, Play, ArrowRight } from 'lucide-react';

interface ChordSuggestionsProps {
  currentChords: string[];
  onChordSelect?: (chord: string) => void;
  onPlaySuggestion?: (chord: string) => void;
}

/**
 * 🤖 AI-POWERED CHORD SUGGESTIONS
 *
 * Displays intelligent next chord suggestions based on:
 * - Music theory (voice leading, cadences)
 * - Common progressions (I-V-vi-IV, etc.)
 * - Harmonic function (tonic, dominant, subdominant)
 * - Jazz substitutions (tritone subs, etc.)
 */
export default function ChordSuggestions({
  currentChords,
  onChordSelect,
  onPlaySuggestion,
}: ChordSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<ChordSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentChords || currentChords.length === 0) {
      setSuggestions([]);
      return;
    }

    setLoading(true);

    // Small delay for dramatic effect
    const timer = setTimeout(() => {
      const key = detectKey(currentChords);
      const nextChords = suggestNextChords(currentChords, key);
      setSuggestions(nextChords);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [currentChords]);

  if (currentChords.length === 0) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">AI Chord Suggestions</h3>
        </div>
        <p className="text-sm text-gray-400">
          Play some chords to get intelligent suggestions...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-700/50 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-bold text-white">AI Chord Suggestions</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
        </div>
      ) : suggestions.length === 0 ? (
        <p className="text-sm text-gray-400">
          No suggestions available for this progression.
        </p>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion, i) => {
            const analysis = analyzeChord(suggestion.chord);
            const probabilityPercent = Math.round(suggestion.probability * 100);

            return (
              <div
                key={i}
                className="bg-gray-800/60 border border-gray-600 rounded-lg p-4 hover:bg-gray-700/60 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-500/20 rounded-full text-purple-300 font-bold text-sm">
                      #{i + 1}
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                        {suggestion.chord}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {suggestion.function} function
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {onPlaySuggestion && (
                      <button
                        onClick={() => onPlaySuggestion(suggestion.chord)}
                        className="p-2 bg-purple-500/20 hover:bg-purple-500/40 rounded-lg transition-colors"
                        title="Preview chord"
                      >
                        <Play className="w-4 h-4 text-purple-300" />
                      </button>
                    )}
                    {onChordSelect && (
                      <button
                        onClick={() => onChordSelect(suggestion.chord)}
                        className="p-2 bg-green-500/20 hover:bg-green-500/40 rounded-lg transition-colors"
                        title="Add to progression"
                      >
                        <ArrowRight className="w-4 h-4 text-green-300" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Probability Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-gray-400">Probability</p>
                      <p className="text-xs font-medium text-purple-300">
                        {probabilityPercent}%
                      </p>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          probabilityPercent >= 80 ? 'bg-green-500' :
                          probabilityPercent >= 60 ? 'bg-yellow-500' :
                          'bg-purple-500'
                        }`}
                        style={{ width: `${probabilityPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-purple-400 mt-1.5" />
                    <p className="text-sm text-gray-300">
                      {suggestion.reason}
                    </p>
                  </div>

                  {/* Chord Notes */}
                  {analysis && (
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-700">
                      <p className="text-xs text-gray-400">Notes:</p>
                      <div className="flex gap-1">
                        {analysis.notes.map((note, noteIdx) => (
                          <span
                            key={noteIdx}
                            className="px-2 py-0.5 bg-gray-700 rounded text-xs text-white font-mono"
                          >
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 pt-4 border-t border-purple-700/30">
        <p className="text-xs text-gray-400 italic">
          💡 Suggestions are based on music theory, common progressions, and harmonic function.
          Higher probability means more natural resolution.
        </p>
      </div>
    </div>
  );
}
