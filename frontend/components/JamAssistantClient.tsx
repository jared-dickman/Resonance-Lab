'use client';

import { useState, useEffect, useMemo } from 'react';
import { Lightbulb, Music2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JamHeader } from './jam/JamHeader';
import { SkillLevelSelector } from './jam/SkillLevelSelector';
import VibeSelector from './jam/VibeSelector';
import { ProgressionsGrid } from './jam/ProgressionsGrid';
import { ProTipsCard } from './jam/ProTipsCard';
import { EmptyBuildState } from './jam/EmptyBuildState';
import JamBuilder from './jam/JamBuilder';
import { getProgressionsByVibe, type ChordProgression } from '@/lib/jamProgressions';
import { Vibe } from '@/lib/enums/vibe.enum';
import { SkillLevel } from '@/lib/enums/skillLevel.enum';
import { ANIMATION_DURATION, FADE_VARIANTS } from '@/lib/constants/animation.constants';
import { MAX_WIDTH } from '@/lib/constants/ui.constants';

const ICON_SIZE = 4;

export default function JamAssistantClient(): JSX.Element {
  const [selectedVibe, setSelectedVibe] = useState<Vibe>(Vibe.Pop);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(SkillLevel.Intermediate);
  const [selectedProgression, setSelectedProgression] = useState<ChordProgression | null>(null);
  const [customProgression, setCustomProgression] = useState<ChordProgression | null>(null);

  const filteredProgressions = useMemo(
    () => getProgressionsByVibe(selectedVibe, skillLevel),
    [selectedVibe, skillLevel]
  );

  useEffect(() => {
    if (filteredProgressions.length > 0 && !selectedProgression) {
      setSelectedProgression(filteredProgressions[0]);
    }
  }, [filteredProgressions, selectedProgression]);

  const handleBuildFromProgression = (progression: ChordProgression): void => {
    setCustomProgression({ ...progression });
  };

  return (
    <motion.div
      className={`container mx-auto py-8 px-4 ${MAX_WIDTH.EXTRA_LARGE} overflow-x-hidden`}
      variants={FADE_VARIANTS}
      initial="hidden"
      animate="show"
      transition={{ duration: ANIMATION_DURATION.NORMAL }}
    >
      <JamHeader />
      <SkillLevelSelector selectedLevel={skillLevel} onSelectLevel={setSkillLevel} />

      <Tabs defaultValue="discover" className="w-full">
        <TabsList className={`grid w-full ${MAX_WIDTH.SMALL} mx-auto grid-cols-2 mb-8`}>
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
          <VibeSelector selectedVibe={selectedVibe} onSelectVibe={(v: Vibe) => setSelectedVibe(v)} />
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
