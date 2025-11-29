'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Settings, Zap } from 'lucide-react';
import { FlangerPedal } from '@/lib/audio/effects/pizzicato';
import {
  Knob,
  Footswitch,
  PedalChassis,
} from '@/components/effects/pizzicato/shared/PedalControls';
import { cn } from '@/lib/utils';

export interface FlangerPedalUIProps {
  pedal?: FlangerPedal;
  onStateChange?: (state: any) => void;
  className?: string;
}

export const FlangerPedalUI: React.FC<FlangerPedalUIProps> = ({
  pedal: externalPedal,
  onStateChange,
  className = '',
}) => {
  const [pedal] = useState(() => externalPedal || new FlangerPedal());
  const [enabled, setEnabled] = useState(true);
  const [rate, setRate] = useState(0.3);
  const [depth, setDepth] = useState(0.7);
  const [feedback, setFeedback] = useState(0.6);
  const [mix, setMix] = useState(0.5);
  const [selectedPreset, setSelectedPreset] = useState('electric-mistress');
  const [showSettings, setShowSettings] = useState(false);

  const presets = FlangerPedal.getPresets();

  useEffect(() => {
    pedal.setRate(rate);
    pedal.setDepth(depth);
    pedal.setFeedback(feedback);
    pedal.setMix(mix);
    pedal.setEnabled(enabled);
    onStateChange?.(pedal.getState());
  }, [rate, depth, feedback, mix, enabled, pedal, onStateChange]);

  const handlePresetLoad = (presetName: string) => {
    const preset = presets.find(p => p.name === presetName);
    if (!preset) return;

    setSelectedPreset(presetName);
    setRate(preset.settings.rate);
    setDepth(preset.settings.depth);
    setFeedback(preset.settings.feedback);
    setMix(preset.settings.mix);
    pedal.loadPreset(presetName);
  };

  return (
    <div className={cn('relative', className)}>
      <PedalChassis gradientFrom="#dc2626" gradientTo="#991b1b" borderColor="#f87171">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-red-300" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Flanger</h2>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-red-900 hover:bg-red-800 transition-colors"
          >
            <Settings className="w-5 h-5 text-red-300" />
          </button>
        </div>

        {showSettings && (
          <motion.div
            className="mb-6 p-4 rounded-lg bg-red-900/50 border border-red-800"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <label className="block text-xs font-bold text-red-300 uppercase mb-2">
              Jet Plane Swoosh
            </label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetLoad(preset.name)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                    selectedPreset === preset.name
                      ? 'bg-red-600 text-white'
                      : 'bg-red-950 text-red-400 hover:bg-red-900'
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
            label="Rate"
            value={rate}
            onChange={setRate}
            min={0.1}
            max={10}
            color="#f87171"
            displayFormat={v => `${v.toFixed(1)}Hz`}
          />
          <Knob label="Depth" value={depth} onChange={setDepth} color="#fca5a5" />
          <Knob label="Feedback" value={feedback} onChange={setFeedback} color="#fecaca" />
          <Knob label="Mix" value={mix} onChange={setMix} color="#fee2e2" />
        </div>

        <div className="flex justify-center">
          <Footswitch enabled={enabled} onToggle={() => setEnabled(!enabled)} color="#f87171" />
        </div>

        <div className="mt-6 pt-4 border-t border-red-900">
          <div className="flex items-center justify-between text-xs text-red-300">
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
