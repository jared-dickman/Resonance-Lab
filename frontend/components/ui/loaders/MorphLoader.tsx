'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function MorphLoader({ size = 'md' }: LoaderProps) {
  const dimension = LOADER_SIZE[size];

  const shape1 = `M ${dimension * 0.3} ${dimension * 0.3} L ${dimension * 0.7} ${dimension * 0.3} L ${dimension * 0.7} ${dimension * 0.7} L ${dimension * 0.3} ${dimension * 0.7} Z`;
  const shape2 = `M ${dimension * 0.5} ${dimension * 0.2} L ${dimension * 0.75} ${dimension * 0.5} L ${dimension * 0.5} ${dimension * 0.8} L ${dimension * 0.25} ${dimension * 0.5} Z`;
  const shape3 = `M ${dimension * 0.5} ${dimension * 0.2} L ${dimension * 0.8} ${dimension * 0.5} L ${dimension * 0.65} ${dimension * 0.8} L ${dimension * 0.35} ${dimension * 0.8} L ${dimension * 0.2} ${dimension * 0.5} Z`;

  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex items-center justify-center"
      style={{ width: dimension, height: dimension }}
    >
      <svg width={dimension} height={dimension} viewBox={`0 0 ${dimension} ${dimension}`}>
        <defs>
          <linearGradient id="morphGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={SAPPHIRE[1]} stopOpacity={0.8} />
            <stop offset="100%" stopColor={SAPPHIRE[3]} stopOpacity={0.9} />
          </linearGradient>
        </defs>
        <motion.path
          d={shape1}
          fill="url(#morphGrad)"
          strokeWidth={dimension * 0.02}
          stroke={SAPPHIRE[2]}
          animate={{
            d: [shape1, shape2, shape3, shape1],
            rotate: [0, 120, 240, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: `${dimension / 2}px ${dimension / 2}px` }}
        />
      </svg>
    </div>
  );
}
