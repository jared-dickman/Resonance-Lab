'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function LightningLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox="0 0 100 100" style={{ display: 'block' }}>
        <motion.path
          d="M50,10 L35,50 L52,50 L40,90 L75,45 L58,45 Z"
          fill={SAPPHIRE[2]}
          stroke={SAPPHIRE[3]}
          strokeWidth="2.5"
          strokeLinejoin="miter"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 1, 0.95, 0],
            scaleY: [0.3, 1.08, 1, 1.05, 0.3],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: [0.22, 1, 0.36, 1],
            times: [0, 0.05, 0.15, 0.25, 1],
          }}
          style={{ originX: '50px', originY: '50px' }}
        />
        <motion.path
          d="M50,10 L35,50 L52,50 L40,90"
          fill="none"
          stroke={SAPPHIRE[3]}
          strokeWidth="5"
          strokeLinecap="round"
          filter="blur(2px)"
          animate={{
            opacity: [0, 0.95, 0.9, 0],
            pathLength: [0, 1, 1, 1],
            scaleY: [0.3, 1, 1, 0.3],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: [0.22, 1, 0.36, 1],
            times: [0, 0.05, 0.2, 1],
          }}
          style={{ originX: '50px', originY: '50px' }}
        />
        <motion.circle
          cx="50"
          cy="10"
          r="8"
          fill={SAPPHIRE[3]}
          filter="blur(3px)"
          animate={{
            scale: [1, 3.5, 1],
            opacity: [0.9, 0, 0.9],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            times: [0, 0.15, 1],
            ease: [0.22, 1, 0.36, 1],
          }}
        />
        <motion.circle
          cx="50"
          cy="50"
          r="10"
          fill={SAPPHIRE[2]}
          filter="blur(4px)"
          animate={{
            scale: [0, 2.5, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: 0.05,
            times: [0, 0.1, 1],
            ease: 'easeOut',
          }}
        />
        <motion.circle
          cx="40"
          cy="90"
          r="12"
          fill={SAPPHIRE[1]}
          filter="blur(5px)"
          animate={{
            scale: [0, 3, 0],
            opacity: [0, 0.9, 0],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: 0.15,
            times: [0, 0.15, 1],
            ease: 'easeOut',
          }}
        />
      </svg>
    </div>
  );
}
