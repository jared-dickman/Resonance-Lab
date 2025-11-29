'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, LOADER_STROKE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function TerminalLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const stroke = LOADER_STROKE[size];
  const fontSize = dim * 0.14;
  const padding = dim * 0.1;
  const lineHeight = fontSize * 1.6;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        <rect
          x={stroke}
          y={stroke}
          width={dim - stroke * 2}
          height={dim - stroke * 2}
          rx={dim * 0.04}
          fill="#0a0a0a"
          stroke={SAPPHIRE[1]}
          strokeWidth={stroke}
        />

        <motion.g
          animate={{ y: [0, -lineHeight, -lineHeight, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <text
            x={padding}
            y={padding + fontSize}
            fontFamily="ui-monospace, monospace"
            fontSize={fontSize}
            fill={SAPPHIRE[1]}
            opacity="0.5"
          >
            initializing...
          </text>

          <text
            x={padding}
            y={padding + fontSize + lineHeight}
            fontFamily="ui-monospace, monospace"
            fontSize={fontSize}
            fill={SAPPHIRE[2]}
            opacity="0.6"
          >
            connecting...
          </text>

          <text
            x={padding}
            y={padding + fontSize + lineHeight * 2}
            fontFamily="ui-monospace, monospace"
            fontSize={fontSize}
            fill={SAPPHIRE[1]}
            opacity="0.5"
          >
            loading modules
          </text>
        </motion.g>

        <text
          x={padding}
          y={dim - padding - fontSize * 0.3}
          fontFamily="ui-monospace, monospace"
          fontSize={fontSize}
          fill={SAPPHIRE[3]}
        >
          &gt;
        </text>

        <motion.rect
          x={padding + fontSize * 0.8}
          y={dim - padding - fontSize * 1.1}
          width={fontSize * 0.5}
          height={fontSize}
          fill={SAPPHIRE[3]}
          animate={{ opacity: [1, 0, 1] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </svg>
    </div>
  );
}
