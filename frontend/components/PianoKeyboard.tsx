"use client";

import { useEffect, useRef, useState } from "react";
import { PianoChordVoicing, midiToFrequency } from "@/lib/pianoChords";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Hand } from "lucide-react";
import { Badge } from "./ui/badge";

interface PianoKeyboardProps {
  voicings: PianoChordVoicing[];
  currentVoicingIndex?: number;
  onVoicingChange?: (index: number) => void;
  showFingerNumbers?: boolean;
  className?: string;
}

const OCTAVE_START = 3; // C3
const OCTAVE_COUNT = 2; // Show 2 octaves
const WHITE_KEY_WIDTH = 40;
const WHITE_KEY_HEIGHT = 160;
const BLACK_KEY_WIDTH = 24;
const BLACK_KEY_HEIGHT = 100;

// Pattern of black keys: 1=black key present, 0=no black key after this white key
const BLACK_KEY_PATTERN = [1, 1, 0, 1, 1, 1, 0]; // C, D, E, F, G, A, B

const FINGER_COLORS = ["#666", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#a855f7"];

export function PianoKeyboard({
  voicings,
  currentVoicingIndex = 0,
  onVoicingChange,
  showFingerNumbers = true,
  className = "",
}: PianoKeyboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);

  const currentVoicing = voicings[currentVoicingIndex] || null;

  useEffect(() => {
    if (typeof window !== "undefined" && !audioContext) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
    }
  }, [audioContext]);

  useEffect(() => {
    if (!currentVoicing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, width, height);

    const totalWhiteKeys = OCTAVE_COUNT * 7;
    const keyWidth = width / totalWhiteKeys;
    const whiteKeyHeight = height * 0.7;
    const blackKeyHeight = height * 0.45;
    const blackKeyWidth = keyWidth * 0.6;

    // Helper to get MIDI note for a key
    const getMidiNote = (octave: number, keyIndex: number): number => {
      const baseNote = octave * 12 + 12; // C0 = 12
      const offsets = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B
      return baseNote + offsets[keyIndex];
    };

    // Helper to check if note is in chord
    const isNoteInChord = (midi: number): boolean => {
      return currentVoicing.position.notes.includes(midi);
    };

    // Helper to get finger number for note
    const getFingerNumber = (midi: number): number | undefined => {
      const index = currentVoicing.position.notes.indexOf(midi);
      if (index === -1) return undefined;
      return currentVoicing.position.fingerNumbers?.[index];
    };

    // Draw white keys
    let whiteKeyIndex = 0;
    for (let octave = OCTAVE_START; octave < OCTAVE_START + OCTAVE_COUNT; octave++) {
      for (let key = 0; key < 7; key++) {
        const x = whiteKeyIndex * keyWidth;
        const midi = getMidiNote(octave, key);
        const isPressed = isNoteInChord(midi);
        const finger = getFingerNumber(midi);

        // Key background
        const gradient = ctx.createLinearGradient(x, 0, x, whiteKeyHeight);
        if (isPressed) {
          gradient.addColorStop(0, "#3b82f6");
          gradient.addColorStop(1, "#2563eb");
        } else {
          gradient.addColorStop(0, "#f5f5f5");
          gradient.addColorStop(1, "#e0e0e0");
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(x, 0, keyWidth - 1, whiteKeyHeight);

        // Key border
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, 0, keyWidth - 1, whiteKeyHeight);

        // Shadow at bottom
        const shadowGradient = ctx.createLinearGradient(x, whiteKeyHeight - 20, x, whiteKeyHeight);
        shadowGradient.addColorStop(0, "rgba(0,0,0,0)");
        shadowGradient.addColorStop(1, "rgba(0,0,0,0.2)");
        ctx.fillStyle = shadowGradient;
        ctx.fillRect(x, whiteKeyHeight - 20, keyWidth - 1, 20);

        // Finger number
        if (isPressed && showFingerNumbers && finger) {
          const color = FINGER_COLORS[finger] || "#666";
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x + keyWidth / 2, whiteKeyHeight - 30, 12, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#fff";
          ctx.font = "bold 14px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(finger.toString(), x + keyWidth / 2, whiteKeyHeight - 30);
        }

        whiteKeyIndex++;
      }
    }

    // Draw black keys
    whiteKeyIndex = 0;
    for (let octave = OCTAVE_START; octave < OCTAVE_START + OCTAVE_COUNT; octave++) {
      for (let key = 0; key < 7; key++) {
        if (BLACK_KEY_PATTERN[key] === 1) {
          const x = whiteKeyIndex * keyWidth + keyWidth - blackKeyWidth / 2;
          const offsets = [1, 3, -1, 6, 8, 10, -1]; // C#, D#, -, F#, G#, A#, -
          const blackKeyOffset = offsets[key];

          if (blackKeyOffset !== -1) {
            const baseNote = octave * 12 + 12;
            const midi = baseNote + blackKeyOffset;
            const isPressed = isNoteInChord(midi);
            const finger = getFingerNumber(midi);

            // Key background
            const gradient = ctx.createLinearGradient(x, 0, x, blackKeyHeight);
            if (isPressed) {
              gradient.addColorStop(0, "#3b82f6");
              gradient.addColorStop(1, "#1d4ed8");
            } else {
              gradient.addColorStop(0, "#1a1a1a");
              gradient.addColorStop(1, "#000");
            }
            ctx.fillStyle = gradient;
            ctx.fillRect(x, 0, blackKeyWidth, blackKeyHeight);

            // Key border
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 1;
            ctx.strokeRect(x, 0, blackKeyWidth, blackKeyHeight);

            // Highlight on top
            ctx.fillStyle = "rgba(255,255,255,0.1)";
            ctx.fillRect(x + 2, 2, blackKeyWidth - 4, 8);

            // Finger number
            if (isPressed && showFingerNumbers && finger) {
              const color = FINGER_COLORS[finger] || "#666";
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(x + blackKeyWidth / 2, blackKeyHeight - 20, 10, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = "#fff";
              ctx.font = "bold 12px sans-serif";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(finger.toString(), x + blackKeyWidth / 2, blackKeyHeight - 20);
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

  const playChord = () => {
    if (!audioContext || !isSoundEnabled || !currentVoicing) return;

    const now = audioContext.currentTime;
    const { notes } = currentVoicing.position;

    notes.forEach((midi, index) => {
      const freq = midiToFrequency(midi);

      // Create oscillator
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(freq, now);

      // Envelope with slight stagger for piano-like attack
      const startTime = now + index * 0.01;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 2);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + 2);
    });
  };

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
    if (!isSoundEnabled && audioContext?.state === "suspended") {
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
                currentVoicing.difficulty === "beginner"
                  ? "default"
                  : currentVoicing.difficulty === "intermediate"
                  ? "secondary"
                  : "destructive"
              }
            >
              {currentVoicing.difficulty}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Hand className="h-3 w-3" />
              {currentVoicing.position.hand === "left"
                ? "Left Hand"
                : currentVoicing.position.hand === "right"
                ? "Right Hand"
                : "Both Hands"}
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
          style={{ display: "block" }}
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
