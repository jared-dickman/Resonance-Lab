/**
 * Audio effects library
 * Enterprise-grade guitar pedal effects with realistic DSP
 */

export { DistortionPedal } from '@/lib/audio/effects/DistortionPedal';
export type {
  DistortionAlgorithm,
  DistortionPreset,
  DistortionPedalConfig,
} from '@/lib/audio/effects/DistortionPedal';

export { Pedalboard } from '@/lib/audio/effects/Pedalboard';
export type { PedalSlot, PedalboardConfig } from '@/lib/audio/effects/Pedalboard';

// Legendary guitarist preset chains
export { loadLegendaryRig, getLegendaryRigs } from '@/lib/audio/effects/LegendaryRigs';
export type { LegendaryRigConfig } from '@/lib/audio/effects/LegendaryRigs';
export { LEGENDARY_RIGS } from '@/lib/audio/effects/LegendaryRigs';

// Pizzicato-based effects
export {
  DelayPedal,
  ReverbPedal,
  ChorusPedal,
  FlangerPedal,
  TremoloPedal,
  CompressorPedal,
} from '@/lib/audio/effects/pizzicato';
export type {
  DelayPreset,
  DelayPedalConfig,
  ReverbPreset,
  ReverbPedalConfig,
  ChorusPreset,
  ChorusPedalConfig,
  FlangerPreset,
  FlangerPedalConfig,
  TremoloPreset,
  TremoloPedalConfig,
  CompressorPreset,
  CompressorPedalConfig,
} from '@/lib/audio/effects/pizzicato';
