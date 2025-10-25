'use client';

import { type ChordProgression, FUNCTION_COLORS } from '@/lib/jamProgressions';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Play, Edit, Clock, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProgressionCardProps {
  progression: ChordProgression;
  isSelected: boolean;
  onSelect: () => void;
  onBuild: () => void;
}

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-500/10 text-green-500 border-green-500/20',
  intermediate: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  expert: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function ProgressionCard({
  progression,
  isSelected,
  onSelect,
  onBuild,
}: ProgressionCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          'cursor-pointer group relative overflow-hidden',
          isSelected && 'ring-2 ring-primary shadow-xl'
        )}
        onClick={onSelect}
      >
        {/* Selection indicator with animation */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </AnimatePresence>

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="font-semibold text-lg leading-tight mb-1">{progression.name}</h3>
              <p className="text-xs text-muted-foreground">Key of {progression.key}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <Badge className={cn('text-xs', DIFFICULTY_COLORS[progression.difficulty])}>
                {progression.difficulty}
              </Badge>
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Chord visualization with stagger animation */}
          <div className="flex flex-wrap gap-2">
            {progression.chords.map((chord, idx) => (
              <motion.div
                key={idx}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium"
                style={{
                  backgroundColor: `${FUNCTION_COLORS[chord.function]}15`,
                  border: `1px solid ${FUNCTION_COLORS[chord.function]}30`,
                  color: FUNCTION_COLORS[chord.function],
                }}
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  delay: 0.3 + idx * 0.05,
                  type: 'spring',
                  stiffness: 500,
                  damping: 25,
                }}
                whileHover={{
                  scale: 1.1,
                  boxShadow: `0 0 8px ${FUNCTION_COLORS[chord.function]}40`,
                  transition: { duration: 0.2 },
                }}
              >
                {chord.name}
                {chord.duration && chord.duration > 4 && (
                  <span className="text-xs opacity-60">×{chord.duration / 4}</span>
                )}
              </motion.div>
            ))}
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">{progression.description}</p>

          {/* Examples */}
          {progression.examples && progression.examples.length > 0 && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Used in:</p>
              <div className="space-y-1">
                {progression.examples.slice(0, 2).map((example, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-muted-foreground/80 flex items-center gap-1"
                  >
                    <Music className="w-3 h-3 opacity-50" />
                    {example}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {progression.bpm} BPM
            </div>
            <div className="flex items-center gap-1">
              <Music className="w-3 h-3" />
              {progression.chords.length} chords
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-3 gap-2 flex-col sm:flex-row">
          <motion.div
            className="flex-1 w-full"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={e => {
                e.stopPropagation();
                onBuild();
              }}
            >
              <Edit className="w-4 h-4 mr-1" />
              Customize
            </Button>
          </motion.div>
          <motion.div
            className="flex-1 w-full"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              size="sm"
              className="w-full"
              onClick={e => {
                e.stopPropagation();
                // TODO: Implement play functionality
              }}
            >
              <Play className="w-4 h-4 mr-1" />
              Play
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
