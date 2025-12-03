'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function OscillateLoader({ size = 'md' }: LoaderProps) {
  const dimension = LOADER_SIZE[size];

  // 12-bar blues rhythm pattern: I-I-I-I-IV-IV-I-I-V-IV-I-I
  const bluesPattern = [
    { bar: 1, duration: 0.5, yRange: 0.3 },
    { bar: 2, duration: 0.5, yRange: 0.3 },
    { bar: 3, duration: 0.5, yRange: 0.3 },
    { bar: 4, duration: 0.5, yRange: 0.3 },
    { bar: 5, duration: 0.6, yRange: 0.35 },
    { bar: 6, duration: 0.6, yRange: 0.35 },
    { bar: 7, duration: 0.5, yRange: 0.3 },
    { bar: 8, duration: 0.5, yRange: 0.3 },
    { bar: 9, duration: 0.7, yRange: 0.4 },
    { bar: 10, duration: 0.6, yRange: 0.35 },
    { bar: 11, duration: 0.5, yRange: 0.3 },
    { bar: 12, duration: 0.5, yRange: 0.3 },
  ];

  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex items-center justify-center"
      style={{ width: dimension, height: dimension }}
    >
      <svg width={dimension} height={dimension} viewBox={`0 0 ${dimension} ${dimension}`}>
        {bluesPattern.map((bar, i) => {
          const x = dimension * 0.1 + (i * dimension * 0.8) / (bluesPattern.length - 1);
          const delay = i * 0.15;
          const radius = dimension * (0.04 + bar.yRange * 0.05);
          const minY = dimension * (0.5 - bar.yRange);
          const maxY = dimension * (0.5 + bar.yRange);

          return (
            <motion.g key={i}>
              {/* Main oscillating circle */}
              <motion.circle
                cx={x}
                cy={dimension / 2}
                r={radius}
                fill={SAPPHIRE[i % SAPPHIRE.length]}
                animate={{
                  cy: [dimension / 2, minY, dimension / 2, maxY, dimension / 2],
                  opacity: [0.4, 1, 0.6, 1, 0.4],
                  r: [radius, radius * 1.2, radius, radius * 1.2, radius],
                }}
                transition={{
                  duration: bar.duration * 4,
                  repeat: Infinity,
                  delay,
                  ease: 'easeInOut',
                }}
              />

              {/* Trail effect */}
              <motion.circle
                cx={x}
                cy={dimension / 2}
                r={radius * 0.6}
                fill={SAPPHIRE[(i + 2) % SAPPHIRE.length]}
                opacity={0.3}
                animate={{
                  cy: [dimension / 2, minY, dimension / 2, maxY, dimension / 2],
                  scale: [1, 0.8, 1, 0.8, 1],
                }}
                transition={{
                  duration: bar.duration * 4,
                  repeat: Infinity,
                  delay: delay + 0.1,
                  ease: 'easeInOut',
                }}
              />
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
