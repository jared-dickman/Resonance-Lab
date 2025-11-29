'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FractalLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SAPPHIRE = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'];

export function FractalLoader({ className, size = 'md' }: FractalLoaderProps) {
  const sizeConfig = { sm: 48, md: 72, lg: 96 };
  const container = sizeConfig[size];
  const center = container / 2;
  const baseRadius = container * 0.35;

  return (
    <div role="status" aria-label="Loading" className={cn('relative overflow-hidden', className)} style={{ width: container, height: container }}>
      <svg width={container} height={container}>
        <defs>
          <filter id="fractalGlow"><feGaussianBlur stdDeviation="2" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} style={{ transformOrigin: `${center}px ${center}px` }}>
          {[0, 1, 2].map(ring => (
            <motion.polygon
              key={ring}
              points={Array.from({ length: 6 }).map((_, i) => {
                const angle = (i * Math.PI) / 3 + (ring * Math.PI) / 6;
                const r = baseRadius * (0.5 + ring * 0.25);
                return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
              }).join(' ')}
              fill="none" stroke={SAPPHIRE[ring]} strokeWidth={1} filter="url(#fractalGlow)"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: ring * 0.3 }}
            />
          ))}
        </motion.g>
        <motion.g animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} style={{ transformOrigin: `${center}px ${center}px` }}>
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            return (
              <motion.circle
                key={i}
                cx={center + Math.cos(angle) * baseRadius * 0.6}
                cy={center + Math.sin(angle) * baseRadius * 0.6}
                r={4}
                fill={SAPPHIRE[i % 4]}
                filter="url(#fractalGlow)"
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              />
            );
          })}
        </motion.g>
        <motion.circle cx={center} cy={center} r={baseRadius * 0.15} fill={SAPPHIRE[2]} filter="url(#fractalGlow)"
          animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
        />
      </svg>
    </div>
  );
}
