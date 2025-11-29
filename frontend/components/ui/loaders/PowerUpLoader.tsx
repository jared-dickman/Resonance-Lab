'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function PowerUpLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const center = dim / 2;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} style={{ display: 'block' }}>
        <defs>
          {/* Radial glow gradient */}
          <radialGradient id={`glow-gradient-${size}`}>
            <stop offset="0%" stopColor={SAPPHIRE[3]} stopOpacity="0.9" />
            <stop offset="40%" stopColor={SAPPHIRE[2]} stopOpacity="0.6" />
            <stop offset="70%" stopColor={SAPPHIRE[1]} stopOpacity="0.2" />
            <stop offset="100%" stopColor={SAPPHIRE[0]} stopOpacity="0" />
          </radialGradient>

          {/* Core orb gradient */}
          <radialGradient id={`core-gradient-${size}`}>
            <stop offset="0%" stopColor={SAPPHIRE[3]} stopOpacity="1" />
            <stop offset="60%" stopColor={SAPPHIRE[2]} stopOpacity="0.9" />
            <stop offset="100%" stopColor={SAPPHIRE[1]} stopOpacity="0.8" />
          </radialGradient>
        </defs>

        {/* Floating animation wrapper */}
        <motion.g
          animate={{
            y: [-3, 3, -3],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Outer glow pulse */}
          <motion.circle
            cx={center}
            cy={center}
            r={dim * 0.35}
            fill={`url(#glow-gradient-${size})`}
            animate={{
              r: [dim * 0.35, dim * 0.42, dim * 0.35],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Middle glow layer */}
          <motion.circle
            cx={center}
            cy={center}
            r={dim * 0.25}
            fill={`url(#glow-gradient-${size})`}
            animate={{
              r: [dim * 0.25, dim * 0.3, dim * 0.25],
              opacity: [0.6, 0.9, 0.6],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.2,
            }}
          />

          {/* Core orb */}
          <motion.circle
            cx={center}
            cy={center}
            r={dim * 0.16}
            fill={`url(#core-gradient-${size})`}
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Star sparkles */}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i * Math.PI * 2) / 6;
            const radius = dim * 0.22;
            const x = center + Math.cos(angle) * radius;
            const y = center + Math.sin(angle) * radius;

            return (
              <motion.g
                key={i}
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{ transformOrigin: `${center}px ${center}px` }}
              >
                <motion.circle
                  cx={x}
                  cy={y}
                  r={dim * 0.025}
                  fill={SAPPHIRE[3]}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.33,
                  }}
                />
              </motion.g>
            );
          })}

          {/* Power indicator symbols (plus signs) */}
          <motion.g
            animate={{
              opacity: [0.6, 1, 0.6],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ transformOrigin: `${center}px ${center}px` }}
          >
            {/* Horizontal bar */}
            <rect
              x={center - dim * 0.08}
              y={center - dim * 0.015}
              width={dim * 0.16}
              height={dim * 0.03}
              fill={SAPPHIRE[3]}
              rx={dim * 0.015}
            />
            {/* Vertical bar */}
            <rect
              x={center - dim * 0.015}
              y={center - dim * 0.08}
              width={dim * 0.03}
              height={dim * 0.16}
              fill={SAPPHIRE[3]}
              rx={dim * 0.015}
            />
          </motion.g>
        </motion.g>
      </svg>
    </div>
  );
}
