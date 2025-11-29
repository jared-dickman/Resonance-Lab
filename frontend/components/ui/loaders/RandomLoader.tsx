'use client';

import { useState, useEffect, type ComponentType } from 'react';
import { PulseLoader } from '@/components/ui/loaders/PulseLoader';
import { SineLoader } from '@/components/ui/loaders/SineLoader';
import { FrequencyLoader } from '@/components/ui/loaders/FrequencyLoader';
import { ResonanceLoader } from '@/components/ui/loaders/ResonanceLoader';
import { HarmonicLoader } from '@/components/ui/loaders/HarmonicLoader';
import { OscillateLoader } from '@/components/ui/loaders/OscillateLoader';
import { AmplitudeLoader } from '@/components/ui/loaders/AmplitudeLoader';
import { OrbitLoader } from '@/components/ui/loaders/OrbitLoader';
import { RippleLoader } from '@/components/ui/loaders/RippleLoader';
import { HelixLoader } from '@/components/ui/loaders/HelixLoader';
import { MorphLoader } from '@/components/ui/loaders/MorphLoader';
import { VinylLoader } from '@/components/ui/loaders/VinylLoader';
import { PendulumLoader } from '@/components/ui/loaders/PendulumLoader';
import { AtomLoader } from '@/components/ui/loaders/AtomLoader';
import { PrismLoader } from '@/components/ui/loaders/PrismLoader';
import { CircuitLoader } from '@/components/ui/loaders/CircuitLoader';
import { FractalLoader } from '@/components/ui/loaders/FractalLoader';
import { PlasmaLoader } from '@/components/ui/loaders/PlasmaLoader';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ALL_LOADERS: ComponentType<any>[] = [
  PulseLoader,
  SineLoader,
  FrequencyLoader,
  ResonanceLoader,
  HarmonicLoader,
  OscillateLoader,
  AmplitudeLoader,
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
];

interface RandomLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RandomLoader({ size = 'md', className }: RandomLoaderProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [LoaderComponent, setLoaderComponent] = useState<ComponentType<any> | null>(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * ALL_LOADERS.length);
    const loader = ALL_LOADERS[randomIndex];
    if (loader) setLoaderComponent(() => loader);
  }, []);

  if (!LoaderComponent) return null;

  return <LoaderComponent size={size} className={className} />;
}
