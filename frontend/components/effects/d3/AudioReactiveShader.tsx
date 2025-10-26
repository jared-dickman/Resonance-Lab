'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import * as Tone from 'tone';

import {
  CANVAS_DIMENSIONS,
  SHADER_CONFIG,
} from '@/lib/constants/visualization.constants';
import {
  createConnectedFFTAnalyzer,
  splitFrequencyBands,
  normalizeFrequencyBands,
} from '@/lib/utils/audio/analyzer.utils';

const VERTEX_SHADER = `
  uniform float uTime;
  uniform float uAudioLow;
  uniform float uAudioMid;
  uniform float uAudioHigh;

  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;

    vec3 pos = position;

    float lowPulse = uAudioLow * ${SHADER_CONFIG.AUDIO_INFLUENCE.LOW_PULSE};
    pos += normal * lowPulse;

    float wave = sin(position.x * 3.0 + uTime) *
                 cos(position.y * 3.0 + uTime) *
                 uAudioMid * ${SHADER_CONFIG.AUDIO_INFLUENCE.MID_WAVE};
    pos += normal * wave;

    float detail = sin(position.x * 10.0 + uTime * 2.0) *
                   sin(position.y * 10.0 + uTime * 2.0) *
                   uAudioHigh * ${SHADER_CONFIG.AUDIO_INFLUENCE.HIGH_DETAIL};
    pos += normal * detail;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform float uTime;
  uniform float uAudioLow;
  uniform float uAudioMid;
  uniform float uAudioHigh;

  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;

  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  void main() {
    float hue = vUv.x + vUv.y + uTime * 0.1;
    hue += uAudioLow * 0.3;

    float saturation = 0.7 + uAudioMid * 0.3;
    float brightness = 0.5 + uAudioHigh * 0.5;

    vec3 color = hsv2rgb(vec3(hue, saturation, brightness));

    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 2.0);
    color += fresnel * vec3(uAudioMid, uAudioHigh, uAudioLow) * 0.5;

    color += vec3(uAudioHigh) * 0.3;

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface ShaderUniforms {
  uTime: { value: number };
  uAudioLow: { value: number };
  uAudioMid: { value: number };
  uAudioHigh: { value: number };
}

interface AudioShaderMaterialProps {
  audioNode?: Tone.ToneAudioNode;
}

function createInitialUniforms(): ShaderUniforms {
  return {
    uTime: { value: 0 },
    uAudioLow: { value: 0 },
    uAudioMid: { value: 0 },
    uAudioHigh: { value: 0 },
  };
}

function updateUniformsWithAudioData(
  uniforms: ShaderUniforms,
  fftData: Float32Array,
  elapsedTime: number
): void {
  const bands = splitFrequencyBands(fftData);
  const normalized = normalizeFrequencyBands(bands);

  uniforms.uAudioLow.value = normalized.low;
  uniforms.uAudioMid.value = normalized.mid;
  uniforms.uAudioHigh.value = normalized.high;
  uniforms.uTime.value = elapsedTime;
}

function rotateMeshWithTime(mesh: THREE.Mesh, elapsedTime: number): void {
  const { NORMAL } = SHADER_CONFIG.ANIMATION.ROTATION_SPEED;

  mesh.rotation.y = elapsedTime * NORMAL;
  mesh.rotation.x = Math.sin(elapsedTime * NORMAL / 2) * NORMAL;
}

function AudioShaderMaterial({ audioNode }: AudioShaderMaterialProps): JSX.Element {
  const meshRef = useRef<THREE.Mesh>(null);
  const analyzerRef = useRef<Tone.FFT | null>(null);

  const uniforms = useMemo(createInitialUniforms, []);

  useEffect(() => {
    const analyzer = createConnectedFFTAnalyzer(
      SHADER_CONFIG.FFT_SIZE.SMALL,
      audioNode
    );
    analyzerRef.current = analyzer;

    return () => {
      analyzer.dispose();
    };
  }, [audioNode]);

  useFrame((state) => {
    if (!analyzerRef.current) return;

    const fftData = analyzerRef.current.getValue() as Float32Array;
    updateUniformsWithAudioData(uniforms, fftData, state.clock.elapsedTime);

    if (meshRef.current) {
      rotateMeshWithTime(meshRef.current, state.clock.elapsedTime);
    }
  });

  const { ICOSAHEDRON_RADIUS, ICOSAHEDRON_DETAIL } = SHADER_CONFIG.GEOMETRY;

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[ICOSAHEDRON_RADIUS, ICOSAHEDRON_DETAIL]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        wireframe={false}
      />
    </mesh>
  );
}

interface AudioReactiveShaderProps {
  audioNode?: Tone.ToneAudioNode;
  width?: number;
  height?: number;
}

function createCameraConfiguration(): { position: [number, number, number]; fov: number } {
  const { POSITION_X, POSITION_Y, POSITION_Z, FOV } = SHADER_CONFIG.CAMERA;
  return {
    position: [POSITION_X, POSITION_Y, POSITION_Z],
    fov: FOV,
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

export const AudioReactiveShader: React.FC<AudioReactiveShaderProps> = ({
  audioNode,
  width = CANVAS_DIMENSIONS.DEFAULT.WIDTH,
  height = CANVAS_DIMENSIONS.DEFAULT.HEIGHT,
}) => {
  const cameraConfig = createCameraConfiguration();
  const lightConfig = createLightConfiguration();

  return (
    <div className="bg-black rounded-lg overflow-hidden border border-gray-800 relative">
      <Canvas
        camera={cameraConfig}
        style={{ width, height }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={lightConfig.ambientIntensity} />
        <pointLight
          position={lightConfig.pointPosition}
          intensity={lightConfig.pointIntensity}
        />
        <AudioShaderMaterial audioNode={audioNode} />
        <OrbitControls enableZoom={true} enablePan={false} enableRotate={true} />
      </Canvas>
      <div className="absolute top-4 left-4 bg-gray-950/80 backdrop-blur px-3 py-2 rounded">
        <div className="text-xs text-gray-400">GLSL Shader</div>
        <div className="text-sm font-bold text-blue-400">Audio-Reactive Vertex Displacement</div>
      </div>
    </div>
  );
};
