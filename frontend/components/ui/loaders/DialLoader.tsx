'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function DialLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const radius = dim * 0.45;
  const centerX = dim / 2;
  const centerY = dim / 2;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill={SAPPHIRE[0]}
          fillOpacity="0.2"
          stroke={SAPPHIRE[1]}
          strokeWidth="2"
        />

        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: `${centerX}px ${centerY}px` }}
        >
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x = centerX + radius * 0.85 * Math.sin(angle);
            const y = centerY - radius * 0.85 * Math.cos(angle);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={dim * 0.03}
                fill={i % 3 === 0 ? SAPPHIRE[3] : SAPPHIRE[2]}
              />
            );
          })}

          <line
            x1={centerX}
            y1={centerY}
            x2={centerX}
            y2={centerY - radius * 0.6}
            stroke={SAPPHIRE[3]}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </motion.g>

        <circle
          cx={centerX}
          cy={centerY}
          r={dim * 0.08}
          fill={SAPPHIRE[2]}
          stroke={SAPPHIRE[3]}
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
