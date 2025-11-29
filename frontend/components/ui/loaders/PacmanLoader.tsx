'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function PacmanLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const center = dim / 2;
  const pacRadius = dim * 0.25;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{ width: dim, height: dim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        {/* Dots being eaten */}
        {[0.55, 0.7, 0.85].map((pos, i) => (
          <motion.circle
            key={i}
            cx={dim * pos}
            cy={center}
            r={dim * 0.04}
            fill={SAPPHIRE[2]}
            animate={{ opacity: [1, 1, 0], x: [-dim * 0.1, -dim * 0.2, -dim * 0.3] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'linear',
            }}
          />
        ))}

        {/* Pacman */}
        <motion.g
          animate={{ x: [0, dim * 0.1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        >
          <motion.path
            d={`M ${center} ${center}
                L ${center + pacRadius} ${center - pacRadius * 0.6}
                A ${pacRadius} ${pacRadius} 0 1 0 ${center + pacRadius} ${center + pacRadius * 0.6}
                Z`}
            fill={SAPPHIRE[1]}
            animate={{
              d: [
                `M ${center} ${center} L ${center + pacRadius} ${center - pacRadius * 0.6} A ${pacRadius} ${pacRadius} 0 1 0 ${center + pacRadius} ${center + pacRadius * 0.6} Z`,
                `M ${center} ${center} L ${center + pacRadius} ${center - pacRadius * 0.1} A ${pacRadius} ${pacRadius} 0 1 0 ${center + pacRadius} ${center + pacRadius * 0.1} Z`,
                `M ${center} ${center} L ${center + pacRadius} ${center - pacRadius * 0.6} A ${pacRadius} ${pacRadius} 0 1 0 ${center + pacRadius} ${center + pacRadius * 0.6} Z`,
              ],
            }}
            transition={{ duration: 0.3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <circle cx={center} cy={center - pacRadius * 0.4} r={dim * 0.03} fill={SAPPHIRE[0]} />
        </motion.g>
      </svg>
    </div>
  );
}
