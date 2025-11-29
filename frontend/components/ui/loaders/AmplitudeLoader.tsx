'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const SAPPHIRE = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'];
const BAR_COUNT = 7;

interface AmplitudeLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AmplitudeLoader({ className, size = 'md' }: AmplitudeLoaderProps) {
  const sizeConfig = {
    sm: { height: 16, width: 2, gap: 2 },
    md: { height: 24, width: 3, gap: 3 },
    lg: { height: 32, width: 4, gap: 4 },
  };

  const { height, width, gap } = sizeConfig[size];

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('relative flex items-center justify-center overflow-hidden', className)}
      style={{ gap }}
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const colorIndex = i % SAPPHIRE.length;
        const delay = i * 0.1;
        const centerDistance = Math.abs(i - Math.floor(BAR_COUNT / 2));
        const baseScale = 0.4 + (1 - centerDistance / Math.floor(BAR_COUNT / 2)) * 0.6;

        return (
          <motion.div
            key={i}
            style={{
              width,
              height,
              borderRadius: width / 2,
              background: `linear-gradient(180deg, ${SAPPHIRE[colorIndex]} 0%, ${SAPPHIRE[(colorIndex + 1) % SAPPHIRE.length]} 100%)`,
              boxShadow: `0 0 8px ${SAPPHIRE[colorIndex]}40`,
            }}
            animate={{
              scaleY: [baseScale * 0.3, baseScale, baseScale * 0.3],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay,
            }}
          />
        );
      })}
    </div>
  );
}
