'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function ClockworkLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const centerX = dim / 2;
  const centerY = dim / 2;
  const outerRadius = dim * 0.38;

  // Create gear teeth for outer mechanism
  const createGearPath = (teeth: number) => {
    const points = [];
    const toothDepth = dim * 0.03;
    const radius = outerRadius - dim * 0.035;

    for (let i = 0; i < teeth; i++) {
      const angle1 = (i / teeth) * Math.PI * 2;
      const angle2 = ((i + 0.4) / teeth) * Math.PI * 2;

      points.push([centerX + Math.cos(angle1) * radius, centerY + Math.sin(angle1) * radius]);
      points.push([centerX + Math.cos(angle2) * (radius + toothDepth), centerY + Math.sin(angle2) * (radius + toothDepth)]);
    }

    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ') + ' Z';
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        {/* Outer casing */}
        <circle cx={centerX} cy={centerY} r={outerRadius} fill="none" stroke={SAPPHIRE[0]} strokeWidth={dim * 0.025} opacity={0.5} />

        {/* Rotating outer gear */}
        <motion.path
          d={createGearPath(24)}
          fill="none"
          stroke={SAPPHIRE[1]}
          strokeWidth={dim * 0.012}
          opacity={0.6}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{ originX: `${centerX}px`, originY: `${centerY}px` }}
        />

        {/* Main clockwork wheel */}
        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          style={{ originX: `${centerX}px`, originY: `${centerY}px` }}
        >
          <circle cx={centerX} cy={centerY} r={dim * 0.28} fill="none" stroke={SAPPHIRE[1]} strokeWidth={dim * 0.018} opacity={0.7} />
          {[0, 60, 120, 180, 240, 300].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <line
                key={angle}
                x1={centerX}
                y1={centerY}
                x2={centerX + Math.cos(rad) * dim * 0.28}
                y2={centerY + Math.sin(rad) * dim * 0.28}
                stroke={SAPPHIRE[2]}
                strokeWidth={dim * 0.015}
                opacity={0.5}
              />
            );
          })}
        </motion.g>

        {/* Inner escapement wheel */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ originX: `${centerX}px`, originY: `${centerY}px` }}
        >
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const innerR = dim * 0.12;
            const outerR = dim * 0.18;
            return (
              <line
                key={i}
                x1={centerX + Math.cos(angle) * innerR}
                y1={centerY + Math.sin(angle) * innerR}
                x2={centerX + Math.cos(angle) * outerR}
                y2={centerY + Math.sin(angle) * outerR}
                stroke={SAPPHIRE[3]}
                strokeWidth={dim * 0.02}
                strokeLinecap="round"
              />
            );
          })}
        </motion.g>

        {/* Central pivot */}
        <circle cx={centerX} cy={centerY} r={dim * 0.08} fill={SAPPHIRE[0]} opacity={0.8} />
        <circle cx={centerX} cy={centerY} r={dim * 0.05} fill={SAPPHIRE[1]} />
        <circle cx={centerX} cy={centerY} r={dim * 0.025} fill={SAPPHIRE[2]} />
      </svg>
    </div>
  );
}
