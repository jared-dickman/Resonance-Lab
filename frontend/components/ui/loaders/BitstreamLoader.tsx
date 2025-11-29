'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function BitstreamLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const streams = 3;
  const bitsPerStream = 12;
  const dotSize = dim / 16;
  const streamSpacing = dim / (streams + 1);

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        <defs>
          <filter id="bitstreamGlow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {Array.from({ length: streams }).map((_, streamIdx) => {
          const y = streamSpacing * (streamIdx + 1);

          return (
            <g key={streamIdx}>
              {/* Stream path */}
              <line
                x1={dim * 0.1}
                y1={y}
                x2={dim * 0.9}
                y2={y}
                stroke={SAPPHIRE[streamIdx]}
                strokeWidth={0.5}
                opacity={0.3}
              />

              {/* Bits */}
              {Array.from({ length: bitsPerStream }).map((_, bitIdx) => {
                const delay = bitIdx * 0.1;
                const x = dim * 0.1 + (bitIdx / bitsPerStream) * (dim * 0.8);

                return (
                  <motion.circle
                    key={`${streamIdx}-${bitIdx}`}
                    cx={x}
                    cy={y}
                    r={dotSize}
                    fill={SAPPHIRE[streamIdx]}
                    filter="url(#bitstreamGlow)"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      scale: [0, 1.2, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay,
                      ease: 'easeInOut',
                    }}
                  />
                );
              })}

              {/* Leading particle */}
              <motion.circle
                cx={dim * 0.1}
                cy={y}
                r={dotSize * 1.5}
                fill={SAPPHIRE[streamIdx]}
                opacity={0.8}
                filter="url(#bitstreamGlow)"
                animate={{
                  cx: [dim * 0.1, dim * 0.9],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
