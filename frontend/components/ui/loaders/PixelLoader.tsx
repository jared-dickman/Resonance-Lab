'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function PixelLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const grid = 8;
  const pixelSize = dim / (grid * 1.5);
  const gap = pixelSize * 0.15;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        {Array.from({ length: grid }).map((_, row) =>
          Array.from({ length: grid }).map((_, col) => {
            const x = (dim - grid * pixelSize - (grid - 1) * gap) / 2 + col * (pixelSize + gap);
            const y = (dim - grid * pixelSize - (grid - 1) * gap) / 2 + row * (pixelSize + gap);
            const distanceFromCenter = Math.sqrt(
              Math.pow(col - grid / 2, 2) + Math.pow(row - grid / 2, 2)
            );
            const delay = distanceFromCenter * 0.08;
            const colorIndex = Math.floor(distanceFromCenter) % SAPPHIRE.length;

            return (
              <motion.rect
                key={`${row}-${col}`}
                x={x}
                y={y}
                width={pixelSize}
                height={pixelSize}
                fill={SAPPHIRE[colorIndex]}
                rx={pixelSize * 0.2}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay,
                  ease: 'easeInOut',
                }}
              />
            );
          })
        )}
      </svg>
    </div>
  );
}
