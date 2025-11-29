'use client';

import { motion } from 'framer-motion';

const SAPPHIRE = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#60a5fa', '#3b82f6', '#1e40af'];

export function HarmonicLoader({ bars = 7, size = 48 }: { bars?: number; size?: number }) {
  const barWidth = size / (bars * 2);
  const maxHeight = size;

  return (
    <div
      className="flex items-center justify-center gap-[2px]"
      style={{ height: size, width: size * 1.5 }}
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: bars }).map((_, i) => {
        const delay = i * 0.1;
        const color = SAPPHIRE[i % SAPPHIRE.length];

        return (
          <motion.div
            key={i}
            style={{
              width: barWidth,
              backgroundColor: color,
              borderRadius: barWidth / 2,
              boxShadow: `0 0 ${barWidth}px ${color}40`,
            }}
            animate={{
              height: [maxHeight * 0.2, maxHeight * 0.9, maxHeight * 0.2],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
}
