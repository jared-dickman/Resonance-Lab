'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function GlitchLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const bars = 7;
  const barWidth = dim / (bars * 2);

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        <defs>
          <linearGradient id="scanline" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={SAPPHIRE[0]} stopOpacity="0" />
            <stop offset="50%" stopColor={SAPPHIRE[1]} stopOpacity="0.8" />
            <stop offset="100%" stopColor={SAPPHIRE[0]} stopOpacity="0" />
          </linearGradient>
        </defs>

        {Array.from({ length: bars }).map((_, i) => {
          const x = (i * dim) / bars + dim / bars / 2 - barWidth / 2;
          const baseHeight = dim * 0.6;

          return (
            <motion.rect
              key={i}
              x={x}
              y={dim / 2}
              width={barWidth}
              height={baseHeight}
              fill={SAPPHIRE[i % SAPPHIRE.length]}
              rx={barWidth / 4}
              initial={{ scaleY: 1, y: dim / 2 }}
              animate={{
                scaleY: [1, 0.2, 1.4, 0.5, 1],
                y: [dim / 2, dim * 0.6, dim * 0.3, dim * 0.7, dim / 2],
                opacity: [1, 0.6, 1, 0.4, 1],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.08,
                ease: [0.45, 0, 0.55, 1],
              }}
              style={{ originY: 'center' }}
            />
          );
        })}

        <motion.rect
          x={0}
          y={0}
          width={dim}
          height={dim * 0.1}
          fill="url(#scanline)"
          animate={{
            y: [0, dim - dim * 0.1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </svg>
    </div>
  );
}
