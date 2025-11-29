'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function ReverbLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const centerX = dim / 2;
  const centerY = dim / 2;
  const rings = 4;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        {Array.from({ length: rings }).map((_, i) => {
          const baseRadius = dim * 0.12;

          return (
            <motion.circle
              key={i}
              cx={centerX}
              cy={centerY}
              fill="none"
              stroke={SAPPHIRE[i % SAPPHIRE.length]}
              strokeWidth={2}
              initial={{ r: baseRadius, opacity: 0.8 }}
              animate={{
                r: [baseRadius, dim / 2 - 2],
                opacity: [0.8, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeOut',
                delay: i * 0.5,
              }}
            />
          );
        })}
        <circle cx={centerX} cy={centerY} r={6} fill={SAPPHIRE[2]} opacity={0.8} />
      </svg>
    </div>
  );
}
