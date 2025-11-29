'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function AsteroidLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];

  // Generate irregular polygon for asteroid shape
  const generateAsteroid = (cx: number, cy: number, baseRadius: number, seed: number) => {
    const points: string[] = [];
    const numPoints = 8;

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      // Use seed to make variation deterministic
      const variation = Math.sin(seed * i) * 0.4 + 1;
      const radius = baseRadius * variation;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      points.push(`${x},${y}`);
    }

    return points.join(' ');
  };

  // Asteroid configurations
  const asteroids = [
    { cx: dim * 0.2, cy: dim * 0.25, radius: dim * 0.06, seed: 1.2, duration: 25, drift: { x: [0, dim * 0.1], y: [0, -dim * 0.05] } },
    { cx: dim * 0.75, cy: dim * 0.3, radius: dim * 0.05, seed: 2.5, duration: 30, drift: { x: [0, -dim * 0.08], y: [0, dim * 0.06] } },
    { cx: dim * 0.15, cy: dim * 0.7, radius: dim * 0.04, seed: 3.7, duration: 28, drift: { x: [0, dim * 0.12], y: [0, dim * 0.04] } },
    { cx: dim * 0.8, cy: dim * 0.75, radius: dim * 0.055, seed: 4.1, duration: 32, drift: { x: [0, -dim * 0.1], y: [0, -dim * 0.07] } },
    { cx: dim * 0.3, cy: dim * 0.15, radius: dim * 0.045, seed: 5.3, duration: 27, drift: { x: [0, dim * 0.07], y: [0, dim * 0.08] } },
  ];

  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{ width: dim, height: dim, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        {/* Drifting asteroids */}
        {asteroids.map((asteroid, i) => (
          <motion.g
            key={i}
            animate={{
              x: asteroid.drift.x,
              y: asteroid.drift.y,
            }}
            transition={{
              duration: asteroid.duration,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          >
            <motion.polygon
              points={generateAsteroid(asteroid.cx, asteroid.cy, asteroid.radius, asteroid.seed)}
              fill={SAPPHIRE[i % 4]}
              opacity={0.7}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 15 + i * 3,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ originX: `${asteroid.cx}px`, originY: `${asteroid.cy}px` }}
            />
          </motion.g>
        ))}

        {/* Center large asteroid */}
        <motion.g>
          <motion.polygon
            points={generateAsteroid(dim * 0.5, dim * 0.5, dim * 0.15, 6.8)}
            fill={SAPPHIRE[3]}
            opacity={0.9}
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ originX: `${dim * 0.5}px`, originY: `${dim * 0.5}px` }}
          />
          {/* Inner core detail */}
          <motion.polygon
            points={generateAsteroid(dim * 0.5, dim * 0.5, dim * 0.08, 7.2)}
            fill={SAPPHIRE[2]}
            opacity={0.6}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ originX: `${dim * 0.5}px`, originY: `${dim * 0.5}px` }}
          />
        </motion.g>

        {/* Small debris particles */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          const radius = dim * (0.25 + Math.sin(i) * 0.08);
          const x = dim * 0.5 + Math.cos(angle) * radius;
          const y = dim * 0.5 + Math.sin(angle) * radius;

          return (
            <motion.circle
              key={`debris-${i}`}
              cx={x}
              cy={y}
              r={dim * 0.015}
              fill={SAPPHIRE[1]}
              animate={{
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.4,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
