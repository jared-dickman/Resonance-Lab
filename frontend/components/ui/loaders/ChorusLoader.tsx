'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function ChorusLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const waves = 3;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        {Array.from({ length: waves }).map((_, i) => {
          const y = dim / 2 + (i - 1) * (dim * 0.15);
          const delayOffset = i * 0.15;

          return (
            <motion.ellipse
              key={i}
              cx={dim / 2}
              cy={y}
              rx={dim * 0.35}
              ry={dim * 0.08}
              fill="none"
              stroke={SAPPHIRE[i % SAPPHIRE.length]}
              strokeWidth={1.8}
              strokeLinecap="round"
              animate={{
                opacity: [0.3, 0.9, 0.3],
                rx: [dim * 0.35, dim * 0.42, dim * 0.35],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: delayOffset,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
