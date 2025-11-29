'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function SunriseLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const sunRadius = dim * 0.12;
  const horizonY = dim * 0.65;
  const rayCount = 12;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} style={{ display: 'block' }}>
        <defs>
          {/* Gradient sky */}
          <linearGradient id={`sunrise-sky-${size}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SAPPHIRE[0]} />
            <stop offset="50%" stopColor={SAPPHIRE[1]} />
            <stop offset="100%" stopColor={SAPPHIRE[2]} />
          </linearGradient>

          {/* Sun gradient */}
          <radialGradient id={`sunrise-sun-${size}`}>
            <stop offset="0%" stopColor={SAPPHIRE[3]} />
            <stop offset="70%" stopColor={SAPPHIRE[2]} />
            <stop offset="100%" stopColor={SAPPHIRE[1]} stopOpacity="0.8" />
          </radialGradient>
        </defs>

        {/* Sky background */}
        <rect width={dim} height={horizonY} fill={`url(#sunrise-sky-${size})`} />

        {/* Radiating rays */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          style={{ originX: `${dim / 2}px`, originY: `${horizonY}px` }}
        >
          {Array.from({ length: rayCount }).map((_, i) => {
            const angle = (i / rayCount) * Math.PI;
            const startRadius = dim * 0.15;
            const endRadius = dim * 0.45;
            const startX = dim / 2 + Math.cos(angle - Math.PI / 2) * startRadius;
            const startY = horizonY + Math.sin(angle - Math.PI / 2) * startRadius;
            const endX = dim / 2 + Math.cos(angle - Math.PI / 2) * endRadius;
            const endY = horizonY + Math.sin(angle - Math.PI / 2) * endRadius;

            return (
              <motion.line
                key={i}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={SAPPHIRE[3]}
                strokeWidth={dim * 0.01}
                strokeLinecap="round"
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.15,
                }}
              />
            );
          })}
        </motion.g>

        {/* Rising sun */}
        <motion.g
          animate={{ y: [-dim * 0.1, 0, -dim * 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Sun glow */}
          <motion.circle
            cx={dim / 2}
            cy={horizonY}
            r={sunRadius * 1.6}
            fill={SAPPHIRE[1]}
            opacity={0.3}
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: `${dim / 2}px`, originY: `${horizonY}px` }}
          />

          {/* Sun core */}
          <motion.circle
            cx={dim / 2}
            cy={horizonY}
            r={sunRadius}
            fill={`url(#sunrise-sun-${size})`}
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: `${dim / 2}px`, originY: `${horizonY}px` }}
          />
        </motion.g>

        {/* Horizon line */}
        <motion.line
          x1={0}
          y1={horizonY}
          x2={dim}
          y2={horizonY}
          stroke={SAPPHIRE[0]}
          strokeWidth={dim * 0.015}
          animate={{
            opacity: [0.7, 1, 0.7],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Horizon silhouette */}
        <rect
          x={0}
          y={horizonY}
          width={dim}
          height={dim - horizonY}
          fill={SAPPHIRE[0]}
          opacity={0.9}
        />
      </svg>
    </div>
  );
}
