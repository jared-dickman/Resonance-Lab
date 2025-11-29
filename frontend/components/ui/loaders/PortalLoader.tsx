'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function PortalLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const center = dim / 2;

  // Portal positions (left and right)
  const leftPortalX = dim * 0.25;
  const rightPortalX = dim * 0.75;
  const portalY = center;
  const portalRadius = dim * 0.15;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} style={{ display: 'block' }}>
        <defs>
          {/* Blue portal gradient (SAPPHIRE palette) */}
          <radialGradient id={`blue-portal-${size}`} cx="50%" cy="50%">
            <stop offset="0%" stopColor={SAPPHIRE[0]} stopOpacity="0.2" />
            <stop offset="40%" stopColor={SAPPHIRE[1]} stopOpacity="0.6" />
            <stop offset="70%" stopColor={SAPPHIRE[2]} stopOpacity="0.9" />
            <stop offset="100%" stopColor={SAPPHIRE[3]} stopOpacity="1" />
          </radialGradient>

          {/* Orange portal gradient (complementary to blue) */}
          <radialGradient id={`orange-portal-${size}`} cx="50%" cy="50%">
            <stop offset="0%" stopColor="#ea580c" stopOpacity="0.2" />
            <stop offset="40%" stopColor="#f97316" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#fb923c" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fdba74" stopOpacity="1" />
          </radialGradient>

          {/* Vortex glow filter */}
          <filter id={`glow-${size}`}>
            <feGaussianBlur stdDeviation={dim * 0.02} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Left Portal (Blue) */}
        <g>
          {/* Portal outer ring */}
          <motion.circle
            cx={leftPortalX}
            cy={portalY}
            r={portalRadius * 1.15}
            fill="none"
            stroke={SAPPHIRE[2]}
            strokeWidth={dim * 0.015}
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Swirling vortex layers */}
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.ellipse
              key={`blue-vortex-${i}`}
              cx={leftPortalX}
              cy={portalY}
              rx={portalRadius * (0.9 - i * 0.15)}
              ry={portalRadius * (0.5 - i * 0.08)}
              fill={`url(#blue-portal-${size})`}
              filter={`url(#glow-${size})`}
              animate={{
                rotate: [0, 360],
                opacity: [0.7, 0.9, 0.7],
              }}
              transition={{
                rotate: {
                  duration: 3 - i * 0.3,
                  repeat: Infinity,
                  ease: 'linear',
                },
                opacity: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.1,
                },
              }}
            />
          ))}

          {/* Portal center glow */}
          <motion.circle
            cx={leftPortalX}
            cy={portalY}
            r={portalRadius * 0.3}
            fill={SAPPHIRE[0]}
            opacity={0.8}
            filter={`url(#glow-${size})`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.6, 0.9, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </g>

        {/* Right Portal (Orange) */}
        <g>
          {/* Portal outer ring */}
          <motion.circle
            cx={rightPortalX}
            cy={portalY}
            r={portalRadius * 1.15}
            fill="none"
            stroke="#fb923c"
            strokeWidth={dim * 0.015}
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />

          {/* Swirling vortex layers */}
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.ellipse
              key={`orange-vortex-${i}`}
              cx={rightPortalX}
              cy={portalY}
              rx={portalRadius * (0.9 - i * 0.15)}
              ry={portalRadius * (0.5 - i * 0.08)}
              fill={`url(#orange-portal-${size})`}
              filter={`url(#glow-${size})`}
              animate={{
                rotate: [0, -360],
                opacity: [0.7, 0.9, 0.7],
              }}
              transition={{
                rotate: {
                  duration: 3 - i * 0.3,
                  repeat: Infinity,
                  ease: 'linear',
                },
                opacity: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.1,
                },
              }}
            />
          ))}

          {/* Portal center glow */}
          <motion.circle
            cx={rightPortalX}
            cy={portalY}
            r={portalRadius * 0.3}
            fill="#ea580c"
            opacity={0.8}
            filter={`url(#glow-${size})`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.6, 0.9, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />
        </g>

        {/* Traveling particles between portals */}
        {Array.from({ length: 6 }).map((_, i) => {
          const isReverse = i % 2 === 0;
          const startX = isReverse ? rightPortalX : leftPortalX;
          const endX = isReverse ? leftPortalX : rightPortalX;
          const arcHeight = (Math.random() - 0.5) * dim * 0.3;

          return (
            <motion.circle
              key={`particle-${i}`}
              r={dim * 0.01}
              fill={isReverse ? '#fb923c' : SAPPHIRE[2]}
              filter={`url(#glow-${size})`}
              animate={{
                cx: [startX, center, endX],
                cy: [portalY, portalY + arcHeight, portalY],
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1.5, 1, 0.5],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.4,
              }}
            />
          );
        })}

        {/* Connection energy beam */}
        <motion.line
          x1={leftPortalX}
          y1={portalY}
          x2={rightPortalX}
          y2={portalY}
          stroke={SAPPHIRE[1]}
          strokeWidth={dim * 0.005}
          strokeDasharray={`${dim * 0.05} ${dim * 0.03}`}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            strokeDashoffset: [0, dim * 0.08],
          }}
          transition={{
            opacity: {
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            },
            strokeDashoffset: {
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            },
          }}
        />
      </svg>
    </div>
  );
}
