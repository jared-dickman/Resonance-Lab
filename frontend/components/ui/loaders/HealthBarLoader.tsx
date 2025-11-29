'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function HealthBarLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const heartSize = dim * 0.22;
  const spacing = dim * 0.28;
  const startX = dim * 0.2;
  const heartY = dim * 0.5;

  // 8-bit pixel heart path
  const createPixelHeart = (x: number, y: number) => {
    const pixelSize = heartSize / 8;
    return `
      M ${x + pixelSize * 2} ${y}
      h ${pixelSize}
      v ${pixelSize}
      h ${pixelSize}
      v ${pixelSize}
      h ${pixelSize}
      v ${pixelSize}
      h ${pixelSize}
      v ${pixelSize}
      h ${-pixelSize}
      v ${pixelSize}
      h ${-pixelSize}
      v ${pixelSize}
      h ${-pixelSize * 2}
      v ${-pixelSize}
      h ${-pixelSize}
      v ${-pixelSize}
      h ${-pixelSize}
      v ${-pixelSize}
      h ${pixelSize}
      v ${-pixelSize}
      h ${pixelSize}
      v ${-pixelSize}
      h ${pixelSize}
      v ${-pixelSize}
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

        {/* Heart 1 */}
        <motion.path
          d={createPixelHeart(startX, heartY)}
          fill={SAPPHIRE[1]}
          filter={`url(#glow-${size})`}
          animate={{
            opacity: [0.6, 1, 0.6],
            scale: [0.95, 1.05, 0.95]
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0
          }}
          style={{ originX: `${startX + heartSize / 2}px`, originY: `${heartY + heartSize / 2}px` }}
        />

        {/* Heart 2 */}
        <motion.path
          d={createPixelHeart(startX + spacing, heartY)}
          fill={SAPPHIRE[2]}
          filter={`url(#glow-${size})`}
          animate={{
            opacity: [0.6, 1, 0.6],
            scale: [0.95, 1.05, 0.95]
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.3
          }}
          style={{ originX: `${startX + spacing + heartSize / 2}px`, originY: `${heartY + heartSize / 2}px` }}
        />

        {/* Heart 3 */}
        <motion.path
          d={createPixelHeart(startX + spacing * 2, heartY)}
          fill={SAPPHIRE[3]}
          filter={`url(#glow-${size})`}
          animate={{
            opacity: [0.6, 1, 0.6],
            scale: [0.95, 1.05, 0.95]
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.6
          }}
          style={{ originX: `${startX + spacing * 2 + heartSize / 2}px`, originY: `${heartY + heartSize / 2}px` }}
        />
      </svg>
    </div>
  );
}
