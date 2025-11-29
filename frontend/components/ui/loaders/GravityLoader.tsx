'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function GravityLoader({ className, size = 'md' }: LoaderProps) {
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
          <radialGradient id="grav-grad">
            <stop offset="0%" stopColor={SAPPHIRE[2]} stopOpacity="0.8" />
            <stop offset="100%" stopColor={SAPPHIRE[0]} stopOpacity="0.2" />
          </radialGradient>
        </defs>

        {/* Central mass */}
        <motion.circle
          cx="50"
          cy="50"
          r="8"
          fill="url(#grav-grad)"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Orbiting particles with gravitational pull effect */}
        {SAPPHIRE.map((color, i) => {
          const angle = (i * 360) / SAPPHIRE.length;
          return (
            <motion.circle
              key={i}
              cx="50"
              cy="50"
              r="3"
              fill={color}
              opacity="0.9"
              animate={{
                cx: [
                  50 + 35 * Math.cos((angle * Math.PI) / 180),
                  50 + 15 * Math.cos(((angle + 180) * Math.PI) / 180),
                  50 + 35 * Math.cos((angle * Math.PI) / 180),
                ],
                cy: [
                  50 + 35 * Math.sin((angle * Math.PI) / 180),
                  50 + 15 * Math.sin(((angle + 180) * Math.PI) / 180),
                  50 + 35 * Math.sin((angle * Math.PI) / 180),
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
