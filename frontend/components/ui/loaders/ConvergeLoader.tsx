'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function ConvergeLoader({ size = 'md' }: LoaderProps) {
  const dimension = LOADER_SIZE[size];
  const ringCount = 3;
  const particlesPerRing = 8;

  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex items-center justify-center"
      style={{ width: dimension, height: dimension }}
    >
      <svg width={dimension} height={dimension} viewBox={`0 0 ${dimension} ${dimension}`}>
        {Array.from({ length: ringCount }).map((_, ringIndex) => {
          const startRadius = dimension * (0.45 - ringIndex * 0.12);

          return Array.from({ length: particlesPerRing }).map((_, i) => {
            const angle = (i / particlesPerRing) * Math.PI * 2;
            const startX = dimension / 2 + Math.cos(angle) * startRadius;
            const startY = dimension / 2 + Math.sin(angle) * startRadius;
            const particleRadius = dimension * 0.045;

            return (
              <motion.circle
                key={`${ringIndex}-${i}`}
                r={particleRadius}
                fill={SAPPHIRE[ringIndex % SAPPHIRE.length]}
                initial={{
                  cx: startX,
                  cy: startY,
                  opacity: 0,
                }}
                animate={{
                  cx: [startX, dimension / 2],
                  cy: [startY, dimension / 2],
                  opacity: [0, 1, 0],
                  scale: [1, 0.5, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: ringIndex * 0.3 + i * 0.08,
                  ease: 'easeInOut',
                }}
              />
            );
          });
        })}
      </svg>
    </div>
  );
}
