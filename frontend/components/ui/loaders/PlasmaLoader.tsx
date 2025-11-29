'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PlasmaLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SAPPHIRE = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'];

export function PlasmaLoader({ className, size = 'md' }: PlasmaLoaderProps) {
  const sizeConfig = { sm: { c: 48, core: 12, arc: 18 }, md: { c: 80, core: 20, arc: 30 }, lg: { c: 120, core: 30, arc: 45 } };
  const { c, core, arc } = sizeConfig[size];
  const center = c / 2;

  return (
    <div role="status" aria-label="Loading" className={cn('relative overflow-hidden', className)} style={{ width: c, height: c }}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${SAPPHIRE[2]}20 0%, transparent 70%)` }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: core, height: core, left: center - core / 2, top: center - core / 2,
          background: `radial-gradient(circle at 30% 30%, ${SAPPHIRE[3]}, ${SAPPHIRE[2]} 30%, ${SAPPHIRE[1]} 60%, ${SAPPHIRE[0]})`,
          boxShadow: `0 0 ${core * 0.5}px ${SAPPHIRE[2]}, 0 0 ${core}px ${SAPPHIRE[1]}80`,
        }}
        animate={{ scale: [1, 1.2, 0.95, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <svg className="absolute inset-0" width={c} height={c}>
        <defs><filter id="plasmaGlow"><feGaussianBlur stdDeviation="2" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
        {Array.from({ length: 6 }).map((_, i) => {
          const startAngle = (i / 6) * 360;
          const endAngle = startAngle + 60;
          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;
          const x1 = center + Math.cos(startRad) * (core / 2);
          const y1 = center + Math.sin(startRad) * (core / 2);
          const x2 = center + Math.cos(endRad) * arc;
          const y2 = center + Math.sin(endRad) * arc;
          return (
            <motion.path
              key={i}
              d={`M ${x1} ${y1} Q ${(x1 + x2) / 2 + (Math.random() - 0.5) * 10} ${(y1 + y2) / 2 + (Math.random() - 0.5) * 10} ${x2} ${y2}`}
              fill="none" stroke={SAPPHIRE[i % 4]} strokeWidth={1.5} strokeLinecap="round" filter="url(#plasmaGlow)"
              animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, repeatDelay: 0.3 }}
            />
          );
        })}
      </svg>
      {[0.6, 0.85].map((r, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-dashed"
          style={{ width: arc * 2 * r, height: arc * 2 * r, left: center - arc * r, top: center - arc * r, borderColor: `${SAPPHIRE[i + 1]}40` }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 8 + i * 4, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
}
