'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function SunriseLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const sunRadius = dim * 0.15;
  const horizonY = dim * 0.7;
  const rayCount = 8;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} style={{ display: 'block' }}>
        <defs>
          {/* Animated sky gradient */}
          <linearGradient id={`sunrise-sky-${size}`} x1="0" y1="0" x2="0" y2="1">
            <motion.stop offset="0%" stopColor={SAPPHIRE[0]}>
              <animate attributeName="stop-color" values={`${SAPPHIRE[0]};${SAPPHIRE[1]};${SAPPHIRE[0]}`} dur="4s" repeatCount="indefinite" />
            </motion.stop>
            <motion.stop offset="70%" stopColor={SAPPHIRE[1]}>
              <animate attributeName="stop-color" values={`${SAPPHIRE[1]};${SAPPHIRE[2]};${SAPPHIRE[1]}`} dur="4s" repeatCount="indefinite" />
            </motion.stop>
            <motion.stop offset="100%" stopColor={SAPPHIRE[2]}>
              <animate attributeName="stop-color" values={`${SAPPHIRE[2]};${SAPPHIRE[3]};${SAPPHIRE[2]}`} dur="4s" repeatCount="indefinite" />
            </motion.stop>
          </linearGradient>

          {/* Sun gradient */}
          <radialGradient id={`sunrise-sun-${size}`}>
            <stop offset="0%" stopColor={SAPPHIRE[3]} />
            <stop offset="60%" stopColor={SAPPHIRE[2]} />
            <stop offset="100%" stopColor={SAPPHIRE[1]} stopOpacity="0.5" />
          </radialGradient>
        </defs>

        {/* Sky background */}
        <rect width={dim} height={dim} fill={`url(#sunrise-sky-${size})`} />

        {/* Radiating rays */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ originX: `${dim / 2}px`, originY: `${horizonY}px` }}
        >
          {Array.from({ length: rayCount }).map((_, i) => {
            const angle = (i / rayCount) * Math.PI;
            const startRadius = dim * 0.18;
            const endRadius = dim * 0.4;
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
                strokeWidth={dim * 0.008}
                strokeLinecap="round"
                animate={{
                  opacity: [0.2, 0.8, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.2,
                }}
              />
            );
          })}
        </motion.g>

        {/* Rising sun */}
        <motion.g
          animate={{ y: [dim * 0.15, -dim * 0.05, dim * 0.15] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Sun outer glow */}
          <motion.circle
            cx={dim / 2}
            cy={horizonY}
            r={sunRadius * 2}
            fill={SAPPHIRE[2]}
            opacity={0.2}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: `${dim / 2}px`, originY: `${horizonY}px` }}
          />

          {/* Sun glow */}
          <motion.circle
            cx={dim / 2}
            cy={horizonY}
            r={sunRadius * 1.4}
            fill={SAPPHIRE[2]}
            opacity={0.5}
            animate={{
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: `${dim / 2}px`, originY: `${horizonY}px` }}
          />

          {/* Sun core */}
          <circle
            cx={dim / 2}
            cy={horizonY}
            r={sunRadius}
            fill={`url(#sunrise-sun-${size})`}
          />
        </motion.g>

        {/* Horizon line */}
        <line
          x1={0}
          y1={horizonY}
          x2={dim}
          y2={horizonY}
          stroke={SAPPHIRE[1]}
          strokeWidth={dim * 0.01}
        />

        {/* Ground/Horizon silhouette */}
        <rect
          x={0}
          y={horizonY}
          width={dim}
          height={dim - horizonY}
          fill={SAPPHIRE[0]}
          opacity={0.8}
        />
      </svg>
    </div>
  );
}
