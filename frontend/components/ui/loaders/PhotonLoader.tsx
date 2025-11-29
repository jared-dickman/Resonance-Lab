'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function PhotonLoader({ className, size = 'md' }: LoaderProps) {
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
          <filter id="photon-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Light beams */}
        {SAPPHIRE.map((color, i) => (
          <g key={i}>
            <motion.line
              x1="0"
              y1={30 + i * 12}
              x2="100"
              y2={30 + i * 12}
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.4"
              filter="url(#photon-glow)"
            />
            <motion.circle
              cx="0"
              cy={30 + i * 12}
              r="3"
              fill={color}
              filter="url(#photon-glow)"
              animate={{
                cx: [0, 100],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'linear',
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
