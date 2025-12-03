'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function RocketLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const center = dim / 2;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} style={{ display: 'block' }}>
        <defs>
          {/* Flame gradient */}
          <linearGradient id={`flame-gradient-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={SAPPHIRE[3]} stopOpacity="0.9" />
            <stop offset="50%" stopColor={SAPPHIRE[2]} stopOpacity="0.7" />
            <stop offset="100%" stopColor={SAPPHIRE[1]} stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Falling star particles (creates upward motion illusion) */}
        {Array.from({ length: 8 }).map((_, i) => {
          const x = center + (Math.random() - 0.5) * dim * 0.6;
          const startY = dim * 0.1;
          const endY = dim * 0.9;

          return (
            <motion.circle
              key={i}
              r={dim * 0.015}
              fill={SAPPHIRE[i % 4]}
              animate={{
                cx: [x, x + (Math.random() - 0.5) * 5],
                cy: [startY, endY],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 1.5 + Math.random() * 1,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 0.2,
              }}
            />
          );
        })}

        {/* Rocket body with hover animation */}
        <motion.g
          animate={{
            y: [0, -3, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Left fin */}
          <motion.path
            d={`M${center - dim * 0.12} ${center + dim * 0.08} L${center - dim * 0.18} ${center + dim * 0.18} L${center - dim * 0.08} ${center + dim * 0.15} Z`}
            fill={SAPPHIRE[1]}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Right fin */}
          <motion.path
            d={`M${center + dim * 0.12} ${center + dim * 0.08} L${center + dim * 0.18} ${center + dim * 0.18} L${center + dim * 0.08} ${center + dim * 0.15} Z`}
            fill={SAPPHIRE[1]}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Main rocket body */}
          <motion.rect
            x={center - dim * 0.08}
            y={center - dim * 0.1}
            width={dim * 0.16}
            height={dim * 0.25}
            fill={SAPPHIRE[2]}
            rx={dim * 0.02}
          />

          {/* Rocket nose cone */}
          <motion.path
            d={`M${center} ${center - dim * 0.22} L${center - dim * 0.08} ${center - dim * 0.1} L${center + dim * 0.08} ${center - dim * 0.1} Z`}
            fill={SAPPHIRE[3]}
          />

          {/* Window */}
          <motion.circle
            cx={center}
            cy={center - dim * 0.02}
            r={dim * 0.04}
            fill={SAPPHIRE[0]}
            opacity={0.6}
            animate={{
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Animated exhaust flames */}
          <motion.g>
            {/* Center flame */}
            <motion.ellipse
              cx={center}
              cy={center + dim * 0.18}
              rx={dim * 0.04}
              ry={dim * 0.12}
              fill={`url(#flame-gradient-${size})`}
              animate={{
                ry: [dim * 0.12, dim * 0.15, dim * 0.12],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 0.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Left flame */}
            <motion.ellipse
              cx={center - dim * 0.05}
              cy={center + dim * 0.18}
              rx={dim * 0.03}
              ry={dim * 0.09}
              fill={`url(#flame-gradient-${size})`}
              animate={{
                ry: [dim * 0.09, dim * 0.11, dim * 0.09],
                opacity: [0.7, 0.9, 0.7],
              }}
              transition={{
                duration: 0.4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.1,
              }}
            />

            {/* Right flame */}
            <motion.ellipse
              cx={center + dim * 0.05}
              cy={center + dim * 0.18}
              rx={dim * 0.03}
              ry={dim * 0.09}
              fill={`url(#flame-gradient-${size})`}
              animate={{
                ry: [dim * 0.09, dim * 0.11, dim * 0.09],
                opacity: [0.7, 0.9, 0.7],
              }}
              transition={{
                duration: 0.4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.2,
              }}
            />
          </motion.g>
        </motion.g>
      </svg>
    </div>
  );
}
