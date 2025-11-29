'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OrbitLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SAPPHIRE = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'];
const PARTICLE_COUNT = 8;

export function OrbitLoader({ className, size = 'md' }: OrbitLoaderProps) {
  const sizeConfig = {
    sm: { container: 32, core: 6, particle: 4, ringRadius: 12 },
    md: { container: 48, core: 10, particle: 6, ringRadius: 18 },
    lg: { container: 64, core: 14, particle: 8, ringRadius: 24 },
  };

  const { container, core, particle, ringRadius } = sizeConfig[size];
  const center = container / 2;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('relative overflow-hidden', className)}
      style={{ width: container, height: container }}
    >
      <motion.div
        className="absolute rounded-full"
        style={{
          width: core,
          height: core,
          left: center - core / 2,
          top: center - core / 2,
          background: `radial-gradient(circle, ${SAPPHIRE[3]} 0%, ${SAPPHIRE[1]} 60%, ${SAPPHIRE[0]} 100%)`,
          boxShadow: `0 0 ${core}px ${SAPPHIRE[2]}, 0 0 ${core * 2}px ${SAPPHIRE[1]}40`,
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const angle = (i / PARTICLE_COUNT) * 360;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: particle,
              height: particle,
              background: SAPPHIRE[i % SAPPHIRE.length],
              boxShadow: `0 0 ${particle * 2}px ${SAPPHIRE[i % SAPPHIRE.length]}`,
            }}
            animate={{
              x: [
                center - particle / 2 + Math.cos((angle * Math.PI) / 180) * ringRadius,
                center - particle / 2 + Math.cos(((angle + 360) * Math.PI) / 180) * ringRadius,
              ],
              y: [
                center - particle / 2 + Math.sin((angle * Math.PI) / 180) * ringRadius,
                center - particle / 2 + Math.sin(((angle + 360) * Math.PI) / 180) * ringRadius,
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          />
        );
      })}
    </div>
  );
}
