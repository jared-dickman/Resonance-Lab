'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function CloudDriftLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];

  // Fluffy cloud shape using overlapping circles with drift
  const Cloud = ({ x, y, scale = 1, delay = 0, duration = 8, layer = 1 }: {
    x: number;
    y: number;
    scale?: number;
    delay?: number;
    duration?: number;
    layer?: number;
  }) => (
    <motion.g
      animate={{
        x: [-dim * 0.2, dim * 0.5],
        y: [0, Math.sin(delay) * 3, 0],
        opacity: [0.4, 0.7, 0.4],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      {/* Fluffy cloud made of overlapping circles */}
      <circle cx={x} cy={y} r={7 * scale} fill={SAPPHIRE[layer % 3]} opacity="0.5" />
      <circle cx={x + 9 * scale} cy={y - 3 * scale} r={8 * scale} fill={SAPPHIRE[(layer + 1) % 3]} opacity="0.6" />
      <circle cx={x + 18 * scale} cy={y - 1 * scale} r={7 * scale} fill={SAPPHIRE[layer % 3]} opacity="0.5" />
      <circle cx={x + 9 * scale} cy={y + 5 * scale} r={9 * scale} fill={SAPPHIRE[(layer + 2) % 3]} opacity="0.7" />
      <circle cx={x + 5 * scale} cy={y + 2 * scale} r={6 * scale} fill={SAPPHIRE[(layer + 1) % 3]} opacity="0.6" />
      <circle cx={x + 14 * scale} cy={y + 3 * scale} r={6 * scale} fill={SAPPHIRE[layer % 3]} opacity="0.5" />
    </motion.g>
  );

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center overflow-hidden', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim * 0.8} height={dim * 0.8} viewBox="0 0 100 100">
        {/* Back layer - slowest, smallest, most distant */}
        <Cloud x={5} y={20} scale={0.5} duration={16} delay={0} layer={0} />
        <Cloud x={40} y={18} scale={0.55} duration={18} delay={3} layer={0} />
        <Cloud x={70} y={22} scale={0.5} duration={17} delay={6} layer={0} />

        {/* Middle layer - medium speed and size */}
        <Cloud x={0} y={42} scale={0.8} duration={11} delay={1.5} layer={1} />
        <Cloud x={35} y={48} scale={0.75} duration={12} delay={4.5} layer={1} />
        <Cloud x={65} y={45} scale={0.7} duration={13} delay={7.5} layer={1} />

        {/* Front layer - fastest, largest, closest */}
        <Cloud x={10} y={65} scale={1.0} duration={8} delay={0.8} layer={2} />
        <Cloud x={45} y={70} scale={1.05} duration={9} delay={3.8} layer={2} />
        <Cloud x={75} y={68} scale={0.95} duration={8.5} delay={6.8} layer={2} />
      </svg>
    </div>
  );
}
