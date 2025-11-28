'use client';

import { type Vibe, VIBE_INFO } from '@/lib/jamProgressions';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface VibeSelectorProps {
  selectedVibe: Vibe;
  onSelectVibe: (vibe: Vibe) => void;
}

const VIBE_GRADIENTS: Record<Vibe, string> = {
  pop: 'from-sapphire-500 to-sapphire-400',
  rock: 'from-sapphire-600 to-sapphire-500',
  jazz: 'from-sapphire-700 to-sapphire-400',
  blues: 'from-sapphire-800 to-sapphire-500',
  folk: 'from-sapphire-400 to-sapphire-300',
  indie: 'from-sapphire-500 to-sapphire-300',
  soul: 'from-sapphire-600 to-sapphire-400',
  country: 'from-sapphire-700 to-sapphire-500',
  funk: 'from-sapphire-800 to-sapphire-400',
  latin: 'from-sapphire-600 to-sapphire-300',
};

export default function VibeSelector({ selectedVibe, onSelectVibe }: VibeSelectorProps) {
  const vibes = Object.keys(VIBE_INFO) as Vibe[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardContent className="pt-6">
          <motion.div
            className="mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h3 className="text-lg font-semibold mb-1">Choose Your Vibe</h3>
            <motion.p
              className="text-sm text-muted-foreground"
              key={selectedVibe}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {VIBE_INFO[selectedVibe].description}
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {vibes.map((vibe, index) => {
              const isSelected = selectedVibe === vibe;
              const info = VIBE_INFO[vibe];

              return (
                <motion.button
                  key={vibe}
                  onClick={() => onSelectVibe(vibe)}
                  className={cn(
                    'relative overflow-hidden rounded-lg p-4',
                    'border-2 flex flex-col items-center gap-2 text-center transition-all duration-200',
                    isSelected
                      ? 'border-sapphire-500 shadow-lg shadow-sapphire-500/20'
                      : 'border-sapphire-500/10 hover:border-sapphire-500/30'
                  )}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.3,
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  }}
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Gradient background with animation */}
                  <motion.div
                    className={cn('absolute inset-0 bg-gradient-to-br', VIBE_GRADIENTS[vibe])}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isSelected ? 0.15 : 0 }}
                    whileHover={{ opacity: 0.08 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    <motion.div
                      className="text-2xl md:text-3xl mb-1"
                      animate={{
                        scale: isSelected ? [1, 1.2, 1] : 1,
                        rotate: isSelected ? [0, 10, -10, 0] : 0,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {info.emoji}
                    </motion.div>
                    <div className="text-xs md:text-sm font-medium capitalize">{vibe}</div>
                  </div>

                  {/* Selection ring animation */}
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 rounded-lg border-2 border-sapphire-500"
                      layoutId="selected-vibe"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
