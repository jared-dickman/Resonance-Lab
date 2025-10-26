/**
 * useIntelligentComposer - Main hook for the intelligent composition system
 * Combines instruments, intelligence, and playback
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Tone from 'tone';
import { AcousticPiano, SynthBass, DrumKit } from '../audio/instruments';
import { ChordAnalyzer, ChordSuggester, BassLineGenerator, DrumPatternGenerator } from '../music-theory/intelligence';
import type { ChordSuggestion } from '../music-theory/intelligence';

export interface ComposerState {
  /** Current chord */
  currentChord: string;
  /** Chord progression */
  progression: string[];
  /** Suggested next chords */
  suggestions: ChordSuggestion[];
  /** Is audio initialized */
  isReady: boolean;
  /** Is currently playing */
  isPlaying: boolean;
  /** Current key */
  key: string;
  /** Current genre */
  genre: 'pop' | 'jazz' | 'rock' | 'blues';
}

export interface ComposerControls {
  /** Initialize audio context */
  initialize: () => Promise<void>;
  /** Play a chord with accompaniment */
  playChord: (chord: string) => Promise<void>;
  /** Add chord to progression */
  addChordToProgression: (chord: string) => void;
  /** Get suggestions for next chord */
  getSuggestions: (chord: string) => ChordSuggestion[];
  /** Play full progression */
  playProgression: () => Promise<void>;
  /** Stop playback */
  stop: () => void;
  /** Clear progression */
  clearProgression: () => void;
  /** Change key */
  setKey: (key: string) => void;
  /** Change genre */
  setGenre: (genre: ComposerState['genre']) => void;
  /** Dispose resources */
  dispose: () => void;
}

export function useIntelligentComposer(): [ComposerState, ComposerControls] {
  const [state, setState] = useState<ComposerState>({
    currentChord: '',
    progression: [],
    suggestions: [],
    isReady: false,
    isPlaying: false,
    key: 'C',
    genre: 'pop',
  });

  // Instruments
  const pianoRef = useRef<AcousticPiano | null>(null);
  const bassRef = useRef<SynthBass | null>(null);
  const drumsRef = useRef<DrumKit | null>(null);

  // Intelligence
  const analyzerRef = useRef(new ChordAnalyzer());
  const suggesterRef = useRef(new ChordSuggester());
  const bassGenRef = useRef(new BassLineGenerator());
  const drumGenRef = useRef(new DrumPatternGenerator());

  // Playback
  const partRef = useRef<Tone.Part | null>(null);

  /**
   * Initialize audio context and instruments
   */
  const initialize = useCallback(async () => {
    if (state.isReady) return;

    await Tone.start();

    // Create instruments
    pianoRef.current = new AcousticPiano({ preset: 'bright', volume: -8 });
    bassRef.current = new SynthBass({ preset: 'fat', volume: -12 });
    drumsRef.current = new DrumKit({ preset: 'rock', volume: -14 });

    setState((prev) => ({ ...prev, isReady: true }));
  }, [state.isReady]);

  /**
   * Play a chord with full accompaniment
   */
  const playChord = useCallback(
    async (chord: string) => {
      if (!state.isReady) {
        await initialize();
      }

      const piano = pianoRef.current;
      const bass = bassRef.current;
      const drums = drumsRef.current;

      if (!piano || !bass || !drums) return;

      // Analyze chord
      const analysis = analyzerRef.current.analyze(chord, { key: state.key });

      // Play chord on piano
      piano.playChord(analysis.notes, '2n');

      // Generate and play bass
      const bassLine = bassGenRef.current.generate([chord], {
        style: 'root',
        octave: 2,
      });

      bassLine.forEach((note) => {
        bass.playNote({
          note: note.note,
          duration: '4n',
          time: `+${note.time * 0.5}`,
          velocity: note.velocity,
        });
      });

      // Generate and play drums
      const drumPattern = drumGenRef.current.generate({
        style: state.genre === 'jazz' ? 'jazz' : 'rock',
        measures: 1,
      });

      drumPattern.forEach((event) => {
        drums.hit(event.drum, `+${event.time * 0.5}`, event.velocity);
      });

      setState((prev) => ({ ...prev, currentChord: chord }));
    },
    [state.isReady, state.key, state.genre, initialize]
  );

  /**
   * Get intelligent suggestions for next chord
   */
  const getSuggestions = useCallback(
    (chord: string) => {
      const suggestions = suggesterRef.current.suggest(chord, {
        key: state.key,
        genre: state.genre,
        maxSuggestions: 3,
      });

      setState((prev) => ({ ...prev, suggestions }));
      return suggestions;
    },
    [state.key, state.genre]
  );

  /**
   * Add chord to progression and get new suggestions
   */
  const addChordToProgression = useCallback(
    (chord: string) => {
      setState((prev) => ({
        ...prev,
        progression: [...prev.progression, chord],
        currentChord: chord,
      }));

      getSuggestions(chord);
    },
    [getSuggestions]
  );

  /**
   * Play full progression
   */
  const playProgression = useCallback(async () => {
    if (!state.isReady) await initialize();
    if (state.progression.length === 0) return;

    const piano = pianoRef.current;
    const bass = bassRef.current;
    const drums = drumsRef.current;

    if (!piano || !bass || !drums) return;

    setState((prev) => ({ ...prev, isPlaying: true }));

    // Generate bass and drums for full progression
    const bassLine = bassGenRef.current.generate(state.progression, {
      style: state.genre === 'jazz' ? 'walking' : 'root',
      octave: 2,
    });

    const drumPattern = drumGenRef.current.generate({
      style: state.genre === 'jazz' ? 'jazz' : 'rock',
      measures: state.progression.length,
    });

    // Schedule chord events
    const events: Array<{ time: number; chord: string }> = [];
    state.progression.forEach((chord, index) => {
      events.push({ time: index * 2, chord });
    });

    // Create Tone.Part for playback
    partRef.current?.dispose();
    partRef.current = new Tone.Part((time, event) => {
      const analysis = analyzerRef.current.analyze(event.chord, { key: state.key });
      piano.playChord(analysis.notes, '2n', time);
    }, events);

    // Schedule bass
    bassLine.forEach((note) => {
      bass.playNote({
        note: note.note,
        duration: '4n',
        time: `+${note.time * 0.5}`,
        velocity: note.velocity,
      });
    });

    // Schedule drums
    drumPattern.forEach((event) => {
      drums.hit(event.drum, `+${event.time * 0.5}`, event.velocity);
    });

    partRef.current.start(Tone.now());
    partRef.current.loop = false;

    // Stop after progression completes
    setTimeout(() => {
      setState((prev) => ({ ...prev, isPlaying: false }));
    }, state.progression.length * 2000);
  }, [state.isReady, state.progression, state.key, state.genre, initialize]);

  /**
   * Stop playback
   */
  const stop = useCallback(() => {
    partRef.current?.stop();
    partRef.current?.dispose();
    partRef.current = null;
    setState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  /**
   * Clear progression
   */
  const clearProgression = useCallback(() => {
    setState((prev) => ({
      ...prev,
      progression: [],
      currentChord: '',
      suggestions: [],
    }));
  }, []);

  /**
   * Change musical key
   */
  const setKey = useCallback((key: string) => {
    setState((prev) => ({ ...prev, key }));
  }, []);

  /**
   * Change genre
   */
  const setGenre = useCallback((genre: ComposerState['genre']) => {
    setState((prev) => ({ ...prev, genre }));
  }, []);

  /**
   * Dispose all resources
   */
  const dispose = useCallback(() => {
    pianoRef.current?.dispose();
    bassRef.current?.dispose();
    drumsRef.current?.dispose();
    partRef.current?.dispose();

    pianoRef.current = null;
    bassRef.current = null;
    drumsRef.current = null;
    partRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispose();
    };
  }, [dispose]);

  return [
    state,
    {
      initialize,
      playChord,
      addChordToProgression,
      getSuggestions,
      playProgression,
      stop,
      clearProgression,
      setKey,
      setGenre,
      dispose,
    },
  ];
}
