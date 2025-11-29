'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function RespawnLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const center = dim / 2;
  const cycleDuration = 3;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{ width: dim, height: dim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        <defs>
          <radialGradient id={`burst-${size}`}>
            <stop offset="0%" stopColor={SAPPHIRE[3]} stopOpacity="1" />
            <stop offset="50%" stopColor={SAPPHIRE[2]} stopOpacity="0.6" />
            <stop offset="100%" stopColor={SAPPHIRE[0]} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Character silhouette - fades out */}
        <motion.g
          animate={{
            opacity: [1, 1, 0, 0, 0, 0.3, 1, 1],
            scale: [1, 1, 0.8, 0, 0, 0.6, 1, 1],
          }}
          transition={{
            duration: cycleDuration,
            repeat: Infinity,
            times: [0, 0.2, 0.3, 0.35, 0.5, 0.6, 0.75, 1],
            ease: 'easeInOut',
          }}
          style={{ originX: `${center}px`, originY: `${center}px` }}
        >
          {/* Simple character silhouette */}
          <circle cx={center} cy={center - dim * 0.12} r={dim * 0.08} fill={SAPPHIRE[2]} />
          <rect
            x={center - dim * 0.08}
            y={center - dim * 0.03}
            width={dim * 0.16}
            height={dim * 0.18}
            rx={dim * 0.03}
            fill={SAPPHIRE[2]}
          />
          <rect
            x={center - dim * 0.08}
            y={center + 0.15 * dim}
            width={dim * 0.06}
            height={dim * 0.12}
            rx={dim * 0.02}
            fill={SAPPHIRE[1]}
          />
          <rect
            x={center + dim * 0.02}
            y={center + 0.15 * dim}
            width={dim * 0.06}
            height={dim * 0.12}
            rx={dim * 0.02}
            fill={SAPPHIRE[1]}
          />
        </motion.g>

        {/* Particle burst - 12 particles */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 12;
          const distance = dim * 0.3;
          return (
            <motion.circle
              key={`particle-${i}`}
              cx={center}
              cy={center}
              r={dim * 0.025}
              fill={SAPPHIRE[i % 3 + 1]}
              animate={{
                cx: [center, center + Math.cos(angle) * distance],
                cy: [center, center + Math.sin(angle) * distance],
                opacity: [0, 0, 1, 0],
                scale: [0, 0, 1.5, 0],
              }}
              transition={{
                duration: cycleDuration,
                repeat: Infinity,
                times: [0, 0.3, 0.4, 0.5],
                ease: 'easeOut',
              }}
            />
          );
        })}

        {/* Central energy burst */}
        <motion.circle
          cx={center}
          cy={center}
          r={dim * 0.15}
          fill={`url(#burst-${size})`}
          animate={{
            scale: [0, 0, 3, 0],
            opacity: [0, 0, 0.9, 0],
          }}
          transition={{
            duration: cycleDuration,
            repeat: Infinity,
            times: [0, 0.3, 0.4, 0.5],
            ease: 'easeOut',
          }}
        />

        {/* Respawn glow rings */}
        <motion.circle
          cx={center}
          cy={center}
          r={dim * 0.32}
          fill="none"
          stroke={SAPPHIRE[3]}
          strokeWidth={dim * 0.015}
          animate={{
            opacity: [0, 0, 0, 0.8, 0.4, 0.4],
            scale: [0.5, 0.5, 0.5, 1.1, 1, 1],
          }}
          transition={{
            duration: cycleDuration,
            repeat: Infinity,
            times: [0, 0.3, 0.5, 0.6, 0.75, 1],
          }}
        />
        <motion.circle
          cx={center}
          cy={center}
          r={dim * 0.24}
          fill="none"
          stroke={SAPPHIRE[2]}
          strokeWidth={dim * 0.012}
          animate={{
            opacity: [0, 0, 0, 0.6, 0.3, 0.3],
            scale: [0.6, 0.6, 0.6, 1.05, 1, 1],
          }}
          transition={{
            duration: cycleDuration,
            repeat: Infinity,
            times: [0, 0.3, 0.5, 0.65, 0.75, 1],
          }}
        />
      </svg>
    </div>
  );
}
