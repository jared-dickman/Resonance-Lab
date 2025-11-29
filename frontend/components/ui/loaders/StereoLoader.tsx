'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function StereoLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const centerX = dim / 2;
  const leftY = dim * 0.35;
  const rightY = dim * 0.65;
  const dotRadius = 4;
  const travel = dim * 0.6;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        <line
          x1={centerX - travel / 2}
          y1={leftY}
          x2={centerX + travel / 2}
          y2={leftY}
          stroke={SAPPHIRE[0]}
          strokeWidth={1.5}
          opacity={0.3}
        />
        <line
          x1={centerX - travel / 2}
          y1={rightY}
          x2={centerX + travel / 2}
          y2={rightY}
          stroke={SAPPHIRE[2]}
          strokeWidth={1.5}
          opacity={0.3}
        />

        <motion.circle
          cy={leftY}
          r={dotRadius}
          fill={SAPPHIRE[0]}
          initial={{ cx: centerX - travel / 2 }}
          animate={{
            cx: [centerX - travel / 2, centerX + travel / 2, centerX - travel / 2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.circle
          cy={rightY}
          r={dotRadius}
          fill={SAPPHIRE[2]}
          initial={{ cx: centerX + travel / 2 }}
          animate={{
            cx: [centerX + travel / 2, centerX - travel / 2, centerX + travel / 2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <text
          x={centerX - travel / 2 - 10}
          y={leftY}
          fill={SAPPHIRE[1]}
          fontSize={10}
          textAnchor="end"
          dominantBaseline="middle"
          opacity={0.6}
        >
          L
        </text>
        <text
          x={centerX - travel / 2 - 10}
          y={rightY}
          fill={SAPPHIRE[3]}
          fontSize={10}
          textAnchor="end"
          dominantBaseline="middle"
          opacity={0.6}
        >
          R
        </text>
      </svg>
    </div>
  );
}
