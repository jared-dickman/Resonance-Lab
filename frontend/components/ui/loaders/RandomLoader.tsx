'use client';

import { useState, useEffect, type FC } from 'react';
import { PulseLoader } from '@/components/ui/loaders/PulseLoader';
import { SineLoader } from '@/components/ui/loaders/SineLoader';
import { FrequencyLoader } from '@/components/ui/loaders/FrequencyLoader';
import { ResonanceLoader } from '@/components/ui/loaders/ResonanceLoader';
import { HarmonicLoader } from '@/components/ui/loaders/HarmonicLoader';
import { OscillateLoader } from '@/components/ui/loaders/OscillateLoader';
import { OrbitLoader } from '@/components/ui/loaders/OrbitLoader';
import { RippleLoader } from '@/components/ui/loaders/RippleLoader';
import { HelixLoader } from '@/components/ui/loaders/HelixLoader';
import { HelixDoubleLoader } from '@/components/ui/loaders/HelixDoubleLoader';
import { MorphLoader } from '@/components/ui/loaders/MorphLoader';
import { VinylLoader } from '@/components/ui/loaders/VinylLoader';
import { PendulumLoader } from '@/components/ui/loaders/PendulumLoader';
import { AtomLoader } from '@/components/ui/loaders/AtomLoader';
import { PrismLoader } from '@/components/ui/loaders/PrismLoader';
import { CircuitLoader } from '@/components/ui/loaders/CircuitLoader';
import { FractalLoader } from '@/components/ui/loaders/FractalLoader';
import { PlasmaLoader } from '@/components/ui/loaders/PlasmaLoader';
import { GravityLoader } from '@/components/ui/loaders/GravityLoader';
import { QuantumLoader } from '@/components/ui/loaders/QuantumLoader';
import { PhotonLoader } from '@/components/ui/loaders/PhotonLoader';
import { MagnetLoader } from '@/components/ui/loaders/MagnetLoader';
import { TeslaLoader } from '@/components/ui/loaders/TeslaLoader';
import { DopplerLoader } from '@/components/ui/loaders/DopplerLoader';
import { EntropyLoader } from '@/components/ui/loaders/EntropyLoader';
import { WaveformLoader } from '@/components/ui/loaders/WaveformLoader';
import { EqualizerLoader } from '@/components/ui/loaders/EqualizerLoader';
import { DecibelLoader } from '@/components/ui/loaders/DecibelLoader';
import { TempoLoader } from '@/components/ui/loaders/TempoLoader';
import { ReverbLoader } from '@/components/ui/loaders/ReverbLoader';
import { ChorusLoader } from '@/components/ui/loaders/ChorusLoader';
import { StereoLoader } from '@/components/ui/loaders/StereoLoader';
import { GearLoader } from '@/components/ui/loaders/GearLoader';
import { PistonLoader } from '@/components/ui/loaders/PistonLoader';
import { ClockworkLoader } from '@/components/ui/loaders/ClockworkLoader';
import { TurbineLoader } from '@/components/ui/loaders/TurbineLoader';
import { PulleyLoader } from '@/components/ui/loaders/PulleyLoader';
import { CrankLoader } from '@/components/ui/loaders/CrankLoader';
import { FlywheelLoader } from '@/components/ui/loaders/FlywheelLoader';

interface RandomLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Loaders that support the standard size prop ('sm' | 'md' | 'lg')
const STANDARD_LOADERS: FC<RandomLoaderProps>[] = [
  ResonanceLoader,
  HelixDoubleLoader,
  OrbitLoader,
  RippleLoader,
  HelixLoader,
  MorphLoader,
  VinylLoader,
  PendulumLoader,
  AtomLoader,
  PrismLoader,
  CircuitLoader,
  FractalLoader,
  PlasmaLoader,
  GravityLoader,
  QuantumLoader,
  PhotonLoader,
  MagnetLoader,
  TeslaLoader,
  DopplerLoader,
  EntropyLoader,
  WaveformLoader,
  EqualizerLoader,
  DecibelLoader,
  TempoLoader,
  ReverbLoader,
  ChorusLoader,
  StereoLoader,
  GearLoader,
  PistonLoader,
  ClockworkLoader,
  TurbineLoader,
  PulleyLoader,
  CrankLoader,
  FlywheelLoader,
];

// Loaders with number-based size (will use default)
const NUMBER_LOADERS = [
  PulseLoader,
  SineLoader,
  FrequencyLoader,
  HarmonicLoader,
  OscillateLoader,
];

export const ALL_LOADERS = [...STANDARD_LOADERS, ...NUMBER_LOADERS];

export function RandomLoader({ size = 'md', className }: RandomLoaderProps) {
  const [loaderIndex, setLoaderIndex] = useState<number | null>(null);

  useEffect(() => {
    setLoaderIndex(Math.floor(Math.random() * STANDARD_LOADERS.length));
  }, []);

  if (loaderIndex === null) return null;

  const LoaderComponent = STANDARD_LOADERS[loaderIndex];
  if (!LoaderComponent) return null;

  return <LoaderComponent size={size} className={className} />;
}
