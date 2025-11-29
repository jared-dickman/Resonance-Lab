'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function TesseractLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const center = dim / 2;
  const outerSize = dim * 0.28;
  const innerSize = dim * 0.16;

  const createCube = (cubeSize: number) => {
    return [
      [center - cubeSize, center - cubeSize],
      [center + cubeSize, center - cubeSize],
      [center + cubeSize, center + cubeSize],
      [center - cubeSize, center + cubeSize],
    ] as [number, number][];
  };

  const outerCube = createCube(outerSize);
  const innerCube = createCube(innerSize);

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        {/* Outer rotating cube */}
        <motion.g
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: `${center}px ${center}px` }}
        >
          {outerCube.map((point, i) => {
            const nextPoint = outerCube[(i + 1) % 4]!;
            return (
              <motion.line
                key={`outer-${i}`}
                x1={point[0]}
                y1={point[1]}
                x2={nextPoint[0]}
                y2={nextPoint[1]}
                stroke={SAPPHIRE[0]}
                strokeWidth={1.5}
                strokeLinecap="round"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
              />
            );
          })}
        </motion.g>

        {/* Inner counter-rotating cube */}
        <motion.g
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: `${center}px ${center}px` }}
        >
          {innerCube.map((point, i) => {
            const nextPoint = innerCube[(i + 1) % 4]!;
            return (
              <motion.line
                key={`inner-${i}`}
                x1={point[0]}
                y1={point[1]}
                x2={nextPoint[0]}
                y2={nextPoint[1]}
                stroke={SAPPHIRE[2]}
                strokeWidth={1.5}
                strokeLinecap="round"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.15 + 0.3,
                  ease: 'easeInOut',
                }}
              />
            );
          })}
        </motion.g>

        {/* Connecting lines between cubes */}
        {outerCube.map((outerPoint, i) => {
          const innerPoint = innerCube[i]!;
          return (
            <motion.line
              key={`connect-${i}`}
              x1={outerPoint[0]}
              y1={outerPoint[1]}
              x2={innerPoint[0]}
              y2={innerPoint[1]}
              stroke={SAPPHIRE[1]}
              strokeWidth={1}
              strokeLinecap="round"
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          );
        })}

        {/* Corner vertices */}
        {outerCube.map((point, i) => (
          <motion.circle
            key={`vertex-outer-${i}`}
            cx={point[0]}
            cy={point[1]}
            r={1.5}
            fill={SAPPHIRE[3]}
            animate={{ scale: [1, 1.8, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
        {innerCube.map((point, i) => (
          <motion.circle
            key={`vertex-inner-${i}`}
            cx={point[0]}
            cy={point[1]}
            r={1.5}
            fill={SAPPHIRE[1]}
            animate={{ scale: [1, 1.8, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2 + 0.3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>
    </div>
  );
}
