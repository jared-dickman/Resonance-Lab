'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, LOADER_STROKE, type LoaderProps } from '@/components/ui/loaders/loader.constants';
import { useState, useEffect } from 'react';

export function NixieLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const stroke = LOADER_STROKE[size];
  const tubeWidth = dim * 0.28;
  const tubeHeight = dim * 0.85;
  const fontSize = dim * 0.35;

  const [digits, setDigits] = useState([0, 1, 2]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDigits(prev => prev.map((d, i) => {
        if (Math.random() > 0.7) {
          return Math.floor(Math.random() * 10);
        }
        return d;
      }));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        <defs>
          <radialGradient id={`nixie-glow-${size}`}>
            <stop offset="0%" stopColor={SAPPHIRE[2]} stopOpacity="0.6" />
            <stop offset="50%" stopColor={SAPPHIRE[2]} stopOpacity="0.3" />
            <stop offset="100%" stopColor={SAPPHIRE[2]} stopOpacity="0" />
          </radialGradient>
          <filter id={`nixie-flicker-${size}`}>
            <feTurbulence baseFrequency="0.3" numOctaves="1" seed="2">
              <animate
                attributeName="seed"
                from="1"
                to="100"
                dur="0.5s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="0.5" />
          </filter>
        </defs>

        {[0, 1, 2].map((tubeIndex) => {
          const x = dim * 0.1 + tubeIndex * (tubeWidth + dim * 0.02);
          const y = (dim - tubeHeight) / 2;
          return (
            <g key={tubeIndex}>
              <motion.rect
                x={x}
                y={y}
                width={tubeWidth}
                height={tubeHeight}
                rx={tubeWidth * 0.15}
                fill={SAPPHIRE[0]}
                fillOpacity="0.2"
                stroke={SAPPHIRE[1]}
                strokeWidth={stroke}
                animate={{
                  strokeOpacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: tubeIndex * 0.2,
                }}
              />

              <motion.rect
                x={x}
                y={y}
                width={tubeWidth}
                height={tubeHeight}
                rx={tubeWidth * 0.15}
                fill={`url(#nixie-glow-${size})`}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: tubeIndex * 0.15,
                }}
              />

              <AnimatePresence mode="wait">
                <motion.text
                  key={digits[tubeIndex]}
                  x={x + tubeWidth / 2}
                  y={y + tubeHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily="monospace"
                  fontSize={fontSize}
                  fontWeight="bold"
                  fill={SAPPHIRE[3]}
                  initial={{ opacity: 0, y: y + tubeHeight / 2 - fontSize * 0.3 }}
                  animate={{
                    opacity: [0.4, 1, 0.7, 1, 0.8],
                    y: y + tubeHeight / 2,
                  }}
                  exit={{ opacity: 0, y: y + tubeHeight / 2 + fontSize * 0.3 }}
                  transition={{
                    opacity: {
                      duration: 1.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                    y: {
                      duration: 0.3,
                    }
                  }}
                  style={{
                    filter: `drop-shadow(0 0 ${dim * 0.08}px ${SAPPHIRE[2]}) url(#nixie-flicker-${size})`,
                  }}
                >
                  {digits[tubeIndex]}
                </motion.text>
              </AnimatePresence>

              <rect
                x={x + tubeWidth / 2 - stroke / 2}
                y={y - dim * 0.04}
                width={stroke}
                height={dim * 0.04}
                fill={SAPPHIRE[1]}
                opacity="0.6"
              />
              <rect
                x={x + tubeWidth / 2 - stroke / 2}
                y={y + tubeHeight}
                width={stroke}
                height={dim * 0.04}
                fill={SAPPHIRE[1]}
                opacity="0.6"
              />

              <motion.circle
                cx={x + tubeWidth / 2}
                cy={y - dim * 0.025}
                r={dim * 0.015}
                fill={SAPPHIRE[2]}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: tubeIndex * 0.2,
                }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
