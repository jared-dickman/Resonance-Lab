'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import VibeSelector from './jam/VibeSelector';
import ProgressionCard from './jam/ProgressionCard';
import JamBuilder from './jam/JamBuilder';
import {
  type Vibe,
  type SkillLevel,
  type ChordProgression,
  getProgressionsByVibe,
  VIBE_INFO,
} from '@/lib/jamProgressions';
import { Sparkles, Music2, Users, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function JamAssistantClient() {
  const [selectedVibe, setSelectedVibe] = useState<Vibe>('pop');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('intermediate');
  const [selectedProgression, setSelectedProgression] = useState<ChordProgression | null>(null);
  const [customProgression, setCustomProgression] = useState<ChordProgression | null>(null);

  // Filter progressions based on vibe and skill level
  const filteredProgressions = useMemo(
    () => getProgressionsByVibe(selectedVibe, skillLevel),
    [selectedVibe, skillLevel]
  );

  // Auto-select first progression when vibe changes
  useEffect(() => {
    if (filteredProgressions.length > 0 && !selectedProgression) {
      setSelectedProgression(filteredProgressions[0]);
    }
  }, [filteredProgressions, selectedProgression]);

  const handleBuildCustom = () => {
    if (selectedProgression) {
      setCustomProgression({ ...selectedProgression });
    }
  };

  return (
    <motion.div
      className="container mx-auto py-8 px-4 max-w-7xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header with animations */}
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          >
            <Sparkles className="w-10 h-10 text-primary" />
          </motion.div>
          <motion.h1
            className="text-4xl font-bold tracking-tight"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Jam Assistant
          </motion.h1>
        </div>
        <motion.p
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Discover chord progressions, build jam sessions, and level up your playing.
          Perfect for solo practice or group jams.
        </motion.p>
      </motion.div>

      {/* Skill Level Selector with animation */}
      <motion.div
        className="mb-6 flex justify-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Your Skill Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {(['beginner', 'intermediate', 'expert'] as SkillLevel[]).map((level, idx) => (
                <motion.div
                  key={level}
                  className="flex-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={skillLevel === level ? 'default' : 'outline'}
                    onClick={() => setSkillLevel(level)}
                    className="w-full capitalize"
                  >
                    {level}
                  </Button>
                </motion.div>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={skillLevel}
                className="text-xs text-muted-foreground mt-3 text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                {skillLevel === 'beginner' && 'Focus on simple, open chord progressions'}
                {skillLevel === 'intermediate' && 'Mix of standard and extended chords'}
                {skillLevel === 'expert' && 'All progressions including jazz & complex voicings'}
              </motion.p>
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="discover" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="build" className="flex items-center gap-2">
            <Music2 className="w-4 h-4" />
            Build
          </TabsTrigger>
        </TabsList>

        {/* Discover Tab */}
        <TabsContent value="discover" className="space-y-6">
          {/* Vibe Selector */}
          <VibeSelector selectedVibe={selectedVibe} onSelectVibe={setSelectedVibe} />

          {/* Progressions Grid */}
          <div>
            <motion.div
              className="flex items-center justify-between mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.h2
                className="text-2xl font-semibold"
                key={selectedVibe}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {VIBE_INFO[selectedVibe].emoji} {selectedVibe.charAt(0).toUpperCase() + selectedVibe.slice(1)} Progressions
              </motion.h2>
              <motion.div
                className="text-sm text-muted-foreground"
                key={filteredProgressions.length}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {filteredProgressions.length} progression{filteredProgressions.length !== 1 ? 's' : ''}
              </motion.div>
            </motion.div>

            <ScrollArea className="h-[600px] pr-4">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.08,
                    },
                  },
                }}
              >
                <AnimatePresence mode="popLayout">
                  {filteredProgressions.map((progression, index) => (
                    <motion.div
                      key={progression.id}
                      layout
                      variants={{
                        hidden: { opacity: 0, y: 20, scale: 0.9 },
                        show: { opacity: 1, y: 0, scale: 1 },
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 24,
                      }}
                    >
                      <ProgressionCard
                        progression={progression}
                        isSelected={selectedProgression?.id === progression.id}
                        onSelect={() => setSelectedProgression(progression)}
                        onBuild={() => {
                          setCustomProgression({ ...progression });
                          // Switch to build tab
                          const buildTab = document.querySelector('[value="build"]') as HTMLElement;
                          buildTab?.click();
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </ScrollArea>
          </div>

          {/* Quick Tips */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Pro Tips for Jamming
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-primary">•</span>
                <p>Start slow and gradually increase BPM as you get comfortable</p>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">•</span>
                <p>Practice chord transitions separately before playing the full progression</p>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">•</span>
                <p>Try different strumming patterns to change the feel</p>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">•</span>
                <p>Use the Build tab to customize progressions and create your own variations</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Build Tab */}
        <TabsContent value="build" className="space-y-6">
          {customProgression ? (
            <JamBuilder
              progression={customProgression}
              onUpdate={setCustomProgression}
              onClear={() => setCustomProgression(null)}
            />
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Music2 className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Progression Selected</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Choose a progression from the Discover tab or start from scratch to build your own jam session.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const discoverTab = document.querySelector('[value="discover"]') as HTMLElement;
                      discoverTab?.click();
                    }}
                  >
                    Browse Progressions
                  </Button>
                  <Button
                    onClick={() => {
                      // Create blank progression in C major
                      setCustomProgression({
                        id: 'custom',
                        name: 'My Custom Progression',
                        vibe: ['pop'],
                        key: 'C',
                        chords: [
                          { name: 'C', function: 'tonic', duration: 4 },
                          { name: 'F', function: 'subdominant', duration: 4 },
                          { name: 'G', function: 'dominant', duration: 4 },
                          { name: 'C', function: 'tonic', duration: 4 },
                        ],
                        difficulty: 'beginner',
                        description: 'Your custom progression',
                        bpm: 90,
                      });
                    }}
                  >
                    Start from Scratch
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
