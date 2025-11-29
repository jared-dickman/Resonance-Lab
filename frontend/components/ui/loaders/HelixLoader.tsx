'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HelixLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SAPPHIRE = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'];

export function HelixLoader({ className, size = 'md' }: HelixLoaderProps) {
  const sizeConfig = {
    sm: { width: 40, height: 24, nodeSize: 6 },
    md: { width: 64, height: 40, nodeSize: 10 },
    lg: { width: 96, height: 56, nodeSize: 14 },
  };

  const { width, height, nodeSize } = sizeConfig[size];
  const nodes = 8;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      {Array.from({ length: nodes }).map((_, i) => {
        const xPos = (i / nodes) * width;
        const delay = i * 0.25;

        return (
          <div key={i} className="absolute" style={{ left: xPos - nodeSize / 2 }}>
            <motion.div
              className="absolute rounded-full"
              style={{
                width: nodeSize,
                height: nodeSize,
                background: `radial-gradient(circle at 30% 30%, ${SAPPHIRE[2]}, ${SAPPHIRE[0]})`,
                boxShadow: `0 0 ${nodeSize}px ${SAPPHIRE[1]}`,
              }}
              animate={{ y: [0, height - nodeSize, 0], scale: [1, 0.6, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay }}
            />
            <motion.div
              className="absolute rounded-full"
              style={{
                width: nodeSize,
                height: nodeSize,
                background: `radial-gradient(circle at 30% 30%, ${SAPPHIRE[3]}, ${SAPPHIRE[1]})`,
              }}
              animate={{ y: [height - nodeSize, 0, height - nodeSize], scale: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay }}
            />
          </div>
        );
      })}
    </div>
  );
}
