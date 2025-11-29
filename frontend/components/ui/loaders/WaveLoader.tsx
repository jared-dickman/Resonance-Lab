'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function WaveLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox="0 0 100 100">
        <motion.path
          d="M10,50 Q25,30 40,50 T70,50 T100,50"
          fill="none"
          stroke={SAPPHIRE[0]}
          strokeWidth="3"
          strokeLinecap="round"
          animate={{
            d: [
              'M10,50 Q25,30 40,50 T70,50 T100,50',
              'M10,50 Q25,70 40,50 T70,50 T100,50',
              'M10,50 Q25,30 40,50 T70,50 T100,50',
            ],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d="M10,60 Q25,40 40,60 T70,60 T100,60"
          fill="none"
          stroke={SAPPHIRE[1]}
          strokeWidth="2.5"
          strokeLinecap="round"
          animate={{
            d: [
              'M10,60 Q25,40 40,60 T70,60 T100,60',
              'M10,60 Q25,80 40,60 T70,60 T100,60',
              'M10,60 Q25,40 40,60 T70,60 T100,60',
            ],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
        <motion.path
          d="M10,40 Q25,20 40,40 T70,40 T100,40"
          fill="none"
          stroke={SAPPHIRE[2]}
          strokeWidth="2"
          strokeLinecap="round"
          animate={{
            d: [
              'M10,40 Q25,20 40,40 T70,40 T100,40',
              'M10,40 Q25,60 40,40 T70,40 T100,40',
              'M10,40 Q25,20 40,40 T70,40 T100,40',
            ],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        />
      </svg>
    </div>
  );
}
