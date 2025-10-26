/**
 * useGuitarPlayback - Hook for playing guitar chords during song playback
 * Automatically plays chords with realistic guitar sound
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { AcousticGuitar } from '../audio/instruments';
import { Chord } from 'tonal';

interface GuitarPlaybackOptions {
  enabled: boolean;
  currentChord: string | null;
  volume?: number;
  preset?: 'bright' | 'warm' | 'strumming' | 'fingerstyle';
}

export function useGuitarPlayback({
  enabled,
  currentChord,
  volume = -8,
  preset = 'strumming',
}: GuitarPlaybackOptions) {
  const guitarRef = useRef<AcousticGuitar | null>(null);
  const isInitializedRef = useRef(false);
  const lastPlayedChordRef = useRef<string | null>(null);

  /**
   * Initialize audio context and guitar eagerly when enabled
   */
  useEffect(() => {
    if (enabled && !isInitializedRef.current) {
      const initAudio = async () => {
        console.log('[useGuitarPlayback] Initializing audio...');
        await Tone.start();
        console.log('[useGuitarPlayback] Tone.js started');

        // Create guitar with strumming preset for realistic sound
        guitarRef.current = new AcousticGuitar({
          preset,
          volume
        });

        console.log('[useGuitarPlayback] AcousticGuitar created, waiting for samples...');

        isInitializedRef.current = true;
      };

      initAudio();
    }
  }, [enabled, preset, volume]);

  /**
   * Play a chord with realistic guitar strumming
   */
  const playChord = useCallback((chordName: string) => {
    if (!enabled) return;

    const guitar = guitarRef.current;
    if (!guitar) {
      console.warn('Guitar not initialized yet');
      return;
    }

    // Check if guitar samples are loaded
    if (!guitar.isReady()) {
      console.warn('Guitar samples still loading, skipping chord:', chordName);
      return;
    }

    // Parse chord to get notes
    const chord = Chord.get(chordName);
    if (chord.empty || chord.notes.length === 0) {
      console.warn('Invalid chord:', chordName);
      return;
    }

    // Add octave to notes (typical guitar range: octaves 2-5)
    // Distribute notes across guitar range for realistic voicing
    const guitarNotes = chord.notes.map((note, index) => {
      // Lower notes (root, bass) in octave 3, higher notes in octave 4
      const octave = index < 2 ? 3 : 4;
      return `${note}${octave}`;
    });

    // Use the special strum method for realistic guitar feel
    // Alternate down/up strumming for natural feel
    const direction = Math.random() > 0.5 ? 'down' : 'up';
    guitar.playStrum(guitarNotes, '2n', undefined, 0.85, direction);

  }, [enabled]);

  /**
   * Play chord when currentChord changes
   */
  useEffect(() => {
    if (!enabled || !currentChord || currentChord === lastPlayedChordRef.current) {
      return;
    }

    lastPlayedChordRef.current = currentChord;
    playChord(currentChord);
  }, [enabled, currentChord, playChord]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (guitarRef.current) {
        guitarRef.current.dispose();
        guitarRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, []);

  return {
    isReady: isInitializedRef.current,
    playChord,
    dispose: () => {
      if (guitarRef.current) {
        guitarRef.current.dispose();
        guitarRef.current = null;
      }
      isInitializedRef.current = false;
    },
  };
}
