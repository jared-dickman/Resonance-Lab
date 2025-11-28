/**
 * D3.js-powered visualizations for guitar pedalboard
 * Real-time audio analysis, animated signal flow, and interactive diagrams
 */

// Original 4 visualizations
export { AnimatedCableRouting } from '@/components/effects/d3/AnimatedCableRouting';
export { SpectrumAnalyzer } from '@/components/effects/d3/SpectrumAnalyzer';
export { WaveformOscilloscope } from '@/components/effects/d3/WaveformOscilloscope';
export { SignalPathDiagram } from '@/components/effects/d3/SignalPathDiagram';

// Music theory visualizations
export { CircleOfFifths } from '@/components/effects/d3/CircleOfFifths';
export { ChordAnalyzer } from '@/components/effects/d3/ChordAnalyzer';
export { NotationDisplay, chordToNotation } from '@/components/effects/d3/NotationDisplay';

// 3D visualizations
export { AudioReactiveParticles } from '@/components/effects/d3/AudioReactiveParticles';
export { AudioReactiveShader } from '@/components/effects/d3/AudioReactiveShader';

// Generative art
export { GenerativeArtVisualizer } from '@/components/effects/d3/GenerativeArtVisualizer';

// Advanced waveform editing
export { WaveformRegionEditor } from '@/components/effects/d3/WaveformRegionEditor';

// Interactive instruments
export { InteractiveSynthVisualizer } from '@/components/effects/d3/InteractiveSynthVisualizer';
