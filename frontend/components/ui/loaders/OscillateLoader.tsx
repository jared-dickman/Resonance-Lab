'use client';

import { motion } from 'framer-motion';

const SAPPHIRE = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'];

interface OscillateLoaderProps {
  size?: number;
  className?: string;
}

export function OscillateLoader({ size = 120, className = '' }: OscillateLoaderProps) {
  const waves = [
    { delay: 0, amplitude: 8, color: SAPPHIRE[0] },
    { delay: 0.15, amplitude: 6, color: SAPPHIRE[1] },
    { delay: 0.3, amplitude: 10, color: SAPPHIRE[2] },
  ];

  const generateWavePath = (amplitude: number, yOffset: number) => {
    const points: string[] = [];
    const width = size;
    const segments = 40;

    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * width;
      const y = yOffset + Math.sin((i / segments) * Math.PI * 3) * amplitude;
      points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
    }

    return points.join(' ');
  };

  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Loading">
      <svg width={size} height={size * 0.5} viewBox={`0 0 ${size} ${size * 0.5}`}>
        {waves.map((wave, index) => (
          <motion.path
            key={index}
            d={generateWavePath(wave.amplitude, size * 0.25)}
            fill="none"
            stroke={wave.color}
            strokeWidth={2.5}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.3 }}
            animate={{
              pathLength: [0, 1, 1, 0],
              opacity: [0.4, 1, 1, 0.4],
              strokeWidth: [2, 3, 3, 2],
            }}
            transition={{
              duration: 2,
              delay: wave.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
        <motion.circle
          cx={size / 2}
          cy={size * 0.25}
          r={4}
          fill={SAPPHIRE[3]}
          animate={{
            x: [-(size / 2) + 10, (size / 2) - 10, -(size / 2) + 10],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>
    </div>
  );
}
