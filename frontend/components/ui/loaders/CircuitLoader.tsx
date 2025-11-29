'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CircuitLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SAPPHIRE = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'];

export function CircuitLoader({ className, size = 'md' }: CircuitLoaderProps) {
  const sizeConfig = { sm: { w: 48, h: 36 }, md: { w: 80, h: 60 }, lg: { w: 120, h: 90 } };
  const { w, h } = sizeConfig[size];

  const paths = [
    `M ${w * 0.1} ${h * 0.3} H ${w * 0.3} V ${h * 0.5} H ${w * 0.5}`,
    `M ${w * 0.5} ${h * 0.5} H ${w * 0.7} V ${h * 0.3} H ${w * 0.9}`,
    `M ${w * 0.1} ${h * 0.7} H ${w * 0.4} V ${h * 0.5}`,
    `M ${w * 0.5} ${h * 0.5} V ${h * 0.7} H ${w * 0.9}`,
  ];

  const nodes = [
    { x: w * 0.1, y: h * 0.3 }, { x: w * 0.3, y: h * 0.5 }, { x: w * 0.5, y: h * 0.5 },
    { x: w * 0.7, y: h * 0.3 }, { x: w * 0.9, y: h * 0.3 }, { x: w * 0.1, y: h * 0.7 },
    { x: w * 0.4, y: h * 0.5 }, { x: w * 0.9, y: h * 0.7 },
  ];

  return (
    <div role="status" aria-label="Loading" className={cn('relative overflow-hidden', className)}>
      <svg width={w} height={h}>
        <defs>
          <linearGradient id="circuitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            {SAPPHIRE.map((c, i) => <stop key={i} offset={`${i * 33}%`} stopColor={c} />)}
          </linearGradient>
          <filter id="circuitGlow"><feGaussianBlur stdDeviation="2" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        {paths.map((d, i) => (
          <g key={i}>
            <path d={d} fill="none" stroke={SAPPHIRE[0]} strokeWidth={2} opacity={0.3} strokeLinecap="round" strokeLinejoin="round" />
            <motion.path
              d={d} fill="none" stroke="url(#circuitGrad)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" filter="url(#circuitGlow)"
              animate={{ pathLength: [0, 0.4, 0], pathOffset: [0, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            />
          </g>
        ))}
        {nodes.map((n, i) => (
          <motion.circle key={i} cx={n.x} cy={n.y} r={3} fill={SAPPHIRE[1]} filter="url(#circuitGlow)"
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.12 }}
          />
        ))}
        <motion.circle cx={w * 0.5} cy={h * 0.5} r={5} fill={SAPPHIRE[2]} filter="url(#circuitGlow)"
          animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, repeat: Infinity }}
        />
      </svg>
    </div>
  );
}
