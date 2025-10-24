import { Music2 } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DEFAULT_BPM, DEFAULT_CHORD_DURATION, DEFAULT_KEY } from '@/lib/constants/music.constants';
import { TAB_SELECTOR } from '@/lib/constants/dom.constants';
import { clickElement } from '@/lib/utils';
import type { ChordProgression } from '@/lib/jamProgressions';
import { Vibe } from '@/lib/enums/vibe.enum';
import { SkillLevel } from '@/lib/enums/skillLevel.enum';

interface EmptyBuildStateProps {
  onCreateProgression: (progression: ChordProgression) => void;
}

const ICON_SIZE = 16;

function createDefaultProgression(): ChordProgression {
  return {
    id: 'custom',
    name: 'My Custom Progression',
    vibe: [Vibe.Pop],
    key: DEFAULT_KEY,
    chords: [
      { name: 'C', function: 'tonic', duration: DEFAULT_CHORD_DURATION },
      { name: 'F', function: 'subdominant', duration: DEFAULT_CHORD_DURATION },
      { name: 'G', function: 'dominant', duration: DEFAULT_CHORD_DURATION },
      { name: 'C', function: 'tonic', duration: DEFAULT_CHORD_DURATION },
    ],
    difficulty: SkillLevel.Beginner,
    description: 'Your custom progression',
    bpm: DEFAULT_BPM,
  };
}

function navigateToDiscoverTab(): void {
  clickElement(TAB_SELECTOR.DISCOVER);
}

export function EmptyBuildState({ onCreateProgression }: EmptyBuildStateProps): JSX.Element {
  const handleStartFromScratch = (): void => {
    onCreateProgression(createDefaultProgression());
  };

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <Music2 className={`w-${ICON_SIZE} h-${ICON_SIZE} text-muted-foreground/50 mb-4`} />
        <h3 className="text-xl font-semibold mb-2">No Progression Selected</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Choose a progression from the Discover tab or start from scratch to build your own jam
          session.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={navigateToDiscoverTab}>
            Browse Progressions
          </Button>
          <Button onClick={handleStartFromScratch}>Start from Scratch</Button>
        </div>
      </CardContent>
    </Card>
  );
}
