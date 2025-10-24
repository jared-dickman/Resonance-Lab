"use client";

import { Song } from "@/lib/types";
import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Play, Pause, RotateCcw, Zap, Star, Trophy } from "lucide-react";

interface ChordRhythmGameProps {
  song: Song;
  bpm: number;
  onChordHit?: (chord: string) => void;
  className?: string;
}

interface FallingChord {
  chord: string;
  color: string;
  y: number;
  timestamp: number;
  hit: boolean;
  hitQuality?: "perfect" | "good" | "miss";
}

interface GameState {
  score: number;
  combo: number;
  maxCombo: number;
  perfect: number;
  good: number;
  miss: number;
  stars: number;
}

const COLORS = {
  Am: "#e91e63",
  E7: "#9c27b0",
  G: "#f06292",
  D: "#3f51b5",
  F: "#ab47bc",
  C: "#42a5f5",
  Dm: "#9fa8da",
};

const getChordColor = (chord: string): string => {
  return COLORS[chord as keyof typeof COLORS] || `hsl(${(chord.charCodeAt(0) * 137) % 360}, 70%, 60%)`;
};

export function ChordRhythmGame({ song, bpm, onChordHit, className = "" }: ChordRhythmGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    combo: 0,
    maxCombo: 0,
    perfect: 0,
    good: 0,
    miss: 0,
    stars: 0,
  });
  const [fallingChords, setFallingChords] = useState<FallingChord[]>([]);
  const gameStateRef = useRef(gameState);
  const startTimeRef = useRef<number>(0);
  const animationRef = useRef<number>(0);
  const [currentActiveChords, setCurrentActiveChords] = useState<string[]>([]);
  const [hitEffects, setHitEffects] = useState<{ chord: string; quality: string; x: number; y: number; time: number }[]>([]);

  // Build chord sequence with timing
  const chordSequence = useRef<{ chord: string; time: number }[]>([]);

  useEffect(() => {
    const sequence: { chord: string; time: number }[] = [];
    let currentTime = 0;
    const beatDuration = (60 / bpm) * 1000; // ms per beat

    song.sections.forEach((section) => {
      section.lines.forEach((line) => {
        if (line.chord?.name) {
          sequence.push({
            chord: line.chord.name,
            time: currentTime,
          });
          currentTime += beatDuration * 2; // 2 beats per chord
        }
      });
    });

    chordSequence.current = sequence;
  }, [song, bpm]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const resetGame = useCallback(() => {
    setGameState({
      score: 0,
      combo: 0,
      maxCombo: 0,
      perfect: 0,
      good: 0,
      miss: 0,
      stars: 0,
    });
    setFallingChords([]);
    setHitEffects([]);
    startTimeRef.current = 0;
  }, []);

  const handleKeyPress = useCallback((chord: string) => {
    const now = performance.now() - startTimeRef.current;
    const hitWindow = 300; // ms window for hitting

    let bestHitChord: FallingChord | null = null;
    let bestDistance = Infinity;

    fallingChords.forEach((fc) => {
      if (fc.chord === chord && !fc.hit) {
        const distance = Math.abs(fc.timestamp - now);
        if (distance < bestDistance && distance < hitWindow) {
          bestDistance = distance;
          bestHitChord = fc;
        }
      }
    });

    if (bestHitChord) {
      const quality: "perfect" | "good" | "miss" = bestDistance < 100 ? "perfect" : bestDistance < 200 ? "good" : "miss";
      const hitChord: FallingChord = bestHitChord;
      hitChord.hit = true;
      hitChord.hitQuality = quality;

      const points = quality === "perfect" ? 100 : quality === "good" ? 50 : 0;
      const newCombo = quality !== "miss" ? gameStateRef.current.combo + 1 : 0;
      const multiplier = Math.floor(newCombo / 10) + 1;

      setGameState((prev) => ({
        ...prev,
        score: prev.score + points * multiplier,
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        [quality]: prev[quality] + 1,
      }));

      // Add hit effect
      setHitEffects((prev) => [
        ...prev,
        { chord, quality, x: 400 + Math.random() * 100, y: 500, time: now },
      ]);

      onChordHit?.(chord);
    }
  }, [fallingChords, onChordHit]);

  // Keyboard controls
  useEffect(() => {
    const keyMap: Record<string, string> = {
      a: "Am",
      s: "E7",
      d: "G",
      f: "D",
      j: "F",
      k: "C",
      l: "Dm",
    };

    const handleKey = (e: KeyboardEvent) => {
      const chord = keyMap[e.key.toLowerCase()];
      if (chord && isPlaying) {
        handleKeyPress(chord);
        setCurrentActiveChords((prev) => [...prev, chord]);
        setTimeout(() => {
          setCurrentActiveChords((prev) => prev.filter((c) => c !== chord));
        }, 100);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isPlaying, handleKeyPress]);

  // Game loop
  useEffect(() => {
    if (!isPlaying || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (startTimeRef.current === 0) {
      startTimeRef.current = performance.now();
    }

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const fallSpeed = 200; // pixels per second
    const spawnY = -100;
    const hitZoneY = height - 120;

    const animate = () => {
      if (!isPlaying) return;

      const now = performance.now() - startTimeRef.current;

      // Spawn new chords
      chordSequence.current.forEach((item) => {
        const travelTime = (hitZoneY - spawnY) / fallSpeed * 1000;
        const spawnTime = item.time - travelTime;

        if (now >= spawnTime && now < spawnTime + 50) {
          setFallingChords((prev) => {
            if (prev.some((fc) => Math.abs(fc.timestamp - item.time) < 10)) {
              return prev;
            }
            return [
              ...prev,
              {
                chord: item.chord,
                color: getChordColor(item.chord),
                y: spawnY,
                timestamp: item.time,
                hit: false,
              },
            ];
          });
        }
      });

      // Update positions
      setFallingChords((prev) => {
        return prev
          .map((fc) => ({
            ...fc,
            y: fc.y + (fallSpeed / 60),
          }))
          .filter((fc) => {
            // Remove if passed hit zone and not hit
            if (fc.y > hitZoneY + 50 && !fc.hit) {
              setGameState((gs) => ({
                ...gs,
                miss: gs.miss + 1,
                combo: 0,
              }));
              return false;
            }
            return fc.y < height + 100;
          });
      });

      // Clear canvas
      ctx.fillStyle = "rgba(10, 10, 10, 0.3)";
      ctx.fillRect(0, 0, width, height);

      // Draw background grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }

      // Draw hit zone
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillRect(0, hitZoneY - 30, width, 60);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 3;
      ctx.strokeRect(0, hitZoneY - 30, width, 60);

      // Perfect zone indicator
      ctx.fillStyle = "rgba(76, 175, 80, 0.2)";
      ctx.fillRect(0, hitZoneY - 10, width, 20);

      // Draw falling chords
      const chordTypes = ["Am", "E7", "G", "D", "F", "C", "Dm"];
      const chordWidth = width / chordTypes.length;

      fallingChords.forEach((fc) => {
        const index = chordTypes.indexOf(fc.chord);
        if (index === -1) return;

        const x = index * chordWidth + chordWidth / 2;

        // Glow effect
        if (!fc.hit) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = fc.color;
        }

        // Draw chord block
        const gradient = ctx.createLinearGradient(x - 30, fc.y - 20, x - 30, fc.y + 20);
        gradient.addColorStop(0, fc.color);
        gradient.addColorStop(1, fc.color.replace(")", ", 0.6)").replace("rgb", "rgba"));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x - 30, fc.y - 20, 60, 40, 8);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Hit effect
        if (fc.hit && fc.hitQuality) {
          const opacity = Math.max(0, 1 - (now - fc.timestamp + 200) / 500);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.font = "bold 24px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(fc.hitQuality.toUpperCase(), x, fc.y - 40);

          // Burst effect
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const dist = 40 * (1 - opacity);
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
            ctx.beginPath();
            ctx.arc(x + Math.cos(angle) * dist, fc.y + Math.sin(angle) * dist, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Chord label
        ctx.fillStyle = "#fff";
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(fc.chord, x, fc.y);
      });

      // Draw lanes
      chordTypes.forEach((chord, index) => {
        const x = index * chordWidth + chordWidth / 2;
        const isActive = currentActiveChords.includes(chord);

        // Lane highlight
        if (isActive) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
          ctx.fillRect(index * chordWidth, 0, chordWidth, height);
        }

        // Bottom key indicator
        const gradient = ctx.createRadialGradient(x, height - 40, 0, x, height - 40, 25);
        gradient.addColorStop(0, getChordColor(chord));
        gradient.addColorStop(1, "rgba(0,0,0,0.5)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, height - 40, isActive ? 28 : 25, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isActive ? "#fff" : "rgba(255,255,255,0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#fff";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(chord, x, height - 40);

        // Key binding
        const keys = ["A", "S", "D", "F", "J", "K", "L"];
        ctx.font = "10px sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fillText(keys[index], x, height - 15);
      });

      // Draw effects
      setHitEffects((prev) => prev.filter((effect) => now - effect.time < 1000));

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, fallingChords, currentActiveChords, bpm]);

  // Calculate stars
  useEffect(() => {
    const total = gameState.perfect + gameState.good + gameState.miss;
    if (total === 0) return;

    const accuracy = ((gameState.perfect * 100 + gameState.good * 50) / (total * 100)) * 100;
    const stars = accuracy >= 95 ? 5 : accuracy >= 85 ? 4 : accuracy >= 70 ? 3 : accuracy >= 50 ? 2 : 1;

    setGameState((prev) => ({ ...prev, stars }));
  }, [gameState.perfect, gameState.good, gameState.miss]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Chord Hero Mode
            </CardTitle>
            <p className="text-sm text-muted-foreground">Press keys A-S-D-F-J-K-L to hit chords!</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={isPlaying ? "destructive" : "default"}
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
              {isPlaying ? "Pause" : "Start"}
            </Button>
            <Button variant="outline" size="sm" onClick={resetGame}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <Badge variant="default" className="gap-1">
            <Trophy className="h-3 w-3" />
            Score: {gameState.score.toLocaleString()}
          </Badge>
          <Badge variant="secondary">
            Combo: {gameState.combo}× (Max: {gameState.maxCombo}×)
          </Badge>
          <Badge variant="outline" className="bg-green-500/20 text-green-400">
            Perfect: {gameState.perfect}
          </Badge>
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400">
            Good: {gameState.good}
          </Badge>
          <Badge variant="outline" className="bg-red-500/20 text-red-400">
            Miss: {gameState.miss}
          </Badge>
          <Badge variant="outline" className="gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < gameState.stars ? "fill-yellow-500 text-yellow-500" : "text-gray-600"}`}
              />
            ))}
          </Badge>
        </div>

        {/* Game Canvas */}
        <div className="relative bg-gradient-to-b from-gray-900 to-black rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-[500px]"
            style={{ display: "block" }}
          />
        </div>

        {/* Instructions */}
        <div className="mt-4 text-sm text-muted-foreground space-y-2">
          <p>🎮 Use keyboard keys A-S-D-F-J-K-L to hit the chords as they reach the hit zone!</p>
          <p>🎯 Perfect hits (green zone) = 100pts | Good hits (white zone) = 50pts</p>
          <p>🔥 Build combos for score multipliers! (10 combo = 2x, 20 combo = 3x, etc.)</p>
        </div>
      </CardContent>
    </Card>
  );
}
