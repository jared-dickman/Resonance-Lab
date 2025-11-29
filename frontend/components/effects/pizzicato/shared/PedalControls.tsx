'use client';

/**
 * Shared pedal control components
 * Reusable Knobs and Footswitches for all pedals
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export interface KnobProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  color?: string;
  displayFormat?: (value: number) => string;
}

export const Knob: React.FC<KnobProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  color = '#fbbf24',
  displayFormat,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startValue = useRef(0);

  const rotation = ((value - min) / (max - min)) * 270 - 135;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startY.current = e.clientY;
    startValue.current = value;
    e.preventDefault();
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaY = startY.current - e.clientY;
      const sensitivity = (max - min) * 0.005;
      const newValue = Math.max(min, Math.min(max, startValue.current + deltaY * sensitivity));

      onChange(newValue);
    },
    [isDragging, min, max, onChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
    return undefined;
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const displayValue = displayFormat ? displayFormat(value) : Math.round(value * 100).toString();

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative cursor-pointer select-none"
        onMouseDown={handleMouseDown}
        style={{ width: 60, height: 60 }}
      >
        <motion.div
          className="absolute inset-0 rounded-full shadow-lg"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${color}, #1f2937)`,
            rotate: rotation,
            border: '3px solid #374151',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-4 bg-white rounded-full shadow-md"
            style={{ transformOrigin: 'center bottom' }}
          />
          <div className="absolute inset-0 m-4 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 shadow-inner" />
        </motion.div>

        {[0, 0.25, 0.5, 0.75, 1].map(pos => {
          const angle = pos * 270 - 135;
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * 32 + 30;
          const y = Math.sin(rad) * 32 + 30;

          return (
            <div
              key={pos}
              className="absolute w-1 h-1 bg-gray-600 rounded-full"
              style={{ left: x, top: y }}
            />
          );
        })}
      </div>

      <div className="text-xs font-bold text-gray-300 uppercase tracking-wider">{label}</div>
      <div className="text-xs text-gray-500 font-mono">{displayValue}</div>
    </div>
  );
};

export interface FootswitchProps {
  enabled: boolean;
  onToggle: () => void;
  color?: string;
}

export const Footswitch: React.FC<FootswitchProps> = ({ enabled, onToggle, color = '#ef4444' }) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        className="w-3 h-3 rounded-full shadow-lg"
        animate={{
          backgroundColor: enabled ? color : '#374151',
          boxShadow: enabled
            ? `0 0 10px ${color}, 0 0 20px ${color}88`
            : '0 2px 4px rgba(0,0,0,0.3)',
        }}
        transition={{ duration: 0.2 }}
      />

      <motion.button
        className="relative w-16 h-16 rounded-full shadow-xl focus:outline-none"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #6b7280, #1f2937)',
          border: '4px solid #374151',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95, y: 2 }}
        onClick={onToggle}
      >
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 shadow-inner" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-gray-600" />
        </div>
      </motion.button>
    </div>
  );
};

export interface PedalChassisProps {
  children: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
}

export const PedalChassis: React.FC<PedalChassisProps> = ({
  children,
  gradientFrom,
  gradientTo,
  borderColor,
}) => {
  return (
    <motion.div
      className="relative rounded-lg shadow-2xl overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
        border: `2px solid ${borderColor}`,
        padding: '2rem',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}

      {[
        { top: '1rem', left: '1rem' },
        { top: '1rem', right: '1rem' },
        { bottom: '1rem', left: '1rem' },
        { bottom: '1rem', right: '1rem' },
      ].map((pos, i) => (
        <div key={i} className="absolute w-3 h-3 rounded-full bg-gray-700 shadow-inner" style={pos}>
          <div className="absolute inset-0.5 rounded-full bg-gray-800" />
        </div>
      ))}
    </motion.div>
  );
};
