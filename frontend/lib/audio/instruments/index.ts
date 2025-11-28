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
export { Instrument } from '@/lib/audio/instruments/base/Instrument';
export type { InstrumentConfig, InstrumentPreset, Note, ChordOptions } from '@/lib/audio/instruments/base/InstrumentConfig';

// Piano instruments
export { AcousticPiano, ElectricPiano } from '@/lib/audio/instruments/piano';

// Bass instruments
export { SynthBass } from '@/lib/audio/instruments/bass';

// Drum instruments
export { DrumKit } from '@/lib/audio/instruments/drums';
export type { DrumHit } from '@/lib/audio/instruments/drums';

// Guitar instruments
export { AcousticGuitar } from '@/lib/audio/instruments/guitar';
