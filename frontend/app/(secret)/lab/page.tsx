'use client';

import {
  PulseLoader,
  SineLoader,
  FrequencyLoader,
  ResonanceLoader,
  HarmonicLoader,
  OscillateLoader,
  AmplitudeLoader,
} from '@/components/ui/loaders';

export default function LabPage() {
  return (
    <div className="min-h-screen bg-black p-8">
      <h1 className="mb-2 text-center text-3xl font-bold text-white">Loader Thunderdome</h1>
      <p className="mb-12 text-center text-sapphire-400">Pick your champion</p>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <LoaderCard num={1} name="PULSE" description="12 bars, staggered wave">
          <PulseLoader size={64} />
        </LoaderCard>

        <LoaderCard num={2} name="SINE" description="SVG sine wave path">
          <SineLoader width={140} height={50} />
        </LoaderCard>

        <LoaderCard num={3} name="FREQUENCY" description="7 bars with glow">
          <FrequencyLoader size={64} />
        </LoaderCard>

        <LoaderCard num={4} name="RESONANCE" description="9 bars, size variants">
          <ResonanceLoader size="lg" />
        </LoaderCard>

        <LoaderCard num={5} name="HARMONIC" description="Rainbow sapphire bars">
          <HarmonicLoader size={64} />
        </LoaderCard>

        <LoaderCard num={6} name="OSCILLATE" description="3 waves + orbiting dot">
          <OscillateLoader size={140} />
        </LoaderCard>

        <LoaderCard num={7} name="AMPLITUDE" description="Compact center-peak">
          <AmplitudeLoader size="lg" />
        </LoaderCard>
      </div>

      <div className="mt-16 text-center">
        <p className="text-sapphire-500/50">localhost:3007/lab</p>
      </div>
    </div>
  );
}

function LoaderCard({
  num,
  name,
  description,
  children,
}: {
  num: number;
  name: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-sapphire-800/50 bg-sapphire-deep/50 p-8 backdrop-blur-sm transition-all hover:border-sapphire-500/50 hover:bg-sapphire-dark/50">
      <span className="mb-2 text-xs font-medium text-sapphire-400">#{num}</span>
      <h2 className="mb-1 text-xl font-bold text-white">{name}</h2>
      <p className="mb-8 text-sm text-sapphire-300/70">{description}</p>
      <div className="flex h-24 items-center justify-center">{children}</div>
    </div>
  );
}
