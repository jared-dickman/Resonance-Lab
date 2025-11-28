/**
 * IntelligentComposer - Demo of the intelligent composition system
 * Type a chord, get AI suggestions, hear studio-quality sound
 */

'use client';

import { useState } from 'react';
import { useIntelligentComposer } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function IntelligentComposer() {
  const [state, controls] = useIntelligentComposer();
  const [inputChord, setInputChord] = useState('');

  const handleAddChord = async () => {
    if (!inputChord.trim()) return;

    if (!state.isReady) {
      await controls.initialize();
    }

    // Play the chord
    await controls.playChord(inputChord);

    // Add to progression
    controls.addChordToProgression(inputChord);

    // Get suggestions
    controls.getSuggestions(inputChord);

    setInputChord('');
  };

  const handleSuggestionClick = async (chord: string) => {
    await controls.playChord(chord);
    controls.addChordToProgression(chord);
    controls.getSuggestions(chord);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="mb-2 text-4xl font-bold">🎸 Intelligent Composer</h1>
        <p className="text-lg text-muted-foreground">
          AI-powered music composition. Type a chord, get perfect suggestions.
        </p>
      </div>

      {/* Controls */}
      <Card className="w-full max-w-2xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm font-medium">Key:</span>
          <select
            value={state.key}
            onChange={(e) => controls.setKey(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire-500/50 focus-visible:border-sapphire-500/50"
          >
            <option>C</option>
            <option>G</option>
            <option>D</option>
            <option>A</option>
            <option>E</option>
            <option>F</option>
          </select>

          <span className="ml-4 text-sm font-medium">Genre:</span>
          <select
            value={state.genre}
            onChange={(e) => controls.setGenre(e.target.value as typeof state.genre)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire-500/50 focus-visible:border-sapphire-500/50"
          >
            <option value="pop">Pop</option>
            <option value="jazz">Jazz</option>
            <option value="rock">Rock</option>
            <option value="blues">Blues</option>
          </select>
        </div>

        {/* Chord Input */}
        <div className="mb-4 flex gap-2">
          <Input
            type="text"
            value={inputChord}
            onChange={(e) => setInputChord(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddChord()}
            placeholder="Enter a chord (e.g., Cmaj7, Am, G7)"
            className="flex-1"
          />
          <Button onClick={handleAddChord}>Add Chord</Button>
        </div>

        {/* Current Progression */}
        {state.progression.length > 0 && (
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium">Progression:</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={controls.playProgression}>
                  ▶ Play All
                </Button>
                <Button variant="outline" size="sm" onClick={controls.clearProgression}>
                  Clear
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {state.progression.map((chord, i) => (
                <Badge key={i} variant="secondary" className="text-base">
                  {chord}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* AI Suggestions */}
        {state.suggestions.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-medium">AI Suggestions:</h3>
            <div className="space-y-3">
              {state.suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(suggestion.chord)}
                  className="w-full rounded-lg border border-sapphire-500/10 p-4 text-left transition-all duration-200 hover:bg-sapphire-500/5 hover:border-sapphire-500/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire-500/50"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xl font-bold text-sapphire-400">
                      {suggestion.chord}
                    </span>
                    <Badge variant="default">
                      {Math.round(suggestion.confidence * 100)}% confident
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {suggestion.relationship}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.tensionChange > 0 ? '↑ Tension' : '↓ Resolution'}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Start Examples */}
        {state.progression.length === 0 && (
          <div className="mt-6 rounded-lg bg-sapphire-500/5 border border-sapphire-500/10 p-4">
            <h4 className="mb-2 text-sm font-medium">Quick Start:</h4>
            <p className="mb-3 text-sm text-muted-foreground">Try these popular progressions:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setInputChord('C');
                  setTimeout(handleAddChord, 100);
                }}
              >
                Start with C
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setInputChord('Am');
                  setTimeout(handleAddChord, 100);
                }}
              >
                Start with Am
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setInputChord('Cmaj7');
                  setTimeout(handleAddChord, 100);
                }}
              >
                Start with Cmaj7
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Status */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>Audio: {state.isReady ? '✅ Ready' : '⏸ Click to start'}</span>
        <span>Playing: {state.isPlaying ? '🎵' : '⏸'}</span>
      </div>
    </div>
  );
}
