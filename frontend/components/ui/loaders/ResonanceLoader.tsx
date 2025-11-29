'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function ResonanceLoader({ size = 'md' }: LoaderProps) {
  const dimension = LOADER_SIZE[size];
  const rings = 4;

  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex items-center justify-center"
      style={{ width: dimension, height: dimension }}
    >
      <svg width={dimension} height={dimension} viewBox={`0 0 ${dimension} ${dimension}`}>
        {Array.from({ length: rings }).map((_, i) => {
          const radius = dimension * (0.15 + i * 0.12);
          const delay = i * 0.15;

          return (
            <motion.circle
              key={i}
              cx={dimension / 2}
              cy={dimension / 2}
              r={radius}
              fill="none"
              stroke={SAPPHIRE[i % SAPPHIRE.length]}
              strokeWidth={dimension * 0.025}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0.8, 1.2, 1.4],
                strokeWidth: [dimension * 0.035, dimension * 0.02, dimension * 0.01],
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
      </svg>
    </div>
  );
}
