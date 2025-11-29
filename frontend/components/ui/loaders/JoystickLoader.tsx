'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function JoystickLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const center = dim / 2;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{ width: dim, height: dim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        <defs>
          <radialGradient id={`ball-grad-${size}`}>
            <stop offset="20%" stopColor={SAPPHIRE[3]} />
            <stop offset="70%" stopColor={SAPPHIRE[2]} />
            <stop offset="100%" stopColor={SAPPHIRE[0]} />
          </radialGradient>
          <linearGradient id={`base-grad-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={SAPPHIRE[1]} />
            <stop offset="100%" stopColor={SAPPHIRE[0]} />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse
          cx={center}
          cy={dim * 0.88}
          rx={dim * 0.38}
          ry={dim * 0.08}
          fill={SAPPHIRE[0]}
          opacity={0.4}
        />

        {/* Round metal base plate */}
        <circle
          cx={center}
          cy={dim * 0.72}
          r={dim * 0.32}
          fill={`url(#base-grad-${size})`}
        />
        <circle
          cx={center}
          cy={dim * 0.72}
          r={dim * 0.28}
          fill="none"
          stroke={SAPPHIRE[0]}
          strokeWidth={dim * 0.015}
        />

        {/* Joystick shaft with wiggle */}
        <motion.g
          animate={{
            rotate: [0, 8, -8, 0],
            x: [0, 2, -2, 0],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.33, 0.66, 1]
          }}
          style={{ originX: `${center}px`, originY: `${dim * 0.72}px` }}
        >
          <rect
            x={center - dim * 0.04}
            y={dim * 0.32}
            width={dim * 0.08}
            height={dim * 0.42}
            rx={dim * 0.01}
            fill={SAPPHIRE[1]}
          />

          {/* Black ball grip with realistic shading */}
          <circle
            cx={center}
            cy={dim * 0.26}
            r={dim * 0.15}
            fill={`url(#ball-grad-${size})`}
          />

          {/* Highlight reflection */}
          <ellipse
            cx={center - dim * 0.05}
            cy={dim * 0.21}
            rx={dim * 0.04}
            ry={dim * 0.05}
            fill={SAPPHIRE[3]}
            opacity={0.7}
          />
        </motion.g>

        {/* Base mounting ring */}
        <circle
          cx={center}
          cy={dim * 0.72}
          r={dim * 0.12}
          fill={SAPPHIRE[0]}
        />
      </svg>
    </div>
  );
}
