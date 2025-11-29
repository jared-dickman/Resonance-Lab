'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

export function FlameLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];

  // Realistic fire colors: white core -> yellow -> orange -> red edges
  const fireColors = ['#93c5fd', '#60a5fa', '#3b82f6', '#1e40af'];

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox="0 0 100 100">
        {/* Outer flame layer - coolest (red/orange) */}
        <motion.path
          d="M35,80 Q30,55 35,40 Q38,28 42,22 Q45,30 48,25 Q52,18 55,15 Q58,20 62,25 Q65,30 68,22 Q72,28 75,40 Q80,55 75,80 Z"
          fill={fireColors[3]}
          opacity="0.6"
          animate={{
            d: [
              "M35,80 Q30,55 35,40 Q38,28 42,22 Q45,30 48,25 Q52,18 55,15 Q58,20 62,25 Q65,30 68,22 Q72,28 75,40 Q80,55 75,80 Z",
              "M33,80 Q28,52 33,38 Q36,25 40,18 Q43,26 46,20 Q50,12 53,10 Q56,16 60,22 Q63,28 66,20 Q70,26 73,38 Q78,52 73,80 Z",
              "M37,80 Q32,58 37,42 Q40,30 44,24 Q47,32 50,28 Q54,20 57,17 Q60,23 64,28 Q67,32 70,24 Q74,30 77,42 Q82,58 77,80 Z",
              "M34,80 Q29,54 34,39 Q37,27 41,20 Q44,28 47,23 Q51,15 54,12 Q57,18 61,24 Q64,29 67,21 Q71,27 74,39 Q79,54 74,80 Z",
              "M35,80 Q30,55 35,40 Q38,28 42,22 Q45,30 48,25 Q52,18 55,15 Q58,20 62,25 Q65,30 68,22 Q72,28 75,40 Q80,55 75,80 Z",
            ],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: [0.45, 0.05, 0.55, 0.95],
          }}
        />

        {/* Middle flame layer - warmer (orange) */}
        <motion.path
          d="M40,78 Q36,58 40,45 Q42,35 45,28 Q47,34 50,30 Q53,24 55,22 Q57,26 60,30 Q62,34 65,28 Q68,35 70,45 Q74,58 70,78 Z"
          fill={fireColors[2]}
          opacity="0.7"
          animate={{
            d: [
              "M40,78 Q36,58 40,45 Q42,35 45,28 Q47,34 50,30 Q53,24 55,22 Q57,26 60,30 Q62,34 65,28 Q68,35 70,45 Q74,58 70,78 Z",
              "M38,78 Q34,55 38,42 Q40,32 43,25 Q45,31 48,27 Q51,20 53,18 Q55,22 58,27 Q60,31 63,25 Q66,32 68,42 Q72,55 68,78 Z",
              "M42,78 Q38,60 42,47 Q44,37 47,30 Q49,36 52,32 Q55,26 57,24 Q59,28 62,32 Q64,36 67,30 Q70,37 72,47 Q76,60 72,78 Z",
              "M39,78 Q35,57 39,44 Q41,34 44,27 Q46,33 49,29 Q52,22 54,20 Q56,24 59,29 Q61,33 64,27 Q67,34 69,44 Q73,57 69,78 Z",
              "M40,78 Q36,58 40,45 Q42,35 45,28 Q47,34 50,30 Q53,24 55,22 Q57,26 60,30 Q62,34 65,28 Q68,35 70,45 Q74,58 70,78 Z",
            ],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: 0.08,
            ease: [0.45, 0.05, 0.55, 0.95],
          }}
        />

        {/* Inner flame layer - hot (yellow) */}
        <motion.path
          d="M44,76 Q41,60 44,48 Q46,40 48,35 Q50,40 52,36 Q54,30 55,28 Q56,32 58,36 Q60,40 62,35 Q64,40 66,48 Q69,60 66,76 Z"
          fill={fireColors[1]}
          opacity="0.8"
          animate={{
            d: [
              "M44,76 Q41,60 44,48 Q46,40 48,35 Q50,40 52,36 Q54,30 55,28 Q56,32 58,36 Q60,40 62,35 Q64,40 66,48 Q69,60 66,76 Z",
              "M43,76 Q40,58 43,46 Q45,38 47,32 Q49,37 51,33 Q53,27 54,25 Q55,29 57,33 Q59,37 61,32 Q63,38 65,46 Q68,58 65,76 Z",
              "M45,76 Q42,62 45,50 Q47,42 49,37 Q51,42 53,38 Q55,32 56,30 Q57,34 59,38 Q61,42 63,37 Q65,42 67,50 Q70,62 67,76 Z",
              "M44,76 Q41,59 44,47 Q46,39 48,34 Q50,39 52,35 Q54,29 55,27 Q56,31 58,35 Q60,39 62,34 Q64,39 66,47 Q69,59 66,76 Z",
              "M44,76 Q41,60 44,48 Q46,40 48,35 Q50,40 52,36 Q54,30 55,28 Q56,32 58,36 Q60,40 62,35 Q64,40 66,48 Q69,60 66,76 Z",
            ],
          }}
          transition={{
            duration: 0.45,
            repeat: Infinity,
            delay: 0.15,
            ease: [0.45, 0.05, 0.55, 0.95],
          }}
        />

        {/* Core flame - hottest (white/bright) */}
        <motion.path
          d="M48,74 Q46,62 48,52 Q49,46 51,42 Q52,45 53,43 Q54,38 55,36 Q56,40 57,43 Q58,45 59,42 Q60,46 61,52 Q63,62 61,74 Z"
          fill={fireColors[0]}
          opacity="0.9"
          animate={{
            d: [
              "M48,74 Q46,62 48,52 Q49,46 51,42 Q52,45 53,43 Q54,38 55,36 Q56,40 57,43 Q58,45 59,42 Q60,46 61,52 Q63,62 61,74 Z",
              "M47,74 Q45,60 47,50 Q48,44 50,40 Q51,43 52,41 Q53,36 54,34 Q55,38 56,41 Q57,43 58,40 Q59,44 60,50 Q62,60 60,74 Z",
              "M49,74 Q47,64 49,54 Q50,48 52,44 Q53,47 54,45 Q55,40 56,38 Q57,42 58,45 Q59,47 60,44 Q61,48 62,54 Q64,64 62,74 Z",
              "M48,74 Q46,61 48,51 Q49,45 51,41 Q52,44 53,42 Q54,37 55,35 Q56,39 57,42 Q58,44 59,41 Q60,45 61,51 Q63,61 61,74 Z",
              "M48,74 Q46,62 48,52 Q49,46 51,42 Q52,45 53,43 Q54,38 55,36 Q56,40 57,43 Q58,45 59,42 Q60,46 61,52 Q63,62 61,74 Z",
            ],
          }}
          transition={{
            duration: 0.35,
            repeat: Infinity,
            delay: 0.2,
            ease: [0.45, 0.05, 0.55, 0.95],
          }}
        />

        {/* Fire base glow */}
        <motion.ellipse
          cx="55"
          cy="78"
          rx="16"
          ry="3"
          fill={fireColors[2]}
          opacity="0.4"
          animate={{
            rx: [14, 18, 15, 17, 14],
            opacity: [0.3, 0.5, 0.35, 0.45, 0.3],
          }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}
