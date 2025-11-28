'use client';

/**
 * PedalboardUI - Visual container for multiple pedal effects
 * Supports drag-and-drop reordering and signal flow visualization
 */

import React, { useState, useCallback } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Plus, Trash2, GripVertical, Volume2, Power } from 'lucide-react';
import type { PedalSlot } from '@/lib/audio/effects/Pedalboard';
import { Pedalboard } from '@/lib/audio/effects/Pedalboard';
import { DistortionPedal } from '@/lib/audio/effects/DistortionPedal';
import { DistortionPedalUI } from '@/components/effects/DistortionPedalUI';
import { PedalVisualizer } from '@/components/effects/PedalVisualizer';
import { cn } from '@/lib/utils';

interface PedalboardUIProps {
  pedalboard?: Pedalboard;
  showVisualizer?: boolean;
  className?: string;
}

/**
 * Individual pedal slot in the board
 */
const PedalSlotUI: React.FC<{
  slot: PedalSlot;
  onToggle: () => void;
  onRemove: () => void;
}> = ({ slot, onToggle, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      {/* Slot header */}
      <div className="flex items-center justify-between p-3 bg-gray-800/50">
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-gray-500 cursor-grab active:cursor-grabbing" />

          <button
            onClick={onToggle}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              slot.enabled
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-700 hover:bg-gray-600'
            )}
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

      {/* Pedal UI (expanded) */}
      {isExpanded && slot.pedal instanceof DistortionPedal && (
        <div className="p-4">
          <DistortionPedalUI pedal={slot.pedal} />
        </div>
      )}
    </motion.div>
  );
};

/**
 * Main pedalboard component
 */
export const PedalboardUI: React.FC<PedalboardUIProps> = ({
  pedalboard: externalPedalboard,
  showVisualizer = true,
  className = '',
}) => {
  const [pedalboard] = useState(() => externalPedalboard || new Pedalboard());
  const [slots, setSlots] = useState<PedalSlot[]>([]);
  const [masterVolume, setMasterVolume] = useState(0);
  const [bypassAll, setBypassAll] = useState(false);

  // Add a new distortion pedal
  const handleAddPedal = useCallback(() => {
    const id = `pedal-${Date.now()}`;
    const pedal = new DistortionPedal({
      preset: 'ts9',
    });

    pedalboard.addPedal(id, `Distortion ${slots.length + 1}`, pedal);
    setSlots(pedalboard.getPedals());
  }, [pedalboard, slots.length]);

  // Remove a pedal
  const handleRemovePedal = useCallback(
    (id: string) => {
      pedalboard.removePedal(id);
      setSlots(pedalboard.getPedals());
    },
    [pedalboard]
  );

  // Toggle pedal on/off
  const handleTogglePedal = useCallback(
    (id: string) => {
      pedalboard.togglePedal(id);
      setSlots([...pedalboard.getPedals()]); // Force re-render
    },
    [pedalboard]
  );

  // Reorder pedals via drag and drop
  const handleReorder = useCallback(
    (newOrder: PedalSlot[]) => {
      newOrder.forEach((slot, index) => {
        pedalboard.reorderPedal(slot.id, index);
      });
      setSlots(newOrder);
    },
    [pedalboard]
  );

  // Master controls
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
    <div className={cn(className)}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Guitar Pedalboard</h1>
          <p className="text-sm text-gray-400">
            {slots.length} {slots.length === 1 ? 'pedal' : 'pedals'} in chain
          </p>
        </div>

        <button
          onClick={handleAddPedal}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Pedal
        </button>
      </div>

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
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                bypassAll
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              )}
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
          <button
            onClick={handleAddPedal}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
          >
            Add Your First Pedal
          </button>
        </motion.div>
      ) : (
        <Reorder.Group
          axis="y"
          values={slots}
          onReorder={handleReorder}
          className="space-y-3"
        >
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
          <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
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
