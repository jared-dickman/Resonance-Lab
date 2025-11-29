'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function AtomLoader({ size = 'md' }: LoaderProps) {
  const dimension = LOADER_SIZE[size];
  const orbits = 3;

  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex items-center justify-center"
      style={{ width: dimension, height: dimension }}
    >
      <svg width={dimension} height={dimension} viewBox={`0 0 ${dimension} ${dimension}`}>
        <defs>
          <radialGradient id="atomCore">
            <stop offset="0%" stopColor={SAPPHIRE[3]} stopOpacity={1} />
            <stop offset="100%" stopColor={SAPPHIRE[1]} stopOpacity={0.8} />
          </radialGradient>
        </defs>
        <motion.circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={dimension * 0.1}
          fill="url(#atomCore)"
          animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {Array.from({ length: orbits }).map((_, i) => {
          const orbitRadius = dimension * (0.2 + i * 0.1);
          const electronRadius = dimension * 0.04;
          const angle = i * 60;
          const duration = 2 + i * 0.5;

          return (
            <g key={i}>
              <motion.ellipse
                cx={dimension / 2}
                cy={dimension / 2}
                rx={orbitRadius}
                ry={orbitRadius * 0.35}
                fill="none"
                stroke={SAPPHIRE[i % SAPPHIRE.length]}
                strokeWidth={dimension * 0.01}
                opacity={0.3}
                animate={{ rotate: angle + 360 }}
                transition={{
                  duration: 8 + i * 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{ transformOrigin: `${dimension / 2}px ${dimension / 2}px` }}
              />
              <motion.g
                animate={{ rotate: 360 }}
                transition={{
                  duration: duration,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{ transformOrigin: `${dimension / 2}px ${dimension / 2}px` }}
              >
                <g transform={`rotate(${angle} ${dimension / 2} ${dimension / 2})`}>
                  <motion.circle
                    cx={dimension / 2 + orbitRadius}
                    cy={dimension / 2}
                    r={electronRadius}
                    fill={SAPPHIRE[(i + 2) % SAPPHIRE.length]}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                </g>
              </motion.g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
