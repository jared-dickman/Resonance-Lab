'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PrismLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SAPPHIRE = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'];
const SPECTRUM = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

export function PrismLoader({ className, size = 'md' }: PrismLoaderProps) {
  const sizeConfig = { sm: 48, md: 72, lg: 96 };
  const dimension = sizeConfig[size];

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('relative overflow-hidden', className)}
      style={{ width: dimension * 1.8, height: dimension }}
    >
      <svg viewBox="0 0 180 100" width={dimension * 1.8} height={dimension}>
        <defs>
          <linearGradient id="prismFace" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={SAPPHIRE[3]} stopOpacity="0.9" />
            <stop offset="50%" stopColor={SAPPHIRE[1]} stopOpacity="0.7" />
            <stop offset="100%" stopColor={SAPPHIRE[0]} stopOpacity="0.9" />
          </linearGradient>
          <filter id="prismGlow">
            <feGaussianBlur stdDeviation="2" />
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <motion.line x1="0" y1="50" x2="55" y2="50" stroke="#ffffff" strokeWidth="3" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} />
        <motion.polygon points="55,15 95,85 55,85" fill="url(#prismFace)" stroke={SAPPHIRE[2]} strokeWidth="1.5" filter="url(#prismGlow)" />
        {SPECTRUM.map((color, i) => {
          const angle = -25 + i * 8;
          const endX = 95 + Math.cos((angle * Math.PI) / 180) * 85;
          const endY = 50 + Math.sin((angle * Math.PI) / 180) * 85;
          return (
            <motion.line
              key={color}
              x1="85" y1="65" x2={endX} y2={endY}
              stroke={color} strokeWidth="2.5" strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.08, times: [0, 0.3, 0.7, 1] }}
            />
          );
        })}
        <motion.circle cx="5" cy="50" r="8" fill="white" opacity="0.8" filter="url(#prismGlow)" animate={{ r: [6, 10, 6] }} transition={{ duration: 1.5, repeat: Infinity }} />
      </svg>
    </div>
  );
}
