'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pause, Volume2 } from 'lucide-react';
import styles from './Metronome.module.css';
import { logger } from '@/lib/logger';
import { METRONOME } from '@/lib/constants/metronome.constants';

const TEMPO_PRESETS = [
  { label: 'Largo', bpm: 50 },
  { label: 'Andante', bpm: 80 },
  { label: 'Moderato', bpm: 108 },
  { label: 'Allegro', bpm: 140 },
  { label: 'Presto', bpm: 180 },
];

const TIME_SIGNATURES = ['4/4', '3/4', '2/4', '6/8', '5/4', '7/8', '1/4'];

// Generate pleasant click sounds using Web Audio API
const createClickSound = (
  context: AudioContext,
  frequency: number,
  duration: number,
  isAccent: boolean
) => {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  const filter = context.createBiquadFilter();

  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(context.destination);

  // Use a sine wave for a softer, more pleasant click
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;

  // Filter settings for a warmer sound
  filter.type = 'lowpass';
  filter.frequency.value = 2000;
  filter.Q.value = 1;

  // Volume envelope for natural click
  const now = context.currentTime;
  const volume = isAccent ? 0.3 : 0.2;

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(volume, now + 0.001);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

  oscillator.start(now);
  oscillator.stop(now + duration);

  return { oscillator, gainNode };
};

export function MetronomeClient() {
  const [bpm, setBpm] = useState<number>(METRONOME.DEFAULT_BPM);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [accentFirstBeat, setAccentFirstBeat] = useState(true);
  const [clickSound, setClickSound] = useState(0); // 0, 1, 2 for different click sounds

  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);
  const nextBeatTimeRef = useRef<number>(0);
  const schedulerIntervalRef = useRef<number | null>(null);

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const getBeatsPerMeasure = useCallback(() => {
    const [beats] = timeSignature.split('/').map(Number);
    return beats;
  }, [timeSignature]);

  const playClick = useCallback(
    (beatNumber: number) => {
      if (!audioContextRef.current) return;

      const isAccent = accentFirstBeat && beatNumber === 0;

      // Different frequencies for different click sounds
      const frequencies = [
        [880, 440], // Click sound 0: high/low
        [1000, 600], // Click sound 1: higher contrast
        [800, 500], // Click sound 2: mid-range
      ];

      const [accentFreq, normalFreq] = frequencies[clickSound];
      const frequency = isAccent ? accentFreq : normalFreq;
      const duration = isAccent ? 0.08 : 0.05;

      createClickSound(audioContextRef.current, frequency, duration, isAccent);
    },
    [accentFirstBeat, clickSound]
  );

  const scheduleNote = useCallback(
    (beatNumber: number, time: number) => {
      // Schedule the visual update
      const delay = (time - audioContextRef.current!.currentTime) * 1000;
      setTimeout(() => {
        setCurrentBeat(beatNumber);
      }, delay);

      // Schedule the audio
      if (audioContextRef.current) {
        const context = audioContextRef.current;
        const isAccent = accentFirstBeat && beatNumber === 0;

        const frequencies = [
          [880, 440],
          [1000, 600],
          [800, 500],
        ];

        const [accentFreq, normalFreq] = frequencies[clickSound];
        const frequency = isAccent ? accentFreq : normalFreq;
        const duration = isAccent ? 0.08 : 0.05;

        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        const filter = context.createBiquadFilter();

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;

        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        filter.Q.value = 1;

        const volume = isAccent ? 0.3 : 0.2;

        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(volume, time + 0.001);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + duration);

        oscillator.start(time);
        oscillator.stop(time + duration);
      }
    },
    [accentFirstBeat, clickSound]
  );

  const scheduler = useCallback(() => {
    if (!audioContextRef.current) return;

    const scheduleAheadTime = 0.1; // Schedule 100ms ahead
    const currentTime = audioContextRef.current.currentTime;

    while (nextBeatTimeRef.current < currentTime + scheduleAheadTime) {
      const beatsPerMeasure = getBeatsPerMeasure();
      const beatNumber = currentBeat % beatsPerMeasure;

      scheduleNote(beatNumber, nextBeatTimeRef.current);

      const secondsPerBeat = 60.0 / bpm;
      nextBeatTimeRef.current += secondsPerBeat;

      setCurrentBeat(prev => (prev + 1) % beatsPerMeasure);
    }
  }, [bpm, currentBeat, getBeatsPerMeasure, scheduleNote]);

  useEffect(() => {
    if (isPlaying && audioContextRef.current) {
      setCurrentBeat(0);
      nextBeatTimeRef.current = audioContextRef.current.currentTime;
      schedulerIntervalRef.current = window.setInterval(scheduler, 25);
    } else {
      if (schedulerIntervalRef.current) {
        clearInterval(schedulerIntervalRef.current);
        schedulerIntervalRef.current = null;
      }
    }

    return () => {
      if (schedulerIntervalRef.current) {
        clearInterval(schedulerIntervalRef.current);
      }
    };
  }, [isPlaying, scheduler]);

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 30 && value <= 300) {
      setBpm(value);
    }
  };

  const togglePlay = () => {
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTap = () => {
    // Tap tempo functionality can be added here
    logger.log('Tap tempo');
  };

  const cycleClickSound = () => {
    setClickSound(prev => (prev + 1) % 3);
  };

  return (
    <div className={styles.container}>
      <Card className={styles.metronomeCard}>
        {/* Indicator light */}
        <div className={styles.indicatorContainer}>
          <div
            className={`${styles.indicator} ${
              isPlaying && currentBeat === 0 ? styles.indicatorActive : ''
            }`}
          />
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
          {TEMPO_PRESETS.map(preset => (
            <button
              key={preset.label}
              onClick={() => setBpm(preset.bpm)}
              className={`${styles.presetButton} ${
                bpm === preset.bpm ? styles.presetButtonActive : ''
              }`}
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
            {TIME_SIGNATURES.map(sig => (
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
