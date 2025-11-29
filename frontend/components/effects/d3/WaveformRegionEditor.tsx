'use client';

import { useEffect, useRef, useState } from 'react';
import type WaveSurfer from 'wavesurfer.js';
import type RegionsPlugin from 'wavesurfer.js/dist/plugins/regions';
import { CANVAS_DIMENSIONS } from '@/lib/constants/visualization.constants';
import {
  type Region,
  createWaveSurfer,
  enableDragSelection,
  createInitialRegions,
  addRegion,
  formatTime,
  getZoomLevels,
  getDefaultAudioUrl,
  convertToRegion,
} from '@/lib/utils/audio/waveform.utils';

interface WaveformRegionEditorProps {
  audioUrl?: string;
  width?: number;
  height?: number;
  onRegionCreate?: (region: Region) => void;
  onRegionUpdate?: (region: Region) => void;
}

function setupPlaybackEventListeners(
  wavesurfer: WaveSurfer,
  setIsPlaying: (playing: boolean) => void,
  setCurrentTime: (time: number) => void,
  setDuration: (duration: number) => void
): void {
  wavesurfer.on('play', () => setIsPlaying(true));
  wavesurfer.on('pause', () => setIsPlaying(false));
  wavesurfer.on('audioprocess', () => setCurrentTime(wavesurfer.getCurrentTime()));
  wavesurfer.on('seeking', () => setCurrentTime(wavesurfer.getCurrentTime()));
  wavesurfer.on('ready', () => setDuration(wavesurfer.getDuration()));
}

function setupRegionEventListeners(
  regionsPlugin: RegionsPlugin,
  setRegions: React.Dispatch<React.SetStateAction<Region[]>>,
  onRegionCreate?: (region: Region) => void,
  onRegionUpdate?: (region: Region) => void
): void {
  regionsPlugin.on('region-created', region => {
    const newRegion = convertToRegion(region, 'New Region');
    setRegions(prev => [...prev, newRegion]);
    onRegionCreate?.(newRegion);
  });

  regionsPlugin.on('region-updated', region => {
    const updatedRegion = convertToRegion(region);
    setRegions(prev => prev.map(r => (r.id === region.id ? updatedRegion : r)));
    onRegionUpdate?.(updatedRegion);
  });

  regionsPlugin.on('region-clicked', (region, e) => {
    e.stopPropagation();
    region.play();
  });
}

function initializeRegions(
  wavesurfer: WaveSurfer,
  regionsPlugin: RegionsPlugin,
  setRegions: React.Dispatch<React.SetStateAction<Region[]>>
): void {
  wavesurfer.on('ready', () => {
    const initialRegions = createInitialRegions(regionsPlugin, wavesurfer.getDuration());
    setRegions(initialRegions);
  });
}

export const WaveformRegionEditor: React.FC<WaveformRegionEditorProps> = ({
  audioUrl = getDefaultAudioUrl(),
  width = CANVAS_DIMENSIONS.REGION_EDITOR.WIDTH,
  height = CANVAS_DIMENSIONS.REGION_EDITOR.HEIGHT,
  onRegionCreate,
  onRegionUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsPluginRef = useRef<RegionsPlugin | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [regions, setRegions] = useState<Region[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const wavesurfer = createWaveSurfer({
      container: containerRef.current,
      height,
      audioUrl,
    });

    wavesurferRef.current = wavesurfer;
    const regionsPlugin = wavesurfer.getActivePlugins()[0] as RegionsPlugin;
    regionsPluginRef.current = regionsPlugin;

    setupPlaybackEventListeners(wavesurfer, setIsPlaying, setCurrentTime, setDuration);
    setupRegionEventListeners(regionsPlugin, setRegions, onRegionCreate, onRegionUpdate);
    initializeRegions(wavesurfer, regionsPlugin, setRegions);
    enableDragSelection(regionsPlugin);

    return () => {
      wavesurfer.destroy();
    };
  }, [audioUrl, height, onRegionCreate, onRegionUpdate]);

  const createRegionHandler = (start: number, end: number, color: string, label: string): void => {
    if (!regionsPluginRef.current) return;

    const newRegion = addRegion(regionsPluginRef.current, start, end, color, label);
    setRegions(prev => [...prev, newRegion]);
  };

  const handlePlayPause = (): void => {
    wavesurferRef.current?.playPause();
  };

  const handleStop = (): void => {
    wavesurferRef.current?.stop();
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleZoom = (zoomLevel: number): void => {
    wavesurferRef.current?.zoom(zoomLevel);
  };

  return (
    <div className="bg-gray-950 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Waveform Editor</h3>
        <div className="text-sm text-gray-400">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Waveform */}
      <div ref={containerRef} className="mb-4 rounded overflow-hidden" />

      {/* Controls */}
      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={handlePlayPause}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition"
        >
          {isPlaying ? '⏸ Pause' : '▶️ Play'}
        </button>
        <button
          onClick={handleStop}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-semibold transition"
        >
          ⏹ Stop
        </button>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Zoom:</span>
          {getZoomLevels().map(level => (
            <button
              key={level}
              onClick={() => handleZoom(level)}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Region List */}
      <div className="space-y-2">
        <div className="text-sm font-semibold text-gray-400 mb-2">Regions ({regions.length})</div>
        {regions.map(region => (
          <div
            key={region.id}
            className="flex items-center justify-between p-2 bg-gray-900 rounded"
          >
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: region.color }} />
              <span className="text-sm text-white font-medium">{region.label}</span>
            </div>
            <div className="text-xs text-gray-500">
              {formatTime(region.start)} - {formatTime(region.end)}
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-gray-900 rounded text-xs text-gray-400">
        <div className="font-semibold mb-1">Instructions:</div>
        <ul className="space-y-1">
          <li>• Click and drag on waveform to create new regions</li>
          <li>• Drag regions to move them</li>
          <li>• Drag region edges to resize</li>
          <li>• Click regions to play them</li>
        </ul>
      </div>
    </div>
  );
};
