'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function CentipedeLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const segments = 12;
  const segmentSize = 3.5;
  const mushroomPositions = [
    [20, 30],
    [45, 25],
    [70, 35],
    [25, 60],
    [55, 55],
    [75, 70],
    [15, 80],
  ];

  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox="0 0 100 100" style={{ display: 'block' }}>
        {/* Mushroom obstacles - static retro style */}
        {mushroomPositions.map(([x = 0, y = 0], i) => (
          <g key={`mushroom-${i}`}>
            {/* Mushroom cap */}
            <motion.ellipse
              cx={x}
              cy={y}
              rx="4"
              ry="3"
              fill={SAPPHIRE[1]}
              opacity={0.6}
              animate={{
                opacity: [0.6, 0.8, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.2,
              }}
            />
            {/* Mushroom stem */}
            <rect x={x - 1.5} y={y + 1} width="3" height="3" fill={SAPPHIRE[0]} opacity={0.6} />
          </g>
        ))}

        {/* Centipede segments - weaving motion */}
        {Array.from({ length: segments }).map((_, i) => {
          const delay = i * 0.08;
          const phaseOffset = (i / segments) * 2 * Math.PI;

          return (
            <motion.g key={`segment-${i}`}>
              <motion.circle
                cx={50}
                cy={50}
                r={segmentSize}
                fill={i === 0 ? SAPPHIRE[3] : SAPPHIRE[2]}
                stroke={SAPPHIRE[0]}
                strokeWidth="1"
                animate={{
                  cx: [
                    50 + 25 * Math.cos(phaseOffset),
                    50 + 25 * Math.cos(phaseOffset + Math.PI / 2),
                    50 + 25 * Math.cos(phaseOffset + Math.PI),
                    50 + 25 * Math.cos(phaseOffset + (3 * Math.PI) / 2),
                    50 + 25 * Math.cos(phaseOffset + 2 * Math.PI),
                  ],
                  cy: [
                    30 + 15 * Math.sin(phaseOffset),
                    30 + 15 * Math.sin(phaseOffset + Math.PI / 2),
                    30 + 15 * Math.sin(phaseOffset + Math.PI),
                    30 + 15 * Math.sin(phaseOffset + (3 * Math.PI) / 2),
                    30 + 15 * Math.sin(phaseOffset + 2 * Math.PI),
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'linear',
                  delay,
                }}
              />

              {/* Head antennae (only on first segment) */}
              {i === 0 && (
                <>
                  <motion.line
                    x1={50}
                    y1={30}
                    x2={48}
                    y2={25}
                    stroke={SAPPHIRE[3]}
                    strokeWidth="1"
                    strokeLinecap="round"
                    animate={{
                      x1: [
                        50 + 25 * Math.cos(phaseOffset),
                        50 + 25 * Math.cos(phaseOffset + Math.PI / 2),
                        50 + 25 * Math.cos(phaseOffset + Math.PI),
                        50 + 25 * Math.cos(phaseOffset + (3 * Math.PI) / 2),
                        50 + 25 * Math.cos(phaseOffset + 2 * Math.PI),
                      ],
                      y1: [
                        30 + 15 * Math.sin(phaseOffset),
                        30 + 15 * Math.sin(phaseOffset + Math.PI / 2),
                        30 + 15 * Math.sin(phaseOffset + Math.PI),
                        30 + 15 * Math.sin(phaseOffset + (3 * Math.PI) / 2),
                        30 + 15 * Math.sin(phaseOffset + 2 * Math.PI),
                      ],
                      x2: [
                        48 + 25 * Math.cos(phaseOffset),
                        48 + 25 * Math.cos(phaseOffset + Math.PI / 2),
                        48 + 25 * Math.cos(phaseOffset + Math.PI),
                        48 + 25 * Math.cos(phaseOffset + (3 * Math.PI) / 2),
                        48 + 25 * Math.cos(phaseOffset + 2 * Math.PI),
                      ],
                      y2: [
                        25 + 15 * Math.sin(phaseOffset),
                        25 + 15 * Math.sin(phaseOffset + Math.PI / 2),
                        25 + 15 * Math.sin(phaseOffset + Math.PI),
                        25 + 15 * Math.sin(phaseOffset + (3 * Math.PI) / 2),
                        25 + 15 * Math.sin(phaseOffset + 2 * Math.PI),
                      ],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'linear',
                      delay,
                    }}
                  />
                  <motion.line
                    x1={50}
                    y1={30}
                    x2={52}
                    y2={25}
                    stroke={SAPPHIRE[3]}
                    strokeWidth="1"
                    strokeLinecap="round"
                    animate={{
                      x1: [
                        50 + 25 * Math.cos(phaseOffset),
                        50 + 25 * Math.cos(phaseOffset + Math.PI / 2),
                        50 + 25 * Math.cos(phaseOffset + Math.PI),
                        50 + 25 * Math.cos(phaseOffset + (3 * Math.PI) / 2),
                        50 + 25 * Math.cos(phaseOffset + 2 * Math.PI),
                      ],
                      y1: [
                        30 + 15 * Math.sin(phaseOffset),
                        30 + 15 * Math.sin(phaseOffset + Math.PI / 2),
                        30 + 15 * Math.sin(phaseOffset + Math.PI),
                        30 + 15 * Math.sin(phaseOffset + (3 * Math.PI) / 2),
                        30 + 15 * Math.sin(phaseOffset + 2 * Math.PI),
                      ],
                      x2: [
                        52 + 25 * Math.cos(phaseOffset),
                        52 + 25 * Math.cos(phaseOffset + Math.PI / 2),
                        52 + 25 * Math.cos(phaseOffset + Math.PI),
                        52 + 25 * Math.cos(phaseOffset + (3 * Math.PI) / 2),
                        52 + 25 * Math.cos(phaseOffset + 2 * Math.PI),
                      ],
                      y2: [
                        25 + 15 * Math.sin(phaseOffset),
                        25 + 15 * Math.sin(phaseOffset + Math.PI / 2),
                        25 + 15 * Math.sin(phaseOffset + Math.PI),
                        25 + 15 * Math.sin(phaseOffset + (3 * Math.PI) / 2),
                        25 + 15 * Math.sin(phaseOffset + 2 * Math.PI),
                      ],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'linear',
                      delay,
                    }}
                  />
                </>
              )}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
