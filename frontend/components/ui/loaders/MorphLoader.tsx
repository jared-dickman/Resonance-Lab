'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function MorphLoader({ size = 'md' }: LoaderProps) {
  const dimension = LOADER_SIZE[size];
  const cx = dimension / 2;
  const cy = dimension / 2;
  const r = dimension * 0.3;

  // All shapes use 6 points for smooth interpolation
  // Circle (approximated with 6 points)
  const circle = `
    M ${cx + r} ${cy}
    L ${cx + r * 0.5} ${cy + r * 0.866}
    L ${cx - r * 0.5} ${cy + r * 0.866}
    L ${cx - r} ${cy}
    L ${cx - r * 0.5} ${cy - r * 0.866}
    L ${cx + r * 0.5} ${cy - r * 0.866}
    Z
  `;

  // Square (with 6 points for smooth morph)
  const square = `
    M ${cx + r * 0.8} ${cy - r * 0.8}
    L ${cx + r * 0.8} ${cy + r * 0.8}
    L ${cx} ${cy + r * 0.8}
    L ${cx - r * 0.8} ${cy + r * 0.8}
    L ${cx - r * 0.8} ${cy - r * 0.8}
    L ${cx} ${cy - r * 0.8}
    Z
  `;

  // Triangle (with 6 points - 3 vertices + 3 midpoints)
  const triangle = `
    M ${cx} ${cy - r}
    L ${cx + r * 0.433} ${cy - r * 0.25}
    L ${cx + r * 0.866} ${cy + r * 0.5}
    L ${cx} ${cy + r}
    L ${cx - r * 0.866} ${cy + r * 0.5}
    L ${cx - r * 0.433} ${cy - r * 0.25}
    Z
  `;

  // Hexagon (6 points - perfect match)
  const hexagon = `
    M ${cx + r} ${cy}
    L ${cx + r * 0.5} ${cy + r * 0.866}
    L ${cx - r * 0.5} ${cy + r * 0.866}
    L ${cx - r} ${cy}
    L ${cx - r * 0.5} ${cy - r * 0.866}
    L ${cx + r * 0.5} ${cy - r * 0.866}
    Z
  `;

  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex items-center justify-center"
      style={{ width: dimension, height: dimension }}
    >
      <svg width={dimension} height={dimension} viewBox={`0 0 ${dimension} ${dimension}`}>
        <defs>
          <linearGradient id="morphGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={SAPPHIRE[1]} stopOpacity={0.8} />
            <stop offset="100%" stopColor={SAPPHIRE[3]} stopOpacity={0.9} />
          </linearGradient>
        </defs>
        <motion.path
          fill="url(#morphGrad)"
          strokeWidth={dimension * 0.02}
          stroke={SAPPHIRE[2]}
          animate={{
            d: [circle, square, triangle, hexagon, circle],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.25, 0.5, 0.75, 1],
          }}
        />
      </svg>
    </div>
  );
}
