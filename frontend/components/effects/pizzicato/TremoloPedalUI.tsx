'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Settings, Activity } from 'lucide-react';
import { TremoloPedal } from '@/lib/audio/effects/pizzicato';
import { Knob, Footswitch, PedalChassis } from './shared/PedalControls';
import { cn } from '@/lib/utils';

export interface TremoloPedalUIProps {
  pedal?: TremoloPedal;
  onStateChange?: (state: any) => void;
  className?: string;
}

export const TremoloPedalUI: React.FC<TremoloPedalUIProps> = ({
  pedal: externalPedal,
  onStateChange,
  className = '',
}) => {
  const [pedal] = useState(() => externalPedal || new TremoloPedal());
  const [enabled, setEnabled] = useState(true);
  const [rate, setRate] = useState(4.0);
  const [depth, setDepth] = useState(0.5);
  const [selectedPreset, setSelectedPreset] = useState('fender-65');
  const [showSettings, setShowSettings] = useState(false);

  const presets = TremoloPedal.getPresets();

  useEffect(() => {
    pedal.setRate(rate);
    pedal.setDepth(depth);
    pedal.setEnabled(enabled);
    onStateChange?.(pedal.getState());
  }, [rate, depth, enabled, pedal, onStateChange]);

  const handlePresetLoad = (presetName: string) => {
    const preset = presets.find((p) => p.name === presetName);
    if (!preset) return;

    setSelectedPreset(presetName);
    setRate(preset.settings.rate);
    setDepth(preset.settings.depth);
    pedal.loadPreset(presetName);
  };

  return (
    <div className={cn('relative', className)}>
      <PedalChassis gradientFrom="#059669" gradientTo="#047857" borderColor="#10b981">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-emerald-300" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Tremolo</h2>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-emerald-900 hover:bg-emerald-800 transition-colors"
          >
            <Settings className="w-5 h-5 text-emerald-300" />
          </button>
        </div>

        {showSettings && (
          <motion.div
            className="mb-6 p-4 rounded-lg bg-emerald-900/50 border border-emerald-800"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <label className="block text-xs font-bold text-emerald-300 uppercase mb-2">
              Volume Waves
            </label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetLoad(preset.name)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                    selectedPreset === preset.name
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-950 text-emerald-400 hover:bg-emerald-900'
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
            label="Speed"
            value={rate}
            onChange={setRate}
            min={0.1}
            max={20}
            color="#10b981"
            displayFormat={(v) => `${v.toFixed(1)}Hz`}
          />
          <Knob label="Depth" value={depth} onChange={setDepth} color="#34d399" />
        </div>

        <div className="flex justify-center">
          <Footswitch enabled={enabled} onToggle={() => setEnabled(!enabled)} color="#10b981" />
        </div>

        <div className="mt-6 pt-4 border-t border-emerald-900">
          <div className="flex items-center justify-between text-xs text-emerald-300">
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
