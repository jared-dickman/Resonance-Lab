/**
 * Audio effects library
 * Enterprise-grade guitar pedal effects with realistic DSP
 */

export { DistortionPedal } from './DistortionPedal';
export type {
  DistortionAlgorithm,
  DistortionPreset,
  DistortionPedalConfig,
} from './DistortionPedal';

export { Pedalboard } from './Pedalboard';
export type { PedalSlot, PedalboardConfig } from './Pedalboard';

// Legendary guitarist preset chains
export { loadLegendaryRig, getLegendaryRigs } from './LegendaryRigs';
export type { LegendaryRigConfig } from './LegendaryRigs';
export { LEGENDARY_RIGS } from './LegendaryRigs';

// Pizzicato-based effects
export {
  DelayPedal,
  ReverbPedal,
  ChorusPedal,
  FlangerPedal,
  TremoloPedal,
  CompressorPedal,
} from './pizzicato';
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
} from './pizzicato';
