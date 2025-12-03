'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function MoleculeLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const atomR = dim * 0.08;
  const bondLength = dim * 0.2;

  const atoms = [
    { x: dim / 2, y: dim / 2 - bondLength, color: SAPPHIRE[0] },
    { x: dim / 2 - bondLength * 0.866, y: dim / 2 + bondLength * 0.5, color: SAPPHIRE[1] },
    { x: dim / 2 + bondLength * 0.866, y: dim / 2 + bondLength * 0.5, color: SAPPHIRE[2] },
  ];

  const bonds: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 0],
  ];

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        {/* Bond lines between atoms */}
        {bonds.map(([a, b], i) => (
          <motion.line
            key={`bond-${i}`}
            x1={atoms[a]!.x}
            y1={atoms[a]!.y}
            x2={atoms[b]!.x}
            y2={atoms[b]!.y}
            stroke={SAPPHIRE[3]}
            strokeWidth="2"
            opacity="0.5"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          />
        ))}

        {/* Atoms with vibration */}
        {atoms.map((atom, i) => (
          <motion.circle
            key={`atom-${i}`}
            cx={atom.x}
            cy={atom.y}
            r={atomR}
            fill={atom.color}
            stroke={SAPPHIRE[3]}
            strokeWidth="1.5"
            animate={{
              x: [0, Math.cos(i * 2.09) * 2, 0],
              y: [0, Math.sin(i * 2.09) * 2, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2,
            }}
          />
        ))}

        {/* Center vibration indicator */}
        <motion.circle
          cx={dim / 2}
          cy={dim / 2}
          r={bondLength * 0.6}
          fill="none"
          stroke={SAPPHIRE[3]}
          strokeWidth="0.5"
          opacity="0.2"
          animate={{
            scale: [0.9, 1.1, 0.9],
            opacity: [0.1, 0.3, 0.1],
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
