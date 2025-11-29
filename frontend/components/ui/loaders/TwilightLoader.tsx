'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function TwilightLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];

  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox="0 0 100 100" style={{ display: 'block' }}>
        <defs>
          {/* Animated gradient sky with color transitions */}
          <linearGradient id={`twilight-sky-${size}`} x1="0%" y1="100%" x2="0%" y2="0%">
            <motion.stop offset="0%" stopColor={SAPPHIRE[2]} />
            <motion.stop offset="40%" stopColor={SAPPHIRE[1]} />
            <motion.stop offset="70%" stopColor={SAPPHIRE[0]} />
            <motion.stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Enhanced sun glow gradient */}
          <radialGradient id={`twilight-sun-${size}`}>
            <stop offset="0%" stopColor={SAPPHIRE[3]} stopOpacity="1" />
            <stop offset="40%" stopColor={SAPPHIRE[2]} stopOpacity="0.9" />
            <stop offset="70%" stopColor={SAPPHIRE[1]} stopOpacity="0.4" />
            <stop offset="100%" stopColor={SAPPHIRE[0]} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sky background */}
        <rect width="100" height="100" fill={`url(#twilight-sky-${size})`} />

        {/* Twinkling stars at top */}
        {Array.from({ length: 12 }).map((_, i) => {
          const x = 10 + (i % 5) * 18 + (i % 3) * 4;
          const y = 8 + Math.floor(i / 5) * 12;
          const isLarge = i % 3 === 0;

          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={isLarge ? 1.2 : 0.7}
              fill={SAPPHIRE[3]}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0.3, 1, 0.5],
                scale: [0.8, 1.2, 1, 1.1, 0.9],
              }}
              transition={{
                duration: 2.5 + i * 0.2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3,
              }}
            />
          );
        })}

        {/* Sun at horizon with glow */}
        <motion.g>
          {/* Sun glow with breathing effect */}
          <motion.circle
            cx="50"
            cy="75"
            r="22"
            fill={`url(#twilight-sun-${size})`}
            animate={{
              opacity: [0.5, 0.8, 0.5],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ originX: '50px', originY: '75px' }}
          />

          {/* Sun disc with color shift */}
          <motion.circle
            cx="50"
            cy="75"
            r="11"
            fill={SAPPHIRE[2]}
            animate={{
              opacity: [0.7, 1, 0.7],
              fill: [SAPPHIRE[2], SAPPHIRE[3], SAPPHIRE[2]],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.g>

        {/* Horizon line with fade */}
        <motion.line
          x1="0"
          y1="75"
          x2="100"
          y2="75"
          stroke={SAPPHIRE[1]}
          strokeWidth="0.5"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Additional small stars twinkling */}
        {Array.from({ length: 4 }).map((_, i) => {
          const x = 20 + i * 18;
          const y = 35 + (i % 2) * 8;

          return (
            <motion.circle
              key={`small-${i}`}
              cx={x}
              cy={y}
              r={0.5}
              fill={SAPPHIRE[2]}
              animate={{
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.6 + 1,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
