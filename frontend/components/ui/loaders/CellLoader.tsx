'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function CellLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox="0 0 64 64">
        <motion.circle
          cx="32"
          cy="32"
          r="24"
          fill="none"
          stroke={SAPPHIRE[1]}
          strokeWidth="1.5"
          opacity="0.3"
        />

        <motion.circle
          cx="32"
          cy="32"
          r="20"
          fill={SAPPHIRE[3] + '15'}
          stroke={SAPPHIRE[2]}
          strokeWidth="1"
          animate={{
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.circle
          cx="28"
          cy="28"
          r="6"
          fill={SAPPHIRE[1]}
          animate={{
            cx: [28, 32, 36, 32, 28],
            cy: [28, 32, 28, 24, 28],
            opacity: [0.8, 1, 0.8, 0.6, 0.8],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.circle
          cx="38"
          cy="32"
          r="3"
          fill={SAPPHIRE[2]}
          animate={{
            cx: [38, 36, 32, 36, 38],
            cy: [32, 36, 36, 32, 32],
            opacity: [0.6, 0.8, 1, 0.8, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        />
      </svg>
    </div>
  );
}
