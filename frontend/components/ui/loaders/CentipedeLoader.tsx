'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function CentipedeLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const numSegments = 12;
  const segmentRadius = dim * 0.04;
  const headRadius = dim * 0.055;
  const legLength = dim * 0.08;
  const pathRadius = dim * 0.3;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center overflow-hidden', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim * 0.8} height={dim * 0.8} viewBox="0 0 100 100">
        <defs>
          <radialGradient id={`centipede-glow-${size}`}>
            <stop offset="0%" stopColor={SAPPHIRE[3]} stopOpacity="1" />
            <stop offset="50%" stopColor={SAPPHIRE[2]} stopOpacity="0.6" />
            <stop offset="100%" stopColor={SAPPHIRE[1]} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Centipede segments with serpentine motion */}
        {Array.from({ length: numSegments }).map((_, i) => {
          const isHead = i === 0;
          const radius = isHead ? headRadius * 1.4 : segmentRadius * 1.2;
          const delay = i * 0.12;
          const phaseOffset = (i / numSegments) * Math.PI * 2;

          return (
            <g key={i}>
              {/* Segment body */}
              <motion.circle
                cx={50}
                cy={50}
                r={radius}
                fill={isHead ? SAPPHIRE[3] : i % 2 === 0 ? SAPPHIRE[2] : SAPPHIRE[1]}
                stroke={SAPPHIRE[3]}
                strokeWidth={0.5}
                animate={{
                  cx: [
                    50 + Math.cos(phaseOffset) * pathRadius * 0.6,
                    50 + Math.cos(phaseOffset + Math.PI) * pathRadius * 0.6,
                    50 + Math.cos(phaseOffset) * pathRadius * 0.6,
                  ],
                  cy: [
                    50 + Math.sin(phaseOffset) * pathRadius * 0.6,
                    50 + Math.sin(phaseOffset + Math.PI) * pathRadius * 0.6,
                    50 + Math.sin(phaseOffset) * pathRadius * 0.6,
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay,
                }}
              />

              {/* Segment glow */}
              {isHead && (
                <motion.circle
                  cx={50}
                  cy={50}
                  r={radius * 1.5}
                  fill={`url(#centipede-glow-${size})`}
                  animate={{
                    cx: [
                      50 + Math.cos(phaseOffset) * pathRadius * 0.6,
                      50 + Math.cos(phaseOffset + Math.PI) * pathRadius * 0.6,
                      50 + Math.cos(phaseOffset) * pathRadius * 0.6,
                    ],
                    cy: [
                      50 + Math.sin(phaseOffset) * pathRadius * 0.6,
                      50 + Math.sin(phaseOffset + Math.PI) * pathRadius * 0.6,
                      50 + Math.sin(phaseOffset) * pathRadius * 0.6,
                    ],
                    opacity: [0.6, 0.9, 0.6],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay,
                  }}
                />
              )}

              {/* Legs - radiating lines */}
              {!isHead &&
                i % 2 === 0 &&
                [0, 1].map((side) => {
                  const legAngle = side === 0 ? -Math.PI / 2 : Math.PI / 2;
                  return (
                    <motion.line
                      key={side}
                      x1={50}
                      y1={50}
                      x2={50}
                      y2={50}
                      stroke={SAPPHIRE[0]}
                      strokeWidth={0.8}
                      strokeLinecap="round"
                      animate={{
                        x1: [
                          50 + Math.cos(phaseOffset) * pathRadius * 0.6,
                          50 + Math.cos(phaseOffset + Math.PI) * pathRadius * 0.6,
                          50 + Math.cos(phaseOffset) * pathRadius * 0.6,
                        ],
                        y1: [
                          50 + Math.sin(phaseOffset) * pathRadius * 0.6,
                          50 + Math.sin(phaseOffset + Math.PI) * pathRadius * 0.6,
                          50 + Math.sin(phaseOffset) * pathRadius * 0.6,
                        ],
                        x2: [
                          50 +
                            Math.cos(phaseOffset) * pathRadius * 0.6 +
                            Math.cos(phaseOffset + legAngle) * legLength * 0.6,
                          50 +
                            Math.cos(phaseOffset + Math.PI) * pathRadius * 0.6 +
                            Math.cos(phaseOffset + Math.PI + legAngle) * legLength * 0.6,
                          50 +
                            Math.cos(phaseOffset) * pathRadius * 0.6 +
                            Math.cos(phaseOffset + legAngle) * legLength * 0.6,
                        ],
                        y2: [
                          50 +
                            Math.sin(phaseOffset) * pathRadius * 0.6 +
                            Math.sin(phaseOffset + legAngle) * legLength * 0.6,
                          50 +
                            Math.sin(phaseOffset + Math.PI) * pathRadius * 0.6 +
                            Math.sin(phaseOffset + Math.PI + legAngle) * legLength * 0.6,
                          50 +
                            Math.sin(phaseOffset) * pathRadius * 0.6 +
                            Math.sin(phaseOffset + legAngle) * legLength * 0.6,
                        ],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay,
                      }}
                    />
                  );
                })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
