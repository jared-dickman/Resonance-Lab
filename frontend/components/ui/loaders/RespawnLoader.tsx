'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function RespawnLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const center = dim / 2;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{ width: dim, height: dim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        <defs>
          <radialGradient id={`respawn-glow-${size}`}>
            <stop offset="0%" stopColor={SAPPHIRE[3]} stopOpacity="1" />
            <stop offset="70%" stopColor={SAPPHIRE[1]} stopOpacity="0.5" />
            <stop offset="100%" stopColor={SAPPHIRE[0]} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Expanding rings */}
        {[0, 0.3, 0.6].map((delay, i) => (
          <motion.circle
            key={i}
            cx={center}
            cy={center}
            fill="none"
            stroke={SAPPHIRE[2 - i]}
            strokeWidth={dim * 0.015}
            animate={{
              r: [dim * 0.05, dim * 0.4],
              opacity: [0.8, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Center glow */}
        <motion.circle
          cx={center}
          cy={center}
          r={dim * 0.15}
          fill={`url(#respawn-glow-${size})`}
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: `${center}px`, originY: `${center}px` }}
        />

        {/* Player silhouette fading in */}
        <motion.g
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: `${center}px`, originY: `${center}px` }}
        >
          {/* Head */}
          <circle cx={center} cy={center - dim * 0.08} r={dim * 0.06} fill={SAPPHIRE[3]} />
          {/* Body */}
          <rect
            x={center - dim * 0.05}
            y={center}
            width={dim * 0.1}
            height={dim * 0.12}
            rx={dim * 0.02}
            fill={SAPPHIRE[2]}
          />
        </motion.g>
      </svg>
    </div>
  );
}
