'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function QuantumLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox="0 0 100 100">
        <defs>
          <filter id="quantum-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Quantum probability clouds */}
        {SAPPHIRE.map((color, i) => (
          <g key={i}>
            <motion.circle
              cx="50"
              cy="50"
              r="20"
              fill="none"
              stroke={color}
              strokeWidth="1.5"
              opacity="0.6"
              filter="url(#quantum-glow)"
              animate={{
                r: [15, 30, 15],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut',
              }}
            />
            <motion.circle
              cx="50"
              cy="50"
              r="4"
              fill={color}
              opacity="0.9"
              animate={{
                cx: [50, 70, 50, 30, 50],
                cy: [50, 50, 70, 50, 50],
                scale: [1, 0.5, 1, 0.5, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'easeInOut',
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
