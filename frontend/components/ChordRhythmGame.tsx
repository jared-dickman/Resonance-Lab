'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { GAME_VISUAL } from '@/lib/constants/game.constants';
import type { HitQuality } from '@/lib/enums/hitQuality.enum';
import type { Song } from '@/lib/types';
import { clearCanvas } from '@/lib/utils/canvas/clearCanvas';
import { drawGrid } from '@/lib/utils/canvas/drawGrid';
import { drawHitZone } from '@/lib/utils/canvas/drawHitZone';
import { calculateCombo, calculateScoreMultiplier } from '@/lib/utils/game/calculateCombo';
import { findBestHitChord } from '@/lib/utils/game/detectHit';
import { drawFallingChords } from '@/lib/utils/game/drawFallingChords';
import { drawLanes } from '@/lib/utils/game/drawLanes';
import {
  createFallingChord,
  isChordAlreadySpawned,
  shouldSpawnChord,
} from '@/lib/utils/game/processChordSpawn';
import { generateChordColor, processHit } from '@/lib/utils/game/scoring';
import { Pause, Play, RotateCcw, Star, Trophy, Zap } from 'lucide-react';

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
  hitQuality?: HitQuality;
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

const PREDEFINED_CHORD_COLORS: Record<string, string> = {
  Am: '#e91e63',
  E7: '#9c27b0',
  G: '#f06292',
  D: '#3f51b5',
  F: '#ab47bc',
  C: '#42a5f5',
  Dm: '#9fa8da',
};

function getChordColor(chord: string): string {
  return PREDEFINED_CHORD_COLORS[chord] || generateChordColor(chord);
}

const CHORD_TYPES = ['Am', 'E7', 'G', 'D', 'F', 'C', 'Dm'];
const SPAWN_Y = -100;
const HIT_ZONE_OFFSET = 120;

export function ChordRhythmGame({ song, bpm, onChordHit, className = '' }: ChordRhythmGameProps) {
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
  const [_hitEffects, setHitEffects] = useState<
    { chord: string; quality: string; x: number; y: number; time: number }[]
  >([]);

  const chordSequence = useRef<{ chord: string; time: number }[]>([]);

  useEffect(() => {
    const sequence: { chord: string; time: number }[] = [];
    let currentTime = 0;
    const beatDuration = (60 / bpm) * 1000; // ms per beat

    song.sections.forEach(section => {
      section.lines.forEach(line => {
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

  const handleKeyPress = useCallback(
    (chord: string) => {
      const now = performance.now() - startTimeRef.current;
      const hitData = findBestHitChord(chord, fallingChords, now);

      if (hitData) {
        const { chord: hitChord, distance } = hitData;
        const hitResult = processHit(distance);

        hitChord.hit = true;
        hitChord.hitQuality = hitResult.quality;

        const newCombo = calculateCombo(gameStateRef.current.combo, hitResult.quality);
        const multiplier = calculateScoreMultiplier(newCombo);

        setGameState(prev => ({
          ...prev,
          score: prev.score + hitResult.points * multiplier,
          combo: newCombo,
          maxCombo: Math.max(prev.maxCombo, newCombo),
          [hitResult.quality]: prev[hitResult.quality as keyof GameState] + 1,
        }));

        setHitEffects(prev => [
          ...prev,
          { chord, quality: hitResult.quality, x: 400 + Math.random() * 100, y: 500, time: now },
        ]);

        onChordHit?.(chord);
      }
    },
    [fallingChords, onChordHit]
  );

  useEffect(() => {
    const keyMap: Record<string, string> = {
      a: 'Am',
      s: 'E7',
      d: 'G',
      f: 'D',
      j: 'F',
      k: 'C',
      l: 'Dm',
    };

    const handleKey = (e: KeyboardEvent) => {
      const chord = keyMap[e.key.toLowerCase()];
      if (chord && isPlaying) {
        handleKeyPress(chord);
        setCurrentActiveChords(prev => [...prev, chord]);
        setTimeout(() => {
          setCurrentActiveChords(prev => prev.filter(c => c !== chord));
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPlaying, handleKeyPress]);

  useEffect(() => {
    if (!isPlaying || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
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
    const fallSpeed = GAME_VISUAL.FALL_SPEED_PX_PER_SEC;
    const hitZoneY = height - HIT_ZONE_OFFSET;

    const animate = (): void => {
      if (!isPlaying) return;

      const now = performance.now() - startTimeRef.current;

      chordSequence.current.forEach(item => {
        if (shouldSpawnChord(item, now, hitZoneY, SPAWN_Y, fallSpeed)) {
          setFallingChords(prev => {
            if (isChordAlreadySpawned(prev, item.time)) {
              return prev;
            }
            return [
              ...prev,
              createFallingChord(item.chord, getChordColor(item.chord), item.time, SPAWN_Y),
            ];
          });
        }
      });

      setFallingChords(prev => {
        return prev
          .map(fc => ({
            ...fc,
            y: fc.y + fallSpeed / 60,
          }))
          .filter(fc => {
            if (fc.y > hitZoneY + 50 && !fc.hit) {
              setGameState(gs => ({
                ...gs,
                miss: gs.miss + 1,
                combo: 0,
              }));
              return false;
            }
            return fc.y < height + 100;
          });
      });

      clearCanvas(ctx, { width, height });
      drawGrid(ctx, { width, height });
      drawHitZone(ctx, { width, hitZoneY });
      drawFallingChords(ctx, fallingChords, CHORD_TYPES, { width, now, getChordColor });
      drawLanes(ctx, CHORD_TYPES, { width, height, currentActiveChords, getChordColor });

      setHitEffects(prev => prev.filter(effect => now - effect.time < 1000));

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, fallingChords, currentActiveChords, bpm]);

  useEffect(() => {
    const total = gameState.perfect + gameState.good + gameState.miss;
    if (total === 0) return;

    const accuracy = ((gameState.perfect * 100 + gameState.good * 50) / (total * 100)) * 100;
    const stars =
      accuracy >= 95 ? 5 : accuracy >= 85 ? 4 : accuracy >= 70 ? 3 : accuracy >= 50 ? 2 : 1;

    setGameState(prev => ({ ...prev, stars }));
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
              variant={isPlaying ? 'destructive' : 'default'}
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
              {isPlaying ? 'Pause' : 'Start'}
            </Button>
            <Button variant="outline" size="sm" onClick={resetGame}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
                className={`h-3 w-3 ${i < gameState.stars ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`}
              />
            ))}
          </Badge>
        </div>

        <div className="relative bg-gradient-to-b from-gray-900 to-black rounded-lg overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-[500px]" style={{ display: 'block' }} />
        </div>

        <div className="mt-4 text-sm text-muted-foreground space-y-2">
          <p>🎮 Use keyboard keys A-S-D-F-J-K-L to hit the chords as they reach the hit zone!</p>
          <p>🎯 Perfect hits (green zone) = 100pts | Good hits (white zone) = 50pts</p>
          <p>🔥 Build combos for score multipliers! (10 combo = 2x, 20 combo = 3x, etc.)</p>
        </div>
      </CardContent>
    </Card>
  );
}
