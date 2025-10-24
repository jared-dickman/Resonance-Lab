import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

import {
  ANIMATION_DELAY,
  ANIMATION_DURATION,
  FADE_VARIANTS,
} from '@/lib/constants/animation.constants';

const ICON_SIZE = 10;
const ICON_ROTATION = [0, 10, -10, 0];
const ICON_SCALE = [1, 1.1, 1.1, 1];
const ICON_ANIMATION_DURATION = 2;
const ICON_REPEAT_DELAY = 3;

export function JamHeader(): JSX.Element {
  return (
    <motion.div
      className="mb-8 text-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: ANIMATION_DELAY.SHORT }}
    >
      <div className="flex items-center justify-center gap-3 mb-3">
        <motion.div
          animate={{
            rotate: ICON_ROTATION,
            scale: ICON_SCALE,
          }}
          transition={{
            duration: ICON_ANIMATION_DURATION,
            repeat: Infinity,
            repeatDelay: ICON_REPEAT_DELAY,
          }}
        >
          <Sparkles className={`w-${ICON_SIZE} h-${ICON_SIZE} text-primary`} />
        </motion.div>
        <motion.h1
          className="text-4xl font-bold tracking-tight"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: ANIMATION_DURATION.NORMAL }}
        >
          Jam Assistant
        </motion.h1>
      </div>
      <motion.p
        className="text-lg text-muted-foreground max-w-2xl mx-auto"
        variants={FADE_VARIANTS}
        initial="hidden"
        animate="show"
        transition={{ delay: ANIMATION_DELAY.SUBTITLE, duration: ANIMATION_DURATION.NORMAL }}
      >
        Discover chord progressions, build jam sessions, and level up your playing. Perfect for solo
        practice or group jams.
      </motion.p>
    </motion.div>
  );
}
