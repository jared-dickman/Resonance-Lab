'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, DURATION, type LoaderProps } from './loader.constants';

export function CrankLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const svgSize = dim * 0.8;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;

  // Crank dimensions
  const crankArmLength = svgSize * 0.3;
  const handleRadius = svgSize * 0.08;
  const shaftRadius = svgSize * 0.06;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
        {/* Central shaft/pivot - stationary */}
        <circle
          cx={centerX}
          cy={centerY}
          r={shaftRadius}
          fill={SAPPHIRE[0]}
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={shaftRadius * 0.5}
          fill={SAPPHIRE[1]}
        />

        {/* Rotating crank arm and handle */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{
            duration: DURATION.slow,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{
            originX: `${centerX}px`,
            originY: `${centerY}px`
          }}
        >
          {/* Crank arm - horizontal bar from center */}
          <line
            x1={centerX}
            y1={centerY}
            x2={centerX + crankArmLength}
            y2={centerY}
            stroke={SAPPHIRE[1]}
            strokeWidth={svgSize * 0.025}
            strokeLinecap="round"
          />

          {/* Handle mount point */}
          <circle
            cx={centerX + crankArmLength}
            cy={centerY}
            r={svgSize * 0.03}
            fill={SAPPHIRE[2]}
          />

          {/* Circular handle - the grip you'd hold */}
          <circle
            cx={centerX + crankArmLength}
            cy={centerY}
            r={handleRadius}
            fill="none"
            stroke={SAPPHIRE[3]}
            strokeWidth={svgSize * 0.025}
          />

          {/* Handle grip detail */}
          <circle
            cx={centerX + crankArmLength}
            cy={centerY}
            r={handleRadius * 0.5}
            fill={SAPPHIRE[2]}
            opacity={0.4}
          />
        </motion.g>

        {/* Optional connecting rod to show mechanical motion */}
        <motion.line
          animate={{
            x1: [
              centerX + crankArmLength * Math.cos(0),
              centerX + crankArmLength * Math.cos(Math.PI),
              centerX + crankArmLength * Math.cos(0),
            ],
            y1: [
              centerY + crankArmLength * Math.sin(0),
              centerY + crankArmLength * Math.sin(Math.PI),
              centerY + crankArmLength * Math.sin(0),
            ],
          }}
          x2={svgSize * 0.85}
          y2={centerY}
          transition={{
            duration: DURATION.slow,
            repeat: Infinity,
            ease: 'linear'
          }}
          stroke={SAPPHIRE[1]}
          strokeWidth={svgSize * 0.02}
          strokeLinecap="round"
          opacity={0.6}
        />
      </svg>
    </div>
  );
}
