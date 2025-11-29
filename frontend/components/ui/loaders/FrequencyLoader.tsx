'use client';

import { motion } from 'framer-motion';

interface FrequencyLoaderProps {
  size?: number;
  barCount?: number;
}

export function FrequencyLoader({ size = 48, barCount = 7 }: FrequencyLoaderProps) {
  const barWidth = size / (barCount * 2);
  const maxHeight = size;

  return (
    <div
      className="flex items-end justify-center gap-[2px]"
      style={{ height: maxHeight, width: size }}
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: barCount }).map((_, i) => {
        const delay = i * 0.1;
        const centerDistance = Math.abs(i - (barCount - 1) / 2);
        const baseHeight = maxHeight * (1 - centerDistance * 0.15);

        return (
          <motion.div
            key={i}
            className="rounded-full"
            style={{
              width: barWidth,
              background: 'linear-gradient(to top, #1e40af, #3b82f6, #60a5fa, #93c5fd)',
              boxShadow: '0 0 8px #3b82f6, 0 0 16px #1e40af40',
            }}
            animate={{
              height: [baseHeight * 0.3, baseHeight, baseHeight * 0.3],
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
