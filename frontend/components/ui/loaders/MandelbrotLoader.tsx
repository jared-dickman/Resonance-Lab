'use client';

import { motion } from 'framer-motion';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function MandelbrotLoader({ size = 'md' }: LoaderProps) {
  const dimension = LOADER_SIZE[size];
  const containerSize = dimension * 0.8;
  const centerX = dimension / 2;
  const centerY = dimension / 2;

  const resolution = 40;
  const maxIterations = 15;

  const mandelbrot = (cx: number, cy: number): number => {
    let x = 0;
    let y = 0;
    let iteration = 0;

    while (x * x + y * y <= 4 && iteration < maxIterations) {
      const xTemp = x * x - y * y + cx;
      y = 2 * x * y + cy;
      x = xTemp;
      iteration++;
    }

    return iteration;
  };

  const generateMandelbrotPoints = (zoom: number, offsetX: number, offsetY: number) => {
    const points: Array<{ x: number; y: number; iteration: number }> = [];
    const step = containerSize / resolution;

    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const screenX = i * step;
        const screenY = j * step;

        const cx = ((screenX - containerSize / 2) / (containerSize / 4)) * zoom + offsetX;
        const cy = ((screenY - containerSize / 2) / (containerSize / 4)) * zoom + offsetY;

        const iteration = mandelbrot(cx, cy);

        if (iteration < maxIterations) {
          points.push({
            x: screenX,
            y: screenY,
            iteration,
          });
        }
      }
    }

    return points;
  };

  const initialPoints = generateMandelbrotPoints(1, -0.5, 0);

  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex items-center justify-center"
      style={{ width: dimension, height: dimension }}
    >
      <svg
        width={dimension}
        height={dimension}
        viewBox={`0 0 ${dimension} ${dimension}`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <radialGradient id={`mandelbrot-glow-${size}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={SAPPHIRE[3]} stopOpacity="0.8" />
            <stop offset="50%" stopColor={SAPPHIRE[2]} stopOpacity="0.4" />
            <stop offset="100%" stopColor={SAPPHIRE[0]} stopOpacity="0" />
          </radialGradient>
        </defs>

        <g transform={`translate(${centerX - containerSize / 2}, ${centerY - containerSize / 2})`}>
          {/* Zoom effect background */}
          <motion.circle
            cx={containerSize / 2}
            cy={containerSize / 2}
            r={containerSize / 2}
            fill={`url(#mandelbrot-glow-${size})`}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Mandelbrot set points */}
          {initialPoints.map((point, index) => {
            const colorIndex = Math.min(
              SAPPHIRE.length - 1,
              Math.floor((point.iteration / maxIterations) * SAPPHIRE.length),
            );
            const size = Math.max(1.2, dimension * 0.015);

            return (
              <motion.circle
                key={index}
                cx={point.x}
                cy={point.y}
                r={size}
                fill={SAPPHIRE[colorIndex]}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.9, 0.6],
                  scale: [0, 1.2, 0.8],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: (point.iteration / maxIterations) * 0.5,
                  ease: 'easeInOut',
                }}
              />
            );
          })}

          {/* Zoom indicator rings */}
          {[0.3, 0.5, 0.7].map((scale, i) => (
            <motion.circle
              key={i}
              cx={containerSize / 2}
              cy={containerSize / 2}
              r={containerSize * scale}
              fill="none"
              stroke={SAPPHIRE[i + 1]}
              strokeWidth={1}
              strokeDasharray="4 4"
              animate={{
                scale: [1, 0.8, 1],
                opacity: [0.3, 0.6, 0.3],
                rotate: [0, 360],
              }}
              transition={{
                duration: 6 + i * 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          ))}
        </g>

        {/* Center focus point */}
        <motion.circle
          cx={centerX}
          cy={centerY}
          r={dimension * 0.03}
          fill={SAPPHIRE[3]}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>
    </div>
  );
}
