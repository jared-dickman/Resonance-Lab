'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function FlameLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox="0 0 100 100">
        {[0, 1, 2].map((i) => (
          <motion.path
            key={i}
            d={`M${35 + i * 10},70 Q${35 + i * 10},40 ${45 + i * 10},30 Q${55 + i * 10},40 ${55 + i * 10},70`}
            fill={SAPPHIRE[i]}
            opacity="0.7"
            animate={{
              d: [
                `M${35 + i * 10},70 Q${35 + i * 10},40 ${45 + i * 10},30 Q${55 + i * 10},40 ${55 + i * 10},70`,
                `M${35 + i * 10},70 Q${32 + i * 10},28 ${48 + i * 10},18 Q${52 + i * 10},35 ${55 + i * 10},70`,
                `M${35 + i * 10},70 Q${38 + i * 10},35 ${42 + i * 10},22 Q${58 + i * 10},30 ${55 + i * 10},70`,
                `M${35 + i * 10},70 Q${36 + i * 10},32 ${46 + i * 10},25 Q${54 + i * 10},38 ${55 + i * 10},70`,
                `M${35 + i * 10},70 Q${35 + i * 10},40 ${45 + i * 10},30 Q${55 + i * 10},40 ${55 + i * 10},70`,
              ],
              opacity: [0.5, 0.9, 0.6, 0.8, 0.5],
              scale: [1, 1.05, 0.98, 1.02, 1],
            }}
            transition={{
              duration: 0.4,
              repeat: Infinity,
              delay: i * 0.08,
              ease: [0.45, 0.05, 0.55, 0.95],
            }}
          />
        ))}
        <motion.ellipse
          cx="50"
          cy="75"
          rx="20"
          ry="4"
          fill={SAPPHIRE[0]}
          opacity="0.3"
          animate={{
            rx: [18, 22, 19, 21, 18],
            opacity: [0.2, 0.4, 0.3, 0.35, 0.2],
            scaleY: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}
