'use client';

import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import p5 from 'p5';
import { GENERATIVE_ART } from '@/lib/constants/visualization.constants';
import {
  type VisualizationStyle,
  type P5Dimensions,
  getDefaultDimensions,
  createAudioAnalyzer,
  getAudioData,
  createFlowField,
} from '@/lib/utils/visualization/generative-art.utils';
import { type FlowFieldParticle, createParticles } from '@/lib/utils/visualization/particle.utils';
import {
  renderFlowField,
  renderSpiral,
  renderMandala,
  renderParticleSystem,
} from '@/lib/utils/visualization/renderers.utils';

interface GenerativeArtVisualizerProps {
  audioNode?: Tone.ToneAudioNode;
  width?: number;
  height?: number;
  style?: VisualizationStyle;
}

function createP5Sketch(
  dimensions: P5Dimensions,
  style: VisualizationStyle,
  analyzerRef: React.RefObject<Tone.Analyser | null>
): (p: p5) => void {
  return (p: p5) => {
    let particles: FlowFieldParticle[] = [];
    let flowField: p5.Vector[][] = [];

    p.setup = (): void => {
      p.createCanvas(dimensions.width, dimensions.height);
      p.colorMode(p.HSB, 360, 100, 100, 100);
      p.background(0);

      flowField = createFlowField(p, dimensions);
      particles = createParticles(p, GENERATIVE_ART.FLOW_FIELD.PARTICLE_COUNT, dimensions.width, dimensions.height);
    };

    p.draw = (): void => {
      if (!analyzerRef.current) return;

      const audioData = getAudioData(analyzerRef.current);

      switch (style) {
        case 'flow-field':
          renderFlowField(p, dimensions, audioData, flowField, particles);
          break;
        case 'spiral':
          renderSpiral(p, dimensions, audioData);
          break;
        case 'mandala':
          renderMandala(p, dimensions, audioData);
          break;
        case 'particles':
          renderParticleSystem(p, dimensions, audioData);
          break;
      }
    };
  };
}

export const GenerativeArtVisualizer: React.FC<GenerativeArtVisualizerProps> = ({
  audioNode,
  width,
  height,
  style = 'flow-field',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const analyzerRef = useRef<Tone.Analyser | null>(null);

  const defaultDimensions = getDefaultDimensions();
  const dimensions: P5Dimensions = {
    width: width ?? defaultDimensions.width,
    height: height ?? defaultDimensions.height,
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const analyzer = createAudioAnalyzer(audioNode);
    analyzerRef.current = analyzer;

    const sketch = createP5Sketch(dimensions, style, analyzerRef);
    p5InstanceRef.current = new p5(sketch, containerRef.current);

    return () => {
      p5InstanceRef.current?.remove();
      analyzer.dispose();
    };
  }, [audioNode, dimensions.width, dimensions.height, style]);

  return (
    <div className="bg-black rounded-lg overflow-hidden border border-gray-800 relative">
      <div ref={containerRef} />
      <div className="absolute top-4 left-4 bg-gray-950/80 backdrop-blur px-3 py-2 rounded">
        <div className="text-xs text-gray-400">P5.js Generative Art</div>
        <div className="text-sm font-bold text-purple-400">{style.toUpperCase()}</div>
      </div>
    </div>
  );
};
