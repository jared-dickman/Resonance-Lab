'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function SpaceInvaderLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const pixelSize = dim * 0.08; // Size of each 8-bit pixel block

  // Classic Space Invader alien shape (11x8 pixel grid)
  // 1 = filled pixel, 0 = empty
  const alienPattern = [
    [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0],
  ];

  const pixels: Array<{ x: number; y: number }> = [];
  alienPattern.forEach((row, rowIndex) => {
    row.forEach((filled, colIndex) => {
      if (filled) {
        pixels.push({ x: colIndex, y: rowIndex });
      }
    });
  });

  // Center the alien in the SVG
  const offsetX = (dim - pixelSize * 11) / 2;
  const offsetY = (dim - pixelSize * 8) / 2;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{ width: dim, height: dim, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        <defs>
          {/* Glow filter for retro CRT effect */}
          <filter id={`invader-glow-${size}`}>
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Alien container with side-to-side + downward movement */}
        <motion.g
          animate={{
            x: [0, dim * 0.15, 0, -dim * 0.15, 0],
            y: [0, dim * 0.03, dim * 0.06, dim * 0.09, dim * 0.12],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Subtle pulse scale effect */}
          <motion.g
            animate={{
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ originX: `${dim / 2}px`, originY: `${dim / 2}px` }}
          >
            {/* Render each pixel of the alien */}
            {pixels.map((pixel, i) => (
              <motion.rect
                key={i}
                x={offsetX + pixel.x * pixelSize}
                y={offsetY + pixel.y * pixelSize}
                width={pixelSize}
                height={pixelSize}
                fill={SAPPHIRE[i % 4]}
                filter={`url(#invader-glow-${size})`}
                animate={{
                  opacity: [0.85, 1, 0.85],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: (i % 8) * 0.05, // Stagger effect per row
                }}
              />
            ))}
          </motion.g>
        </motion.g>

        {/* Scanline effect for retro authenticity */}
        <motion.line
          x1="0"
          y1="0"
          x2={dim}
          y2="0"
          stroke={SAPPHIRE[3]}
          strokeWidth="1"
          opacity="0.3"
          animate={{
            y1: [0, dim],
            y2: [0, dim],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </svg>
    </div>
  );
}
