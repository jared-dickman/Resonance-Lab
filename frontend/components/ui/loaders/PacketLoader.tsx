'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function PacketLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const lanes = 4;
  const packetSize = dim / 8;
  const laneHeight = dim / (lanes * 2);

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        {Array.from({ length: lanes }).map((_, i) => {
          const y = (i * dim) / lanes + dim / lanes / 2 - laneHeight / 2;
          const trackPadding = packetSize;

          return (
            <g key={i}>
              {/* Track */}
              <rect
                x={trackPadding}
                y={y}
                width={dim - trackPadding * 2}
                height={laneHeight}
                fill={SAPPHIRE[i]}
                opacity={0.15}
                rx={laneHeight / 2}
              />

              {/* Packet */}
              <motion.rect
                x={trackPadding}
                y={y}
                width={packetSize}
                height={laneHeight}
                fill={SAPPHIRE[i]}
                rx={laneHeight / 3}
                animate={{
                  x: [trackPadding, dim - trackPadding - packetSize],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'linear',
                }}
              />

              {/* Trailing glow */}
              <motion.rect
                x={trackPadding}
                y={y}
                width={packetSize * 0.5}
                height={laneHeight}
                fill={SAPPHIRE[i]}
                opacity={0.4}
                rx={laneHeight / 3}
                animate={{
                  x: [trackPadding, dim - trackPadding - packetSize],
                  opacity: [0.4, 0],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  delay: i * 0.2,
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
