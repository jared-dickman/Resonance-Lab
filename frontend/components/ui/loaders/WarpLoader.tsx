'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function WarpLoader({ size = 'md' }: LoaderProps) {
  const dimension = LOADER_SIZE[size];
  const lineCount = 12;

  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex items-center justify-center"
      style={{ width: dimension, height: dimension }}
    >
      <svg width={dimension} height={dimension} viewBox={`0 0 ${dimension} ${dimension}`}>
        <defs>
          <radialGradient id="warp-gradient">
            <stop offset="0%" stopColor={SAPPHIRE[1]} stopOpacity="1" />
            <stop offset="100%" stopColor={SAPPHIRE[3]} stopOpacity="0.3" />
          </radialGradient>
        </defs>
        {Array.from({ length: lineCount }).map((_, i) => {
          const angle = (i / lineCount) * Math.PI * 2;
          const innerRadius = dimension * 0.15;
          const outerRadius = dimension * 0.45;

          return (
            <motion.line
              key={i}
              x1={dimension / 2 + Math.cos(angle) * innerRadius}
              y1={dimension / 2 + Math.sin(angle) * innerRadius}
              stroke={SAPPHIRE[i % SAPPHIRE.length]}
              strokeWidth={dimension * 0.015}
              strokeLinecap="round"
              initial={{
                x2: dimension / 2 + Math.cos(angle) * innerRadius,
                y2: dimension / 2 + Math.sin(angle) * innerRadius,
                opacity: 0.2,
              }}
              animate={{
                x2: [
                  dimension / 2 + Math.cos(angle) * innerRadius,
                  dimension / 2 + Math.cos(angle) * outerRadius,
                  dimension / 2 + Math.cos(angle) * innerRadius,
                ],
                y2: [
                  dimension / 2 + Math.sin(angle) * innerRadius,
                  dimension / 2 + Math.sin(angle) * outerRadius,
                  dimension / 2 + Math.sin(angle) * innerRadius,
                ],
                opacity: [0.2, 1, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.05,
                ease: 'easeInOut',
              }}
            />
          );
        })}
        <motion.circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={dimension * 0.12}
          fill="url(#warp-gradient)"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.5, 1, 0.5],
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
