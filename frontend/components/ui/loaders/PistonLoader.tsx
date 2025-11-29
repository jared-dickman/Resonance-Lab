'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function PistonLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const pistonWidth = dim * 0.12;
  const pistonHeight = dim * 0.28;
  const strokeWidth = dim * 0.03;

  const pistons = [
    { x: dim * 0.25, delay: 0 },
    { x: dim * 0.5, delay: 0.15 },
    { x: dim * 0.75, delay: 0.3 },
  ];

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        {/* Engine block */}
        <rect
          x={dim * 0.15}
          y={dim * 0.15}
          width={dim * 0.7}
          height={dim * 0.22}
          fill={SAPPHIRE[0]}
          opacity={0.3}
          rx={dim * 0.02}
        />

        {pistons.map((piston, i) => (
          <g key={i}>
            {/* Cylinder */}
            <rect
              x={piston.x - pistonWidth / 2}
              y={dim * 0.15}
              width={pistonWidth}
              height={dim * 0.22}
              fill={SAPPHIRE[0]}
              opacity={0.5}
              rx={dim * 0.015}
            />

            {/* Piston head + connecting rod */}
            <motion.g
              animate={{
                y: [0, dim * 0.25, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: piston.delay,
              }}
            >
              {/* Piston head */}
              <rect
                x={piston.x - pistonWidth / 2}
                y={dim * 0.37}
                width={pistonWidth}
                height={pistonHeight}
                fill={SAPPHIRE[i + 1]}
                rx={dim * 0.015}
              />
              <rect
                x={piston.x - pistonWidth / 3}
                y={dim * 0.37 + pistonHeight * 0.85}
                width={(pistonWidth * 2) / 3}
                height={pistonHeight * 0.15}
                fill={SAPPHIRE[0]}
                opacity={0.7}
              />

              {/* Connecting rod */}
              <line
                x1={piston.x}
                y1={dim * 0.37 + pistonHeight}
                x2={piston.x}
                y2={dim * 0.82}
                stroke={SAPPHIRE[2]}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />

              {/* Crankshaft connection */}
              <circle cx={piston.x} cy={dim * 0.82} r={strokeWidth * 1.5} fill={SAPPHIRE[3]} />
            </motion.g>
          </g>
        ))}

        {/* Crankshaft */}
        <line
          x1={dim * 0.1}
          y1={dim * 0.82}
          x2={dim * 0.9}
          y2={dim * 0.82}
          stroke={SAPPHIRE[1]}
          strokeWidth={strokeWidth * 1.2}
          strokeLinecap="round"
          opacity={0.6}
        />
      </svg>
    </div>
  );
}
