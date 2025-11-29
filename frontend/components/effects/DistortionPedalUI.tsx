'use client';

/**
 * DistortionPedalUI - Beautiful 3D-style interactive guitar pedal
 * Realistic knobs, switches, and LED indicators
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Settings, Zap } from 'lucide-react';
import type { DistortionAlgorithm } from '@/lib/audio/effects/DistortionPedal';
import { DistortionPedal } from '@/lib/audio/effects/DistortionPedal';
import { cn } from '@/lib/utils';

interface KnobProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  color?: string;
}

/**
 * Realistic rotary knob control
 */
const Knob: React.FC<KnobProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  color = '#fbbf24',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startValue = useRef(0);

  // Map value to rotation (-135deg to 135deg)
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
      const sensitivity = 0.005;
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

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative cursor-pointer select-none"
        onMouseDown={handleMouseDown}
        style={{ width: 60, height: 60 }}
      >
        {/* Knob body */}
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
          {/* Knob indicator */}
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-4 bg-white rounded-full shadow-md"
            style={{ transformOrigin: 'center bottom' }}
          />

          {/* Center cap */}
          <div className="absolute inset-0 m-4 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 shadow-inner" />
        </motion.div>

        {/* Degree markers */}
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

      {/* Label */}
      <div className="text-xs font-bold text-gray-300 uppercase tracking-wider">{label}</div>

      {/* Value display */}
      <div className="text-xs text-gray-500 font-mono">{Math.round(value * 100)}</div>
    </div>
  );
};

interface FootswitchProps {
  enabled: boolean;
  onToggle: () => void;
  color?: string;
}

/**
 * Realistic footswitch with LED
 */
const Footswitch: React.FC<FootswitchProps> = ({ enabled, onToggle, color = '#ef4444' }) => {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* LED indicator */}
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

      {/* Footswitch */}
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
        {/* Inner circle */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 shadow-inner" />

        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-gray-600" />
        </div>
      </motion.button>
    </div>
  );
};

export interface DistortionPedalUIProps {
  pedal?: DistortionPedal;
  onStateChange?: (state: any) => void;
  className?: string;
}

/**
 * Main distortion pedal component
 */
export const DistortionPedalUI: React.FC<DistortionPedalUIProps> = ({
  pedal: externalPedal,
  onStateChange,
  className = '',
}) => {
  const [pedal] = useState(() => externalPedal || new DistortionPedal());
  const [enabled, setEnabled] = useState(true);
  const [drive, setDrive] = useState(0.6);
  const [tone, setTone] = useState(0.65);
  const [level, setLevel] = useState(0.75);
  const [mix, setMix] = useState(1.0);
  const [algorithm, setAlgorithm] = useState<DistortionAlgorithm>('overdrive');
  const [selectedPreset, setSelectedPreset] = useState<string>('ts9');
  const [showSettings, setShowSettings] = useState(false);

  const presets = DistortionPedal.getPresets();

  // Update pedal when controls change
  useEffect(() => {
    pedal.setDrive(drive);
    pedal.setTone(tone);
    pedal.setLevel(level);
    pedal.setMix(mix);
    onStateChange?.(pedal.getState());
  }, [drive, tone, level, mix, pedal, onStateChange]);

  useEffect(() => {
    pedal.setAlgorithm(algorithm);
    onStateChange?.(pedal.getState());
  }, [algorithm, pedal, onStateChange]);

  useEffect(() => {
    pedal.setEnabled(enabled);
    onStateChange?.(pedal.getState());
  }, [enabled, pedal, onStateChange]);

  const handlePresetLoad = (presetName: string) => {
    const preset = presets.find(p => p.name === presetName);
    if (!preset) return;

    setSelectedPreset(presetName);
    setAlgorithm(preset.algorithm);
    setDrive(preset.settings.drive);
    setTone(preset.settings.tone);
    setLevel(preset.settings.level);
    setMix(preset.settings.mix);

    pedal.loadPreset(presetName);
  };

  const handleToggle = () => {
    setEnabled(!enabled);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Pedal chassis */}
      <motion.div
        className="relative rounded-lg shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
          border: '2px solid #374151',
          padding: '2rem',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-sapphire-400" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Distortion</h2>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Algorithm/Preset selector */}
        {showSettings && (
          <motion.div
            className="mb-6 p-4 rounded-lg bg-gray-800/50 border border-gray-700"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="mb-3">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                Algorithm
              </label>
              <select
                value={algorithm}
                onChange={e => setAlgorithm(e.target.value as DistortionAlgorithm)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-sapphire-400"
              >
                <option value="tube">Tube</option>
                <option value="fuzz">Fuzz</option>
                <option value="overdrive">Overdrive</option>
                <option value="heavy">Heavy</option>
                <option value="soft-clip">Soft Clip</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {presets.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetLoad(preset.name)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                      selectedPreset === preset.name
                        ? 'bg-sapphire-500 text-white'
                        : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                    )}
                  >
                    {preset.name.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Knobs section */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Knob label="Drive" value={drive} onChange={setDrive} color="#ef4444" />
          <Knob label="Tone" value={tone} onChange={setTone} color="#fbbf24" />
          <Knob label="Level" value={level} onChange={setLevel} color="#10b981" />
          <Knob label="Mix" value={mix} onChange={setMix} color="var(--sapphire-500)" />
        </div>

        {/* Footswitch */}
        <div className="flex justify-center">
          <Footswitch enabled={enabled} onToggle={handleToggle} />
        </div>

        {/* Status bar */}
        <div className="mt-6 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              {enabled ? (
                <Volume2 className="w-4 h-4 text-sapphire-400" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
              <span className="uppercase font-bold">{enabled ? algorithm : 'Bypassed'}</span>
            </div>
            <span className="font-mono">{selectedPreset.toUpperCase()}</span>
          </div>
        </div>

        {/* Screws (cosmetic detail) */}
        {[
          { top: '1rem', left: '1rem' },
          { top: '1rem', right: '1rem' },
          { bottom: '1rem', left: '1rem' },
          { bottom: '1rem', right: '1rem' },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-gray-700 shadow-inner"
            style={pos}
          >
            <div className="absolute inset-0.5 rounded-full bg-gray-800" />
          </div>
        ))}
      </motion.div>
    </div>
  );
};
