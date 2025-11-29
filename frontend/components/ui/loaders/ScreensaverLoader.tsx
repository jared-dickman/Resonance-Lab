'use client';

import { useEffect, useRef, useState } from 'react';
import { SAPPHIRE, LOADER_SIZE, type LoaderProps } from './loader.constants';

export function ScreensaverLoader({ className, size = 'md' }: LoaderProps) {
  const dim = LOADER_SIZE[size];
  const logoWidth = dim * 0.4;
  const logoHeight = dim * 0.2;

  const [position, setPosition] = useState({ x: dim / 2 - logoWidth / 2, y: dim / 2 - logoHeight / 2 });
  const [colorIndex, setColorIndex] = useState(0);
  const velocityRef = useRef({ x: 1.5, y: 1.2 });

  useEffect(() => {
    const animate = () => {
      setPosition(prev => {
        let newX = prev.x + velocityRef.current.x;
        let newY = prev.y + velocityRef.current.y;
        let bounced = false;

        // Check horizontal bounds
        if (newX <= 0) {
          newX = 0;
          velocityRef.current.x *= -1;
          bounced = true;
        } else if (newX + logoWidth >= dim) {
          newX = dim - logoWidth;
          velocityRef.current.x *= -1;
          bounced = true;
        }

        // Check vertical bounds
        if (newY <= 0) {
          newY = 0;
          velocityRef.current.y *= -1;
          bounced = true;
        } else if (newY + logoHeight >= dim) {
          newY = dim - logoHeight;
          velocityRef.current.y *= -1;
          bounced = true;
        }

        // Change color on bounce
        if (bounced) {
          setColorIndex(prev => (prev + 1) % SAPPHIRE.length);
        }

        return { x: newX, y: newY };
      });
    };

    const interval = setInterval(animate, 16); // ~60fps
    return () => clearInterval(interval);
  }, [dim, logoWidth, logoHeight]);

  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{ width: dim, height: dim, position: 'relative', overflow: 'hidden' }}
    >
      <div
        style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
          width: logoWidth,
          height: logoHeight,
          backgroundColor: SAPPHIRE[colorIndex],
          borderRadius: dim * 0.02,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: dim * 0.12,
          fontWeight: 'bold',
          color: 'white',
          transition: 'background-color 0.3s ease',
          boxShadow: `0 0 ${dim * 0.08}px ${SAPPHIRE[colorIndex]}`,
        }}
      >
        RL
      </div>
    </div>
  );
}
