'use client';

import { useRef, useMemo, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import * as Tone from 'tone';

import {
  CANVAS_DIMENSIONS,
  AUDIO_ANALYSIS,
  PARTICLE_SYSTEM,
  SHADER_CONFIG,
} from '@/lib/constants/visualization.constants';
import { createConnectedWaveformAnalyzer } from '@/lib/utils/audio/analyzer.utils';

const PARTICLE_CONFIG = {
  DEFAULT_COUNT: PARTICLE_SYSTEM.COUNT.LARGE,
  DISTRIBUTION_RADIUS: PARTICLE_SYSTEM.SPHERE_RADIUS,
  SIZE_MIN: PARTICLE_SYSTEM.SIZE_RANGE.MIN,
  SIZE_MAX: PARTICLE_SYSTEM.SIZE_RANGE.MAX,
  MATERIAL_SIZE: 0.15,
  MATERIAL_OPACITY: 0.8,
  COLOR: {
    SATURATION: 70,
    LIGHTNESS_BASE: 50,
  },
  ANIMATION: {
    AMPLITUDE_MULTIPLIER: 0.3,
    INTENSITY_BASE: 0.5,
    INTENSITY_MULTIPLIER: 0.5,
    HUE_ROTATION_SPEED: 20,
    ROTATION_SPEED_Y: 0.1,
    ROTATION_SPEED_X: 0.05,
    ROTATION_AMPLITUDE: 0.2,
  },
} as const;

interface ParticlesProps {
  audioNode?: Tone.ToneAudioNode;
  count?: number;
}

interface ParticleGeometry {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
}

function calculateSpherePosition(radius: number): { x: number; y: number; z: number } {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(Math.random() * 2 - 1);

  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.sin(phi) * Math.sin(theta),
    z: radius * Math.cos(phi),
  };
}

function calculateRainbowColor(index: number, count: number): THREE.Color {
  const hue = (index / count) * 360;
  const { SATURATION, LIGHTNESS_BASE } = PARTICLE_CONFIG.COLOR;
  return new THREE.Color(`hsl(${hue}, ${SATURATION}%, ${LIGHTNESS_BASE}%)`);
}

function calculateParticleSize(): number {
  const { SIZE_MIN, SIZE_MAX } = PARTICLE_CONFIG;
  return Math.random() * (SIZE_MAX - SIZE_MIN) + SIZE_MIN;
}

function createParticleGeometry(count: number): ParticleGeometry {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const position = calculateSpherePosition(PARTICLE_CONFIG.DISTRIBUTION_RADIUS);

    positions[i * 3] = position.x;
    positions[i * 3 + 1] = position.y;
    positions[i * 3 + 2] = position.z;

    const color = calculateRainbowColor(i, count);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    sizes[i] = calculateParticleSize();
  }

  return { positions, colors, sizes };
}

function getWaveformValueForParticle(
  waveform: Float32Array,
  particleIndex: number,
  particleCount: number
): number {
  const waveformIndex = Math.floor((particleIndex / particleCount) * waveform.length);
  return Math.abs(waveform[waveformIndex] ?? 0);
}

function applyAmplitudePulsation(
  positions: Float32Array,
  particleIndex: number,
  amplitude: number
): void {
  const i3 = particleIndex * 3;
  const baseX = positions[i3] ?? 0;
  const baseY = positions[i3 + 1] ?? 0;
  const baseZ = positions[i3 + 2] ?? 0;

  const { AMPLITUDE_MULTIPLIER } = PARTICLE_CONFIG.ANIMATION;
  const scale = 1 + amplitude * AMPLITUDE_MULTIPLIER;

  positions[i3] = baseX * scale;
  positions[i3 + 1] = baseY * scale;
  positions[i3 + 2] = baseZ * scale;
}

function calculateDynamicColor(
  particleIndex: number,
  particleCount: number,
  amplitude: number,
  elapsedTime: number
): THREE.Color {
  const { INTENSITY_BASE, INTENSITY_MULTIPLIER, HUE_ROTATION_SPEED } =
    PARTICLE_CONFIG.ANIMATION;
  const { SATURATION } = PARTICLE_CONFIG.COLOR;

  const intensity = INTENSITY_BASE + amplitude * INTENSITY_MULTIPLIER;
  const hue =
    ((particleIndex / particleCount) * 360 + elapsedTime * HUE_ROTATION_SPEED) % 360;

  return new THREE.Color(`hsl(${hue}, ${SATURATION}%, ${intensity * 100}%)`);
}

function updateColorAttribute(
  colors: Float32Array,
  particleIndex: number,
  color: THREE.Color
): void {
  const i3 = particleIndex * 3;
  colors[i3] = color.r;
  colors[i3 + 1] = color.g;
  colors[i3 + 2] = color.b;
}

function updateParticlesWithAudioData(
  positions: Float32Array,
  colors: Float32Array,
  waveform: Float32Array,
  count: number,
  elapsedTime: number
): void {
  for (let i = 0; i < count; i++) {
    const amplitude = getWaveformValueForParticle(waveform, i, count);

    applyAmplitudePulsation(positions, i, amplitude);

    const color = calculateDynamicColor(i, count, amplitude, elapsedTime);
    updateColorAttribute(colors, i, color);
  }
}

function rotateParticleSystem(mesh: THREE.Points, elapsedTime: number): void {
  const { ROTATION_SPEED_Y, ROTATION_SPEED_X, ROTATION_AMPLITUDE } =
    PARTICLE_CONFIG.ANIMATION;

  mesh.rotation.y = elapsedTime * ROTATION_SPEED_Y;
  mesh.rotation.x = Math.sin(elapsedTime * ROTATION_SPEED_X) * ROTATION_AMPLITUDE;
}

function Particles({ audioNode, count = PARTICLE_CONFIG.DEFAULT_COUNT }: ParticlesProps) {
  const meshRef = useRef<THREE.Points>(null);
  const analyzerRef = useRef<Tone.Waveform | null>(null);

  const particles = useMemo(() => createParticleGeometry(count), [count]);

  useEffect(() => {
    const waveform = new Tone.Waveform(AUDIO_ANALYSIS.WAVEFORM_SIZE.SMALL);

    if (audioNode) {
      audioNode.connect(waveform);
    } else {
      Tone.getDestination().connect(waveform);
    }

    analyzerRef.current = waveform;

    return () => {
      waveform.dispose();
    };
  }, [audioNode]);

  useFrame((state) => {
    if (!meshRef.current || !analyzerRef.current) return;

    const posAttr = meshRef.current.geometry.attributes.position;
    const colorAttr = meshRef.current.geometry.attributes.color;
    if (!posAttr || !colorAttr) return;

    const positions = posAttr.array as Float32Array;
    const colors = colorAttr.array as Float32Array;
    const waveform = analyzerRef.current.getValue() as Float32Array;

    updateParticlesWithAudioData(positions, colors, waveform, count, state.clock.elapsedTime);

    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;

    rotateParticleSystem(meshRef.current, state.clock.elapsedTime);
  });

  const { MATERIAL_SIZE, MATERIAL_OPACITY } = PARTICLE_CONFIG;

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particles.colors, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[particles.sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={MATERIAL_SIZE}
        vertexColors
        transparent
        opacity={MATERIAL_OPACITY}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

interface AudioReactiveParticlesProps {
  audioNode?: Tone.ToneAudioNode;
  width?: number | string;
  height?: number | string;
  particleCount?: number;
}

function createCameraConfiguration(): { position: [number, number, number]; fov: number } {
  return {
    position: [0, 0, 30],
    fov: SHADER_CONFIG.CAMERA.FOV,
  };
}

function createLightConfiguration(): {
  ambientIntensity: number;
  pointIntensity: number;
  pointPosition: [number, number, number];
} {
  const { AMBIENT_INTENSITY, POINT_INTENSITY, POINT_POSITION } = SHADER_CONFIG.LIGHT;
  return {
    ambientIntensity: AMBIENT_INTENSITY,
    pointIntensity: POINT_INTENSITY,
    pointPosition: POINT_POSITION,
  };
}

export const AudioReactiveParticles: React.FC<AudioReactiveParticlesProps> = ({
  audioNode,
  width = CANVAS_DIMENSIONS.DEFAULT.WIDTH,
  height = CANVAS_DIMENSIONS.DEFAULT.HEIGHT,
  particleCount = PARTICLE_CONFIG.DEFAULT_COUNT,
}) => {
  const cameraConfig = createCameraConfiguration();
  const lightConfig = createLightConfiguration();
  const canvasStyle: CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width ?? '100%',
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div className="relative bg-black rounded-lg overflow-hidden border border-gray-800">
      <Canvas
        camera={cameraConfig}
        style={canvasStyle}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={lightConfig.ambientIntensity} />
        <pointLight
          position={lightConfig.pointPosition}
          intensity={lightConfig.pointIntensity}
        />
        <Particles audioNode={audioNode} count={particleCount} />
        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
      </Canvas>
      <div className="absolute top-4 left-4 bg-gray-950/80 backdrop-blur px-3 py-2 rounded">
        <div className="text-xs text-gray-400">3D Audio Reactive</div>
        <div className="text-sm font-bold text-white">{particleCount} Particles</div>
      </div>
    </div>
  );
};
