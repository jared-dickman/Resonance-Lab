'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function OscilloscopeLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const width = dim * 1.4;
  const height = dim * 0.8;
  const points = 30;

  const generateWave = (phase: number) => {
    const pathParts = Array.from({ length: points }, (_, i) => {
      const x = (i / (points - 1)) * width;
      const y = height / 2 + Math.sin((i / (points - 1)) * Math.PI * 3 + phase) * (height * 0.3);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    });
    return pathParts.join(' ');
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill={SAPPHIRE[0]}
          fillOpacity="0.1"
          stroke={SAPPHIRE[1]}
          strokeWidth="1.5"
          rx="2"
        />

        {[0.25, 0.5, 0.75].map((pos, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={height * pos}
            x2={width}
            y2={height * pos}
            stroke={SAPPHIRE[1]}
            strokeWidth="0.5"
            opacity="0.2"
          />
        ))}
        {[0.2, 0.4, 0.6, 0.8].map((pos, i) => (
          <line
            key={`v-${i}`}
            x1={width * pos}
            y1="0"
            x2={width * pos}
            y2={height}
            stroke={SAPPHIRE[1]}
            strokeWidth="0.5"
            opacity="0.2"
          />
        ))}

        <motion.path
          d={generateWave(0)}
          fill="none"
          stroke={SAPPHIRE[3]}
          strokeWidth="2"
          animate={{ d: [generateWave(0), generateWave(Math.PI), generateWave(Math.PI * 2)] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        <motion.line
          x1="0"
          y1="0"
          x2="0"
          y2={height}
          stroke={SAPPHIRE[2]}
          strokeWidth="1.5"
          opacity="0.6"
          animate={{ x1: [0, width], x2: [0, width] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </svg>
    </div>
  );
}
