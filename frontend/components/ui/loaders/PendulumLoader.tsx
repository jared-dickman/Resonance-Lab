'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function PendulumLoader({ size = 'md' }: LoaderProps) {
  const dimension = LOADER_SIZE[size];
  const baseWidth = dimension * 0.5;
  const baseHeight = dimension * 0.6;
  const pivotY = dimension * 0.2;
  const armLength = dimension * 0.45;
  const weightRadius = dimension * 0.08;
  const maxAngle = 25; // degrees

  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex items-center justify-center"
      style={{ width: dimension, height: dimension }}
    >
      <svg width={dimension} height={dimension} viewBox={`0 0 ${dimension} ${dimension}`}>
        <defs>
          <linearGradient id={`metronome-grad-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={SAPPHIRE[2]} />
            <stop offset="100%" stopColor={SAPPHIRE[0]} />
          </linearGradient>
        </defs>

        {/* Metronome body - triangular shape */}
        <path
          d={`
            M ${dimension / 2} ${pivotY}
            L ${dimension / 2 + baseWidth / 2} ${pivotY + baseHeight}
            L ${dimension / 2 - baseWidth / 2} ${pivotY + baseHeight}
            Z
          `}
          fill={`url(#metronome-grad-${size})`}
          opacity={0.85}
          stroke={SAPPHIRE[1]}
          strokeWidth={dimension * 0.015}
        />

        {/* Base decorative line */}
        <line
          x1={dimension / 2 - baseWidth / 2}
          y1={pivotY + baseHeight}
          x2={dimension / 2 + baseWidth / 2}
          y2={pivotY + baseHeight}
          stroke={SAPPHIRE[3]}
          strokeWidth={dimension * 0.025}
          strokeLinecap="round"
        />

        {/* Animated pendulum arm */}
        <motion.g
          animate={{
            rotate: [-maxAngle, maxAngle, -maxAngle],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: [0.45, 0.05, 0.55, 0.95], // Custom easing for realistic pendulum
          }}
          style={{ originX: `${dimension / 2}px`, originY: `${pivotY}px` }}
        >
          {/* Arm rod */}
          <line
            x1={dimension / 2}
            y1={pivotY}
            x2={dimension / 2}
            y2={pivotY + armLength}
            stroke={SAPPHIRE[3]}
            strokeWidth={dimension * 0.018}
            strokeLinecap="round"
          />

          {/* Weight at top of arm */}
          <circle
            cx={dimension / 2}
            cy={pivotY + armLength * 0.2}
            r={weightRadius}
            fill={SAPPHIRE[0]}
            stroke={SAPPHIRE[3]}
            strokeWidth={dimension * 0.01}
          />

          {/* Smaller weight indicator */}
          <circle
            cx={dimension / 2}
            cy={pivotY + armLength * 0.2}
            r={weightRadius * 0.4}
            fill={SAPPHIRE[3]}
            opacity={0.8}
          />
        </motion.g>

        {/* Pivot point */}
        <circle
          cx={dimension / 2}
          cy={pivotY}
          r={dimension * 0.025}
          fill={SAPPHIRE[2]}
        />
      </svg>
    </div>
  );
}
