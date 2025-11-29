'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function GalagaLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center overflow-hidden', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim * 0.8} height={dim * 0.8} viewBox="0 0 100 100">
        {/* Star field background */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.circle
            key={`star-${i}`}
            cx={20 + (i % 4) * 20}
            cy={10 + Math.floor(i / 4) * 30}
            r={0.8}
            fill={SAPPHIRE[i % 3]}
            animate={{
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.15,
            }}
          />
        ))}

        {/* Enemy ships - swooping in curved paths */}
        {[0, 1, 2].map((i) => (
          <motion.g
            key={`enemy-${i}`}
            animate={{
              x: [0, 20, -20, 0],
              y: [0, 15, 30, 45],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.8,
            }}
          >
            {/* Enemy ship body */}
            <motion.path
              d={`M${25 + i * 25},8 L${22 + i * 25},12 L${28 + i * 25},12 Z`}
              fill={SAPPHIRE[1]}
              animate={{
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.8,
              }}
            />
            {/* Enemy wings */}
            <motion.rect
              x={20 + i * 25}
              y={10}
              width={10}
              height={2}
              fill={SAPPHIRE[2]}
              animate={{
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.8,
              }}
            />
          </motion.g>
        ))}

        {/* Player's projectiles */}
        {[0, 1, 2, 3].map((i) => (
          <motion.line
            key={`bullet-${i}`}
            x1={50}
            y1={85}
            x2={50}
            y2={80}
            stroke={SAPPHIRE[3]}
            strokeWidth={1.5}
            strokeLinecap="round"
            animate={{
              y1: [85, 0],
              y2: [80, -5],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.4,
            }}
          />
        ))}

        {/* Player ship - triangular at bottom */}
        <motion.g
          animate={{
            x: [-3, 3, -3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Ship body - triangle */}
          <path d="M50,85 L44,92 L56,92 Z" fill={SAPPHIRE[2]} />
          {/* Ship detail - cockpit */}
          <circle cx={50} cy={88} r={1.5} fill={SAPPHIRE[3]} />
          {/* Ship wings */}
          <path d="M44,92 L41,94 L44,94 Z" fill={SAPPHIRE[1]} />
          <path d="M56,92 L59,94 L56,94 Z" fill={SAPPHIRE[1]} />
        </motion.g>

        {/* Muzzle flash effect */}
        <motion.circle
          cx={50}
          cy={83}
          r={2}
          fill={SAPPHIRE[3]}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 0.4,
            repeat: Infinity,
            ease: 'easeOut',
            repeatDelay: 1.1,
          }}
          style={{ originX: '50px', originY: '83px' }}
        />
      </svg>
    </div>
  );
}
