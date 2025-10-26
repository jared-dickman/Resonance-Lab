'use client';

/**
 * Enhanced PedalboardUI - Multi-type pedal support + Legendary Rigs
 * Supports all pedal types: Distortion, Delay, Reverb, Chorus, Flanger, Tremolo, Compressor
 */

import React, { useState, useCallback } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Plus, Trash2, GripVertical, Volume2, Power, Star, X } from 'lucide-react';
import type { PedalSlot } from '@/lib/audio/effects/Pedalboard';
import { Pedalboard } from '@/lib/audio/effects/Pedalboard';
import { DistortionPedal } from '@/lib/audio/effects/DistortionPedal';
import {
  DelayPedal,
  ReverbPedal,
  ChorusPedal,
  FlangerPedal,
  TremoloPedal,
  CompressorPedal,
} from '@/lib/audio/effects/pizzicato';
import { loadLegendaryRig, LEGENDARY_RIGS } from '@/lib/audio/effects/LegendaryRigs';
import { DistortionPedalUI } from './DistortionPedalUI';
import {
  DelayPedalUI,
  ReverbPedalUI,
  ChorusPedalUI,
  FlangerPedalUI,
  TremoloPedalUI,
  CompressorPedalUI,
} from './pizzicato';
import { PedalVisualizer } from './PedalVisualizer';

interface PedalboardUIProps {
  pedalboard?: Pedalboard;
  showVisualizer?: boolean;
  className?: string;
}

type PedalType = 'distortion' | 'delay' | 'reverb' | 'chorus' | 'flanger' | 'tremolo' | 'compressor';

const PEDAL_TYPES: Array<{ type: PedalType; name: string; description: string; color: string }> = [
  { type: 'compressor', name: 'Compressor', description: 'Sustain & dynamics', color: 'orange' },
  { type: 'distortion', name: 'Distortion', description: 'Overdrive & fuzz', color: 'amber' },
  { type: 'chorus', name: 'Chorus', description: '80s shimmer', color: 'purple' },
  { type: 'flanger', name: 'Flanger', description: 'Jet plane swoosh', color: 'red' },
  { type: 'delay', name: 'Delay', description: 'Echoes & repeats', color: 'blue' },
  { type: 'reverb', name: 'Reverb', description: 'Space & ambience', color: 'slate' },
  { type: 'tremolo', name: 'Tremolo', description: 'Volume pulsation', color: 'emerald' },
];

const PedalSlotUI: React.FC<{
  slot: PedalSlot;
  onToggle: () => void;
  onRemove: () => void;
}> = ({ slot, onToggle, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderPedalUI = () => {
    if (slot.pedal instanceof DistortionPedal) {
      return <DistortionPedalUI pedal={slot.pedal} />;
    } else if (slot.pedal instanceof DelayPedal) {
      return <DelayPedalUI pedal={slot.pedal as any} />;
    } else if (slot.pedal instanceof ReverbPedal) {
      return <ReverbPedalUI pedal={slot.pedal as any} />;
    } else if (slot.pedal instanceof ChorusPedal) {
      return <ChorusPedalUI pedal={slot.pedal as any} />;
    } else if (slot.pedal instanceof FlangerPedal) {
      return <FlangerPedalUI pedal={slot.pedal as any} />;
    } else if (slot.pedal instanceof TremoloPedal) {
      return <TremoloPedalUI pedal={slot.pedal as any} />;
    } else if (slot.pedal instanceof CompressorPedal) {
      return <CompressorPedalUI pedal={slot.pedal as any} />;
    }
    return null;
  };

  return (
    <motion.div
      layout
      className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="flex items-center justify-between p-3 bg-gray-800/50">
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-gray-500 cursor-grab active:cursor-grabbing" />

          <button
            onClick={onToggle}
            className={`p-1.5 rounded-lg transition-colors ${
              slot.enabled
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <Power className="w-3 h-3 text-white" />
          </button>

          <div>
            <div className="text-sm font-bold text-white">{slot.name}</div>
            <div className="text-xs text-gray-500">Slot {slot.order + 1}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-white transition-colors"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>

          <button
            onClick={onRemove}
            className="p-1.5 rounded-lg bg-red-900/20 hover:bg-red-900/40 transition-colors"
          >
            <Trash2 className="w-3 h-3 text-red-500" />
          </button>
        </div>
      </div>

      {isExpanded && <div className="p-4">{renderPedalUI()}</div>}
    </motion.div>
  );
};

export const PedalboardUI: React.FC<PedalboardUIProps> = ({
  pedalboard: externalPedalboard,
  showVisualizer = true,
  className = '',
}) => {
  const [pedalboard] = useState(() => externalPedalboard || new Pedalboard());
  const [slots, setSlots] = useState<PedalSlot[]>([]);
  const [masterVolume, setMasterVolume] = useState(0);
  const [bypassAll, setBypassAll] = useState(false);
  const [showPedalSelector, setShowPedalSelector] = useState(false);
  const [showLegendaryRigs, setShowLegendaryRigs] = useState(false);

  const createPedal = (type: PedalType) => {
    switch (type) {
      case 'compressor':
        return new CompressorPedal({ preset: 'dyna-comp' });
      case 'distortion':
        return new DistortionPedal({ preset: 'ts9' });
      case 'chorus':
        return new ChorusPedal({ preset: 'ce2-classic' });
      case 'flanger':
        return new FlangerPedal({ preset: 'electric-mistress' });
      case 'delay':
        return new DelayPedal({ preset: 'carbon-copy' });
      case 'reverb':
        return new ReverbPedal({ preset: 'bluesky-studio' });
      case 'tremolo':
        return new TremoloPedal({ preset: 'fender-65' });
      default:
        return new DistortionPedal();
    }
  };

  const handleAddPedal = useCallback(
    (type: PedalType) => {
      const id = `pedal-${Date.now()}`;
      const pedal = createPedal(type);
      const pedalInfo = PEDAL_TYPES.find((p) => p.type === type);

      pedalboard.addPedal(id, pedalInfo?.name || 'Effect', pedal);
      setSlots(pedalboard.getPedals());
      setShowPedalSelector(false);
    },
    [pedalboard]
  );

  const handleLoadLegendaryRig = useCallback(
    (rigName: string) => {
      loadLegendaryRig(pedalboard, rigName);
      setSlots(pedalboard.getPedals());
      setShowLegendaryRigs(false);
    },
    [pedalboard]
  );

  const handleRemovePedal = useCallback(
    (id: string) => {
      pedalboard.removePedal(id);
      setSlots(pedalboard.getPedals());
    },
    [pedalboard]
  );

  const handleTogglePedal = useCallback(
    (id: string) => {
      pedalboard.togglePedal(id);
      setSlots([...pedalboard.getPedals()]);
    },
    [pedalboard]
  );

  const handleReorder = useCallback(
    (newOrder: PedalSlot[]) => {
      newOrder.forEach((slot, index) => {
        pedalboard.reorderPedal(slot.id, index);
      });
      setSlots(newOrder);
    },
    [pedalboard]
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      setMasterVolume(value);
      pedalboard.setMasterVolume(value);
    },
    [pedalboard]
  );

  const handleBypassAll = useCallback(() => {
    setBypassAll(!bypassAll);
    pedalboard.setBypassAll(!bypassAll);
  }, [pedalboard, bypassAll]);

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Guitar Pedalboard</h1>
          <p className="text-sm text-gray-400">
            {slots.length} {slots.length === 1 ? 'pedal' : 'pedals'} in chain
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLegendaryRigs(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            <Star className="w-4 h-4" />
            Legendary Rigs
          </button>

          <button
            onClick={() => setShowPedalSelector(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Pedal
          </button>
        </div>
      </div>

      {/* Pedal Selector Modal */}
      {showPedalSelector && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <motion.div
            className="bg-gray-900 rounded-xl p-8 max-w-3xl w-full mx-4 border border-gray-800"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Choose Your Pedal</h2>
              <button
                onClick={() => setShowPedalSelector(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {PEDAL_TYPES.map((pedalType) => (
                <button
                  key={pedalType.type}
                  onClick={() => handleAddPedal(pedalType.type)}
                  className="p-6 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-all hover:scale-105"
                >
                  <div className="text-lg font-bold text-white mb-1">{pedalType.name}</div>
                  <div className="text-sm text-gray-400">{pedalType.description}</div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Legendary Rigs Modal */}
      {showLegendaryRigs && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <motion.div
            className="bg-gray-900 rounded-xl p-8 max-w-4xl w-full mx-4 border border-purple-800"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-purple-500" />
                <h2 className="text-2xl font-bold text-white">Legendary Guitarist Rigs</h2>
              </div>
              <button
                onClick={() => setShowLegendaryRigs(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {LEGENDARY_RIGS.map((rig) => (
                <button
                  key={rig.name}
                  onClick={() => handleLoadLegendaryRig(rig.name)}
                  className="w-full p-6 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-purple-900/30 hover:to-gray-900 rounded-lg border border-gray-800 hover:border-purple-700 transition-all text-left group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-lg font-bold text-white mb-1">{rig.guitarist}</div>
                      <div className="text-sm text-purple-400 mb-2">"{rig.song}"</div>
                      <div className="text-sm text-gray-400 mb-3">{rig.description}</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {rig.pedals.map((pedal) => (
                          <span
                            key={pedal.id}
                            className="px-2 py-1 text-xs bg-gray-700 rounded text-gray-300"
                          >
                            {pedal.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="ml-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Master controls */}
      <motion.div
        className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBypassAll}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                bypassAll
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              {bypassAll ? 'Bypassed' : 'Active'}
            </button>
          </div>

          <div className="flex-1 flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-gray-400" />
            <input
              type="range"
              min="-20"
              max="6"
              step="0.1"
              value={masterVolume}
              onChange={handleVolumeChange}
              className="flex-1"
            />
            <div className="text-sm font-mono text-gray-400 w-16 text-right">
              {masterVolume > 0 ? '+' : ''}
              {masterVolume.toFixed(1)} dB
            </div>
          </div>
        </div>
      </motion.div>

      {/* Visualizer */}
      {showVisualizer && (
        <div className="mb-6">
          <PedalVisualizer audioNode={pedalboard.getOutput() as any} type="both" height={100} />
        </div>
      )}

      {/* Pedal slots */}
      {slots.length === 0 ? (
        <motion.div
          className="p-12 text-center bg-gray-900 rounded-lg border-2 border-dashed border-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-gray-500 mb-4">No pedals in the chain</div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowLegendaryRigs(true)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              Load Legendary Rig
            </button>
            <button
              onClick={() => setShowPedalSelector(true)}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
            >
              Add Your First Pedal
            </button>
          </div>
        </motion.div>
      ) : (
        <Reorder.Group axis="y" values={slots} onReorder={handleReorder} className="space-y-3">
          {slots.map((slot) => (
            <Reorder.Item key={slot.id} value={slot}>
              <PedalSlotUI
                slot={slot}
                onToggle={() => handleTogglePedal(slot.id)}
                onRemove={() => handleRemovePedal(slot.id)}
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {/* Signal flow indicator */}
      {slots.length > 0 && (
        <motion.div
          className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-xs font-bold text-gray-400 uppercase mb-2">Signal Flow</div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-mono flex-wrap">
            <span>INPUT</span>
            {slots.map((slot) => (
              <React.Fragment key={slot.id}>
                <span>→</span>
                <span className={slot.enabled ? 'text-green-500' : 'text-gray-600'}>
                  {slot.name}
                </span>
              </React.Fragment>
            ))}
            <span>→</span>
            <span>OUTPUT</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
