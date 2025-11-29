'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function HealthBarLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const heartSize = dim * 0.22;
  const spacing = dim * 0.28;
  const startX = dim * 0.2;
  const heartY = dim * 0.5;

  // Classic Zelda 8-bit pixel heart path
  const createPixelHeart = (x: number, y: number) => {
    const p = heartSize / 8;
    // Classic Zelda heart shape using pixel grid
    return `
      M ${x + p * 1} ${y + p * 2}
      h ${p}
      v ${-p}
      h ${p}
      v ${-p}
      h ${p * 2}
      v ${p}
      h ${p}
      v ${p}
      h ${p}
      v ${p * 2}
      h ${-p}
      v ${p}
      h ${-p}
      v ${p}
      h ${-p}
      v ${-p}
      h ${-p}
      v ${-p}
      h ${-p}
      v ${p}
      h ${-p}
      v ${p}
      h ${-p}
      v ${-p}
      h ${-p}
      v ${-p * 2}
      h ${p}
      v ${-p}
      z
    `;
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{ width: dim, height: dim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        <defs>
          <filter id={`glow-${size}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Heart 1 - Dark red outline + red fill */}
        <g>
          <path
            d={createPixelHeart(startX, heartY)}
            fill="#8B0000"
            stroke="none"
          />
          <motion.path
            d={createPixelHeart(startX + heartSize * 0.1, heartY + heartSize * 0.1)}
            fill="#DC143C"
            stroke="none"
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0
            }}
          />
        </g>

        {/* Heart 2 - Dark red outline + red fill */}
        <g>
          <path
            d={createPixelHeart(startX + spacing, heartY)}
            fill="#8B0000"
            stroke="none"
          />
          <motion.path
            d={createPixelHeart(startX + spacing + heartSize * 0.1, heartY + heartSize * 0.1)}
            fill="#DC143C"
            stroke="none"
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.3
            }}
          />
        </g>

        {/* Heart 3 - Dark red outline + red fill */}
        <g>
          <path
            d={createPixelHeart(startX + spacing * 2, heartY)}
            fill="#8B0000"
            stroke="none"
          />
          <motion.path
            d={createPixelHeart(startX + spacing * 2 + heartSize * 0.1, heartY + heartSize * 0.1)}
            fill="#DC143C"
            stroke="none"
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.6
            }}
          />
        </g>
      </svg>
    </div>
  );
}
