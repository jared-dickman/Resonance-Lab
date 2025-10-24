'use client';

import { useState, useEffect, useMemo } from 'react';
import { Lightbulb, Music2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JamHeader } from '@/components/jam/JamHeader';
import { SkillLevelSelector } from '@/components/jam/SkillLevelSelector';
import VibeSelector from '@/components/jam/VibeSelector';
import { ProgressionsGrid } from '@/components/jam/ProgressionsGrid';
import { ProTipsCard } from '@/components/jam/ProTipsCard';
import { EmptyBuildState } from '@/components/jam/EmptyBuildState';
import JamBuilder from '@/components/jam/JamBuilder';
import { getProgressionsByVibe, type ChordProgression } from '@/lib/jamProgressions';
import { cn } from '@/lib/utils';
import { type Vibe } from '@/lib/jamProgressions';
import { SkillLevel } from '@/lib/enums/skillLevel.enum';
import { ANIMATION_DURATION, FADE_VARIANTS } from '@/lib/constants/animation.constants';
import { MAX_WIDTH } from '@/lib/constants/ui.constants';

const ICON_SIZE = 4;

export default function JamAssistantClient(): React.JSX.Element {
  const [selectedVibe, setSelectedVibe] = useState<Vibe>('pop');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(SkillLevel.Intermediate);
  const [selectedProgression, setSelectedProgression] = useState<ChordProgression | null>(null);
  const [customProgression, setCustomProgression] = useState<ChordProgression | null>(null);

  const filteredProgressions = useMemo(
    () => getProgressionsByVibe(selectedVibe, skillLevel),
    [selectedVibe, skillLevel]
  );

  useEffect(() => {
    if (filteredProgressions.length > 0 && !selectedProgression) {
      setSelectedProgression(filteredProgressions[0] ?? null);
    }
  }, [filteredProgressions, selectedProgression]);

  const handleBuildFromProgression = (progression: ChordProgression): void => {
    setCustomProgression({ ...progression });
  };

  return (
    <motion.div
      className={cn('container mx-auto py-8 px-4 overflow-x-hidden', MAX_WIDTH.EXTRA_LARGE)}
      variants={FADE_VARIANTS}
      initial="hidden"
      animate="show"
      transition={{ duration: ANIMATION_DURATION.NORMAL }}
    >
      <JamHeader />
      <SkillLevelSelector selectedLevel={skillLevel} onSelectLevel={setSkillLevel} />

      <Tabs defaultValue="discover" className="w-full">
        <TabsList className={cn('grid w-full mx-auto grid-cols-2 mb-8', MAX_WIDTH.SMALL)}>
          <TabsTrigger value="discover" className="flex items-center gap-2">
            <Lightbulb className={`w-${ICON_SIZE} h-${ICON_SIZE}`} />
            Discover
          </TabsTrigger>
          <TabsTrigger value="build" className="flex items-center gap-2">
            <Music2 className={`w-${ICON_SIZE} h-${ICON_SIZE}`} />
            Build
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          <VibeSelector selectedVibe={selectedVibe} onSelectVibe={setSelectedVibe} />
          <ProgressionsGrid
            vibe={selectedVibe}
            progressions={filteredProgressions}
            selectedProgressionId={selectedProgression?.id ?? null}
            onSelectProgression={setSelectedProgression}
            onBuildProgression={handleBuildFromProgression}
          />
          <ProTipsCard />
        </TabsContent>

        <TabsContent value="build" className="space-y-6">
          {customProgression ? (
            <JamBuilder
              progression={customProgression}
              onUpdate={setCustomProgression}
              onClear={() => setCustomProgression(null)}
            />
          ) : (
            <EmptyBuildState onCreateProgression={setCustomProgression} />
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
