interface ChordSequenceItem {
  chord: string;
  time: number;
}

interface FallingChord {
  chord: string;
  color: string;
  y: number;
  timestamp: number;
  hit: boolean;
}

export function shouldSpawnChord(
  item: ChordSequenceItem,
  now: number,
  hitZoneY: number,
  spawnY: number,
  fallSpeed: number
): boolean {
  const travelTime = ((hitZoneY - spawnY) / fallSpeed) * 1000;
  const spawnTime = item.time - travelTime;
  const spawnWindow = 50;

  return now >= spawnTime && now < spawnTime + spawnWindow;
}

export function createFallingChord(
  chord: string,
  color: string,
  timestamp: number,
  spawnY: number
): FallingChord {
  return {
    chord,
    color,
    y: spawnY,
    timestamp,
    hit: false,
  };
}

export function isChordAlreadySpawned(
  existingChords: FallingChord[],
  timestamp: number
): boolean {
  const duplicateThreshold = 10;
  return existingChords.some(fc => Math.abs(fc.timestamp - timestamp) < duplicateThreshold);
}
