'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SineLoaderProps {
  className?: string;
  width?: number;
  height?: number;
}

export function SineLoader({ className, width = 120, height = 40 }: SineLoaderProps) {
  const points = 60;
  const amplitude = height * 0.35;
  const frequency = 2;

  const generatePath = (phase: number, amp: number) => {
    let d = `M 0 ${height / 2}`;
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width;
      const y = height / 2 + Math.sin((i / points) * Math.PI * 2 * frequency + phase) * amp;
      d += ` L ${x} ${y}`;
    }
    return d;
  };

  return (
    <div className={cn('flex items-center justify-center', className)} role="status" aria-label="Loading">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="sineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <motion.stop
              offset="0%"
              animate={{ stopColor: ['#1e40af', '#3b82f6', '#60a5fa', '#1e40af'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            <motion.stop
              offset="50%"
              animate={{ stopColor: ['#3b82f6', '#60a5fa', '#93c5fd', '#3b82f6'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            <motion.stop
              offset="100%"
              animate={{ stopColor: ['#60a5fa', '#93c5fd', '#1e40af', '#60a5fa'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          </linearGradient>
        </defs>

        <motion.path
          d={generatePath(0, amplitude)}
          fill="none"
          stroke="url(#sineGradient)"
          strokeWidth={3}
          strokeLinecap="round"
          animate={{
            d: [
              generatePath(0, amplitude),
              generatePath(Math.PI, amplitude * 0.6),
              generatePath(Math.PI * 2, amplitude),
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.path
          d={generatePath(Math.PI / 2, amplitude * 0.5)}
          fill="none"
          stroke="url(#sineGradient)"
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.4}
          animate={{
            d: [
              generatePath(Math.PI / 2, amplitude * 0.5),
              generatePath(Math.PI * 1.5, amplitude * 0.8),
              generatePath(Math.PI * 2.5, amplitude * 0.5),
            ],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>
    </div>
  );
}
