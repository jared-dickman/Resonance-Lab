'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function PongLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const paddleW = dim * 0.04;
  const paddleH = dim * 0.25;
  const ballSize = dim * 0.08;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{ width: dim, height: dim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        {/* Center line */}
        {Array.from({ length: 7 }).map((_, i) => (
          <rect
            key={i}
            x={dim / 2 - dim * 0.01}
            y={dim * 0.1 + i * dim * 0.12}
            width={dim * 0.02}
            height={dim * 0.06}
            fill={SAPPHIRE[3]}
            opacity={0.3}
          />
        ))}

        {/* Left paddle */}
        <motion.rect
          x={dim * 0.1}
          width={paddleW}
          height={paddleH}
          rx={paddleW / 2}
          fill={SAPPHIRE[1]}
          animate={{ y: [dim * 0.2, dim * 0.55, dim * 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Right paddle */}
        <motion.rect
          x={dim * 0.86}
          width={paddleW}
          height={paddleH}
          rx={paddleW / 2}
          fill={SAPPHIRE[1]}
          animate={{ y: [dim * 0.55, dim * 0.2, dim * 0.55] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Ball */}
        <motion.rect
          width={ballSize}
          height={ballSize}
          rx={ballSize * 0.2}
          fill={SAPPHIRE[2]}
          animate={{
            x: [dim * 0.16, dim * 0.76, dim * 0.16],
            y: [dim * 0.3, dim * 0.6, dim * 0.3],
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        />
      </svg>
    </div>
  );
}
