'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MorphLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SAPPHIRE = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'];

export function MorphLoader({ className, size = 'md' }: MorphLoaderProps) {
  const sizeConfig = { sm: 32, md: 48, lg: 64 };
  const dimension = sizeConfig[size];

  const blobPaths = [
    'M45,25 C55,10 70,15 75,30 C80,45 70,60 55,65 C40,70 25,60 20,45 C15,30 25,15 45,25',
    'M50,15 C70,20 80,35 75,55 C70,75 50,80 35,70 C20,60 15,40 25,25 C35,10 45,10 50,15',
    'M40,20 C60,10 80,25 80,45 C80,65 60,80 40,75 C20,70 10,50 15,35 C20,20 30,15 40,20',
  ];

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('relative overflow-hidden', className)}
      style={{ width: dimension, height: dimension }}
    >
      <svg viewBox="0 0 100 100" width={dimension} height={dimension}>
        <defs>
          <radialGradient id="morphGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={SAPPHIRE[3]} />
            <stop offset="50%" stopColor={SAPPHIRE[1]} />
            <stop offset="100%" stopColor={SAPPHIRE[0]} />
          </radialGradient>
          <filter id="morphGlow">
            <feGaussianBlur stdDeviation="3" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <motion.path
          fill="url(#morphGrad)"
          filter="url(#morphGlow)"
          animate={{ d: blobPaths, rotate: [0, 360] }}
          transition={{
            d: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
          }}
          style={{ transformOrigin: '50px 50px' }}
        />
      </svg>
    </div>
  );
}
