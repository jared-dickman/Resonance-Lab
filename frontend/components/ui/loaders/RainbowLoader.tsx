'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function RainbowLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const strokeWidth = dim * 0.08;
  const spacing = strokeWidth * 1.2;

  // Generate arc paths from top-left to bottom-right
  const generateArc = (index: number) => {
    const radius = dim * 0.35 - spacing * index;
    const centerX = dim / 2;
    const centerY = dim / 2;

    // 180-degree arc from left to right
    const startX = centerX - radius;
    const endX = centerX + radius;
    const y = centerY;

    return `M ${startX} ${y} A ${radius} ${radius} 0 0 1 ${endX} ${y}`;
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center overflow-hidden', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim * 0.8} height={dim * 0.8} viewBox={`0 0 ${dim} ${dim}`}>
        <defs>
          {/* Vibrant shimmer gradient for each arc */}
          {SAPPHIRE.map((color, i) => (
            <linearGradient key={i} id={`rainbow-shimmer-${i}-${size}`}>
              <stop offset="0%" stopColor={color} stopOpacity="0.5" />
              <stop offset="50%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0.5" />
            </linearGradient>
          ))}
          {/* Moving shimmer highlight */}
          <linearGradient id={`rainbow-highlight-${size}`}>
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Concentric arcs - draw on sequentially */}
        {SAPPHIRE.map((color, i) => {
          const totalLength = Math.PI * (dim * 0.35 - spacing * i);

          return (
            <motion.path
              key={i}
              d={generateArc(i)}
              stroke={`url(#rainbow-shimmer-${i}-${size})`}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              initial={{
                pathLength: 0,
                opacity: 0,
              }}
              animate={{
                pathLength: [0, 1],
                opacity: [0, 1, 1],
              }}
              transition={{
                duration: 1.2,
                delay: i * 0.3,
                repeat: Infinity,
                repeatDelay: 0.8,
                ease: 'easeInOut',
              }}
            />
          );
        })}

        {/* Enhanced shimmer overlay - travels across arcs */}
        {SAPPHIRE.map((color, i) => (
          <motion.path
            key={`shimmer-${i}`}
            d={generateArc(i)}
            stroke={`url(#rainbow-highlight-${size})`}
            strokeWidth={strokeWidth * 0.6}
            fill="none"
            strokeLinecap="round"
            initial={{
              pathLength: 0,
              pathOffset: 0,
            }}
            animate={{
              pathLength: [0, 0.4, 0],
              pathOffset: [0, 0.6, 1],
            }}
            transition={{
              duration: 1.8,
              delay: i * 0.3 + 0.5,
              repeat: Infinity,
              repeatDelay: 0.8,
              ease: 'easeInOut',
            }}
            style={{
              opacity: 0.8,
            }}
          />
        ))}

        {/* Subtle pulse on outer arc */}
        <motion.circle
          cx={dim / 2}
          cy={dim / 2}
          r={dim * 0.05}
          fill={SAPPHIRE[3]}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 0.4, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ originX: `${dim / 2}px`, originY: `${dim / 2}px` }}
        />
      </svg>
    </div>
  );
}
