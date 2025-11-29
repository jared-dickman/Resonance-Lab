'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Settings, Waves } from 'lucide-react';
import { ReverbPedal } from '@/lib/audio/effects/pizzicato';
import {
  Knob,
  Footswitch,
  PedalChassis,
} from '@/components/effects/pizzicato/shared/PedalControls';
import { cn } from '@/lib/utils';

export interface ReverbPedalUIProps {
  pedal?: ReverbPedal;
  onStateChange?: (state: any) => void;
  className?: string;
}

export const ReverbPedalUI: React.FC<ReverbPedalUIProps> = ({
  pedal: externalPedal,
  onStateChange,
  className = '',
}) => {
  const [pedal] = useState(() => externalPedal || new ReverbPedal());
  const [enabled, setEnabled] = useState(true);
  const [time, setTime] = useState(2.5);
  const [mix, setMix] = useState(0.3);
  const [selectedPreset, setSelectedPreset] = useState('bluesky-studio');
  const [showSettings, setShowSettings] = useState(false);

  const presets = ReverbPedal.getPresets();

  useEffect(() => {
    pedal.setTime(time);
    pedal.setMix(mix);
    pedal.setEnabled(enabled);
    onStateChange?.(pedal.getState());
  }, [time, mix, enabled, pedal, onStateChange]);

  const handlePresetLoad = (presetName: string) => {
    const preset = presets.find(p => p.name === presetName);
    if (!preset) return;

    setSelectedPreset(presetName);
    setTime(preset.settings.time);
    setMix(preset.settings.mix);
    pedal.loadPreset(presetName);
  };

  return (
    <div className={cn('relative', className)}>
      <PedalChassis gradientFrom="#1e293b" gradientTo="#0f172a" borderColor="#475569">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Waves className="w-6 h-6 text-slate-400" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Reverb</h2>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <Settings className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        {showSettings && (
          <motion.div
            className="mb-6 p-4 rounded-lg bg-slate-900/50 border border-slate-800"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
              Legendary Spaces
            </label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetLoad(preset.name)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                    selectedPreset === preset.name
                      ? 'bg-slate-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:bg-slate-900'
                  )}
                >
                  {preset.name.toUpperCase()}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-6 mb-8">
          <Knob
            label="Decay"
            value={time}
            onChange={setTime}
            min={0.01}
            max={10}
            color="#64748b"
            displayFormat={v => `${v.toFixed(1)}s`}
          />
          <Knob label="Mix" value={mix} onChange={setMix} color="#94a3b8" />
        </div>

        <div className="flex justify-center">
          <Footswitch enabled={enabled} onToggle={() => setEnabled(!enabled)} color="#64748b" />
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              {enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="uppercase font-bold">{enabled ? 'Active' : 'Bypassed'}</span>
            </div>
            <span className="font-mono">{selectedPreset.toUpperCase()}</span>
          </div>
        </div>
      </PedalChassis>
    </div>
  );
};
