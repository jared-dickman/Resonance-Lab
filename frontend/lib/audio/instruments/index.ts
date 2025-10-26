/**
 * Composable instrument system
 * Import only what you need, swap implementations freely
 *
 * @example
 * ```ts
 * import { AcousticPiano, SynthBass, DrumKit } from '@/lib/audio/instruments';
 *
 * const piano = new AcousticPiano({ preset: 'bright' });
 * const bass = new SynthBass({ preset: 'fat' });
 * const drums = new DrumKit({ preset: 'rock' });
 * ```
 */

// Base classes and types
export { Instrument } from './base/Instrument';
export type { InstrumentConfig, InstrumentPreset, Note, ChordOptions } from './base/InstrumentConfig';

// Piano instruments
export { AcousticPiano, ElectricPiano } from './piano';

// Bass instruments
export { SynthBass } from './bass';

// Drum instruments
export { DrumKit } from './drums';
export type { DrumHit } from './drums';

// Guitar instruments
export { AcousticGuitar } from './guitar';
