'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function CoinLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const center = dim / 2;
  const coinRadius = dim * 0.28;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{ width: dim, height: dim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        <defs>
          <linearGradient id={`coin-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={SAPPHIRE[0]} />
            <stop offset="50%" stopColor={SAPPHIRE[2]} />
            <stop offset="100%" stopColor={SAPPHIRE[0]} />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <motion.ellipse
          cx={center}
          cy={dim * 0.85}
          rx={coinRadius * 0.8}
          ry={dim * 0.05}
          fill={SAPPHIRE[0]}
          opacity={0.3}
          animate={{ scaleX: [0.8, 1, 0.8] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: `${center}px`, originY: `${dim * 0.85}px` }}
        />

        {/* Coin spinning (scale X to simulate 3D rotation) */}
        <motion.g
          animate={{
            scaleX: [1, 0.1, 1],
            y: [0, -dim * 0.15, 0],
          }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: `${center}px`, originY: `${center}px` }}
        >
          {/* Outer ring */}
          <circle
            cx={center}
            cy={center}
            r={coinRadius}
            fill={`url(#coin-grad-${size})`}
          />

          {/* Inner detail */}
          <circle
            cx={center}
            cy={center}
            r={coinRadius * 0.75}
            fill="none"
            stroke={SAPPHIRE[3]}
            strokeWidth={dim * 0.02}
            opacity={0.6}
          />

          {/* Star/emblem */}
          <motion.text
            x={center}
            y={center + dim * 0.05}
            textAnchor="middle"
            fontSize={dim * 0.22}
            fill={SAPPHIRE[3]}
            fontWeight="bold"
          >
            ★
          </motion.text>
        </motion.g>
      </svg>
    </div>
  );
}
