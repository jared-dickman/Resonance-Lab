'use client';

import { useState } from 'react';
import IntelligentMusicPanel from '@/components/music-theory/IntelligentMusicPanel';
import * as Tone from 'tone';
import { Chord } from 'tonal';

/**
 * 🎼 MUSIC THEORY EXPLORER PAGE
 *
 * A standalone page for exploring music theory with the Intelligent Music Engine
 * Users can experiment with chord progressions, visualizations, and AI suggestions
 */
export default function MusicTheoryPage() {
  // Example chord progressions for demo
  const [selectedProgression, setSelectedProgression] = useState<'I-IV-V-I' | 'ii-V-I' | 'I-V-vi-IV' | 'custom'>('I-IV-V-I');
  const [customChords, setCustomChords] = useState<string[]>(['C', 'F', 'G', 'C']);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Predefined progressions
  const progressions = {
    'I-IV-V-I': {
      name: 'I-IV-V-I (Classic)',
      chords: ['C', 'F', 'G', 'C'],
      description: 'The most common chord progression in Western music'
    },
    'ii-V-I': {
      name: 'ii-V-I (Jazz)',
      chords: ['Dm7', 'G7', 'Cmaj7'],
      description: 'The foundation of jazz harmony'
    },
    'I-V-vi-IV': {
      name: 'I-V-vi-IV (Pop)',
      chords: ['C', 'G', 'Am', 'F'],
      description: 'The "four chords" that power countless hits'
    },
    'custom': {
      name: 'Custom Progression',
      chords: customChords,
      description: 'Create your own chord progression'
    }
  };

  const currentProgression = progressions[selectedProgression];
  const chords = selectedProgression === 'custom' ? customChords : currentProgression.chords;

  // Play chord with Tone.js
  const playChord = async (chordName: string) => {
    await Tone.start();
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();

    const chordData = Chord.get(chordName);
    if (chordData.notes && chordData.notes.length > 0) {
      const notes = chordData.notes.map(note => note + '4');
      synth.triggerAttackRelease(notes, '1n');
    }
  };

  // Add chord to custom progression
  const addChord = (chord: string) => {
    setCustomChords([...customChords, chord]);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-7xl">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-700/50 rounded-lg p-8">
          <h1 className="text-4xl font-bold text-white mb-3">
            🎼 Music Theory Explorer
          </h1>
          <p className="text-lg text-gray-300 mb-6">
            Explore music theory with AI-powered visualizations, chord analysis, and smart suggestions
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
              Circle of Fifths
            </span>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
              AI Suggestions
            </span>
            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
              Harmonic Analysis
            </span>
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">
              Key Detection
            </span>
          </div>
        </div>
      </div>

      {/* Progression Selector */}
      <div className="mb-8 bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Select a Chord Progression</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {(Object.keys(progressions) as Array<keyof typeof progressions>).map((key) => {
            const prog = progressions[key];
            return (
              <button
                key={key}
                onClick={() => setSelectedProgression(key)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedProgression === key
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                }`}
              >
                <h3 className="font-bold text-white mb-1">{prog.name}</h3>
                <p className="text-sm text-gray-400 mb-2">{prog.description}</p>
                <div className="flex gap-2 flex-wrap">
                  {prog.chords.map((chord, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-600 rounded text-xs text-white font-mono"
                    >
                      {chord}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Current Progression Display */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {chords.map((chord, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentChordIndex(i);
                  playChord(chord);
                }}
                className={`px-6 py-3 rounded-lg font-bold text-lg transition-all ${
                  i === currentChordIndex
                    ? 'bg-purple-500 text-white scale-110'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {chord}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Intelligent Music Panel */}
      <IntelligentMusicPanel
        chords={chords}
        currentChordIndex={currentChordIndex}
        onChordClick={(chord) => {
          const index = chords.indexOf(chord);
          if (index !== -1) {
            setCurrentChordIndex(index);
          }
          playChord(chord);
        }}
        onPlayChord={playChord}
      />

      {/* Educational Section */}
      <div className="mt-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">💡 How to Use</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
          <div>
            <h3 className="font-bold text-blue-400 mb-2">1. Select a Progression</h3>
            <p className="text-sm">
              Choose from classic progressions like I-IV-V-I, jazz's ii-V-I, or create your own custom sequence.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-purple-400 mb-2">2. Explore the Circle</h3>
            <p className="text-sm">
              Click chords on the Circle of Fifths to hear them. Current chord pulses in gold, suggestions glow green.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-green-400 mb-2">3. Analyze Harmony</h3>
            <p className="text-sm">
              See the key, scale, and harmonic function (I, IV, V, etc.) of your progression in real-time.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-yellow-400 mb-2">4. Get AI Suggestions</h3>
            <p className="text-sm">
              The AI engine suggests next chords based on music theory, with probability scores and reasons.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
