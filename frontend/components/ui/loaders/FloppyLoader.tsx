'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function FloppyLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];

  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{
        width: dim,
        height: dim,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <svg width={dim * 0.8} height={dim * 0.8} viewBox="0 0 100 100">
        <defs>
          <linearGradient id={`floppy-disk-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={SAPPHIRE[2]} />
            <stop offset="100%" stopColor={SAPPHIRE[1]} />
          </linearGradient>
          <linearGradient id={`floppy-label-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={SAPPHIRE[3]} />
            <stop offset="100%" stopColor={SAPPHIRE[2]} />
          </linearGradient>
        </defs>

        {/* Main floppy body */}
        <rect
          x="15"
          y="10"
          width="70"
          height="80"
          rx="3"
          fill={`url(#floppy-disk-${size})`}
          stroke={SAPPHIRE[0]}
          strokeWidth="1"
        />

        {/* Top label area */}
        <rect
          x="20"
          y="15"
          width="60"
          height="28"
          rx="2"
          fill={`url(#floppy-label-${size})`}
          opacity="0.8"
        />

        {/* Label lines with write animation */}
        {[0, 1, 2].map((i) => (
          <motion.line
            key={i}
            x1="25"
            y1={22 + i * 6}
            x2="75"
            y2={22 + i * 6}
            stroke={SAPPHIRE[0]}
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 1, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          />
        ))}

        {/* Metal shutter slider */}
        <motion.g
          animate={{
            x: [0, -8, -8, 0],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.3, 0.7, 1],
          }}
        >
          <rect
            x="20"
            y="50"
            width="60"
            height="25"
            rx="1"
            fill={SAPPHIRE[0]}
            stroke={SAPPHIRE[1]}
            strokeWidth="1"
          />
          {/* Shutter ridges */}
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1={30 + i * 10}
              y1="52"
              x2={30 + i * 10}
              y2="73"
              stroke={SAPPHIRE[1]}
              strokeWidth="0.8"
              opacity="0.6"
            />
          ))}
        </motion.g>

        {/* Disk opening (exposed when slider moves) */}
        <motion.ellipse
          cx="45"
          cy="62"
          rx="10"
          ry="10"
          fill={SAPPHIRE[3]}
          opacity="0"
          animate={{
            opacity: [0, 0, 0.8, 0.8, 0],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.3, 0.5, 0.7, 1],
          }}
        >
          {/* Spinning disk inside */}
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 45 62"
            to="360 45 62"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </motion.ellipse>

        {/* Write protect notch */}
        <rect x="82" y="68" width="3" height="8" fill={SAPPHIRE[0]} rx="0.5" />

        {/* Bottom notch */}
        <rect x="15" y="84" width="12" height="6" fill={SAPPHIRE[0]} />

        {/* Read/write activity indicator */}
        <motion.circle
          cx="88"
          cy="20"
          r="3"
          fill={SAPPHIRE[3]}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>
    </div>
  );
}
