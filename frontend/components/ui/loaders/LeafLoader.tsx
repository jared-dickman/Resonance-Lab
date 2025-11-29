'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function LeafLoader({ className, size = 'md' }: LoaderProps) {
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
            d="M50,50 Q70,30 80,50 T50,70 Q30,70 20,50 T50,30"
            fill="none"
            stroke={SAPPHIRE[i]}
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 0],
              opacity: [0, 0.8, 0],
              rotate: [0, 120, 240],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: [0.4, 0, 0.2, 1],
            }}
            style={{ originX: '50px', originY: '50px' }}
          />
        ))}
        <motion.circle
          cx="50"
          cy="50"
          r="3"
          fill={SAPPHIRE[1]}
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}
