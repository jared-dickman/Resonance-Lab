'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function CrankLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const svgSize = dim * 0.8;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const crankRadius = svgSize * 0.22;
  const pistonX = centerX + svgSize * 0.35;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
        {/* Piston cylinder (stationary) */}
        <rect
          x={pistonX - svgSize * 0.05}
          y={centerY - svgSize * 0.25}
          width={svgSize * 0.1}
          height={svgSize * 0.5}
          fill={SAPPHIRE[0]}
          opacity={0.3}
          rx={svgSize * 0.015}
        />

        {/* Rotating crank assembly */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ originX: `${centerX}px`, originY: `${centerY}px` }}
        >
          {/* Crank arm */}
          <line
            x1={centerX}
            y1={centerY}
            x2={centerX + crankRadius}
            y2={centerY}
            stroke={SAPPHIRE[1]}
            strokeWidth={svgSize * 0.04}
            strokeLinecap="round"
          />

          {/* Crankpin (where connecting rod attaches) */}
          <circle cx={centerX + crankRadius} cy={centerY} r={svgSize * 0.035} fill={SAPPHIRE[2]} />
          <circle cx={centerX + crankRadius} cy={centerY} r={svgSize * 0.02} fill={SAPPHIRE[0]} opacity={0.7} />

          {/* Connecting rod - animates to follow crankpin and piston */}
          <motion.line
            animate={{
              x1: [centerX + crankRadius, centerX + crankRadius, centerX + crankRadius],
              y1: [centerY, centerY, centerY],
              x2: [pistonX, pistonX, pistonX],
              y2: [
                centerY - crankRadius,
                centerY,
                centerY + crankRadius,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            stroke={SAPPHIRE[2]}
            strokeWidth={svgSize * 0.03}
            strokeLinecap="round"
          />
        </motion.g>

        {/* Piston head - moves up and down */}
        <motion.g
          animate={{
            y: [
              centerY - crankRadius - svgSize * 0.05,
              centerY - svgSize * 0.05,
              centerY + crankRadius - svgSize * 0.05,
              centerY - svgSize * 0.05,
              centerY - crankRadius - svgSize * 0.05,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <rect
            x={pistonX - svgSize * 0.045}
            y={0}
            width={svgSize * 0.09}
            height={svgSize * 0.1}
            fill={SAPPHIRE[3]}
            rx={svgSize * 0.01}
          />
          <circle cx={pistonX} cy={svgSize * 0.05} r={svgSize * 0.025} fill={SAPPHIRE[0]} opacity={0.6} />
        </motion.g>

        {/* Central crankshaft hub */}
        <circle cx={centerX} cy={centerY} r={svgSize * 0.055} fill={SAPPHIRE[1]} opacity={0.9} />
        <circle cx={centerX} cy={centerY} r={svgSize * 0.032} fill={SAPPHIRE[2]} />
      </svg>
    </div>
  );
}
