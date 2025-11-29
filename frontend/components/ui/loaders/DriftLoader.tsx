'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function DriftLoader({ size = 'md' }: LoaderProps) {
  const dimension = LOADER_SIZE[size];
  const particleCount = 8;

  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex items-center justify-center"
      style={{ width: dimension, height: dimension }}
    >
      <svg width={dimension} height={dimension} viewBox={`0 0 ${dimension} ${dimension}`}>
        {Array.from({ length: particleCount }).map((_, i) => {
          const angle = (i / particleCount) * Math.PI * 2;
          const radius = dimension * 0.3;
          const cx = dimension / 2 + Math.cos(angle) * radius;
          const cy = dimension / 2 + Math.sin(angle) * radius;
          const particleRadius = dimension * 0.06;

          return (
            <motion.circle
              key={i}
              r={particleRadius}
              fill={SAPPHIRE[i % SAPPHIRE.length]}
              initial={{ cx, cy, opacity: 0.3 }}
              animate={{
                cx: [cx, dimension / 2, cx],
                cy: [cy, dimension / 2, cy],
                opacity: [0.3, 1, 0.3],
                scale: [1, 0.5, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
