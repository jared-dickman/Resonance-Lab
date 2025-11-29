'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ResonanceLoaderProps {
  className?: string;
  barCount?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ResonanceLoader({ className, barCount = 9, size = 'md' }: ResonanceLoaderProps) {
  const sizeConfig = {
    sm: { height: 16, barWidth: 2, gap: 1 },
    md: { height: 32, barWidth: 3, gap: 2 },
    lg: { height: 48, barWidth: 4, gap: 3 },
  };

  const { height, barWidth, gap } = sizeConfig[size];

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ gap }}
    >
      {Array.from({ length: barCount }).map((_, i) => {
        const centerIndex = (barCount - 1) / 2;
        const distanceFromCenter = Math.abs(i - centerIndex);
        const maxScale = 1 - (distanceFromCenter / centerIndex) * 0.6;

        return (
          <motion.div
            key={i}
            className="rounded-full"
            style={{
              width: barWidth,
              height,
              background: `linear-gradient(180deg, #1e40af 0%, #3b82f6 35%, #60a5fa 65%, #93c5fd 100%)`,
              boxShadow: '0 0 8px #3b82f6, 0 0 16px #60a5fa40',
            }}
            animate={{
              scaleY: [0.3, maxScale, 0.3],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.08,
            }}
          />
        );
      })}
    </div>
  );
}
