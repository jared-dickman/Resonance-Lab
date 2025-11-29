'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function CoinLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const center = dim / 2;
  const coinRadius = dim * 0.32;

  // Multiple sparkles that twinkle and move across the coin
  const sparkles = [
    { delay: 0, x: 0.15, y: 0.2, duration: 1.8 },
    { delay: 0.3, x: 0.25, y: 0.35, duration: 2.0 },
    { delay: 0.6, x: 0.35, y: 0.25, duration: 1.6 },
    { delay: 0.9, x: 0.2, y: 0.3, duration: 2.2 },
  ];

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
        </defs>

        {/* Coin body - static gold surface */}
        <circle
          cx={center}
          cy={center}
          r={coinRadius}
          fill={`url(#coin-gold-${size})`}
        />

        {/* Multiple animated star sparkles that twinkle and move */}
        {sparkles.map((sparkle, i) => (
          <motion.g
            key={`sparkle-${i}`}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1.2, 1, 0.5],
            }}
            transition={{
              duration: sparkle.duration,
              repeat: Infinity,
              delay: sparkle.delay,
              ease: 'easeInOut',
            }}
            style={{
              originX: `${center + coinRadius * sparkle.x}px`,
              originY: `${center - coinRadius * sparkle.y}px`,
            }}
          >
            {/* Four-pointed star sparkle */}
            <path
              d={`
                M ${center + coinRadius * sparkle.x} ${center - coinRadius * sparkle.y - dim * 0.05}
                L ${center + coinRadius * sparkle.x + dim * 0.015} ${center - coinRadius * sparkle.y}
                L ${center + coinRadius * sparkle.x} ${center - coinRadius * sparkle.y + dim * 0.05}
                L ${center + coinRadius * sparkle.x - dim * 0.015} ${center - coinRadius * sparkle.y}
                Z
              `}
              fill="#ffffff"
            />
            {/* Horizontal beam */}
            <path
              d={`
                M ${center + coinRadius * sparkle.x - dim * 0.04} ${center - coinRadius * sparkle.y}
                L ${center + coinRadius * sparkle.x + dim * 0.04} ${center - coinRadius * sparkle.y}
              `}
              stroke="#ffffff"
              strokeWidth={dim * 0.01}
              opacity={0.8}
            />
            {/* Vertical beam */}
            <path
              d={`
                M ${center + coinRadius * sparkle.x} ${center - coinRadius * sparkle.y - dim * 0.04}
                L ${center + coinRadius * sparkle.x} ${center - coinRadius * sparkle.y + dim * 0.04}
              `}
              stroke="#ffffff"
              strokeWidth={dim * 0.01}
              opacity={0.8}
            />
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
