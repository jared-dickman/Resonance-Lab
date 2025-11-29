'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function FroggerLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const svgDim = dim * 0.8;

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
      <svg width={svgDim} height={svgDim} viewBox="0 0 100 100">
        {/* Lane lines background */}
        {[20, 40, 60, 80].map((y, i) => (
          <motion.line
            key={i}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke={SAPPHIRE[0]}
            strokeWidth="0.5"
            strokeDasharray="4 3"
            animate={{
              strokeDashoffset: [0, -14],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.3,
            }}
          />
        ))}

        {/* Log platforms */}
        {[25, 65].map((y, i) => (
          <motion.rect
            key={i}
            x="10"
            y={y - 3}
            width="30"
            height="6"
            rx="2"
            fill={SAPPHIRE[1]}
            animate={{
              x: [10, 70, 10],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 2,
            }}
          />
        ))}

        {/* Frog hopping animation */}
        <motion.g
          animate={{
            y: [0, -20, -35, -20, 0],
            scaleY: [1, 1.1, 0.8, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.25, 0.5, 0.75, 1],
          }}
          style={{ originX: '50px', originY: '70px' }}
        >
          {/* Frog body */}
          <motion.ellipse
            cx="50"
            cy="70"
            rx="8"
            ry="10"
            fill={SAPPHIRE[2]}
            animate={{
              scaleX: [1, 0.9, 1.2, 0.9, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              times: [0, 0.25, 0.5, 0.75, 1],
            }}
            style={{ originX: '50px', originY: '70px' }}
          />

          {/* Frog head */}
          <ellipse cx="50" cy="63" rx="6" ry="5" fill={SAPPHIRE[3]} />

          {/* Eyes */}
          <circle cx="47" cy="62" r="1.5" fill={SAPPHIRE[0]} />
          <circle cx="53" cy="62" r="1.5" fill={SAPPHIRE[0]} />

          {/* Back legs */}
          <motion.path
            d="M 42 75 Q 38 78 35 80"
            stroke={SAPPHIRE[2]}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            animate={{
              d: [
                'M 42 75 Q 38 78 35 80',
                'M 42 75 Q 38 76 36 77',
                'M 42 75 Q 38 72 35 70',
                'M 42 75 Q 38 76 36 77',
                'M 42 75 Q 38 78 35 80',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              times: [0, 0.25, 0.5, 0.75, 1],
            }}
          />
          <motion.path
            d="M 58 75 Q 62 78 65 80"
            stroke={SAPPHIRE[2]}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            animate={{
              d: [
                'M 58 75 Q 62 78 65 80',
                'M 58 75 Q 62 76 64 77',
                'M 58 75 Q 62 72 65 70',
                'M 58 75 Q 62 76 64 77',
                'M 58 75 Q 62 78 65 80',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              times: [0, 0.25, 0.5, 0.75, 1],
            }}
          />

          {/* Front legs */}
          <motion.path
            d="M 44 68 Q 40 70 38 72"
            stroke={SAPPHIRE[3]}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            animate={{
              d: [
                'M 44 68 Q 40 70 38 72',
                'M 44 68 Q 40 69 38 70',
                'M 44 68 Q 40 66 38 65',
                'M 44 68 Q 40 69 38 70',
                'M 44 68 Q 40 70 38 72',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              times: [0, 0.25, 0.5, 0.75, 1],
            }}
          />
          <motion.path
            d="M 56 68 Q 60 70 62 72"
            stroke={SAPPHIRE[3]}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            animate={{
              d: [
                'M 56 68 Q 60 70 62 72',
                'M 56 68 Q 60 69 62 70',
                'M 56 68 Q 60 66 62 65',
                'M 56 68 Q 60 69 62 70',
                'M 56 68 Q 60 70 62 72',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              times: [0, 0.25, 0.5, 0.75, 1],
            }}
          />
        </motion.g>
      </svg>
    </div>
  );
}
