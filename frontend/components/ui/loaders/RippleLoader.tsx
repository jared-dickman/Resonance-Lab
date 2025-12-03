'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function RippleLoader({ size = 'md' }: LoaderProps) {
  const dimension = LOADER_SIZE[size];
  const waves = 3;

  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex items-center justify-center"
      style={{ width: dimension, height: dimension }}
    >
      <svg width={dimension} height={dimension} viewBox={`0 0 ${dimension} ${dimension}`}>
        {Array.from({ length: waves }).map((_, i) => {
          const delay = i * 0.5;

          return (
            <motion.circle
              key={i}
              cx={dimension / 2}
              cy={dimension / 2}
              r={dimension * 0.1}
              fill="none"
              stroke={SAPPHIRE[i + 1]}
              strokeWidth={dimension * 0.025}
              animate={{
                r: [dimension * 0.1, dimension * 0.45],
                opacity: [0.8, 0],
                strokeWidth: [dimension * 0.03, dimension * 0.015],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay,
                ease: 'easeOut',
              }}
            />
          );
        })}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={dimension * 0.08}
          fill={SAPPHIRE[2]}
          opacity={0.9}
        />
      </svg>
    </div>
  );
}
