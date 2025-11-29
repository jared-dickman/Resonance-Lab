'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function VinylLoader({ size = 'md' }: LoaderProps) {
  const dimension = LOADER_SIZE[size];

  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex items-center justify-center"
      style={{ width: dimension, height: dimension }}
    >
      <svg width={dimension} height={dimension} viewBox={`0 0 ${dimension} ${dimension}`}>
        <defs>
          <radialGradient id="vinylGrad">
            <stop offset="0%" stopColor={SAPPHIRE[3]} stopOpacity={0.2} />
            <stop offset="40%" stopColor={SAPPHIRE[1]} stopOpacity={0.6} />
            <stop offset="80%" stopColor={SAPPHIRE[0]} stopOpacity={0.9} />
          </radialGradient>
        </defs>
        <motion.g
          animate={{
            rotate: 360,
            scale: [1, 1.015, 0.985, 1.01, 1]
          }}
          transition={{
            rotate: { duration: 2.5, repeat: Infinity, ease: 'linear' },
            scale: {
              duration: 2.5,
              repeat: Infinity,
              ease: [0.45, 0.05, 0.55, 0.95],
              times: [0, 0.25, 0.5, 0.75, 1]
            }
          }}
          style={{ transformOrigin: `${dimension / 2}px ${dimension / 2}px` }}
        >
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={dimension * 0.4}
            fill="url(#vinylGrad)"
            stroke={SAPPHIRE[1]}
            strokeWidth={dimension * 0.015}
          />
          {Array.from({ length: 6 }).map((_, i) => (
            <circle
              key={i}
              cx={dimension / 2}
              cy={dimension / 2}
              r={dimension * (0.15 + i * 0.04)}
              fill="none"
              stroke={SAPPHIRE[i % SAPPHIRE.length]}
              strokeWidth={dimension * 0.005}
              opacity={0.3}
            />
          ))}
          <circle cx={dimension / 2} cy={dimension / 2} r={dimension * 0.08} fill={SAPPHIRE[2]} opacity={0.8} />
          <circle cx={dimension / 2} cy={dimension / 2} r={dimension * 0.03} fill="#0f172a" />
        </motion.g>

        <motion.g
          animate={{
            rotate: [0, -20, -18, -22, -20, 0, 0, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: [0.65, 0, 0.35, 1],
            times: [0, 0.15, 0.2, 0.25, 0.3, 0.5, 0.8, 1]
          }}
          style={{ transformOrigin: `${dimension * 0.75}px ${dimension * 0.2}px` }}
        >
          <line
            x1={dimension * 0.75}
            y1={dimension * 0.2}
            x2={dimension * 0.72}
            y2={dimension * 0.48}
            stroke={SAPPHIRE[2]}
            strokeWidth={dimension * 0.02}
            strokeLinecap="round"
          />
          <circle
            cx={dimension * 0.75}
            cy={dimension * 0.2}
            r={dimension * 0.03}
            fill={SAPPHIRE[1]}
          />
          <motion.circle
            cx={dimension * 0.72}
            cy={dimension * 0.48}
            r={dimension * 0.025}
            fill={SAPPHIRE[3]}
            animate={{
              opacity: [0.6, 1, 0.8, 1, 0.6, 0.6]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              times: [0, 0.15, 0.2, 0.25, 0.3, 1]
            }}
          />
        </motion.g>
      </svg>
    </div>
  );
}
