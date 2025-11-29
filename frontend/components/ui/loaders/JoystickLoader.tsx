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
        {/* Base plate */}
        <ellipse
          cx={center}
          cy={dim * 0.75}
          rx={dim * 0.35}
          ry={dim * 0.1}
          fill={SAPPHIRE[0]}
          opacity={0.6}
        />

        {/* Joystick shaft */}
        <motion.g
          animate={{
            rotate: [0, 15, 0, -15, 0],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: `${center}px`, originY: `${dim * 0.7}px` }}
        >
          <rect
            x={center - dim * 0.03}
            y={dim * 0.35}
            width={dim * 0.06}
            height={dim * 0.4}
            rx={dim * 0.02}
            fill={SAPPHIRE[1]}
          />

          {/* Ball top */}
          <motion.circle
            cx={center}
            cy={dim * 0.3}
            r={dim * 0.12}
            fill={SAPPHIRE[2]}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{ originX: `${center}px`, originY: `${dim * 0.3}px` }}
          />

          {/* Highlight */}
          <circle cx={center - dim * 0.04} cy={dim * 0.26} r={dim * 0.03} fill={SAPPHIRE[3]} opacity={0.6} />
        </motion.g>

        {/* Base ring */}
        <ellipse
          cx={center}
          cy={dim * 0.7}
          rx={dim * 0.15}
          ry={dim * 0.05}
          fill="none"
          stroke={SAPPHIRE[1]}
          strokeWidth={dim * 0.02}
        />
      </svg>
    </div>
  );
}
