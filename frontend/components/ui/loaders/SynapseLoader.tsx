'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function SynapseLoader({ className, size = 'md' }: LoaderProps) {
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
          cx="16"
          cy="32"
          r="6"
          fill={SAPPHIRE[1]}
          animate={{
            r: [6, 7, 6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.circle
          cx="48"
          cy="32"
          r="6"
          fill={SAPPHIRE[1]}
          animate={{
            r: [6, 7, 6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.8,
          }}
        />

        <motion.line
          x1="22"
          y1="32"
          x2="30"
          y2="32"
          stroke={SAPPHIRE[2]}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
        />

        <motion.line
          x1="34"
          y1="32"
          x2="42"
          y2="32"
          stroke={SAPPHIRE[2]}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
        />

        <motion.circle
          cx="22"
          cy="32"
          r="2"
          fill={SAPPHIRE[3]}
          initial={{ cx: 22, opacity: 0 }}
          animate={{
            cx: [22, 30],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
            times: [0, 0.3, 0.7, 1],
          }}
        />

        <motion.line
          x1="30"
          y1="32"
          x2="34"
          y2="32"
          stroke={SAPPHIRE[0]}
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 0],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
            times: [0, 0.4, 0.6, 1],
            delay: 0.3,
          }}
        />

        <motion.circle
          cx="34"
          cy="32"
          r="2"
          fill={SAPPHIRE[3]}
          initial={{ cx: 34, opacity: 0 }}
          animate={{
            cx: [34, 42],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
            times: [0, 0.3, 0.7, 1],
            delay: 0.5,
          }}
        />

        <motion.circle
          cx="48"
          cy="32"
          r="10"
          fill="none"
          stroke={SAPPHIRE[2]}
          strokeWidth="1.5"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.3, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
            delay: 1.2,
          }}
        />
      </svg>
    </div>
  );
}
