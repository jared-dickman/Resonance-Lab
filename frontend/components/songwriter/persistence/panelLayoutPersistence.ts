import type { PanelConfiguration, PanelLayoutState } from '../types/ui';

const PANEL_LAYOUT_STORAGE_KEY = 'songwriter_panel_layout_v1';

export function savePanelLayoutToLocalStorage(layout: PanelLayoutState): void {
  try {
    const serialized = JSON.stringify({
      panels: layout.panels,
      totalWidth: layout.totalWidth,
      layoutVersion: layout.layoutVersion,
      lastResizedAt: layout.lastResizedAt?.toISOString() || null,
    });
    localStorage.setItem(PANEL_LAYOUT_STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save panel layout:', error);
  }
}

export function loadPanelLayoutFromLocalStorage(): PanelLayoutState | null {
  try {
    const serialized = localStorage.getItem(PANEL_LAYOUT_STORAGE_KEY);
    if (!serialized) return null;

    const parsed = JSON.parse(serialized);
    return {
      panels: parsed.panels,
      totalWidth: parsed.totalWidth,
      layoutVersion: parsed.layoutVersion,
      lastResizedAt: parsed.lastResizedAt ? new Date(parsed.lastResizedAt) : null,
    };
  } catch (error) {
    console.error('Failed to load panel layout:', error);
    return null;
  }
}

export function createDefaultPanelLayout(): PanelLayoutState {
  return {
    panels: [
      createDefaultChatPanel(),
      createDefaultLyricsPanel(),
      createDefaultChordsPanel(),
    ],
    totalWidth: 1200,
    lastResizedAt: null,
    layoutVersion: 1,
  };
}

function createDefaultChatPanel(): PanelConfiguration {
  return {
    panelId: 'chat',
    widthPercentage: 25,
    minWidthPixels: 300,
    maxWidthPixels: 600,
    state: 'expanded',
    isResizable: true,
    order: 0,
  };
}

function createDefaultLyricsPanel(): PanelConfiguration {
  return {
    panelId: 'lyrics',
    widthPercentage: 45,
    minWidthPixels: 400,
    maxWidthPixels: null,
    state: 'expanded',
    isResizable: true,
    order: 1,
  };
}

function createDefaultChordsPanel(): PanelConfiguration {
  return {
    panelId: 'chords',
    widthPercentage: 30,
    minWidthPixels: 300,
    maxWidthPixels: 500,
    state: 'expanded',
    isResizable: true,
    order: 2,
  };
}

export function updatePanelWidth(
  layout: PanelLayoutState,
  panelId: string,
  newWidthPercentage: number
): PanelLayoutState {
  const updatedPanels = layout.panels.map((panel) =>
    panel.panelId === panelId
      ? { ...panel, widthPercentage: newWidthPercentage }
      : panel
  );

  return {
    ...layout,
    panels: updatedPanels,
    lastResizedAt: new Date(),
    layoutVersion: layout.layoutVersion + 1,
  };
}

export function togglePanelState(
  layout: PanelLayoutState,
  panelId: string
): PanelLayoutState {
  const updatedPanels = layout.panels.map((panel) => {
    if (panel.panelId === panelId) {
      const newState: 'expanded' | 'collapsed' =
        panel.state === 'collapsed' ? 'expanded' : 'collapsed';
      return { ...panel, state: newState };
    }
    return panel;
  });

  return {
    ...layout,
    panels: updatedPanels,
    lastResizedAt: new Date(),
    layoutVersion: layout.layoutVersion + 1,
  };
}

export function calculatePanelWidthInPixels(
  panel: PanelConfiguration,
  totalWidth: number
): number {
  return Math.floor((panel.widthPercentage / 100) * totalWidth);
}

export function validatePanelWidths(layout: PanelLayoutState): boolean {
  const totalPercentage = layout.panels.reduce(
    (sum, panel) => sum + panel.widthPercentage,
    0
  );

  return Math.abs(totalPercentage - 100) < 0.1;
}

export function redistributePanelWidths(layout: PanelLayoutState): PanelLayoutState {
  const expandedPanels = layout.panels.filter((p) => p.state === 'expanded');

  if (expandedPanels.length === 0) return layout;

  const equalWidth = 100 / expandedPanels.length;

  const updatedPanels = layout.panels.map((panel) =>
    panel.state === 'expanded'
      ? { ...panel, widthPercentage: equalWidth }
      : { ...panel, widthPercentage: 0 }
  );

  return {
    ...layout,
    panels: updatedPanels,
    lastResizedAt: new Date(),
    layoutVersion: layout.layoutVersion + 1,
  };
}
