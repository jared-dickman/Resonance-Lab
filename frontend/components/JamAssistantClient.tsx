'use client';

import { useState, useEffect, useMemo } from 'react';
import { Lightbulb, Music2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JamHeader } from '@/components/jam/JamHeader';
import { SkillLevelSelector } from '@/components/jam/SkillLevelSelector';
import VibeSelector from '@/components/jam/VibeSelector';
import { ProgressionsGrid } from '@/components/jam/ProgressionsGrid';
import { EmptyBuildState } from '@/components/jam/EmptyBuildState';
import JamBuilder from '@/components/jam/JamBuilder';
import { QuickStart } from '@/components/ui/quick-start';
import { JamWizard, type WizardStep } from '@/components/jam/JamWizard';
import { getProgressionsByVibe, type ChordProgression } from '@/lib/jamProgressions';
import { cn } from '@/lib/utils';
import { type Vibe } from '@/lib/jamProgressions';
import { SkillLevel } from '@/lib/enums/skillLevel.enum';
import { ANIMATION_DURATION, FADE_VARIANTS } from '@/lib/constants/animation.constants';
import { MAX_WIDTH } from '@/lib/constants/ui.constants';
import { QUICK_TIPS } from '@/lib/constants/help-content.constants';

export default function JamAssistantClient(): React.JSX.Element {
  const [selectedVibe, setSelectedVibe] = useState<Vibe>('pop');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(SkillLevel.Intermediate);
  const [selectedProgression, setSelectedProgression] = useState<ChordProgression | null>(null);
  const [customProgression, setCustomProgression] = useState<ChordProgression | null>(null);
  const [showQuickStart, setShowQuickStart] = useState<boolean>(true);
  const [useWizardMode, setUseWizardMode] = useState<boolean>(false);

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
    setUseWizardMode(true);
  };

  const wizardSteps: WizardStep[] = [
    {
      id: 'skill',
      title: 'Select Your Skill Level',
      description: 'Choose your experience level to get appropriate chord progressions',
      component: <SkillLevelSelector selectedLevel={skillLevel} onSelectLevel={setSkillLevel} />,
    },
    {
      id: 'vibe',
      title: 'Choose Your Vibe',
      description: 'Pick the musical style that inspires you',
      component: <VibeSelector selectedVibe={selectedVibe} onSelectVibe={setSelectedVibe} />,
    },
    {
      id: 'progression',
      title: 'Pick a Progression',
      description: 'Select a chord progression to practice',
      component: (
        <ProgressionsGrid
          vibe={selectedVibe}
          progressions={filteredProgressions}
          selectedProgressionId={selectedProgression?.id ?? null}
          onSelectProgression={setSelectedProgression}
          onBuildProgression={handleBuildFromProgression}
        />
      ),
    },
  ];

  return (
    <motion.div
      className={cn('container mx-auto py-6 md:py-8 px-4 overflow-x-hidden', MAX_WIDTH.EXTRA_LARGE)}
      variants={FADE_VARIANTS}
      initial="hidden"
      animate="show"
      transition={{ duration: ANIMATION_DURATION.NORMAL }}
    >
      <JamHeader />
      <SkillLevelSelector selectedLevel={skillLevel} onSelectLevel={setSkillLevel} />

      {showQuickStart && (
        <QuickStart
          tips={QUICK_TIPS.jam}
          className="mb-6"
          onDismiss={() => setShowQuickStart(false)}
        />
      )}

      {useWizardMode && customProgression ? (
        <div className="space-y-6">
          <JamBuilder
            progression={customProgression}
            onUpdate={setCustomProgression}
            onClear={() => {
              setCustomProgression(null);
              setUseWizardMode(false);
            }}
          />
        </div>
      ) : (
        <Tabs defaultValue="discover" className="w-full">
          <TabsList className={cn('grid w-full mx-auto grid-cols-2 mb-6 md:mb-8', MAX_WIDTH.SMALL)}>
            <TabsTrigger value="discover" className="flex items-center gap-2 h-11">
              <Lightbulb className="w-4 h-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="build" className="flex items-center gap-2 h-11">
              <Music2 className="w-4 h-4" />
              Build
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            <JamWizard
              steps={wizardSteps}
              onComplete={() => {
                if (selectedProgression) {
                  handleBuildFromProgression(selectedProgression);
                }
              }}
            />
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
      )}
    </motion.div>
  );
}
