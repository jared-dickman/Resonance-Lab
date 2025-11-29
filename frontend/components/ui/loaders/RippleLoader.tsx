'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RippleLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SAPPHIRE = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'];

export function RippleLoader({ className, size = 'md' }: RippleLoaderProps) {
  const sizeConfig = { sm: 32, md: 64, lg: 96 };
  const dimension = sizeConfig[size];
  const center = dimension / 2;
  const maxRadius = (dimension - 3) / 2;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('relative flex items-center justify-center overflow-hidden', className)}
      style={{ width: dimension, height: dimension }}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.svg
          key={i}
          className="absolute inset-0"
          width={dimension}
          height={dimension}
        >
          <motion.circle
            cx={center}
            cy={center}
            fill="none"
            stroke={SAPPHIRE[i]}
            strokeWidth={3}
            initial={{ r: maxRadius * 0.1, opacity: 1 }}
            animate={{ r: [maxRadius * 0.1, maxRadius], opacity: [0.9, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: i * 0.4 }}
            style={{ filter: `drop-shadow(0 0 4px ${SAPPHIRE[i]})` }}
          />
        </motion.svg>
      ))}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: dimension * 0.12,
          height: dimension * 0.12,
          background: `radial-gradient(circle, ${SAPPHIRE[3]} 0%, ${SAPPHIRE[1]} 100%)`,
          boxShadow: `0 0 12px ${SAPPHIRE[2]}`,
        }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
    </div>
  );
}
