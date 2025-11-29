'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function FlywheelLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const svgSize = dim * 0.8;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const outerRadius = svgSize * 0.42;
  const innerRadius = svgSize * 0.12;
  const spokeCount = 8;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
        {/* Rotating flywheel assembly */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: [0.45, 0.05, 0.55, 0.95], // Momentum curve
          }}
          style={{ originX: `${centerX}px`, originY: `${centerY}px` }}
        >
          {/* Heavy outer rim with thickness */}
          <circle
            cx={centerX}
            cy={centerY}
            r={outerRadius}
            fill="none"
            stroke={SAPPHIRE[0]}
            strokeWidth={svgSize * 0.12}
            opacity={0.95}
          />

          {/* Weight distribution markers on rim */}
          {Array.from({ length: spokeCount }, (_, i) => {
            const angle = (i * 360) / spokeCount;
            const rad = (angle * Math.PI) / 180;
            const x = centerX + Math.cos(rad) * outerRadius;
            const y = centerY + Math.sin(rad) * outerRadius;

            return (
              <circle
                key={`weight-${i}`}
                cx={x}
                cy={y}
                r={svgSize * 0.04}
                fill={SAPPHIRE[3]}
                opacity={0.7}
              />
            );
          })}

          {/* Industrial spokes - thick and solid */}
          {Array.from({ length: spokeCount }, (_, i) => {
            const angle = (i * 360) / spokeCount;
            const rad = (angle * Math.PI) / 180;
            const x1 = centerX + Math.cos(rad) * innerRadius;
            const y1 = centerY + Math.sin(rad) * innerRadius;
            const x2 = centerX + Math.cos(rad) * (outerRadius * 0.82);
            const y2 = centerY + Math.sin(rad) * (outerRadius * 0.82);

            return (
              <line
                key={`spoke-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={SAPPHIRE[1]}
                strokeWidth={svgSize * 0.025}
                strokeLinecap="round"
                opacity={0.85}
              />
            );
          })}

          {/* Solid center hub - heavy industrial bearing */}
          <circle cx={centerX} cy={centerY} r={innerRadius} fill={SAPPHIRE[0]} opacity={1} />

          {/* Hub detail ring */}
          <circle
            cx={centerX}
            cy={centerY}
            r={innerRadius * 0.65}
            fill="none"
            stroke={SAPPHIRE[2]}
            strokeWidth={svgSize * 0.01}
            opacity={0.6}
          />
        </motion.g>
      </svg>
    </div>
  );
}
