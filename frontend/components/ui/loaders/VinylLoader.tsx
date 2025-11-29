'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VinylLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SAPPHIRE = { dark: '#1e40af', mid: '#3b82f6', light: '#60a5fa', pale: '#93c5fd' };

export function VinylLoader({ className, size = 'md' }: VinylLoaderProps) {
  const sizeConfig = { sm: 48, md: 72, lg: 96 };
  const d = sizeConfig[size];

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('relative overflow-hidden rounded-full', className)}
      style={{ width: d, height: d }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${SAPPHIRE.dark} 0%, ${SAPPHIRE.dark} 12%, ${SAPPHIRE.mid} 13%, ${SAPPHIRE.dark} 14%, ${SAPPHIRE.dark} 34%, ${SAPPHIRE.light} 35%, ${SAPPHIRE.dark} 36%, ${SAPPHIRE.dark} 64%, ${SAPPHIRE.pale} 65%, ${SAPPHIRE.dark} 66%)`,
          boxShadow: `0 0 20px ${SAPPHIRE.mid}60`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute rounded-full z-10"
        style={{
          width: d * 0.28,
          height: d * 0.28,
          left: d * 0.36,
          top: d * 0.36,
          background: `radial-gradient(circle at 40% 40%, ${SAPPHIRE.pale}, ${SAPPHIRE.mid})`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
      <div
        className="absolute rounded-full z-20"
        style={{
          width: d * 0.06,
          height: d * 0.06,
          left: d * 0.47,
          top: d * 0.47,
          backgroundColor: '#0f172a',
        }}
      />
    </div>
  );
}
