'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function CDRomLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const center = 50;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox="0 0 100 100" style={{ display: 'block' }}>
        <defs>
          {/* Prismatic shimmer gradient */}
          <linearGradient id={`cdrom-shimmer-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={SAPPHIRE[0]} />
            <stop offset="25%" stopColor={SAPPHIRE[1]} />
            <stop offset="50%" stopColor={SAPPHIRE[2]} />
            <stop offset="75%" stopColor={SAPPHIRE[3]} />
            <stop offset="100%" stopColor={SAPPHIRE[1]} />
          </linearGradient>

          {/* Center hole gradient */}
          <radialGradient id={`cdrom-hole-${size}`}>
            <stop offset="0%" stopColor={SAPPHIRE[0]} stopOpacity="1" />
            <stop offset="100%" stopColor={SAPPHIRE[1]} stopOpacity="0.3" />
          </radialGradient>

          {/* Data track gradient */}
          <radialGradient id={`cdrom-track-${size}`}>
            <stop offset="0%" stopColor={SAPPHIRE[2]} stopOpacity="0.4" />
            <stop offset="100%" stopColor={SAPPHIRE[3]} stopOpacity="0.8" />
          </radialGradient>
        </defs>

        {/* Rotating disc container */}
        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '50px', originY: '50px' }}
        >
          {/* Main disc surface */}
          <circle
            cx={center}
            cy={center}
            r={40}
            fill={`url(#cdrom-shimmer-${size})`}
            opacity={0.9}
          />

          {/* Data track rings */}
          {[32, 28, 24, 20].map((radius, i) => (
            <circle
              key={`track-${i}`}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={`url(#cdrom-track-${size})`}
              strokeWidth={0.5}
              opacity={0.6}
            />
          ))}

          {/* Prismatic shimmer streaks */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const x1 = center + Math.cos(angle) * 15;
            const y1 = center + Math.sin(angle) * 15;
            const x2 = center + Math.cos(angle) * 40;
            const y2 = center + Math.sin(angle) * 40;

            return (
              <motion.line
                key={`shimmer-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={SAPPHIRE[i % 4]}
                strokeWidth={1}
                opacity={0.3}
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.1,
                }}
              />
            );
          })}

          {/* Center hole outer ring */}
          <circle
            cx={center}
            cy={center}
            r={12}
            fill={`url(#cdrom-hole-${size})`}
          />

          {/* Center hole */}
          <circle
            cx={center}
            cy={center}
            r={8}
            fill={SAPPHIRE[0]}
            opacity={0.9}
          />
        </motion.g>

        {/* Stationary light reflection effect */}
        <motion.ellipse
          cx={60}
          cy={40}
          rx={15}
          ry={8}
          fill={SAPPHIRE[3]}
          opacity={0.4}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>
    </div>
  );
}
