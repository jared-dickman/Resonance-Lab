'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Pause, Volume2 } from 'lucide-react';
import styles from './Metronome.module.css';
import { logger } from '@/lib/logger';
import { METRONOME } from '@/lib/constants/metronome.constants';
import * as Tone from 'tone';

const TEMPO_PRESETS = [
  { label: 'Largo', bpm: 50 },
  { label: 'Andante', bpm: 80 },
  { label: 'Moderato', bpm: 108 },
  { label: 'Allegro', bpm: 140 },
  { label: 'Presto', bpm: 180 },
];

const TIME_SIGNATURES = ['4/4', '3/4', '2/4', '6/8', '5/4', '7/8', '1/4'];

export function MetronomeClient() {
  const [bpm, setBpm] = useState<number>(METRONOME.DEFAULT_BPM);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [accentFirstBeat, setAccentFirstBeat] = useState(true);
  const [clickSound, setClickSound] = useState(0); // 0, 1, 2 for different click sounds

  const sliderRef = useRef<HTMLInputElement>(null);
  const synthRef = useRef<Tone.Synth | null>(null);
  const loopRef = useRef<Tone.Loop | null>(null);
  const tapTimesRef = useRef<number[]>([]);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Tone.js synth
  useEffect(() => {
    synthRef.current = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        release: 0.1,
      },
    }).toDestination();

    return () => {
      synthRef.current?.dispose();
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    };
  }, []);

  const getBeatsPerMeasure = useCallback(() => {
    const beats = timeSignature.split('/')[0];
    return beats ? parseInt(beats, 10) : 4;
  }, [timeSignature]);

  // Update slider gradient
  useEffect(() => {
    if (sliderRef.current) {
      const percentage = ((bpm - 30) / (300 - 30)) * 100;
      sliderRef.current.style.setProperty('--value', `${percentage}%`);
    }
  }, [bpm]);

  // Handle metronome playback with Tone.js
  useEffect(() => {
    if (isPlaying) {
      const beatsPerMeasure = getBeatsPerMeasure();
      let beat = 0;

      // Set tempo (AudioContext is already started by user gesture in togglePlay)
      Tone.Transport.bpm.value = bpm;

      // Create a loop for the metronome
      loopRef.current = new Tone.Loop((time) => {
        const isAccent = accentFirstBeat && beat === 0;

        // Get frequency based on sound type and accent
        const frequencies = [
          [880, 440], // Sound 1
          [1000, 600], // Sound 2
          [800, 500], // Sound 3
        ] as const;

        const soundFreqs = frequencies[clickSound] ?? frequencies[0];
        const [accentFreq, normalFreq] = soundFreqs;
        const frequency = isAccent ? accentFreq : normalFreq;

        // Play the sound
        if (synthRef.current) {
          synthRef.current.triggerAttackRelease(frequency, '16n', time);
        }

        // Update UI beat indicator
        Tone.Draw.schedule(() => {
          setCurrentBeat(beat);
        }, time);

        beat = (beat + 1) % beatsPerMeasure;
      }, '4n');

      loopRef.current.start(0);
      Tone.Transport.start();
    } else {
      // Stop playback
      if (loopRef.current) {
        loopRef.current.stop();
        loopRef.current.dispose();
        loopRef.current = null;
      }
      Tone.Transport.stop();
      setCurrentBeat(0);
    }

    return () => {
      if (loopRef.current) {
        loopRef.current.stop();
        loopRef.current.dispose();
        loopRef.current = null;
      }
      Tone.Transport.stop();
    };
  }, [isPlaying, bpm, timeSignature, accentFirstBeat, clickSound, getBeatsPerMeasure]);

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 30 && value <= 300) {
      setBpm(value);
    }
  };

  const togglePlay = async () => {
    // Start Tone.js audio context on user interaction
    await Tone.start();
    setIsPlaying(!isPlaying);
  };

  const handleTap = () => {
    const now = Date.now();

    // Clear existing timeout
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    // Add current tap time
    tapTimesRef.current.push(now);

    // Keep only the last 4 taps for averaging
    if (tapTimesRef.current.length > 4) {
      tapTimesRef.current.shift();
    }

    // Calculate BPM if we have at least 2 taps
    if (tapTimesRef.current.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        const currentTap = tapTimesRef.current[i];
        const previousTap = tapTimesRef.current[i - 1];
        if (currentTap !== undefined && previousTap !== undefined) {
          intervals.push(currentTap - previousTap);
        }
      }

      // Calculate average interval in milliseconds
      const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;

      // Convert to BPM (60000 ms per minute / interval in ms)
      const calculatedBpm = Math.round(60000 / avgInterval);

      // Clamp to valid range
      const newBpm = Math.max(30, Math.min(300, calculatedBpm));
      setBpm(newBpm);
    }

    // Reset tap times after 2 seconds of no tapping
    tapTimeoutRef.current = setTimeout(() => {
      tapTimesRef.current = [];
    }, 2000);
  };

  const cycleClickSound = () => {
    setClickSound((prev) => (prev + 1) % 3);
  };

  return (
    <div className={styles.container}>
      <Card className={styles.metronomeCard}>
        {/* Indicator light */}
        <div className={styles.indicatorContainer}>
          <div className={`${styles.indicator} ${isPlaying && currentBeat === 0 ? styles.indicatorActive : ''}`} />
        </div>

        {/* BPM Display */}
        <div className={styles.bpmDisplay}>
          <div className={styles.bpmNumber}>{bpm}</div>
          <div className={styles.bpmLabel}>BPM</div>
        </div>

        {/* Tempo Slider */}
        <div className={styles.tempoControl}>
          <label className={styles.tempoLabel}>Tempo</label>
          <div className={styles.sliderContainer}>
            <input
              ref={sliderRef}
              type="range"
              min="30"
              max="300"
              value={bpm}
              onChange={handleBpmChange}
              className={styles.slider}
            />
            <input
              type="number"
              min="30"
              max="300"
              value={bpm}
              onChange={handleBpmChange}
              className={styles.bpmInput}
            />
          </div>
        </div>

        {/* Tempo Presets */}
        <div className={styles.presets}>
          {TEMPO_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setBpm(preset.bpm)}
              className={`${styles.presetButton} ${bpm === preset.bpm ? styles.presetButtonActive : ''}`}
            >
              <div className={styles.presetLabel}>{preset.label}</div>
              <div className={styles.presetBpm}>{preset.bpm}</div>
            </button>
          ))}
        </div>

        {/* Time Signature */}
        <div className={styles.timeSignatureSection}>
          <label className={styles.timeSignatureLabel}>Time Signature</label>
          <div className={styles.timeSignatureGrid}>
            {TIME_SIGNATURES.map((sig) => (
              <button
                key={sig}
                onClick={() => {
                  setTimeSignature(sig);
                  setCurrentBeat(0);
                }}
                className={`${styles.timeSignatureButton} ${
                  timeSignature === sig ? styles.timeSignatureButtonActive : ''
                }`}
              >
                {sig}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Options */}
        <div className={styles.optionsSection}>
          <button
            onClick={() => setAccentFirstBeat(!accentFirstBeat)}
            className={`${styles.optionButton} ${accentFirstBeat ? styles.optionButtonActive : ''}`}
          >
            Accent Beat 1
          </button>
          <button onClick={cycleClickSound} className={styles.optionButton}>
            <Volume2 className="w-4 h-4 mr-2" />
            Click Sound {clickSound + 1}
          </button>
        </div>

        {/* Control Buttons */}
        <div className={styles.controls}>
          <button onClick={togglePlay} className={styles.playButton}>
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5 mr-2" />
                Start
              </>
            )}
          </button>
          <button onClick={handleTap} className={styles.tapButton}>
            <Volume2 className="w-5 h-5 mr-2" />
            Tap
          </button>
        </div>
      </Card>
    </div>
  );
}
