import { motion, AnimatePresence } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkillLevel, SKILL_LEVEL_DESCRIPTIONS } from '@/lib/enums/skillLevel.enum';
import { ANIMATION_DELAY, ANIMATION_DURATION } from '@/lib/constants/animation.constants';

interface SkillLevelSelectorProps {
  selectedLevel: SkillLevel;
  onSelectLevel: (level: SkillLevel) => void;
}

const SKILL_LEVELS = [SkillLevel.Beginner, SkillLevel.Intermediate, SkillLevel.Expert];

const ANIMATION_BASE_DELAY = 0.5;
const ANIMATION_STAGGER_DELAY = 0.1;
const SCALE_HOVER = 1.05;
const SCALE_TAP = 0.95;

export function SkillLevelSelector({
  selectedLevel,
  onSelectLevel,
}: SkillLevelSelectorProps): JSX.Element {
  return (
    <motion.div
      className="mb-6 flex justify-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: ANIMATION_DELAY.LONG, duration: ANIMATION_DELAY.LONG }}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Your Skill Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {SKILL_LEVELS.map((level, index) => (
              <motion.div
                key={level}
                className="flex-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: ANIMATION_BASE_DELAY + index * ANIMATION_STAGGER_DELAY,
                  duration: ANIMATION_DURATION.FAST,
                }}
                whileHover={{ scale: SCALE_HOVER }}
                whileTap={{ scale: SCALE_TAP }}
              >
                <Button
                  variant={selectedLevel === level ? 'default' : 'outline'}
                  onClick={() => onSelectLevel(level)}
                  className="w-full capitalize"
                >
                  {level}
                </Button>
              </motion.div>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={selectedLevel}
              className="text-xs text-muted-foreground mt-3 text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: ANIMATION_DURATION.FAST }}
            >
              {SKILL_LEVEL_DESCRIPTIONS[selectedLevel]}
            </motion.p>
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
