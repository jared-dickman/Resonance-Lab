'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function ScanlineLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const width = dim * 1.3;
  const height = dim * 0.9;
  const scanlineCount = Math.floor(height / 3);

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id={`scanline-grad-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={SAPPHIRE[3]} stopOpacity="0" />
            <stop offset="50%" stopColor={SAPPHIRE[3]} stopOpacity="0.8" />
            <stop offset="100%" stopColor={SAPPHIRE[3]} stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`vignette-${size}`}>
            <stop offset="0%" stopColor={SAPPHIRE[0]} stopOpacity="0" />
            <stop offset="100%" stopColor={SAPPHIRE[0]} stopOpacity="0.5" />
          </radialGradient>
        </defs>

        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          rx="2"
          fill={SAPPHIRE[0]}
          fillOpacity="0.1"
          stroke={SAPPHIRE[1]}
          strokeWidth="1.5"
        />

        {Array.from({ length: scanlineCount }).map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={i * 3}
            x2={width}
            y2={i * 3}
            stroke={SAPPHIRE[1]}
            strokeWidth="0.5"
            opacity="0.15"
          />
        ))}

        <motion.text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="monospace"
          fontSize={dim * 0.18}
          fontWeight="bold"
          fill={SAPPHIRE[3]}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ filter: `drop-shadow(0 0 ${dim * 0.08}px ${SAPPHIRE[2]})` }}
        >
          LOADING
        </motion.text>

        <motion.rect
          x="0"
          y="0"
          width={width}
          height="3"
          fill={`url(#scanline-grad-${size})`}
          animate={{ y: [0, height - 3] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill={`url(#vignette-${size})`}
          pointerEvents="none"
        />

        <motion.rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill={SAPPHIRE[3]}
          animate={{ opacity: [0, 0.08, 0] }}
          transition={{
            duration: 0.15,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        />
      </svg>
    </div>
  );
}
