'use client';

/**
 * DelayPedalUI - The Edge's dotted eighth, Gilmour's ambient wash
 * MXR Carbon Copy, Boss DD-3, Strymon Timeline emulation
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Settings, Clock } from 'lucide-react';
import { DelayPedal } from '@/lib/audio/effects/pizzicato';
import { cn } from '@/lib/utils';

interface KnobProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  color?: string;
}

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
      <div className="text-xs text-gray-500 font-mono">
        {label === 'Time' ? `${Math.round(value * 1000)}ms` : Math.round(value * 100)}
      </div>
    </div>
  );
};

interface FootswitchProps {
  enabled: boolean;
  onToggle: () => void;
  color?: string;
}

const Footswitch: React.FC<FootswitchProps> = ({
  enabled,
  onToggle,
  color = 'var(--sapphire-500)',
}) => {
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

export interface DelayPedalUIProps {
  pedal?: DelayPedal;
  onStateChange?: (state: any) => void;
  className?: string;
}

export const DelayPedalUI: React.FC<DelayPedalUIProps> = ({
  pedal: externalPedal,
  onStateChange,
  className = '',
}) => {
  const [pedal] = useState(() => externalPedal || new DelayPedal());
  const [enabled, setEnabled] = useState(true);
  const [time, setTime] = useState(0.38);
  const [feedback, setFeedback] = useState(0.45);
  const [mix, setMix] = useState(0.35);
  const [selectedPreset, setSelectedPreset] = useState<string>('carbon-copy');
  const [showSettings, setShowSettings] = useState(false);

  const presets = DelayPedal.getPresets();

  useEffect(() => {
    pedal.setTime(time);
    pedal.setFeedback(feedback);
    pedal.setMix(mix);
    onStateChange?.(pedal.getState());
  }, [time, feedback, mix, pedal, onStateChange]);

  useEffect(() => {
    pedal.setEnabled(enabled);
    onStateChange?.(pedal.getState());
  }, [enabled, pedal, onStateChange]);

  const handlePresetLoad = (presetName: string) => {
    const preset = presets.find(p => p.name === presetName);
    if (!preset) return;

    setSelectedPreset(presetName);
    setTime(preset.settings.time);
    setFeedback(preset.settings.feedback);
    setMix(preset.settings.mix);

    pedal.loadPreset(presetName);
  };

  const handleToggle = () => {
    setEnabled(!enabled);
  };

  return (
    <div className={cn('relative', className)}>
      <motion.div
        className="relative rounded-lg shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--sapphire-900) 0%, var(--sapphire-800) 100%)',
          border: '2px solid var(--sapphire-500)',
          padding: '2rem',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Delay</h2>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-blue-900 hover:bg-blue-800 transition-colors"
          >
            <Settings className="w-5 h-5 text-blue-300" />
          </button>
        </div>

        {showSettings && (
          <motion.div
            className="mb-6 p-4 rounded-lg bg-blue-900/50 border border-blue-800"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div>
              <label className="block text-xs font-bold text-blue-300 uppercase mb-2">
                Legendary Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {presets.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetLoad(preset.name)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                      selectedPreset === preset.name
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-950 text-blue-400 hover:bg-blue-900'
                    )}
                  >
                    {preset.name.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-3 gap-6 mb-8">
          <Knob
            label="Time"
            value={time}
            onChange={setTime}
            min={0.005}
            max={2}
            color="var(--sapphire-500)"
          />
          <Knob
            label="Feedback"
            value={feedback}
            onChange={setFeedback}
            color="var(--sapphire-400)"
          />
          <Knob label="Mix" value={mix} onChange={setMix} color="var(--sapphire-300)" />
        </div>

        <div className="flex justify-center">
          <Footswitch enabled={enabled} onToggle={handleToggle} color="var(--sapphire-500)" />
        </div>

        <div className="mt-6 pt-4 border-t border-blue-900">
          <div className="flex items-center justify-between text-xs text-blue-300">
            <div className="flex items-center gap-2">
              {enabled ? (
                <Volume2 className="w-4 h-4 text-blue-400" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
              <span className="uppercase font-bold">{enabled ? 'Active' : 'Bypassed'}</span>
            </div>
            <span className="font-mono">{selectedPreset.toUpperCase()}</span>
          </div>
        </div>

        {[
          { top: '1rem', left: '1rem' },
          { top: '1rem', right: '1rem' },
          { bottom: '1rem', left: '1rem' },
          { bottom: '1rem', right: '1rem' },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-blue-950 shadow-inner"
            style={pos}
          >
            <div className="absolute inset-0.5 rounded-full bg-blue-900" />
          </div>
        ))}
      </motion.div>
    </div>
  );
};
