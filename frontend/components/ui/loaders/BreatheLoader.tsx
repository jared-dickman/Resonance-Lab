'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function BreatheLoader({ size = 'md' }: LoaderProps) {
  const dimension = LOADER_SIZE[size];
  const ringCount = 4;

  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex items-center justify-center"
      style={{ width: dimension, height: dimension }}
    >
      <svg width={dimension} height={dimension} viewBox={`0 0 ${dimension} ${dimension}`}>
        {Array.from({ length: ringCount }).map((_, i) => {
          const baseRadius = dimension * (0.15 + i * 0.08);

          return (
            <motion.circle
              key={i}
              cx={dimension / 2}
              cy={dimension / 2}
              fill="none"
              stroke={SAPPHIRE[i % SAPPHIRE.length]}
              strokeWidth={dimension * 0.02}
              initial={{ r: baseRadius, opacity: 0.2 }}
              animate={{
                r: [baseRadius, baseRadius * 1.6, baseRadius],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.25,
                ease: 'easeInOut',
              }}
            />
          );
        })}
        <motion.circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={dimension * 0.08}
          fill={SAPPHIRE[2]}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>
    </div>
  );
}
