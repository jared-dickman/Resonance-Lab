'use client';

import { useState, type FC } from 'react';
import { AmongUsLoader } from '@/components/ui/loaders/AmongUsLoader';
import { AstronautLoader } from '@/components/ui/loaders/AstronautLoader';
import { AtomLoader } from '@/components/ui/loaders/AtomLoader';
import { AuroraLoader } from '@/components/ui/loaders/AuroraLoader';
import { BinaryLoader } from '@/components/ui/loaders/BinaryLoader';
import { BitstreamLoader } from '@/components/ui/loaders/BitstreamLoader';
import { BlackHoleLoader } from '@/components/ui/loaders/BlackHoleLoader';
import { BloomLoader } from '@/components/ui/loaders/BloomLoader';
import { BondLoader } from '@/components/ui/loaders/BondLoader';
import { BreakoutLoader } from '@/components/ui/loaders/BreakoutLoader';
import { BreatheLoader } from '@/components/ui/loaders/BreatheLoader';
import { CandyCrushLoader } from '@/components/ui/loaders/CandyCrushLoader';
import { CassetteLoader } from '@/components/ui/loaders/CassetteLoader';
import { CatalystLoader } from '@/components/ui/loaders/CatalystLoader';
import { CellLoader } from '@/components/ui/loaders/CellLoader';
import { CentipedeLoader } from '@/components/ui/loaders/CentipedeLoader';
import { ChorusLoader } from '@/components/ui/loaders/ChorusLoader';
import { CircuitLoader } from '@/components/ui/loaders/CircuitLoader';
import { ClockworkLoader } from '@/components/ui/loaders/ClockworkLoader';
import { CloudDriftLoader } from '@/components/ui/loaders/CloudDriftLoader';
import { CoinLoader } from '@/components/ui/loaders/CoinLoader';
import { CometLoader } from '@/components/ui/loaders/CometLoader';
import { ConvergeLoader } from '@/components/ui/loaders/ConvergeLoader';
import { CrankLoader } from '@/components/ui/loaders/CrankLoader';
import { CrystalLoader } from '@/components/ui/loaders/CrystalLoader';
import { DNALoader } from '@/components/ui/loaders/DNALoader';
import { DecibelLoader } from '@/components/ui/loaders/DecibelLoader';
import { DefragLoader } from '@/components/ui/loaders/DefragLoader';
import { DialLoader } from '@/components/ui/loaders/DialLoader';
import { DialupLoader } from '@/components/ui/loaders/DialupLoader';
import { DopplerLoader } from '@/components/ui/loaders/DopplerLoader';
import { DriftLoader } from '@/components/ui/loaders/DriftLoader';
import { EclipseLoader } from '@/components/ui/loaders/EclipseLoader';
import { ElectronLoader } from '@/components/ui/loaders/ElectronLoader';
import { EntropyLoader } from '@/components/ui/loaders/EntropyLoader';
import { EqualizerLoader } from '@/components/ui/loaders/EqualizerLoader';
import { FlameLoader } from '@/components/ui/loaders/FlameLoader';
import { FlappyLoader } from '@/components/ui/loaders/FlappyLoader';
import { FloppyLoader } from '@/components/ui/loaders/FloppyLoader';
import { FlowLoader } from '@/components/ui/loaders/FlowLoader';
import { FlywheelLoader } from '@/components/ui/loaders/FlywheelLoader';
import { FractalLoader } from '@/components/ui/loaders/FractalLoader';
import { FrequencyLoader } from '@/components/ui/loaders/FrequencyLoader';
import { GalagaLoader } from '@/components/ui/loaders/GalagaLoader';
import { GalaxyLoader } from '@/components/ui/loaders/GalaxyLoader';
import { Game2048Loader } from '@/components/ui/loaders/Game2048Loader';
import { GearLoader } from '@/components/ui/loaders/GearLoader';
import { GlitchLoader } from '@/components/ui/loaders/GlitchLoader';
import { GraphLoader } from '@/components/ui/loaders/GraphLoader';
import { GravityLoader } from '@/components/ui/loaders/GravityLoader';
import { HarmonicLoader } from '@/components/ui/loaders/HarmonicLoader';
import { HealthBarLoader } from '@/components/ui/loaders/HealthBarLoader';
import { HeartbeatLoader } from '@/components/ui/loaders/HeartbeatLoader';
import { HelixDoubleLoader } from '@/components/ui/loaders/HelixDoubleLoader';
import { HelixLoader } from '@/components/ui/loaders/HelixLoader';
import { HexagonLoader } from '@/components/ui/loaders/HexagonLoader';
import { HorizonLoader } from '@/components/ui/loaders/HorizonLoader';
import { HourglassLoader } from '@/components/ui/loaders/HourglassLoader';
import { IonLoader } from '@/components/ui/loaders/IonLoader';
import { JuliaLoader } from '@/components/ui/loaders/JuliaLoader';
import { KaleidoscopeLoader } from '@/components/ui/loaders/KaleidoscopeLoader';
import { LatticeLoader } from '@/components/ui/loaders/LatticeLoader';
import { LeafLoader } from '@/components/ui/loaders/LeafLoader';
import { LightningLoader } from '@/components/ui/loaders/LightningLoader';
import { MagnetLoader } from '@/components/ui/loaders/MagnetLoader';
import { MandalaLoader } from '@/components/ui/loaders/MandalaLoader';
import { MandelbrotLoader } from '@/components/ui/loaders/MandelbrotLoader';
import { MatrixLoader } from '@/components/ui/loaders/MatrixLoader';
import { MinecraftLoader } from '@/components/ui/loaders/MinecraftLoader';
import { MitosisLoader } from '@/components/ui/loaders/MitosisLoader';
import { MoleculeLoader } from '@/components/ui/loaders/MoleculeLoader';
import { MoonriseLoader } from '@/components/ui/loaders/MoonriseLoader';
import { MorphLoader } from '@/components/ui/loaders/MorphLoader';
import { NebulaLoader } from '@/components/ui/loaders/NebulaLoader';
import { NeuronLoader } from '@/components/ui/loaders/NeuronLoader';
import { NexusLoader } from '@/components/ui/loaders/NexusLoader';
import { NixieLoader } from '@/components/ui/loaders/NixieLoader';
import { OceanLoader } from '@/components/ui/loaders/OceanLoader';
import { OrbitLoader } from '@/components/ui/loaders/OrbitLoader';
import { OscillateLoader } from '@/components/ui/loaders/OscillateLoader';
import { OscilloscopeLoader } from '@/components/ui/loaders/OscilloscopeLoader';
import { PacketLoader } from '@/components/ui/loaders/PacketLoader';
import { PacmanLoader } from '@/components/ui/loaders/PacmanLoader';
import { PendulumLoader } from '@/components/ui/loaders/PendulumLoader';
import { PhotonLoader } from '@/components/ui/loaders/PhotonLoader';
import { PistonLoader } from '@/components/ui/loaders/PistonLoader';
import { PixelLoader } from '@/components/ui/loaders/PixelLoader';
import { PlasmaLoader } from '@/components/ui/loaders/PlasmaLoader';
import { PolarLoader } from '@/components/ui/loaders/PolarLoader';
import { PongLoader } from '@/components/ui/loaders/PongLoader';
import { PortalLoader } from '@/components/ui/loaders/PortalLoader';
import { PowerUpLoader } from '@/components/ui/loaders/PowerUpLoader';
import { PrismLoader } from '@/components/ui/loaders/PrismLoader';
import { PulleyLoader } from '@/components/ui/loaders/PulleyLoader';
import { PulseLoader } from '@/components/ui/loaders/PulseLoader';
import { QuantumLoader } from '@/components/ui/loaders/QuantumLoader';
import { RadarLoader } from '@/components/ui/loaders/RadarLoader';
import { RainLoader } from '@/components/ui/loaders/RainLoader';
import { RainbowLoader } from '@/components/ui/loaders/RainbowLoader';
import { ReactionLoader } from '@/components/ui/loaders/ReactionLoader';
import { ResonanceLoader } from '@/components/ui/loaders/ResonanceLoader';
import { ReverbLoader } from '@/components/ui/loaders/ReverbLoader';
import { RippleLoader } from '@/components/ui/loaders/RippleLoader';
import { RocketLoader } from '@/components/ui/loaders/RocketLoader';
import { SatelliteLoader } from '@/components/ui/loaders/SatelliteLoader';
import { ScanlineLoader } from '@/components/ui/loaders/ScanlineLoader';
import { ScatterLoader } from '@/components/ui/loaders/ScatterLoader';
import { ScreensaverLoader } from '@/components/ui/loaders/ScreensaverLoader';
import { ShimmerLoader } from '@/components/ui/loaders/ShimmerLoader';
import { SierpinskiLoader } from '@/components/ui/loaders/SierpinskiLoader';
import { SignalLoader } from '@/components/ui/loaders/SignalLoader';
import { SineLoader } from '@/components/ui/loaders/SineLoader';
import { SnakeLoader } from '@/components/ui/loaders/SnakeLoader';
import { SpiralLoader } from '@/components/ui/loaders/SpiralLoader';
import { StarfieldLoader } from '@/components/ui/loaders/StarfieldLoader';
import { StereoLoader } from '@/components/ui/loaders/StereoLoader';
import { SunriseLoader } from '@/components/ui/loaders/SunriseLoader';
import { SupernovaLoader } from '@/components/ui/loaders/SupernovaLoader';
import { SynapseLoader } from '@/components/ui/loaders/SynapseLoader';
import { TempoLoader } from '@/components/ui/loaders/TempoLoader';
import { TerminalLoader } from '@/components/ui/loaders/TerminalLoader';
import { TeslaLoader } from '@/components/ui/loaders/TeslaLoader';
import { TesseractLoader } from '@/components/ui/loaders/TesseractLoader';
import { TetrisLoader } from '@/components/ui/loaders/TetrisLoader';
import { TornadoLoader } from '@/components/ui/loaders/TornadoLoader';
import { TurbineLoader } from '@/components/ui/loaders/TurbineLoader';
import { TwilightLoader } from '@/components/ui/loaders/TwilightLoader';
import { UFOLoader } from '@/components/ui/loaders/UFOLoader';
import { VinylLoader } from '@/components/ui/loaders/VinylLoader';
import { VirusLoader } from '@/components/ui/loaders/VirusLoader';
import { VortexLoader } from '@/components/ui/loaders/VortexLoader';
import { WarpLoader } from '@/components/ui/loaders/WarpLoader';
import { WaveLoader } from '@/components/ui/loaders/WaveLoader';
import { WaveformLoader } from '@/components/ui/loaders/WaveformLoader';

interface RandomLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// All 134 loaders - show them all!
const ALL_LOADERS: FC<RandomLoaderProps>[] = [
  AmongUsLoader,
  AstronautLoader,
  AtomLoader,
  AuroraLoader,
  BinaryLoader,
  BitstreamLoader,
  BlackHoleLoader,
  BloomLoader,
  BondLoader,
  BreakoutLoader,
  BreatheLoader,
  CandyCrushLoader,
  CassetteLoader,
  CatalystLoader,
  CellLoader,
  CentipedeLoader,
  ChorusLoader,
  CircuitLoader,
  ClockworkLoader,
  CloudDriftLoader,
  CoinLoader,
  CometLoader,
  ConvergeLoader,
  CrankLoader,
  CrystalLoader,
  DNALoader,
  DecibelLoader,
  DefragLoader,
  DialLoader,
  DialupLoader,
  DopplerLoader,
  DriftLoader,
  EclipseLoader,
  ElectronLoader,
  EntropyLoader,
  EqualizerLoader,
  FlameLoader,
  FlappyLoader,
  FloppyLoader,
  FlowLoader,
  FlywheelLoader,
  FractalLoader,
  FrequencyLoader,
  GalagaLoader,
  GalaxyLoader,
  Game2048Loader,
  GearLoader,
  GlitchLoader,
  GraphLoader,
  GravityLoader,
  HarmonicLoader,
  HealthBarLoader,
  HeartbeatLoader,
  HelixDoubleLoader,
  HelixLoader,
  HexagonLoader,
  HorizonLoader,
  HourglassLoader,
  IonLoader,
  JuliaLoader,
  KaleidoscopeLoader,
  LatticeLoader,
  LeafLoader,
  LightningLoader,
  MagnetLoader,
  MandalaLoader,
  MandelbrotLoader,
  MatrixLoader,
  MinecraftLoader,
  MitosisLoader,
  MoleculeLoader,
  MoonriseLoader,
  MorphLoader,
  NebulaLoader,
  NeuronLoader,
  NexusLoader,
  NixieLoader,
  OceanLoader,
  OrbitLoader,
  OscillateLoader,
  OscilloscopeLoader,
  PacketLoader,
  PacmanLoader,
  PendulumLoader,
  PhotonLoader,
  PistonLoader,
  PixelLoader,
  PlasmaLoader,
  PolarLoader,
  PongLoader,
  PortalLoader,
  PowerUpLoader,
  PrismLoader,
  PulleyLoader,
  PulseLoader,
  QuantumLoader,
  RadarLoader,
  RainLoader,
  RainbowLoader,
  ReactionLoader,
  ResonanceLoader,
  ReverbLoader,
  RippleLoader,
  RocketLoader,
  SatelliteLoader,
  ScanlineLoader,
  ScatterLoader,
  ScreensaverLoader,
  ShimmerLoader,
  SierpinskiLoader,
  SignalLoader,
  SineLoader,
  SnakeLoader,
  SpiralLoader,
  StarfieldLoader,
  StereoLoader,
  SunriseLoader,
  SupernovaLoader,
  SynapseLoader,
  TempoLoader,
  TerminalLoader,
  TeslaLoader,
  TesseractLoader,
  TetrisLoader,
  TornadoLoader,
  TurbineLoader,
  TwilightLoader,
  UFOLoader,
  VinylLoader,
  VirusLoader,
  VortexLoader,
  WarpLoader,
  WaveLoader,
  WaveformLoader,
];

export { ALL_LOADERS };

export function RandomLoader({ size = 'lg', className }: RandomLoaderProps) {
  // Pick one random loader on mount - stable across re-renders
  const [loaderIndex] = useState(() => Math.floor(Math.random() * ALL_LOADERS.length));

  const LoaderComponent = ALL_LOADERS[loaderIndex];
  if (!LoaderComponent) return null;

  return (
    <div className="flex items-center justify-center">
      <LoaderComponent size={size} className={className} />
    </div>
  );
}
