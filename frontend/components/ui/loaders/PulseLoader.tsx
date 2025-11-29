'use client';

import { motion } from 'framer-motion';

const BARS = 12;
const SAPPHIRE = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'];

export function PulseLoader({ size = 48 }: { size?: number }) {
  const barWidth = size / (BARS * 2);
  const maxHeight = size;

  return (
    <div
      className="flex items-center justify-center gap-[2px]"
      style={{ height: size, width: size * 1.5 }}
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: BARS }).map((_, i) => {
        const colorIndex = Math.floor((i / BARS) * SAPPHIRE.length);
        const delay = i * 0.08;

        return (
          <motion.div
            key={i}
            style={{
              width: barWidth,
              background: `linear-gradient(180deg, ${SAPPHIRE[colorIndex]} 0%, ${SAPPHIRE[Math.min(colorIndex + 1, 3)]} 100%)`,
              borderRadius: barWidth / 2,
            }}
            animate={{
              height: [maxHeight * 0.2, maxHeight * 0.9, maxHeight * 0.2],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1,
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
