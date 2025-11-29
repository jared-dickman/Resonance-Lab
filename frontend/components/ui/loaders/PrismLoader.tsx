'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, LOADER_STROKE, type LoaderProps } from './loader.constants';

export function PrismLoader({ size = 'md' }: LoaderProps) {
  const dimension = LOADER_SIZE[size];
  const stroke = LOADER_STROKE[size];

  // Rainbow spectrum colors (ROYGBIV)
  const spectrum = [
    '#FF0000', // red
    '#FF7F00', // orange
    '#FFFF00', // yellow
    '#00FF00', // green
    '#0099FF', // blue
    '#4B0082', // indigo
    '#9400D3', // violet
  ];

  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex items-center justify-center"
      style={{ width: dimension, height: dimension }}
    >
      <svg width={dimension} height={dimension} viewBox="0 0 100 100">
        {/* Black background */}
        <rect width="100" height="100" fill="#000000" />

        {/* White light beam entering from left - pulsing */}
        <motion.line
          x1="8"
          y1="50"
          x2="38"
          y2="50"
          stroke="white"
          strokeWidth={stroke * 1.5}
          strokeLinecap="round"
          initial={{ opacity: 0.5 }}
          animate={{
            opacity: [0.5, 1, 0.5],
            strokeWidth: [stroke * 1.5, stroke * 1.8, 3, stroke * 1.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Equilateral triangular prism outline - SAPPHIRE color */}
        <motion.polygon
          points="38,35 62,50 38,65"
          fill="none"
          stroke={SAPPHIRE[2]}
          strokeWidth={stroke * 0.8}
          strokeLinejoin="miter"
          initial={{ opacity: 0.6 }}
          animate={{
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Rainbow spectrum dispersing from prism - fanning out */}
        {spectrum.map((color, i) => {
          const totalBeams = spectrum.length;
          const angle = ((i - (totalBeams - 1) / 2) * 3.5); // Spread angle

          return (
            <motion.line
              key={i}
              x1="62"
              y1="50"
              x2="92"
              y2={50 + angle}
              stroke={color}
              strokeWidth={stroke * 1.2}
              strokeLinecap="round"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{
                opacity: [0, 0.85, 0.85],
                pathLength: [0, 1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.3 + i * 0.08,
                ease: 'easeOut',
              }}
            />
          );
        })}

        {/* Subtle glow effect on the prism point where light disperses */}
        <motion.circle
          cx="62"
          cy="50"
          r={stroke * 0.8}
          fill="white"
          initial={{ opacity: 0.2 }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>
    </div>
  );
}
