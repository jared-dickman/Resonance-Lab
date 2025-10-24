import { motion, AnimatePresence } from 'framer-motion';

import { ScrollArea } from '@/components/ui/scroll-area';
import ProgressionCard from '@/components/jam/ProgressionCard';
import type { ChordProgression, Vibe } from '@/lib/jamProgressions';
import { SCROLL_AREA_HEIGHT, GRID_COLUMNS } from '@/lib/constants/ui.constants';
import { ANIMATION_DURATION, SPRING_CONFIG } from '@/lib/constants/animation.constants';
import { TAB_SELECTOR } from '@/lib/constants/dom.constants';
import { clickElement, capitalize, formatCount, cn } from '@/lib/utils';
import { VIBE_INFO } from '@/lib/jamProgressions';

interface ProgressionsGridProps {
  vibe: Vibe;
  progressions: ChordProgression[];
  selectedProgressionId: string | null;
  onSelectProgression: (progression: ChordProgression) => void;
  onBuildProgression: (progression: ChordProgression) => void;
}

const STAGGER_DELAY = 0.08;

function navigateToBuildTab(): void {
  clickElement(TAB_SELECTOR.BUILD);
}

export function ProgressionsGrid({
  vibe,
  progressions,
  selectedProgressionId,
  onSelectProgression,
  onBuildProgression,
}: ProgressionsGridProps): React.JSX.Element {
  const handleBuild = (progression: ChordProgression): void => {
    onBuildProgression(progression);
    navigateToBuildTab();
  };

  return (
    <div>
      <motion.div
        className="flex items-center justify-between mb-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.h2
          className="text-2xl font-semibold"
          key={vibe}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: ANIMATION_DURATION.LONG }}
        >
          {VIBE_INFO[vibe].emoji} {capitalize(vibe)} Progressions
        </motion.h2>
        <motion.div
          className="text-sm text-muted-foreground"
          key={progressions.length}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: SPRING_CONFIG.DEFAULT.stiffness }}
        >
          {formatCount(progressions.length, 'progression')}
        </motion.div>
      </motion.div>

      <ScrollArea className="h-[600px] pr-4">
        <motion.div
          className={cn('grid gap-4', GRID_COLUMNS.THREE)}
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: STAGGER_DELAY,
              },
            },
          }}
        >
          <AnimatePresence mode="popLayout">
            {progressions.map(progression => (
              <motion.div
                key={progression.id}
                layout
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.9 },
                  show: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{
                  type: 'spring',
                  stiffness: SPRING_CONFIG.DEFAULT.stiffness,
                  damping: SPRING_CONFIG.DEFAULT.damping,
                }}
              >
                <ProgressionCard
                  progression={progression}
                  isSelected={selectedProgressionId === progression.id}
                  onSelect={() => onSelectProgression(progression)}
                  onBuild={() => handleBuild(progression)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </ScrollArea>
    </div>
  );
}
