'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function GearLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const svgSize = dim * 0.8;

  // Create precise gear tooth path with pronounced teeth
  const createGear = (cx: number, cy: number, radius: number, teeth: number) => {
    const points = [];
    const toothDepth = radius * 0.35; // More pronounced teeth
    const toothWidth = 0.3;

    for (let i = 0; i < teeth; i++) {
      const baseAngle = (i / teeth) * Math.PI * 2;
      const toothStart = ((i + (0.5 - toothWidth)) / teeth) * Math.PI * 2;
      const toothPeak1 = ((i + 0.5) / teeth) * Math.PI * 2;
      const toothEnd = ((i + (0.5 + toothWidth)) / teeth) * Math.PI * 2;

      // Valley to base of tooth
      points.push([cx + Math.cos(toothStart) * radius, cy + Math.sin(toothStart) * radius]);
      // Rise to tooth peak
      points.push([
        cx + Math.cos(toothPeak1) * (radius + toothDepth),
        cy + Math.sin(toothPeak1) * (radius + toothDepth),
      ]);
      // Fall to other side
      points.push([cx + Math.cos(toothEnd) * radius, cy + Math.sin(toothEnd) * radius]);
    }

    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ') + ' Z';
  };

  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const leftGearX = centerX - svgSize * 0.2;
  const rightGearX = centerX + svgSize * 0.2;
  const largeRadius = svgSize * 0.16;
  const smallRadius = svgSize * 0.11;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
        {/* Large gear - clockwise */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{ originX: `${leftGearX}px`, originY: `${centerY}px` }}
        >
          <path d={createGear(leftGearX, centerY, largeRadius, 12)} fill={SAPPHIRE[1]} opacity={0.9} />
          <circle cx={leftGearX} cy={centerY} r={largeRadius * 0.35} fill={SAPPHIRE[0]} opacity={0.8} />
          <circle cx={leftGearX} cy={centerY} r={largeRadius * 0.15} fill={SAPPHIRE[2]} />
        </motion.g>

        {/* Small gear - counter-clockwise, perfectly meshed */}
        <motion.g
          animate={{ rotate: -540 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{ originX: `${rightGearX}px`, originY: `${centerY}px` }}
        >
          <path d={createGear(rightGearX, centerY, smallRadius, 8)} fill={SAPPHIRE[2]} opacity={0.9} />
          <circle cx={rightGearX} cy={centerY} r={smallRadius * 0.4} fill={SAPPHIRE[1]} opacity={0.8} />
          <circle cx={rightGearX} cy={centerY} r={smallRadius * 0.18} fill={SAPPHIRE[3]} />
        </motion.g>
      </svg>
    </div>
  );
}
