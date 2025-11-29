'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function PendulumLoader({ size = 'md' }: LoaderProps) {
  const dimension = LOADER_SIZE[size];
  const dots = 5;
  const spacing = dimension * 0.12;
  const dotRadius = dimension * 0.08;
  const swingDistance = dimension * 0.2;

  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex items-center justify-center"
      style={{ width: dimension, height: dimension }}
    >
      <svg width={dimension} height={dimension} viewBox={`0 0 ${dimension} ${dimension}`}>
        <rect
          x={dimension * 0.15}
          y={dimension * 0.18}
          width={dimension * 0.7}
          height={dimension * 0.03}
          rx={dimension * 0.015}
          fill={SAPPHIRE[2]}
          opacity={0.6}
        />

        {Array.from({ length: dots }).map((_, i) => {
          const isFirstBall = i === 0;
          const isLastBall = i === dots - 1;
          const centerX = dimension / 2 - ((dots - 1) * spacing) / 2 + i * spacing;
          const topY = dimension * 0.2;
          const bottomY = dimension * 0.7;

          if (isFirstBall) {
            return (
              <g key={i}>
                <motion.line
                  x1={centerX}
                  y1={topY}
                  x2={centerX}
                  y2={bottomY}
                  stroke={SAPPHIRE[1]}
                  strokeWidth={dimension * 0.012}
                  opacity={0.5}
                  animate={{
                    x1: [centerX - swingDistance, centerX, centerX, centerX - swingDistance],
                    x2: [centerX - swingDistance, centerX, centerX, centerX - swingDistance],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: [0.5, 0, 0.5, 1],
                    times: [0, 0.4, 0.6, 1]
                  }}
                />
                <motion.circle
                  cx={centerX}
                  cy={bottomY}
                  r={dotRadius}
                  fill={SAPPHIRE[0]}
                  animate={{
                    cx: [centerX - swingDistance, centerX, centerX, centerX - swingDistance],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: [0.5, 0, 0.5, 1],
                    times: [0, 0.4, 0.6, 1]
                  }}
                />
              </g>
            );
          }

          if (isLastBall) {
            return (
              <g key={i}>
                <motion.line
                  x1={centerX}
                  y1={topY}
                  x2={centerX}
                  y2={bottomY}
                  stroke={SAPPHIRE[1]}
                  strokeWidth={dimension * 0.012}
                  opacity={0.5}
                  animate={{
                    x1: [centerX, centerX, centerX + swingDistance, centerX],
                    x2: [centerX, centerX, centerX + swingDistance, centerX],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: [0.5, 0, 0.5, 1],
                    times: [0, 0.4, 0.6, 1]
                  }}
                />
                <motion.circle
                  cx={centerX}
                  cy={bottomY}
                  r={dotRadius}
                  fill={SAPPHIRE[3]}
                  animate={{
                    cx: [centerX, centerX, centerX + swingDistance, centerX],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: [0.5, 0, 0.5, 1],
                    times: [0, 0.4, 0.6, 1]
                  }}
                />
              </g>
            );
          }

          return (
            <g key={i}>
              <line
                x1={centerX}
                y1={topY}
                x2={centerX}
                y2={bottomY}
                stroke={SAPPHIRE[1]}
                strokeWidth={dimension * 0.012}
                opacity={0.5}
              />
              <circle
                cx={centerX}
                cy={bottomY}
                r={dotRadius}
                fill={SAPPHIRE[i % SAPPHIRE.length]}
                opacity={0.9}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
