'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function GalaxyLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const center = dim / 2;

  // Generate spiral arm path
  const generateSpiralArm = (startAngle: number) => {
    const points: string[] = [];
    const numPoints = 50;
    const maxRadius = dim * 0.4;

    for (let i = 0; i < numPoints; i++) {
      const t = i / numPoints;
      const angle = startAngle + t * Math.PI * 3;
      const radius = t * maxRadius;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;
      points.push(`${x},${y}`);
    }

    return `M${center},${center} ${points.join(' L')}`;
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} style={{ display: 'block' }}>
        <defs>
          <radialGradient id={`galaxy-core-${size}`}>
            <stop offset="0%" stopColor={SAPPHIRE[3]} stopOpacity="1" />
            <stop offset="50%" stopColor={SAPPHIRE[2]} stopOpacity="0.9" />
            <stop offset="100%" stopColor={SAPPHIRE[0]} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`galaxy-arm-${size}`}>
            <stop offset="0%" stopColor={SAPPHIRE[3]} stopOpacity="0" />
            <stop offset="30%" stopColor={SAPPHIRE[2]} stopOpacity="0.6" />
            <stop offset="70%" stopColor={SAPPHIRE[1]} stopOpacity="0.8" />
            <stop offset="100%" stopColor={SAPPHIRE[0]} stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Rotating spiral arms */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ originX: `${center}px`, originY: `${center}px` }}
        >
          {[0, Math.PI].map((startAngle, i) => (
            <motion.path
              key={i}
              d={generateSpiralArm(startAngle)}
              stroke={`url(#galaxy-arm-${size})`}
              strokeWidth={dim * 0.025}
              fill="none"
              strokeLinecap="round"
              animate={{
                opacity: [0.6, 0.9, 0.6],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 2,
              }}
            />
          ))}
        </motion.g>

        {/* Star field */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const radius = dim * (0.15 + Math.random() * 0.25);
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;

          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={dim * 0.01}
              fill={SAPPHIRE[i % 4]}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.2,
              }}
              style={{ originX: `${x}px`, originY: `${y}px` }}
            />
          );
        })}

        {/* Bright galactic core */}
        <motion.circle
          cx={center}
          cy={center}
          r={dim * 0.12}
          fill={`url(#galaxy-core-${size})`}
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: `${center}px`, originY: `${center}px` }}
        />

        {/* Inner glow */}
        <motion.circle
          cx={center}
          cy={center}
          r={dim * 0.06}
          fill={SAPPHIRE[3]}
          animate={{
            opacity: [0.8, 1, 0.8],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}
