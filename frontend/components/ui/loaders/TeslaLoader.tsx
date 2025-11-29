'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function TeslaLoader({ className, size = 'md' }: LoaderProps) {
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
          <filter id="tesla-glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Tesla coil base */}
        <rect x="40" y="70" width="20" height="25" rx="2" fill={SAPPHIRE[0]} opacity="0.6" />

        {/* Electrical arcs */}
        {SAPPHIRE.map((color, i) => {
          const angle = (i * 360) / SAPPHIRE.length - 90;
          const rad = (angle * Math.PI) / 180;
          const x2 = 50 + 40 * Math.cos(rad);
          const y2 = 70 + 40 * Math.sin(rad);

          return (
            <motion.path
              key={i}
              d={`M 50 70 Q ${50 + 10 * Math.cos(rad - 0.5)} ${70 + 10 * Math.sin(rad - 0.5)} ${x2} ${y2}`}
              stroke={color}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              filter="url(#tesla-glow)"
              opacity="0"
              animate={{
                opacity: [0, 0.9, 0],
                pathLength: [0, 1],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeOut',
              }}
            />
          );
        })}

        {/* Center spark */}
        <motion.circle
          cx="50"
          cy="70"
          r="4"
          fill={SAPPHIRE[2]}
          filter="url(#tesla-glow)"
          animate={{
            r: [3, 6, 3],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>
    </div>
  );
}
