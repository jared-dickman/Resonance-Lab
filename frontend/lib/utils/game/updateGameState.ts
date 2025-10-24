interface FallingChord {
  chord: string;
  color: string;
  y: number;
  timestamp: number;
  hit: boolean;
  hitQuality?: string;
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

export function updateChordPositions(
  chords: FallingChord[],
  fallSpeed: number,
  hitZoneY: number,
  height: number,
  onMiss: (gameState: GameState) => GameState
): FallingChord[] {
  const deltaPerFrame = fallSpeed / 60;
  const missThreshold = 50;
  const maxY = height + 100;

  return chords
    .map(fc => ({
      ...fc,
      y: fc.y + deltaPerFrame,
    }))
    .filter(fc => {
      if (fc.y > hitZoneY + missThreshold && !fc.hit) {
        onMiss({ score: 0, combo: 0, maxCombo: 0, perfect: 0, good: 0, miss: 1, stars: 0 });
        return false;
      }
      return fc.y < maxY;
    });
}
