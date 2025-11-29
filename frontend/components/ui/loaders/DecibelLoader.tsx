'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function DecibelLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const segments = 12;
  const radius = dim * 0.35;
  const centerX = dim / 2;
  const centerY = dim / 2;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        {Array.from({ length: segments }).map((_, i) => {
          const angle = (i / segments) * Math.PI * 2 - Math.PI / 2;
          const x1 = centerX + Math.cos(angle) * radius * 0.7;
          const y1 = centerY + Math.sin(angle) * radius * 0.7;
          const x2 = centerX + Math.cos(angle) * radius;
          const y2 = centerY + Math.sin(angle) * radius;

          return (
            <motion.line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={SAPPHIRE[Math.floor((i / segments) * SAPPHIRE.length)]}
              strokeWidth={2.5}
              strokeLinecap="round"
              initial={{ opacity: 0.2 }}
              animate={{
                opacity: [0.2, 1, 0.2],
                strokeWidth: [2, 3.5, 2],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.06,
              }}
            />
          );
        })}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.6}
          fill="none"
          stroke={SAPPHIRE[1]}
          strokeWidth={1}
          opacity={0.2}
        />
      </svg>
    </div>
  );
}
