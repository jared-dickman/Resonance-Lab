'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function RespawnLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const center = dim / 2;
  const cycleDuration = 3;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{ width: dim, height: dim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        <defs>
          <radialGradient id={`burst-${size}`}>
            <stop offset="0%" stopColor={SAPPHIRE[3]} stopOpacity="1" />
            <stop offset="50%" stopColor={SAPPHIRE[2]} stopOpacity="0.6" />
            <stop offset="100%" stopColor={SAPPHIRE[0]} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Link silhouette - forms from sparkles */}
        <motion.g
          animate={{
            opacity: [0, 0, 0.3, 1, 1],
            scale: [0.5, 0.5, 0.8, 1, 1],
          }}
          transition={{
            duration: cycleDuration,
            repeat: Infinity,
            times: [0, 0.4, 0.5, 0.7, 1],
            ease: 'easeOut',
          }}
          style={{ originX: `${center}px`, originY: `${center}px` }}
        >
          {/* Head */}
          <circle cx={center} cy={center - dim * 0.15} r={dim * 0.09} fill={SAPPHIRE[2]} />
          {/* Body/tunic */}
          <path
            d={`
              M ${center - dim * 0.1} ${center - dim * 0.05}
              L ${center} ${center - dim * 0.08}
              L ${center + dim * 0.1} ${center - dim * 0.05}
              L ${center + dim * 0.12} ${center + dim * 0.12}
              L ${center - dim * 0.12} ${center + dim * 0.12}
              Z
            `}
            fill={SAPPHIRE[2]}
          />
          {/* Legs */}
          <rect
            x={center - dim * 0.09}
            y={center + 0.12 * dim}
            width={dim * 0.07}
            height={dim * 0.14}
            fill={SAPPHIRE[1]}
          />
          <rect
            x={center + dim * 0.02}
            y={center + 0.12 * dim}
            width={dim * 0.07}
            height={dim * 0.14}
            fill={SAPPHIRE[1]}
          />
        </motion.g>

        {/* Sparkle burst - 8 four-pointed stars */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 8;
          const distance = dim * 0.25;
          const starSize = dim * 0.04;
          return (
            <motion.g
              key={`star-${i}`}
              animate={{
                opacity: [1, 1, 0],
                scale: [1.5, 1, 0.5],
              }}
              transition={{
                duration: cycleDuration,
                repeat: Infinity,
                times: [0, 0.3, 0.5],
                ease: 'easeOut',
                delay: i * 0.03,
              }}
              style={{
                originX: `${center + Math.cos(angle) * distance}px`,
                originY: `${center + Math.sin(angle) * distance}px`,
              }}
            >
              {/* Four-pointed star */}
              <path
                d={`
                  M ${center + Math.cos(angle) * distance} ${center + Math.sin(angle) * distance - starSize}
                  L ${center + Math.cos(angle) * distance + starSize * 0.3} ${center + Math.sin(angle) * distance}
                  L ${center + Math.cos(angle) * distance} ${center + Math.sin(angle) * distance + starSize}
                  L ${center + Math.cos(angle) * distance - starSize * 0.3} ${center + Math.sin(angle) * distance}
                  Z
                `}
                fill="#ffffff"
              />
            </motion.g>
          );
        })}

        {/* Central magic burst */}
        <motion.circle
          cx={center}
          cy={center}
          r={dim * 0.15}
          fill={`url(#burst-${size})`}
          animate={{
            scale: [2, 2, 0.5],
            opacity: [1, 0.6, 0],
          }}
          transition={{
            duration: cycleDuration,
            repeat: Infinity,
            times: [0, 0.3, 0.5],
            ease: 'easeOut',
          }}
        />

        {/* Triforce-inspired triangular sparkles */}
        {[0, 120, 240].map((rotation, i) => (
          <motion.path
            key={`tri-${i}`}
            d={`
              M ${center} ${center - dim * 0.2}
              L ${center + dim * 0.06} ${center - dim * 0.1}
              L ${center - dim * 0.06} ${center - dim * 0.1}
              Z
            `}
            fill={SAPPHIRE[3]}
            opacity={0.8}
            animate={{
              opacity: [0, 0, 0.8, 0.3],
              scale: [0, 0, 1.2, 1],
            }}
            transition={{
              duration: cycleDuration,
              repeat: Infinity,
              times: [0, 0.2, 0.4, 1],
              ease: 'easeOut',
              delay: i * 0.1,
            }}
            style={{
              originX: `${center}px`,
              originY: `${center}px`,
              transform: `rotate(${rotation}deg)`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
