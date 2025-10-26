/**
 * Waveform Utilities
 * Helper functions for WaveSurfer region editor
 */

import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline';
import { WAVEFORM_EDITOR, VISUALIZATION_COLORS } from '@/lib/constants/visualization.constants';

export interface Region {
  id: string;
  start: number;
  end: number;
  color: string;
  label: string;
}

export interface WaveformConfig {
  container: HTMLDivElement;
  height: number;
  audioUrl: string;
}

const WAVEFORM_CONFIG = {
  DEFAULT_AUDIO_URL: '/samples/demo.mp3',
  DRAG_SELECTION_COLOR: 'rgba(255, 0, 0, 0.3)',
  TIMELINE_FONT_SIZE: '10px',
  INITIAL_REGIONS: [
    { startRatio: 0, endRatio: 0.25, color: WAVEFORM_EDITOR.REGION_COLORS.INTRO, label: 'Intro' },
    { startRatio: 0.25, endRatio: 0.5, color: WAVEFORM_EDITOR.REGION_COLORS.VERSE, label: 'Verse' },
    { startRatio: 0.5, endRatio: 0.75, color: WAVEFORM_EDITOR.REGION_COLORS.CHORUS, label: 'Chorus' },
    { startRatio: 0.75, endRatio: 1, color: WAVEFORM_EDITOR.REGION_COLORS.OUTRO, label: 'Outro' },
  ],
} as const;

export function getDefaultAudioUrl(): string {
  return WAVEFORM_CONFIG.DEFAULT_AUDIO_URL;
}

export function createTimelinePlugin(): TimelinePlugin {
  return TimelinePlugin.create({
    height: WAVEFORM_EDITOR.TIMELINE_HEIGHT,
    insertPosition: 'beforebegin',
    timeInterval: WAVEFORM_EDITOR.TIME_INTERVALS.SECONDARY,
    primaryLabelInterval: WAVEFORM_EDITOR.TIME_INTERVALS.PRIMARY,
    secondaryLabelInterval: WAVEFORM_EDITOR.TIME_INTERVALS.SECONDARY,
    style: {
      fontSize: WAVEFORM_CONFIG.TIMELINE_FONT_SIZE,
      color: VISUALIZATION_COLORS.UI.TEXT_SECONDARY,
    },
  });
}

export function createWaveSurfer(config: WaveformConfig): WaveSurfer {
  const regionsPlugin = RegionsPlugin.create();
  const timelinePlugin = createTimelinePlugin();

  const wavesurfer = WaveSurfer.create({
    container: config.container,
    waveColor: WAVEFORM_EDITOR.WAVEFORM_STYLE.WAVE_COLOR,
    progressColor: WAVEFORM_EDITOR.WAVEFORM_STYLE.PROGRESS_COLOR,
    cursorColor: WAVEFORM_EDITOR.WAVEFORM_STYLE.CURSOR_COLOR,
    barWidth: WAVEFORM_EDITOR.WAVEFORM_STYLE.BAR_WIDTH,
    barGap: WAVEFORM_EDITOR.WAVEFORM_STYLE.BAR_GAP,
    barRadius: WAVEFORM_EDITOR.WAVEFORM_STYLE.BAR_RADIUS,
    height: config.height,
    normalize: true,
    plugins: [regionsPlugin, timelinePlugin],
  });

  wavesurfer.load(config.audioUrl);

  return wavesurfer;
}

export function enableDragSelection(regionsPlugin: RegionsPlugin): void {
  regionsPlugin.enableDragSelection({
    color: WAVEFORM_CONFIG.DRAG_SELECTION_COLOR,
  });
}

export function createInitialRegions(
  regionsPlugin: RegionsPlugin,
  duration: number
): Region[] {
  const regions: Region[] = [];

  WAVEFORM_CONFIG.INITIAL_REGIONS.forEach((config) => {
    const start = duration * config.startRatio;
    const end = duration * config.endRatio;

    const region = regionsPlugin.addRegion({
      start,
      end,
      color: config.color,
      drag: true,
      resize: true,
      content: config.label,
    });

    regions.push({
      id: region.id,
      start,
      end,
      color: config.color,
      label: config.label,
    });
  });

  return regions;
}

export function addRegion(
  regionsPlugin: RegionsPlugin,
  start: number,
  end: number,
  color: string,
  label: string
): Region {
  const region = regionsPlugin.addRegion({
    start,
    end,
    color,
    drag: true,
    resize: true,
    content: label,
  });

  return {
    id: region.id,
    start,
    end,
    color,
    label,
  };
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getZoomLevels(): readonly number[] {
  return WAVEFORM_EDITOR.ZOOM_LEVELS;
}

export function convertToRegion(
  wavesurferRegion: any,
  label?: string
): Region {
  return {
    id: wavesurferRegion.id,
    start: wavesurferRegion.start,
    end: wavesurferRegion.end,
    color: wavesurferRegion.color,
    label: label || wavesurferRegion.content?.textContent || 'Region',
  };
}
