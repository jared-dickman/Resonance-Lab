'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AtomLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SAPPHIRE = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'];

export function AtomLoader({ className, size = 'md' }: AtomLoaderProps) {
  const sizeConfig = {
    sm: { container: 40, nucleus: 8, electron: 4, orbit: [14, 18, 22] },
    md: { container: 64, nucleus: 12, electron: 6, orbit: [22, 28, 34] },
    lg: { container: 96, nucleus: 18, electron: 8, orbit: [32, 42, 52] },
  };

  const { container, nucleus, electron, orbit } = sizeConfig[size];
  const center = container / 2;
  const orbitAngles = [0, 60, 120];
  const orbitDurations = [2.2, 2.8, 3.4];

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
          width: nucleus,
          height: nucleus,
          left: center - nucleus / 2,
          top: center - nucleus / 2,
          background: `radial-gradient(circle at 30% 30%, ${SAPPHIRE[3]}, ${SAPPHIRE[1]} 40%, ${SAPPHIRE[0]})`,
          boxShadow: `0 0 ${nucleus}px ${SAPPHIRE[2]}, 0 0 ${nucleus * 2}px ${SAPPHIRE[1]}60`,
        }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {orbit.map((radius, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: radius * 2,
            height: radius * 2,
            left: center - radius,
            top: center - radius,
            borderColor: `${SAPPHIRE[2]}30`,
          }}
          initial={{ rotate: orbitAngles[i], scaleY: 0.4 }}
        />
      ))}
      {orbit.map((radius, i) => (
        <motion.div
          key={`e-${i}`}
          className="absolute"
          style={{ width: container, height: container }}
          initial={{ rotate: orbitAngles[i] ?? 0 }}
          animate={{ rotate: (orbitAngles[i] ?? 0) + 360 }}
          transition={{ duration: orbitDurations[i], repeat: Infinity, ease: 'linear' }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: electron,
              height: electron,
              background: `radial-gradient(circle, ${SAPPHIRE[3]}, ${SAPPHIRE[1]})`,
              boxShadow: `0 0 ${electron}px ${SAPPHIRE[2]}`,
              left: center + radius - electron / 2,
              top: center * 0.6 - electron / 2,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
