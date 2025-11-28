'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Settings, Sparkles } from 'lucide-react';
import { ChorusPedal } from '@/lib/audio/effects/pizzicato';
import { Knob, Footswitch, PedalChassis } from '@/components/effects/pizzicato/shared/PedalControls';
import { cn } from '@/lib/utils';

export interface ChorusPedalUIProps {
  pedal?: ChorusPedal;
  onStateChange?: (state: any) => void;
  className?: string;
}

export const ChorusPedalUI: React.FC<ChorusPedalUIProps> = ({
  pedal: externalPedal,
  onStateChange,
  className = '',
}) => {
  const [pedal] = useState(() => externalPedal || new ChorusPedal());
  const [enabled, setEnabled] = useState(true);
  const [rate, setRate] = useState(1.2);
  const [depth, setDepth] = useState(0.6);
  const [mix, setMix] = useState(0.5);
  const [selectedPreset, setSelectedPreset] = useState('ce2-classic');
  const [showSettings, setShowSettings] = useState(false);

  const presets = ChorusPedal.getPresets();

  useEffect(() => {
    pedal.setRate(rate);
    pedal.setDepth(depth);
    pedal.setMix(mix);
    pedal.setEnabled(enabled);
    onStateChange?.(pedal.getState());
  }, [rate, depth, mix, enabled, pedal, onStateChange]);

  const handlePresetLoad = (presetName: string) => {
    const preset = presets.find((p) => p.name === presetName);
    if (!preset) return;

    setSelectedPreset(presetName);
    setRate(preset.settings.rate);
    setDepth(preset.settings.depth);
    setMix(preset.settings.mix);
    pedal.loadPreset(presetName);
  };

  return (
    <div className={cn('relative', className)}>
      <PedalChassis gradientFrom="#7c3aed" gradientTo="#5b21b6" borderColor="#a78bfa">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-sapphire-300" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Chorus</h2>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-sapphire-800 hover:bg-sapphire-700 transition-colors"
          >
            <Settings className="w-5 h-5 text-sapphire-300" />
          </button>
        </div>

        {showSettings && (
          <motion.div
            className="mb-6 p-4 rounded-lg bg-sapphire-800/50 border border-sapphire-700"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <label className="block text-xs font-bold text-sapphire-300 uppercase mb-2">
              Legendary Shimmer
            </label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetLoad(preset.name)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                    selectedPreset === preset.name
                      ? 'bg-sapphire-500 text-white'
                      : 'bg-sapphire-900 text-sapphire-400 hover:bg-sapphire-800'
                  )}
                >
                  {preset.name.toUpperCase()}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-3 gap-6 mb-8">
          <Knob
            label="Rate"
            value={rate}
            onChange={setRate}
            min={0.1}
            max={10}
            color="#a78bfa"
            displayFormat={(v) => `${v.toFixed(1)}Hz`}
          />
          <Knob label="Depth" value={depth} onChange={setDepth} color="#c4b5fd" />
          <Knob label="Mix" value={mix} onChange={setMix} color="#ddd6fe" />
        </div>

        <div className="flex justify-center">
          <Footswitch enabled={enabled} onToggle={() => setEnabled(!enabled)} color="#a78bfa" />
        </div>

        <div className="mt-6 pt-4 border-t border-sapphire-800">
          <div className="flex items-center justify-between text-xs text-sapphire-300">
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
