/**
 * Legendary Guitarist Preset Chains
 * One-click access to iconic guitar tones from rock history
 * Gilmour, The Edge, Frusciante, Cobain, Van Halen
 */

import type { Pedalboard } from './Pedalboard';
import { DistortionPedal } from './DistortionPedal';
import {
  DelayPedal,
  ReverbPedal,
  ChorusPedal,
  FlangerPedal,
  CompressorPedal,
} from './pizzicato';

export interface LegendaryRigConfig {
  name: string;
  description: string;
  guitarist: string;
  song: string;
  pedals: Array<{
    id: string;
    name: string;
    type: 'compressor' | 'distortion' | 'chorus' | 'flanger' | 'delay' | 'reverb';
    preset: string;
  }>;
}

/**
 * All legendary guitarist rig configurations
 */
export const LEGENDARY_RIGS: LegendaryRigConfig[] = [
  {
    name: 'gilmour-comfortably-numb',
    description: 'Comfortably Numb Solo - Soaring sustain and ambient wash',
    guitarist: 'David Gilmour',
    song: 'Comfortably Numb',
    pedals: [
      { id: 'comp', name: 'Compressor', type: 'compressor', preset: 'gilmour-sustain' },
      { id: 'dist', name: 'Overdrive', type: 'distortion', preset: 'tube-screamer' },
      { id: 'delay', name: 'Delay', type: 'delay', preset: 'gilmour-ambient' },
      { id: 'reverb', name: 'Reverb', type: 'reverb', preset: 'abbey-road' },
    ],
  },
  {
    name: 'the-edge-streets',
    description: 'Where The Streets Have No Name - Dotted eighth cascades',
    guitarist: 'The Edge (U2)',
    song: 'Where The Streets Have No Name',
    pedals: [
      { id: 'comp', name: 'Compressor', type: 'compressor', preset: 'dyna-comp' },
      { id: 'delay1', name: 'Delay 1', type: 'delay', preset: 'the-edge' },
      { id: 'delay2', name: 'Delay 2', type: 'delay', preset: 'carbon-copy' },
      { id: 'reverb', name: 'Reverb', type: 'reverb', preset: 'bluesky-studio' },
    ],
  },
  {
    name: 'frusciante-under-the-bridge',
    description: 'Under The Bridge - Chorus-drenched clean tone',
    guitarist: 'John Frusciante',
    song: 'Under The Bridge',
    pedals: [
      { id: 'chorus', name: 'Chorus', type: 'chorus', preset: 'frusciante-ce1' },
      { id: 'comp', name: 'Compressor', type: 'compressor', preset: 'parallel-ny' },
      { id: 'dist', name: 'Clean Boost', type: 'distortion', preset: 'clean-boost' },
      { id: 'delay', name: 'Delay', type: 'delay', preset: 'carbon-copy' },
    ],
  },
  {
    name: 'cobain-come-as-you-are',
    description: 'Come As You Are - Swirling grunge chorus',
    guitarist: 'Kurt Cobain',
    song: 'Come As You Are',
    pedals: [
      { id: 'chorus', name: 'Chorus', type: 'chorus', preset: 'small-clone' },
      { id: 'dist', name: 'Distortion', type: 'distortion', preset: 'ds1' },
      { id: 'reverb', name: 'Reverb', type: 'reverb', preset: 'spring-65' },
    ],
  },
  {
    name: 'van-halen-unchained',
    description: 'Unchained - Jet plane flanger with bite',
    guitarist: 'Eddie Van Halen',
    song: 'Unchained',
    pedals: [
      { id: 'comp', name: 'Compressor', type: 'compressor', preset: 'dyna-comp' },
      { id: 'flanger', name: 'Flanger', type: 'flanger', preset: 'jet-plane' },
      { id: 'dist', name: 'Distortion', type: 'distortion', preset: 'big-muff' },
      { id: 'delay', name: 'Delay', type: 'delay', preset: 'slapback' },
    ],
  },
];

/**
 * Load a legendary rig onto a pedalboard
 */
export function loadLegendaryRig(pedalboard: Pedalboard, rigName: string): void {
  const rig = LEGENDARY_RIGS.find((r) => r.name === rigName);

  if (!rig) {
    throw new Error(`Legendary rig "${rigName}" not found`);
  }

  // Clear existing pedals
  pedalboard.getPedals().forEach((slot) => {
    pedalboard.removePedal(slot.id);
  });

  // Add pedals in order
  rig.pedals.forEach((pedalConfig, index) => {
    let pedal;

    switch (pedalConfig.type) {
      case 'compressor':
        pedal = new CompressorPedal({ preset: pedalConfig.preset });
        break;
      case 'distortion':
        pedal = new DistortionPedal({ preset: pedalConfig.preset });
        break;
      case 'chorus':
        pedal = new ChorusPedal({ preset: pedalConfig.preset });
        break;
      case 'flanger':
        pedal = new FlangerPedal({ preset: pedalConfig.preset });
        break;
      case 'delay':
        pedal = new DelayPedal({ preset: pedalConfig.preset });
        break;
      case 'reverb':
        pedal = new ReverbPedal({ preset: pedalConfig.preset });
        break;
      default:
        throw new Error(`Unknown pedal type: ${pedalConfig.type}`);
    }

    pedalboard.addPedal(pedalConfig.id, pedalConfig.name, pedal, index);
  });
}

/**
 * Get all available legendary rigs
 */
export function getLegendaryRigs(): LegendaryRigConfig[] {
  return LEGENDARY_RIGS;
}
