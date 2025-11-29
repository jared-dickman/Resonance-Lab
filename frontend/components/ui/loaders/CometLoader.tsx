'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function CometLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const center = dim / 2;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{ width: dim, height: dim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`comet-tail-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={SAPPHIRE[0]} stopOpacity="0" />
            <stop offset="40%" stopColor={SAPPHIRE[1]} stopOpacity="0.4" />
            <stop offset="80%" stopColor={SAPPHIRE[2]} stopOpacity="0.7" />
            <stop offset="100%" stopColor={SAPPHIRE[3]} stopOpacity="1" />
          </linearGradient>
          <radialGradient id={`comet-head-${size}`}>
            <stop offset="0%" stopColor={SAPPHIRE[3]} />
            <stop offset="60%" stopColor={SAPPHIRE[2]} />
            <stop offset="100%" stopColor={SAPPHIRE[1]} stopOpacity="0.3" />
          </radialGradient>
          <radialGradient id={`comet-glow-${size}`}>
            <stop offset="0%" stopColor={SAPPHIRE[3]} stopOpacity="0.8" />
            <stop offset="100%" stopColor={SAPPHIRE[2]} stopOpacity="0" />
          </radialGradient>
        </defs>

        <motion.g
          animate={{
            x: [-dim * 0.7, dim * 1.3],
            y: [dim * 0.15, -dim * 0.15],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: [0.45, 0, 0.55, 1],
          }}
        >
          {/* Trailing tail particles */}
          {[0, 1, 2, 3].map((i) => (
            <motion.ellipse
              key={i}
              cx={-dim * (0.15 + i * 0.08)}
              cy={center}
              rx={dim * (0.25 - i * 0.04)}
              ry={dim * (0.06 - i * 0.01)}
              fill={`url(#comet-tail-${size})`}
              opacity={0.7 - i * 0.15}
              animate={{
                scaleX: [1, 1.3, 1],
                opacity: [0.7 - i * 0.15, 0.9 - i * 0.15, 0.7 - i * 0.15],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.1,
              }}
            />
          ))}

          {/* Outer glow */}
          <motion.circle
            cx={dim * 0.15}
            cy={center}
            r={dim * 0.15}
            fill={`url(#comet-glow-${size})`}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ originX: `${dim * 0.15}px`, originY: `${center}px` }}
          />

          {/* Comet head */}
          <motion.circle
            cx={dim * 0.15}
            cy={center}
            r={dim * 0.09}
            fill={`url(#comet-head-${size})`}
            animate={{
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ originX: `${dim * 0.15}px`, originY: `${center}px` }}
          />

          {/* Bright core */}
          <circle
            cx={dim * 0.15}
            cy={center}
            r={dim * 0.035}
            fill={SAPPHIRE[3]}
          />
        </motion.g>
      </svg>
    </div>
  );
}
