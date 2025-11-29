'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function FlywheelLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const svgSize = dim * 0.8;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const outerRadius = svgSize * 0.38;
  const innerRadius = svgSize * 0.28;
  const hubRadius = svgSize * 0.1;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
        {/* Outer rim */}
        <circle
          cx={centerX}
          cy={centerY}
          r={outerRadius}
          fill="none"
          stroke={SAPPHIRE[0]}
          strokeWidth={svgSize * 0.06}
          opacity={0.8}
        />

        {/* Inner rim detail */}
        <circle
          cx={centerX}
          cy={centerY}
          r={outerRadius - svgSize * 0.045}
          fill="none"
          stroke={SAPPHIRE[1]}
          strokeWidth={svgSize * 0.015}
          opacity={0.4}
        />

        {/* Rotating spokes and weights */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ originX: `${centerX}px`, originY: `${centerY}px` }}
        >
          {/* 8 spokes */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i * 45 * Math.PI) / 180;
            const x1 = centerX + Math.cos(angle) * hubRadius;
            const y1 = centerY + Math.sin(angle) * hubRadius;
            const x2 = centerX + Math.cos(angle) * innerRadius;
            const y2 = centerY + Math.sin(angle) * innerRadius;
            const colorIndex = (i % 3) + 1;

            return (
              <g key={i}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={SAPPHIRE[colorIndex]}
                  strokeWidth={svgSize * 0.025}
                  strokeLinecap="round"
                  opacity={0.7}
                />
              </g>
            );
          })}

          {/* 4 counterweights at cardinal points */}
          {[0, 90, 180, 270].map((deg) => {
            const angle = (deg * Math.PI) / 180;
            const weightX = centerX + Math.cos(angle) * ((innerRadius + outerRadius) / 2);
            const weightY = centerY + Math.sin(angle) * ((innerRadius + outerRadius) / 2);

            return (
              <g key={deg}>
                <rect
                  x={weightX - svgSize * 0.045}
                  y={weightY - svgSize * 0.055}
                  width={svgSize * 0.09}
                  height={svgSize * 0.11}
                  fill={SAPPHIRE[3]}
                  rx={svgSize * 0.015}
                />
                <rect
                  x={weightX - svgSize * 0.03}
                  y={weightY - svgSize * 0.035}
                  width={svgSize * 0.06}
                  height={svgSize * 0.07}
                  fill={SAPPHIRE[0]}
                  opacity={0.4}
                  rx={svgSize * 0.01}
                />
              </g>
            );
          })}
        </motion.g>

        {/* Particle tracing the outer rim */}
        <motion.circle
          cx={centerX + outerRadius}
          cy={centerY}
          r={svgSize * 0.04}
          fill={SAPPHIRE[3]}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ originX: `${centerX}px`, originY: `${centerY}px` }}
        />

        {/* Central hub */}
        <circle cx={centerX} cy={centerY} r={hubRadius} fill={SAPPHIRE[0]} opacity={0.9} />
        <circle cx={centerX} cy={centerY} r={hubRadius * 0.7} fill={SAPPHIRE[1]} opacity={0.8} />
        <circle cx={centerX} cy={centerY} r={hubRadius * 0.4} fill={SAPPHIRE[2]} />

        {/* Hub bolts */}
        {[45, 135, 225, 315].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const boltX = centerX + Math.cos(rad) * (hubRadius * 0.6);
          const boltY = centerY + Math.sin(rad) * (hubRadius * 0.6);
          return <circle key={angle} cx={boltX} cy={boltY} r={svgSize * 0.015} fill={SAPPHIRE[0]} opacity={0.6} />;
        })}
      </svg>
    </div>
  );
}
