'use client';

import { useEffect, useRef, useState } from 'react';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { FINGER_COLORS } from '@/lib/constants/canvas.constants';
import { CANVAS_RATIO } from '@/lib/constants/game.constants';
import type { PianoChordVoicing } from '@/lib/pianoChords';
import { createAudioContext } from '@/lib/utils/audio/audioContext';
import { playPianoChord } from '@/lib/utils/audio/pianoPlayback';
import {
  drawWhiteKey,
  drawBlackKey,
  drawFingerNumber,
} from '@/lib/utils/canvas/pianoKeyRendering';
import {
  getMidiNote,
  getBlackKeyMidiOffset,
  isBlackKeyPresent,
} from '@/lib/utils/canvas/pianoKeyboard';
import { ChevronLeft, ChevronRight, Hand, Volume2, VolumeX } from 'lucide-react';

interface PianoKeyboardProps {
  voicings: PianoChordVoicing[];
  currentVoicingIndex?: number;
  onVoicingChange?: (index: number) => void;
  showFingerNumbers?: boolean;
  className?: string;
}

const OCTAVE_START = 3;
const OCTAVE_COUNT = 2;

export function PianoKeyboard({
  voicings,
  currentVoicingIndex = 0,
  onVoicingChange,
  showFingerNumbers = true,
  className = '',
}: PianoKeyboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);

  const currentVoicing = voicings[currentVoicingIndex] || null;

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContext) {
      const ctx = createAudioContext();
      setAudioContext(ctx);
    }
  }, [audioContext]);

  useEffect(() => {
    if (!currentVoicing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    const totalWhiteKeys = OCTAVE_COUNT * 7;
    const keyWidth = width / totalWhiteKeys;
    const whiteKeyHeight = height * CANVAS_RATIO.BLACK_KEY_HEIGHT;
    const blackKeyHeight = height * CANVAS_RATIO.BLACK_KEY_OFFSET;
    const blackKeyWidth = keyWidth * CANVAS_RATIO.BLACK_KEY_WIDTH;

    const isNoteInChord = (midi: number): boolean => {
      return currentVoicing.position.notes.includes(midi);
    };

    const getFingerForNote = (midi: number): number | undefined => {
      const index = currentVoicing.position.notes.indexOf(midi);
      if (index === -1) return undefined;
      return currentVoicing.position.fingerNumbers?.[index];
    };

    let whiteKeyIndex = 0;
    for (let octave = OCTAVE_START; octave < OCTAVE_START + OCTAVE_COUNT; octave++) {
      for (let key = 0; key < 7; key++) {
        const x = whiteKeyIndex * keyWidth;
        const midi = getMidiNote(octave, key);
        const isPressed = isNoteInChord(midi);
        const finger = getFingerForNote(midi);

        drawWhiteKey(ctx, {
          x,
          width: keyWidth,
          height: whiteKeyHeight,
          isPressed,
          finger,
          showFingerNumbers,
          isBlackKey: false,
        });

        if (isPressed && showFingerNumbers && finger) {
          drawFingerNumber(ctx, x + keyWidth / 2, whiteKeyHeight - 30, finger, 'large');
        }

        whiteKeyIndex++;
      }
    }

    whiteKeyIndex = 0;
    for (let octave = OCTAVE_START; octave < OCTAVE_START + OCTAVE_COUNT; octave++) {
      for (let key = 0; key < 7; key++) {
        if (isBlackKeyPresent(key)) {
          const x = whiteKeyIndex * keyWidth + keyWidth - blackKeyWidth / 2;
          const blackKeyOffset = getBlackKeyMidiOffset(key);

          if (blackKeyOffset !== -1) {
            const baseNote = octave * 12 + 12;
            const midi = baseNote + blackKeyOffset;
            const isPressed = isNoteInChord(midi);
            const finger = getFingerForNote(midi);

            drawBlackKey(ctx, {
              x,
              width: blackKeyWidth,
              height: blackKeyHeight,
              isPressed,
              finger,
              showFingerNumbers,
              isBlackKey: true,
            });

            if (isPressed && showFingerNumbers && finger) {
              drawFingerNumber(ctx, x + blackKeyWidth / 2, blackKeyHeight - 20, finger, 'small');
            }
          }
        }
        whiteKeyIndex++;
      }
    }
  }, [currentVoicing, showFingerNumbers]);

  const handlePrevVoicing = () => {
    if (voicings.length <= 1) return;
    const newIndex = (currentVoicingIndex - 1 + voicings.length) % voicings.length;
    onVoicingChange?.(newIndex);
  };

  const handleNextVoicing = () => {
    if (voicings.length <= 1) return;
    const newIndex = (currentVoicingIndex + 1) % voicings.length;
    onVoicingChange?.(newIndex);
  };

  const playChord = (): void => {
    if (!audioContext || !isSoundEnabled || !currentVoicing) return;
    playPianoChord(audioContext, currentVoicing.position.notes);
  };

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
    if (!isSoundEnabled && audioContext?.state === 'suspended') {
      audioContext.resume();
    }
  };

  if (!currentVoicing) {
    return (
      <div className={`p-6 bg-muted rounded-lg ${className}`}>
        <p className="text-center text-muted-foreground">No piano chord position available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold">{currentVoicing.name}</h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{currentVoicing.positionName}</Badge>
            <Badge
              variant={
                currentVoicing.difficulty === 'beginner'
                  ? 'default'
                  : currentVoicing.difficulty === 'intermediate'
                    ? 'secondary'
                    : 'destructive'
              }
            >
              {currentVoicing.difficulty}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Hand className="h-3 w-3" />
              {currentVoicing.position.hand === 'left'
                ? 'Left Hand'
                : currentVoicing.position.hand === 'right'
                  ? 'Right Hand'
                  : 'Both Hands'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={toggleSound} title="Toggle sound">
            {isSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          {isSoundEnabled && (
            <Button variant="default" onClick={playChord}>
              Play Chord
            </Button>
          )}
        </div>
      </div>

      {/* Piano Canvas */}
      <div className="relative bg-gradient-to-b from-gray-900 to-black rounded-lg overflow-hidden p-4">
        <canvas
          ref={canvasRef}
          className="w-full h-[180px] cursor-pointer"
          onClick={isSoundEnabled ? playChord : undefined}
          style={{ display: 'block' }}
        />
      </div>

      {/* Voicing Navigation */}
      {voicings.length > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="icon" onClick={handlePrevVoicing}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Voicing {currentVoicingIndex + 1} of {voicings.length}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextVoicing}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Finger Guide */}
      {showFingerNumbers && (
        <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: FINGER_COLORS[1] }} />
            <span>Thumb</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: FINGER_COLORS[2] }} />
            <span>Index</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: FINGER_COLORS[3] }} />
            <span>Middle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: FINGER_COLORS[4] }} />
            <span>Ring</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: FINGER_COLORS[5] }} />
            <span>Pinky</span>
          </div>
        </div>
      )}
    </div>
  );
}
