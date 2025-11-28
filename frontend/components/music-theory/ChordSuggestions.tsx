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
      <div className="bg-gray-800/50 border border-sapphire-500/10 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-sapphire-400" />
          <h3 className="text-lg font-bold text-white">AI Chord Suggestions</h3>
        </div>
        <p className="text-sm text-gray-400">
          Play some chords to get intelligent suggestions...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-sapphire-800/40 to-sapphire-500/40 border border-sapphire-500/50 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-sapphire-400" />
        <h3 className="text-lg font-bold text-white">AI Chord Suggestions</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sapphire-500" />
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
                className="bg-gray-800/60 border border-sapphire-500/10 rounded-lg p-4 hover:bg-gray-700/60 hover:border-sapphire-500/30 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-sapphire-500/20 rounded-full text-sapphire-400 font-bold text-sm">
                      #{i + 1}
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white group-hover:text-sapphire-400 transition-colors">
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
                        className="p-2 bg-sapphire-500/20 hover:bg-sapphire-500/40 rounded-lg transition-all duration-200"
                        title="Preview chord"
                      >
                        <Play className="w-4 h-4 text-sapphire-400" />
                      </button>
                    )}
                    {onChordSelect && (
                      <button
                        onClick={() => onChordSelect(suggestion.chord)}
                        className="p-2 bg-sapphire-500/20 hover:bg-sapphire-500/40 rounded-lg transition-all duration-200"
                        title="Add to progression"
                      >
                        <ArrowRight className="w-4 h-4 text-sapphire-400" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Probability Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-gray-400">Probability</p>
                      <p className="text-xs font-medium text-sapphire-400">
                        {probabilityPercent}%
                      </p>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          probabilityPercent >= 80 ? 'bg-sapphire-600' :
                          probabilityPercent >= 60 ? 'bg-sapphire-500' :
                          'bg-sapphire-400'
                        }`}
                        style={{ width: `${probabilityPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-sapphire-400 mt-1.5" />
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
      <div className="mt-6 pt-4 border-t border-sapphire-500/30">
        <p className="text-xs text-gray-400 italic">
          💡 Suggestions are based on music theory, common progressions, and harmonic function.
          Higher probability means more natural resolution.
        </p>
      </div>
    </div>
  );
}
