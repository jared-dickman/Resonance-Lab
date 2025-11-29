'use client';

import { motion } from 'framer-motion';
import { LOADER_SIZE, LOADER_STROKE, type LoaderProps } from './loader.constants';

export function PrismLoader({ size = 'md' }: LoaderProps) {
  const dimension = LOADER_SIZE[size];
  const stroke = LOADER_STROKE[size];

  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex items-center justify-center"
      style={{ width: dimension, height: dimension }}
    >
      <svg width={dimension} height={dimension} viewBox="0 0 100 100">
        {/* White light beam entering from left */}
        <motion.line
          x1="5"
          y1="50"
          x2="35"
          y2="50"
          stroke="white"
          strokeWidth={stroke * 1.2}
          strokeLinecap="round"
          initial={{ opacity: 0.4 }}
          animate={{
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Triangular prism - Dark Side of the Moon style */}
        <polygon
          points="35,35 65,50 35,65"
          fill="rgba(0,0,0,0.8)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={stroke * 0.5}
        />

        {/* Rainbow spectrum dispersing to the right */}
        {[
          { offset: -12, color: '#FF0000' }, // red
          { offset: -8, color: '#FF7F00' },  // orange
          { offset: -4, color: '#FFFF00' },  // yellow
          { offset: 0, color: '#00FF00' },   // green
          { offset: 4, color: '#0000FF' },   // blue
          { offset: 8, color: '#4B0082' },   // indigo
          { offset: 12, color: '#9400D3' },  // violet
        ].map((beam, i) => (
          <motion.line
            key={i}
            x1="65"
            y1="50"
            x2="95"
            y2={50 + beam.offset}
            stroke={beam.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.9, 0.9],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeOut',
            }}
          />
        ))}
      </svg>
    </div>
  );
}
