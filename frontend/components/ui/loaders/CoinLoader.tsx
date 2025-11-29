'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function CoinLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const center = dim / 2;
  const coinRadius = dim * 0.32;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{ width: dim, height: dim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        <defs>
          <radialGradient id={`coin-gold-${size}`}>
            <stop offset="0%" stopColor={SAPPHIRE[3]} />
            <stop offset="50%" stopColor={SAPPHIRE[2]} />
            <stop offset="100%" stopColor={SAPPHIRE[1]} />
          </radialGradient>
          <linearGradient id={`sparkle-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="45%" stopColor="transparent" />
            <stop offset="50%" stopColor={SAPPHIRE[3]} />
            <stop offset="55%" stopColor="transparent" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse
          cx={center}
          cy={dim * 0.85}
          rx={coinRadius * 0.9}
          ry={dim * 0.06}
          fill={SAPPHIRE[0]}
          opacity={0.3}
        />

        {/* Coin body - static gold */}
        <circle
          cx={center}
          cy={center}
          r={coinRadius}
          fill={`url(#coin-gold-${size})`}
        />

        {/* Outer rim */}
        <circle
          cx={center}
          cy={center}
          r={coinRadius}
          fill="none"
          stroke={SAPPHIRE[1]}
          strokeWidth={dim * 0.025}
        />

        {/* Inner detail ring */}
        <circle
          cx={center}
          cy={center}
          r={coinRadius * 0.75}
          fill="none"
          stroke={SAPPHIRE[2]}
          strokeWidth={dim * 0.015}
          opacity={0.7}
        />

        {/* Star emblem */}
        <text
          x={center}
          y={center + dim * 0.08}
          textAnchor="middle"
          fontSize={dim * 0.24}
          fill={SAPPHIRE[3]}
          fontWeight="bold"
        >
          ★
        </text>

        {/* Animated sparkle/glimmer effect */}
        <motion.rect
          x={-dim * 0.2}
          y={-dim * 0.5}
          width={dim * 0.4}
          height={dim * 2}
          fill={`url(#sparkle-${size})`}
          opacity={0.8}
          animate={{ x: [-dim * 0.3, dim * 1.3] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'linear',
            repeatDelay: 0.5
          }}
        />
      </svg>
    </div>
  );
}
