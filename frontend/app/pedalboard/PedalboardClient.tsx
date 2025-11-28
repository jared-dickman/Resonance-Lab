'use client';

/**
 * 🎸 THE ULTIMATE PEDALBOARD - ABSOLUTE PERFECTION 🎸
 *
 * Combines:
 * - 6 Pizzicato pedals + Distortion
 * - 30 legendary presets
 * - 5 legendary guitarist rigs
 * - D3.js animated cable routing
 * - D3.js spectrum analyzer
 * - D3.js waveform oscilloscope
 * - D3.js interactive signal path diagram
 * - Drag-and-drop pedal reordering
 * - Real-time audio analysis
 * - Beautiful 3D UI components
 *
 * THIS IS THE GREATEST PEDALBOARD PAGE EVER CREATED.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Tone from 'tone';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Guitar, Star, Zap, Settings, Maximize2, Minimize2 } from 'lucide-react';

import { Pedalboard } from '@/lib/audio/effects';
import { PedalboardUI } from '@/components/effects';
import {
  AnimatedCableRouting,
  SpectrumAnalyzer,
  WaveformOscilloscope,
  SignalPathDiagram,
  AudioReactiveParticles,
  GenerativeArtVisualizer,
} from '@/components/effects/d3';
import type { VisualizationStyle } from '@/lib/utils/visualization/generative-art.utils';
import { cn } from '@/lib/utils';

const ART_STYLES: VisualizationStyle[] = ['flow-field', 'spiral', 'mandala', 'particles'];

interface Cable {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  active: boolean;
  signalStrength: number;
}

export default function UltimatePedalboardPage() {
  const [pedalboard, setPedalboard] = useState<Pedalboard | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const [cables, setCables] = useState<Cable[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [showVisualizations, setShowVisualizations] = useState(true);
  const [visualizationLayout, setVisualizationLayout] = useState<'grid' | 'stack'>('grid');
  const [artStyle, setArtStyle] = useState<VisualizationStyle>('flow-field');
  const synthRef = useRef<Tone.PolySynth | null>(null);

  // Connect pedalboard to output
  useEffect(() => {
    const pb = new Pedalboard();
    pb.toDestination();
    setPedalboard(pb);

    return () => {
      pb.dispose();
      synthRef.current?.dispose();
    };
  }, []);

  // Auto-generate cables from pedal chain
  const updateCables = useCallback(() => {
    if (!pedalboard) {
      setSlots([]);
      setCables([]);
      return;
    }

    const currentSlots = pedalboard.getPedals();
    setSlots(currentSlots);

    if (currentSlots.length === 0) {
      setCables([]);
      return;
    }

    const newCables: Cable[] = [];
    const spacing = 180;
    const startX = 100;
    const yPosition = 250;

    // Input to first pedal
    newCables.push({
      id: 'input-cable',
      fromX: startX - 80,
      fromY: yPosition,
      toX: startX,
      toY: yPosition,
      active: true,
      signalStrength: 0.5,
    });

    // Between pedals
    currentSlots.forEach((slot, i) => {
      if (i < currentSlots.length - 1) {
        newCables.push({
          id: `cable-${i}`,
          fromX: startX + i * spacing,
          fromY: yPosition,
          toX: startX + (i + 1) * spacing,
          toY: yPosition,
          active: slot.enabled,
          signalStrength: slot.enabled ? 0.7 + Math.random() * 0.3 : 0,
        });
      }
    });

    // Last pedal to output
    if (currentSlots.length > 0) {
      newCables.push({
        id: 'output-cable',
        fromX: startX + (currentSlots.length - 1) * spacing,
        fromY: yPosition,
        toX: startX + currentSlots.length * spacing,
        toY: yPosition,
        active: true,
        signalStrength: 0.6,
      });
    }

    setCables(newCables);
  }, [pedalboard]);

  // Update cables when slots change
  useEffect(() => {
    if (!pedalboard) return;

    updateCables();

    const interval = setInterval(() => {
      updateCables();
    }, 1000);

    return () => clearInterval(interval);
  }, [pedalboard, updateCables]);

  const startAudio = async () => {
    const currentPedalboard = pedalboard;
    if (!currentPedalboard) return;

    await Tone.start();
    setAudioStarted(true);

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

      synthRef.current.connect(currentPedalboard.getInput());
    }
  };

  const playTestRiff = async () => {
    if (!audioStarted) {
      await startAudio();
    }

    if (!synthRef.current) return;

    setIsPlaying(true);

    // Extended blues rock riff for testing
    const now = Tone.now();
    const riff = [
      { time: now, notes: ['E3', 'G3', 'B3'], duration: '4n' },
      { time: now + 0.5, notes: ['E3', 'G3', 'B3'], duration: '8n' },
      { time: now + 0.75, notes: ['D3', 'F#3', 'A3'], duration: '8n' },
      { time: now + 1, notes: ['E3', 'G3', 'B3'], duration: '4n' },
      { time: now + 1.5, notes: ['G3', 'B3', 'D4'], duration: '4n' },
      { time: now + 2, notes: ['A3', 'C4', 'E4'], duration: '4n' },
      { time: now + 2.5, notes: ['G3', 'B3', 'D4'], duration: '4n' },
      { time: now + 3, notes: ['E3', 'G3', 'B3'], duration: '2n' },
    ];

    riff.forEach(({ time, notes: chordNotes, duration }) => {
      synthRef.current?.triggerAttackRelease(chordNotes, duration, time, 0.7);
    });

    setTimeout(() => setIsPlaying(false), 5000);
  };

  const stopAudio = () => {
    synthRef.current?.releaseAll();
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 lg:p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Epic Hero Section */}
        <motion.div
          className="mb-8 text-center relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              <Guitar className="w-16 h-16 text-amber-500" />
              <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-purple-500 to-blue-500">
                ULTIMATE PEDALBOARD
              </h1>
              <Zap className="w-16 h-16 text-purple-500" />
            </div>

            <p className="text-xl text-gray-400 max-w-3xl">
              6 Legendary Pedals • 30 Iconic Presets • 5 Guitarist Rigs • Real-Time D3 Visualizations
            </p>

            {/* Control Bar */}
            <div className="flex items-center gap-4 mt-4">
              {!audioStarted ? (
                <button
                  onClick={startAudio}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-bold text-lg shadow-lg shadow-green-500/50 transition-all"
                >
                  Initialize Audio Engine
                </button>
              ) : (
                <>
                  <button
                    onClick={playTestRiff}
                    disabled={isPlaying}
                    className={cn(
                      'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all',
                      isPlaying
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/50'
                    )}
                  >
                    <Play className="w-5 h-5" />
                    Play Test Riff
                  </button>

                  <button
                    onClick={stopAudio}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg font-medium shadow-lg shadow-red-500/50 transition-all"
                  >
                    <Square className="w-5 h-5" />
                    Stop
                  </button>

                  <button
                    onClick={() => setShowVisualizations(!showVisualizations)}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-all"
                  >
                    {showVisualizations ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    {showVisualizations ? 'Hide' : 'Show'} Visualizations
                  </button>

                  {showVisualizations && (
                    <button
                      onClick={() => setVisualizationLayout(visualizationLayout === 'grid' ? 'stack' : 'grid')}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-all"
                    >
                      <Settings className="w-5 h-5" />
                      {visualizationLayout === 'grid' ? 'Stack' : 'Grid'} Layout
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Pedalboard UI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          {pedalboard ? <PedalboardUI pedalboard={pedalboard} showVisualizer={true} /> : null}
        </motion.div>

        {/* D3.js Visualizations */}
        <AnimatePresence>
          {showVisualizations && pedalboard && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6"
            >
              {/* Animated Cable Routing */}
              {cables.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-950 rounded-xl p-6 border-2 border-amber-500/30 shadow-xl shadow-amber-500/10"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-6 h-6 text-amber-500" />
                    <h3 className="text-xl font-bold text-white">
                      Live Signal Flow - Watch the Music Travel
                    </h3>
                  </div>
                  <AnimatedCableRouting cables={cables} width={1400} height={350} />
                </motion.div>
              )}

              {/* Audio Reactive 3D Particles */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="border-2 border-pink-500/30 shadow-xl shadow-pink-500/10 rounded-xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-pink-500/20 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10">
                  <div>
                    <h3 className="text-xl font-bold text-white">Audio Reactive Particles</h3>
                    <p className="text-sm text-pink-200/80">
                      Three.js particle nebula synced to your current tone
                    </p>
                  </div>
                  <div className="text-xs font-mono text-pink-200/70 uppercase tracking-wide">
                    Drag to orbit • Scroll to zoom
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <AudioReactiveParticles
                    audioNode={pedalboard.getOutput()}
                    width="100%"
                    height={visualizationLayout === 'grid' ? 360 : 420}
                    particleCount={1200}
                  />
                </div>
              </motion.div>

              {/* Generative Art Visualizer */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="border-2 border-purple-500/30 shadow-xl shadow-purple-500/10 rounded-xl overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 px-6 pt-5 pb-3 border-b border-purple-500/20 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10">
                  <div>
                    <h3 className="text-xl font-bold text-white">Generative Art Flow Field</h3>
                    <p className="text-sm text-purple-200/80">
                      P5.js visuals evolving in real-time with your signal
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {ART_STYLES.map(style => (
                      <button
                        key={style}
                        onClick={() => setArtStyle(style)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                          artStyle === style
                            ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                            : 'bg-white/5 text-purple-100 hover:bg-white/10'
                        }`}
                      >
                        {style.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <GenerativeArtVisualizer
                    audioNode={pedalboard.getOutput()}
                    width="auto"
                    height={visualizationLayout === 'grid' ? 320 : 380}
                    style={artStyle}
                  />
                </div>
              </motion.div>

              {/* Audio Analysis Grid */}
              <div className={cn('grid gap-6', visualizationLayout === 'grid' ? 'lg:grid-cols-2' : 'grid-cols-1')}>
                {/* Spectrum Analyzer */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="border-2 border-blue-500/30 shadow-xl shadow-blue-500/10 rounded-xl overflow-hidden"
                >
                  <SpectrumAnalyzer
                    audioNode={pedalboard.getOutput()}
                    width={visualizationLayout === 'grid' ? 650 : 1400}
                    height={220}
                    barCount={64}
                    smoothing={0.8}
                  />
                </motion.div>

                {/* Waveform Oscilloscope */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="border-2 border-emerald-500/30 shadow-xl shadow-emerald-500/10 rounded-xl overflow-hidden"
                >
                  <WaveformOscilloscope
                    audioNode={pedalboard.getOutput()}
                    width={visualizationLayout === 'grid' ? 650 : 1400}
                    height={180}
                    color="#10b981"
                  />
                </motion.div>
              </div>

              {/* Interactive Signal Path Diagram */}
              {slots.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="border-2 border-purple-500/30 shadow-xl shadow-purple-500/10 rounded-xl overflow-hidden"
                >
                  <SignalPathDiagram
                    pedals={slots.map((s) => ({
                      id: s.id,
                      name: s.name,
                      type: 'effect',
                      enabled: s.enabled,
                    }))}
                    width={1400}
                    height={450}
                  />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <motion.div
          className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="p-6 bg-gradient-to-br from-amber-900/20 to-amber-950/20 border border-amber-500/30 rounded-xl">
            <div className="text-4xl font-bold text-amber-500 mb-2">7</div>
            <div className="text-sm text-gray-400 uppercase tracking-wide">Pedal Types</div>
            <div className="text-xs text-gray-500 mt-1">Distortion + 6 Pizzicato</div>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-900/20 to-purple-950/20 border border-purple-500/30 rounded-xl">
            <div className="text-4xl font-bold text-purple-500 mb-2">30</div>
            <div className="text-sm text-gray-400 uppercase tracking-wide">Legendary Presets</div>
            <div className="text-xs text-gray-500 mt-1">Gilmour, The Edge, Cobain...</div>
          </div>

          <div className="p-6 bg-gradient-to-br from-blue-900/20 to-blue-950/20 border border-blue-500/30 rounded-xl">
            <div className="text-4xl font-bold text-blue-500 mb-2">5</div>
            <div className="text-sm text-gray-400 uppercase tracking-wide">Guitarist Rigs</div>
            <div className="text-xs text-gray-500 mt-1">One-click legendary tones</div>
          </div>

          <div className="p-6 bg-gradient-to-br from-emerald-900/20 to-emerald-950/20 border border-emerald-500/30 rounded-xl">
            <div className="text-4xl font-bold text-emerald-500 mb-2">4</div>
            <div className="text-sm text-gray-400 uppercase tracking-wide">D3 Visualizations</div>
            <div className="text-xs text-gray-500 mt-1">Real-time audio analysis</div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-12 text-center text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p>
            Built with Tone.js, Pizzicato.js, D3.js, and Framer Motion
          </p>
          <p className="mt-2 text-xs">
            The most advanced web-based guitar pedalboard ever created
          </p>
        </motion.div>
      </div>
    </div>
  );
}
