"use client";

import { useEffect, useRef, useState } from "react";
import { ChordVoicing } from "@/lib/chordPositions";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { Badge } from "./ui/badge";

interface FretboardProps {
  voicings: ChordVoicing[];
  currentVoicingIndex?: number;
  onVoicingChange?: (index: number) => void;
  isLeftHanded?: boolean;
  showFingerNumbers?: boolean;
  className?: string;
}

const STRING_NAMES = ["E", "A", "D", "G", "B", "e"];
const FRET_COUNT = 12;
const FINGER_COLORS = ["#666", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export function Fretboard({
  voicings,
  currentVoicingIndex = 0,
  onVoicingChange,
  isLeftHanded = false,
  showFingerNumbers = true,
  className = "",
}: FretboardProps) {
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

    // Drawing dimensions
    const width = rect.width;
    const height = rect.height;
    const padding = 40;
    const fretboardWidth = width - padding * 2;
    const fretboardHeight = height - padding * 2;

    // Calculate visible frets
    const { baseFret, frets } = currentVoicing.position;
    const maxFret = Math.max(...frets.filter((f) => f > 0));
    const minFret = baseFret;
    const visibleFrets = Math.max(4, maxFret - minFret + 2);
    const startFret = baseFret === 1 ? 0 : baseFret - 1;
    const endFret = startFret + visibleFrets;

    const fretWidth = fretboardWidth / visibleFrets;
    const stringSpacing = fretboardHeight / 5;

    // Clear canvas
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, width, height);

    // Draw fretboard background (wood grain effect)
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, "#4a3520");
    gradient.addColorStop(0.5, "#5a4530");
    gradient.addColorStop(1, "#4a3520");
    ctx.fillStyle = gradient;
    ctx.fillRect(padding, padding, fretboardWidth, fretboardHeight);

    // Draw frets
    ctx.strokeStyle = "#c0c0c0";
    ctx.lineWidth = 2;
    for (let i = 0; i <= visibleFrets; i++) {
      const x = padding + i * fretWidth;
      const lineWidth = i === 0 && startFret === 0 ? 6 : 2;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // Draw strings
    ctx.strokeStyle = "#e0e0e0";
    for (let i = 0; i < 6; i++) {
      const y = padding + i * stringSpacing;
      const stringWidth = 1 + (5 - i) * 0.4;
      ctx.lineWidth = stringWidth;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw fret markers
    ctx.fillStyle = "#8b7355";
    const markerFrets = [3, 5, 7, 9, 12];
    markerFrets.forEach((fret) => {
      if (fret > startFret && fret <= endFret) {
        const fretIndex = fret - startFret;
        const x = padding + (fretIndex - 0.5) * fretWidth;
        if (fret === 12) {
          ctx.beginPath();
          ctx.arc(x, height / 2 - stringSpacing, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x, height / 2 + stringSpacing, 6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(x, height / 2, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // Draw fret numbers
    ctx.fillStyle = "#999";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    if (baseFret > 1) {
      ctx.fillText(`${baseFret}fr`, padding - 20, padding + stringSpacing * 2.5);
    }

    // Draw chord positions
    frets.forEach((fret, stringIndex) => {
      const y = padding + stringIndex * stringSpacing;
      const finger = currentVoicing.position.fingers[stringIndex];

      if (fret === -1) {
        // Muted string - draw X
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2;
        const size = 8;
        ctx.beginPath();
        ctx.moveTo(padding - size, y - size);
        ctx.lineTo(padding + size, y + size);
        ctx.moveTo(padding + size, y - size);
        ctx.lineTo(padding - size, y + size);
        ctx.stroke();
      } else if (fret === 0) {
        // Open string - draw O
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(padding, y, 8, 0, Math.PI * 2);
        ctx.stroke();
      } else if (fret >= startFret && fret <= endFret) {
        // Fretted note
        const fretIndex = fret - startFret;
        const x = padding + (fretIndex - 0.5) * fretWidth;

        // Draw finger dot
        const color = finger > 0 && finger <= 4 ? FINGER_COLORS[finger] : FINGER_COLORS[0];
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fill();

        // Draw finger number
        if (showFingerNumbers && finger > 0) {
          ctx.fillStyle = "#fff";
          ctx.font = "bold 12px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(finger.toString(), x, y);
        }
      }
    });

    // Draw barres
    if (currentVoicing.position.barres) {
      currentVoicing.position.barres.forEach((barre) => {
        const fretIndex = barre.fret - startFret;
        const x = padding + (fretIndex - 0.5) * fretWidth;
        const y1 = padding + (6 - barre.fromString) * stringSpacing;
        const y2 = padding + (6 - barre.toString) * stringSpacing;

        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 20;
        ctx.lineCap = "round";
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      });
    }

    // Draw string names
    ctx.fillStyle = "#999";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    STRING_NAMES.forEach((name, i) => {
      const y = padding + i * stringSpacing;
      ctx.fillText(name, padding - 25, y);
    });
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
    const { frets } = currentVoicing.position;

    // Standard guitar tuning (in Hz)
    const openStringFreqs = [82.41, 110.0, 146.83, 196.0, 246.94, 329.63];

    frets.forEach((fret, stringIndex) => {
      if (fret < 0) return; // Skip muted strings

      // Calculate frequency (each fret is one semitone)
      const baseFreq = openStringFreqs[stringIndex];
      const freq = baseFreq * Math.pow(2, fret / 12);

      // Create oscillator
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(freq, now);

      // Envelope
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(now);
      oscillator.stop(now + 1.5);
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
        <p className="text-center text-muted-foreground">No chord position available</p>
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

      {/* Fretboard Canvas */}
      <div className="relative bg-background rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-[300px] cursor-pointer"
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
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: FINGER_COLORS[1] }} />
            <span>Index</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: FINGER_COLORS[2] }} />
            <span>Middle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: FINGER_COLORS[3] }} />
            <span>Ring</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: FINGER_COLORS[4] }} />
            <span>Pinky</span>
          </div>
        </div>
      )}
    </div>
  );
}
