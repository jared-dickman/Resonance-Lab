'use client';

/**
 * PedalVisualizer - Real-time audio visualizer for pedal effects
 * Shows waveform and frequency spectrum
 */

import React, { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PedalVisualizerProps {
  audioNode?: Tone.ToneAudioNode;
  type?: 'waveform' | 'spectrum' | 'both';
  height?: number;
  className?: string;
}

export const PedalVisualizer: React.FC<PedalVisualizerProps> = ({
  audioNode,
  type = 'both',
  height = 120,
  className = '',
}) => {
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const spectrumCanvasRef = useRef<HTMLCanvasElement>(null);
  const waveformRef = useRef<Tone.Waveform | null>(null);
  const analyzerRef = useRef<Tone.Analyser | null>(null);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!audioNode) return;

    // Create analyzers
    if (type === 'waveform' || type === 'both') {
      waveformRef.current = new Tone.Waveform(2048);
      audioNode.connect(waveformRef.current);
    }

    if (type === 'spectrum' || type === 'both') {
      analyzerRef.current = new Tone.Analyser({
        type: 'fft',
        size: 1024,
        smoothing: 0.8,
      });
      audioNode.connect(analyzerRef.current);
    }

    // Animation loop
    const animate = () => {
      drawWaveform();
      drawSpectrum();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      waveformRef.current?.dispose();
      analyzerRef.current?.dispose();
    };
  }, [audioNode, type]);

  const drawWaveform = () => {
    const canvas = waveformCanvasRef.current;
    if (!canvas || !waveformRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const values = waveformRef.current.getValue();

    // Clear canvas
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1;

    // Horizontal lines
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Vertical lines
    for (let i = 0; i <= 8; i++) {
      const x = (width / 8) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw waveform
    ctx.beginPath();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;

    const sliceWidth = width / values.length;
    let x = 0;

    for (let i = 0; i < values.length; i++) {
      const value = values[i] as number;
      const y = ((value + 1) / 2) * height;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.stroke();

    // Draw zero line
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  };

  const drawSpectrum = () => {
    const canvas = spectrumCanvasRef.current;
    if (!canvas || !analyzerRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const values = analyzerRef.current.getValue() as Float32Array;

    // Clear canvas
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, width, height);

    // Draw frequency bars
    const barWidth = width / values.length;
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(0.5, '#8b5cf6');
    gradient.addColorStop(1, '#ec4899');

    for (let i = 0; i < values.length; i++) {
      // Convert dB to 0-1 range (roughly -100dB to 0dB)
      const value = values[i] ?? -100;
      const normalizedValue = Math.max(0, Math.min(1, (value + 100) / 100));

      const barHeight = normalizedValue * height;
      const x = i * barWidth;
      const y = height - barHeight;

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    }

    // Draw frequency labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';

    const freqLabels = ['60', '250', '1k', '4k', '16k'];
    const freqPositions = [0.1, 0.3, 0.5, 0.7, 0.9];

    freqLabels.forEach((label, i) => {
      const position = freqPositions[i];
      if (position !== undefined) {
        const x = width * position;
        ctx.fillText(label, x, height - 5);
      }
    });
  };

  return (
    <div className={cn(className)}>
      {(type === 'waveform' || type === 'both') && (
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            Waveform
          </div>
          <div className="rounded-lg overflow-hidden border border-gray-800 bg-gray-950">
            <canvas
              ref={waveformCanvasRef}
              width={800}
              height={height}
              className="w-full"
              style={{ height: `${height}px` }}
            />
          </div>
        </motion.div>
      )}

      {(type === 'spectrum' || type === 'both') && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: type === 'both' ? 0.3 : 0.2 }}
        >
          <div className="mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            Frequency Spectrum
          </div>
          <div className="rounded-lg overflow-hidden border border-gray-800 bg-gray-950">
            <canvas
              ref={spectrumCanvasRef}
              width={800}
              height={height}
              className="w-full"
              style={{ height: `${height}px` }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};
