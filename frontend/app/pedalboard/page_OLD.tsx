'use client';

/**
 * Pedalboard Demo Page
 * Interactive guitar pedalboard with real-time audio processing
 */

import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { PedalboardUI } from '@/components/effects';
import { Pedalboard } from '@/lib/audio/effects';
import { Guitar, Play, Square } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PedalboardPage() {
  const [pedalboard, setPedalboard] = useState<Pedalboard | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const synthRef = useRef<Tone.PolySynth | null>(null);

  useEffect(() => {
    // Initialize pedalboard on client-side only
    const pb = new Pedalboard();
    setPedalboard(pb);

    // Connect pedalboard to output
    pb.toDestination();

    return () => {
      pb.dispose();
      synthRef.current?.dispose();
    };
  }, []);

  const startAudio = async () => {
    await Tone.start();
    setAudioStarted(true);

    // Create a guitar-like synth for testing
    if (!synthRef.current) {
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: 'triangle',
        },
        envelope: {
          attack: 0.01,
          decay: 0.3,
          sustain: 0.4,
          release: 1.2,
        },
      });

      // Connect synth to pedalboard
      synthRef.current.connect(pedalboard.getInput());
    }
  };

  const playTestRiff = async () => {
    if (!audioStarted) {
      await startAudio();
    }

    if (!synthRef.current || !pedalboard) return;

    setIsPlaying(true);

    // Play a simple blues rock riff
    const now = Tone.now();
    const notes = [
      { time: now, notes: ['E3', 'G3', 'B3'], duration: '4n' },
      { time: now + 0.5, notes: ['E3', 'G3', 'B3'], duration: '8n' },
      { time: now + 0.75, notes: ['D3', 'F#3', 'A3'], duration: '8n' },
      { time: now + 1, notes: ['E3', 'G3', 'B3'], duration: '4n' },
      { time: now + 1.5, notes: ['G3', 'B3', 'D4'], duration: '4n' },
      { time: now + 2, notes: ['E3', 'G3', 'B3'], duration: '2n' },
    ];

    notes.forEach(({ time, notes: chordNotes, duration }) => {
      synthRef.current?.triggerAttackRelease(chordNotes, duration, time, 0.7);
    });

    setTimeout(() => setIsPlaying(false), 3000);
  };

  const stopAudio = () => {
    synthRef.current?.releaseAll();
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero section */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <Guitar className="w-12 h-12 text-amber-500" />
            <h1 className="text-5xl font-bold text-white">Guitar Pedalboard</h1>
          </div>
          <p className="text-xl text-gray-400">
            Professional effects with studio-grade DSP processing
          </p>

          {/* Test controls */}
          <div className="mt-8 flex items-center justify-center gap-4">
            {!audioStarted ? (
              <button
                onClick={startAudio}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Initialize Audio
              </button>
            ) : (
              <>
                <button
                  onClick={playTestRiff}
                  disabled={isPlaying}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    isPlaying
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  Play Test Riff
                </button>

                <button
                  onClick={stopAudio}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Square className="w-4 h-4" />
                  Stop
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Pedalboard */}
        {pedalboard && <PedalboardUI pedalboard={pedalboard} showVisualizer={true} />}

        {/* Info cards */}
        <motion.div
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
            <h3 className="text-lg font-bold text-white mb-2">5 Distortion Algorithms</h3>
            <p className="text-sm text-gray-400">
              Tube, Fuzz, Overdrive, Heavy, and Soft-Clip with authentic waveshaping curves
            </p>
          </div>

          <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
            <h3 className="text-lg font-bold text-white mb-2">8 Classic Presets</h3>
            <p className="text-sm text-gray-400">
              TS9, DS-1, Big Muff, Blues Breaker, RAT, Clean Boost, Metal Zone, Fuzz Face
            </p>
          </div>

          <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
            <h3 className="text-lg font-bold text-white mb-2">Real-time Visualization</h3>
            <p className="text-sm text-gray-400">
              Waveform and frequency spectrum analysis with beautiful graphics
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
