'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function FlywheelLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const svgSize = dim * 0.8;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const diskRadius = svgSize * 0.4;
  const hubRadius = svgSize * 0.08;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
        {/* Rotating disk assembly */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{ originX: `${centerX}px`, originY: `${centerY}px` }}
        >
          {/* Main solid disk - heavy industrial wheel */}
          <circle cx={centerX} cy={centerY} r={diskRadius} fill={SAPPHIRE[1]} opacity={0.9} />

          {/* Subtle weight indicators at 4 cardinal points */}
          {[0, 90, 180, 270].map((deg) => {
            const angle = (deg * Math.PI) / 180;
            const weightX = centerX + Math.cos(angle) * diskRadius * 0.75;
            const weightY = centerY + Math.sin(angle) * diskRadius * 0.75;

            return (
              <circle key={deg} cx={weightX} cy={weightY} r={svgSize * 0.03} fill={SAPPHIRE[0]} opacity={0.6} />
            );
          })}

          {/* 6 subtle spokes */}
          {Array.from({ length: 6 }, (_, i) => {
            const angle = (i * 60 * Math.PI) / 180;
            const x1 = centerX + Math.cos(angle) * hubRadius;
            const y1 = centerY + Math.sin(angle) * hubRadius;
            const x2 = centerX + Math.cos(angle) * diskRadius * 0.85;
            const y2 = centerY + Math.sin(angle) * diskRadius * 0.85;

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={SAPPHIRE[3]}
                strokeWidth={svgSize * 0.015}
                opacity={0.4}
              />
            );
          })}

          {/* Central hub */}
          <circle cx={centerX} cy={centerY} r={hubRadius} fill={SAPPHIRE[0]} opacity={0.95} />
        </motion.g>

        {/* Static outer ring - stationary reference frame */}
        <circle cx={centerX} cy={centerY} r={diskRadius + svgSize * 0.04} fill="none" stroke={SAPPHIRE[2]} strokeWidth={svgSize * 0.02} opacity={0.3} />
      </svg>
    </div>
  );
}
