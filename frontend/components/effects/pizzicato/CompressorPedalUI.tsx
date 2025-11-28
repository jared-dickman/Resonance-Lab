'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Settings, Gauge } from 'lucide-react';
import { CompressorPedal } from '@/lib/audio/effects/pizzicato';
import { Knob, Footswitch, PedalChassis } from './shared/PedalControls';
import { cn } from '@/lib/utils';

export interface CompressorPedalUIProps {
  pedal?: CompressorPedal;
  onStateChange?: (state: any) => void;
  className?: string;
}

export const CompressorPedalUI: React.FC<CompressorPedalUIProps> = ({
  pedal: externalPedal,
  onStateChange,
  className = '',
}) => {
  const [pedal] = useState(() => externalPedal || new CompressorPedal());
  const [enabled, setEnabled] = useState(true);
  const [threshold, setThreshold] = useState(-25);
  const [ratio, setRatio] = useState(4);
  const [attack, setAttack] = useState(0.005);
  const [release, setRelease] = useState(0.05);
  const [selectedPreset, setSelectedPreset] = useState('dyna-comp');
  const [showSettings, setShowSettings] = useState(false);

  const presets = CompressorPedal.getPresets();

  useEffect(() => {
    pedal.setThreshold(threshold);
    pedal.setRatio(ratio);
    pedal.setAttack(attack);
    pedal.setRelease(release);
    pedal.setEnabled(enabled);
    onStateChange?.(pedal.getState());
  }, [threshold, ratio, attack, release, enabled, pedal, onStateChange]);

  const handlePresetLoad = (presetName: string) => {
    const preset = presets.find((p) => p.name === presetName);
    if (!preset) return;

    setSelectedPreset(presetName);
    setThreshold(preset.settings.threshold);
    setRatio(preset.settings.ratio);
    setAttack(preset.settings.attack);
    setRelease(preset.settings.release);
    pedal.loadPreset(presetName);
  };

  return (
    <div className={cn('relative', className)}>
      <PedalChassis gradientFrom="#ea580c" gradientTo="#c2410c" borderColor="#fb923c">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Gauge className="w-6 h-6 text-sapphire-300" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Compressor</h2>
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
              Dynamics Control
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

        <div className="grid grid-cols-4 gap-4 mb-8">
          <Knob
            label="Threshold"
            value={threshold}
            onChange={setThreshold}
            min={-60}
            max={0}
            color="#fb923c"
            displayFormat={(v) => `${v.toFixed(0)}dB`}
          />
          <Knob
            label="Ratio"
            value={ratio}
            onChange={setRatio}
            min={1}
            max={20}
            color="#fdba74"
            displayFormat={(v) => `${v.toFixed(1)}:1`}
          />
          <Knob
            label="Attack"
            value={attack}
            onChange={setAttack}
            min={0}
            max={1}
            color="#fed7aa"
            displayFormat={(v) => `${(v * 1000).toFixed(0)}ms`}
          />
          <Knob
            label="Release"
            value={release}
            onChange={setRelease}
            min={0}
            max={1}
            color="#ffedd5"
            displayFormat={(v) => `${(v * 1000).toFixed(0)}ms`}
          />
        </div>

        <div className="flex justify-center">
          <Footswitch enabled={enabled} onToggle={() => setEnabled(!enabled)} color="#fb923c" />
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
