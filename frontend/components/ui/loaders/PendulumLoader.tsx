'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PendulumLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SAPPHIRE = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'];

export function PendulumLoader({ className, size = 'md' }: PendulumLoaderProps) {
  const sizeConfig = {
    sm: { width: 80, height: 50, ball: 10, stringLength: 28 },
    md: { width: 120, height: 70, ball: 14, stringLength: 38 },
    lg: { width: 160, height: 90, ball: 18, stringLength: 50 },
  };

  const { width, height, ball, stringLength } = sizeConfig[size];
  const balls = 5;
  const spacing = ball + 2;
  const startX = (width - (balls - 1) * spacing) / 2;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
        style={{
          width: balls * spacing + ball,
          height: 3,
          background: `linear-gradient(90deg, ${SAPPHIRE[0]}, ${SAPPHIRE[2]}, ${SAPPHIRE[0]})`,
        }}
      />
      {Array.from({ length: balls }).map((_, i) => {
        const isFirst = i === 0;
        const isLast = i === balls - 1;
        const x = startX + i * spacing;

        return (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: x, top: 3, width: ball, height: stringLength + ball, transformOrigin: `${ball / 2}px 0px` }}
            animate={isFirst ? { rotate: [-35, 0, 0, 0, -35] } : isLast ? { rotate: [0, 0, 35, 0, 0] } : { rotate: 0 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: [0.45, 0, 0.55, 1], times: [0, 0.25, 0.5, 0.75, 1] }}
          >
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{ width: 2, height: stringLength, background: `linear-gradient(180deg, ${SAPPHIRE[1]}80, ${SAPPHIRE[2]}40)` }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: ball,
                height: ball,
                top: stringLength,
                background: `radial-gradient(circle at 30% 30%, ${SAPPHIRE[3]}, ${SAPPHIRE[i % 4]} 50%, ${SAPPHIRE[0]})`,
                boxShadow: `0 0 ${ball / 2}px ${SAPPHIRE[2]}80`,
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
