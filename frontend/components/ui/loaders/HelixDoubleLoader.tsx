'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function HelixDoubleLoader({ size = 'md' }: LoaderProps) {
  const dimension = LOADER_SIZE[size];
  const strands = 12;

  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex items-center justify-center"
      style={{ width: dimension, height: dimension }}
    >
      <svg width={dimension} height={dimension} viewBox={`0 0 ${dimension} ${dimension}`}>
        {/* Horizontal helix (original orientation) */}
        {Array.from({ length: strands }).map((_, i) => {
          const x = dimension * 0.2 + (i * dimension * 0.6) / (strands - 1);
          const delay = i * 0.1;
          const radius = dimension * 0.04;

          return (
            <g key={`h-${i}`}>
              <motion.circle
                cx={x}
                cy={dimension / 2}
                r={radius}
                fill={SAPPHIRE[0]}
                opacity={0.8}
                animate={{
                  cy: [dimension / 2, dimension * 0.3, dimension / 2],
                  fill: [SAPPHIRE[0], SAPPHIRE[2], SAPPHIRE[0]],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay,
                  ease: 'easeInOut',
                }}
              />
              <motion.circle
                cx={x}
                cy={dimension / 2}
                r={radius}
                fill={SAPPHIRE[3]}
                opacity={0.8}
                animate={{
                  cy: [dimension / 2, dimension * 0.7, dimension / 2],
                  fill: [SAPPHIRE[3], SAPPHIRE[1], SAPPHIRE[3]],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay,
                  ease: 'easeInOut',
                }}
              />
            </g>
          );
        })}

        {/* Vertical helix (rotated 90 degrees) */}
        {Array.from({ length: strands }).map((_, i) => {
          const y = dimension * 0.2 + (i * dimension * 0.6) / (strands - 1);
          const delay = i * 0.1 + 1;
          const radius = dimension * 0.04;

          return (
            <g key={`v-${i}`}>
              <motion.circle
                cx={dimension / 2}
                cy={y}
                r={radius}
                fill={SAPPHIRE[1]}
                opacity={0.7}
                animate={{
                  cx: [dimension / 2, dimension * 0.3, dimension / 2],
                  fill: [SAPPHIRE[1], SAPPHIRE[3], SAPPHIRE[1]],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay,
                  ease: 'easeInOut',
                }}
              />
              <motion.circle
                cx={dimension / 2}
                cy={y}
                r={radius}
                fill={SAPPHIRE[2]}
                opacity={0.7}
                animate={{
                  cx: [dimension / 2, dimension * 0.7, dimension / 2],
                  fill: [SAPPHIRE[2], SAPPHIRE[0], SAPPHIRE[2]],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay,
                  ease: 'easeInOut',
                }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
