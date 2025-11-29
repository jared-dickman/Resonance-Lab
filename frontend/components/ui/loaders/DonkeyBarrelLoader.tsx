'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function DonkeyBarrelLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];

  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{ width: dim, height: dim, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
    >
      <svg width={dim * 0.8} height={dim * 0.8} viewBox="0 0 100 100">
        <defs>
          <linearGradient id={`barrel-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={SAPPHIRE[0]} />
            <stop offset="40%" stopColor={SAPPHIRE[2]} />
            <stop offset="60%" stopColor={SAPPHIRE[2]} />
            <stop offset="100%" stopColor={SAPPHIRE[0]} />
          </linearGradient>
        </defs>

        {/* Slanted platform */}
        <motion.line
          x1="20"
          y1="75"
          x2="80"
          y2="85"
          stroke={SAPPHIRE[1]}
          strokeWidth="2"
          strokeLinecap="round"
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Rolling barrel with bounce */}
        <motion.g
          animate={{
            rotate: -360,
            y: [0, -3, 0],
          }}
          transition={{
            rotate: {
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            },
            y: {
              duration: 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
          style={{ originX: '50px', originY: '50px' }}
        >
          {/* Barrel body - oval shape */}
          <ellipse
            cx="50"
            cy="50"
            rx="18"
            ry="24"
            fill={`url(#barrel-grad-${size})`}
            stroke={SAPPHIRE[3]}
            strokeWidth="1.5"
          />

          {/* Barrel rings */}
          <ellipse
            cx="50"
            cy="38"
            rx="18"
            ry="3"
            fill="none"
            stroke={SAPPHIRE[3]}
            strokeWidth="1.5"
          />
          <ellipse
            cx="50"
            cy="50"
            rx="18"
            ry="3"
            fill="none"
            stroke={SAPPHIRE[3]}
            strokeWidth="1.5"
          />
          <ellipse
            cx="50"
            cy="62"
            rx="18"
            ry="3"
            fill="none"
            stroke={SAPPHIRE[3]}
            strokeWidth="1.5"
          />

          {/* Barrel planks - vertical lines for wood texture */}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            const x = 50 + Math.cos(angle) * 18;
            const startY = 50 - 24;
            const endY = 50 + 24;

            return (
              <line
                key={i}
                x1={x}
                y1={startY}
                x2={x}
                y2={endY}
                stroke={SAPPHIRE[0]}
                strokeWidth="0.5"
                opacity="0.4"
              />
            );
          })}
        </motion.g>

        {/* Shadow under barrel */}
        <motion.ellipse
          cx="50"
          cy="78"
          rx="20"
          ry="4"
          fill={SAPPHIRE[0]}
          opacity="0.2"
          animate={{
            scale: [1, 0.9, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ originX: '50px', originY: '78px' }}
        />
      </svg>
    </div>
  );
}
