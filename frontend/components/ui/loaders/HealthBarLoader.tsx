'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function HealthBarLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const center = dim / 2;
  const barWidth = dim * 0.7;
  const barHeight = dim * 0.2;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{ width: dim, height: dim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        {/* Heart icon */}
        <motion.path
          d={`M ${center} ${dim * 0.28}
              C ${center - dim * 0.08} ${dim * 0.18}, ${center - dim * 0.18} ${dim * 0.22}, ${center - dim * 0.18} ${dim * 0.3}
              C ${center - dim * 0.18} ${dim * 0.38}, ${center} ${dim * 0.48}, ${center} ${dim * 0.48}
              C ${center} ${dim * 0.48}, ${center + dim * 0.18} ${dim * 0.38}, ${center + dim * 0.18} ${dim * 0.3}
              C ${center + dim * 0.18} ${dim * 0.22}, ${center + dim * 0.08} ${dim * 0.18}, ${center} ${dim * 0.28} Z`}
          fill={SAPPHIRE[1]}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: `${center}px`, originY: `${dim * 0.33}px` }}
        />

        {/* Bar outline */}
        <rect
          x={(dim - barWidth) / 2}
          y={dim * 0.58}
          width={barWidth}
          height={barHeight}
          rx={dim * 0.03}
          fill="none"
          stroke={SAPPHIRE[0]}
          strokeWidth={dim * 0.02}
        />

        {/* Bar background */}
        <rect
          x={(dim - barWidth) / 2 + dim * 0.02}
          y={dim * 0.58 + dim * 0.02}
          width={barWidth - dim * 0.04}
          height={barHeight - dim * 0.04}
          rx={dim * 0.02}
          fill={SAPPHIRE[0]}
          opacity={0.3}
        />

        {/* Animated fill */}
        <motion.rect
          x={(dim - barWidth) / 2 + dim * 0.02}
          y={dim * 0.58 + dim * 0.02}
          height={barHeight - dim * 0.04}
          rx={dim * 0.02}
          fill={SAPPHIRE[2]}
          animate={{ width: [0, barWidth - dim * 0.04, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Shimmer effect */}
        <motion.rect
          x={(dim - barWidth) / 2}
          y={dim * 0.58}
          width={dim * 0.08}
          height={barHeight}
          rx={dim * 0.02}
          fill={SAPPHIRE[3]}
          opacity={0.4}
          animate={{ x: [0, barWidth - dim * 0.08] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </svg>
    </div>
  );
}
