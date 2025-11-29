'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function MitosisLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const center = dim / 2;
  const cellRadius = dim * 0.25;
  const splitRadius = dim * 0.19;
  const nucleusRadius = dim * 0.08;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        <motion.circle
          cx={center}
          cy={center}
          r={cellRadius}
          fill={SAPPHIRE[3] + '20'}
          stroke={SAPPHIRE[1]}
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{
            r: [cellRadius, cellRadius * 1.4, cellRadius, cellRadius],
            opacity: [1, 1, 0.3, 0.3],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.3, 0.5, 1],
          }}
        />

        <motion.circle
          cx={center}
          cy={center}
          r={cellRadius}
          fill={SAPPHIRE[3] + '20'}
          stroke={SAPPHIRE[1]}
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{
            cx: [center, center, center, center - cellRadius * 0.75],
            r: [cellRadius, cellRadius * 1.4, cellRadius, splitRadius],
            opacity: [0, 0, 1, 1],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.3, 0.5, 1],
          }}
        />

        <motion.circle
          cx={center}
          cy={center}
          r={cellRadius}
          fill={SAPPHIRE[3] + '20'}
          stroke={SAPPHIRE[1]}
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{
            cx: [center, center, center, center + cellRadius * 0.75],
            r: [cellRadius, cellRadius * 1.4, cellRadius, splitRadius],
            opacity: [0, 0, 1, 1],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.3, 0.5, 1],
          }}
        />

        <motion.circle
          cx={center}
          cy={center}
          r={nucleusRadius}
          fill={SAPPHIRE[0]}
          animate={{
            cx: [center, center, center, center - cellRadius * 0.75],
            opacity: [0.8, 0.8, 1, 1],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.4, 0.6, 1],
          }}
        />

        <motion.circle
          cx={center}
          cy={center}
          r={nucleusRadius}
          fill={SAPPHIRE[0]}
          animate={{
            cx: [center, center, center, center + cellRadius * 0.75],
            opacity: [0.8, 0.8, 1, 1],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.4, 0.6, 1],
          }}
        />
      </svg>
    </div>
  );
}
