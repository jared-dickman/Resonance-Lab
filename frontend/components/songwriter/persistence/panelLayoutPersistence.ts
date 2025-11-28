import { withLocalStorage } from '@/lib/utils/dom/safeBrowserStorage';

import type { PanelConfiguration, PanelId, PanelLayoutState } from '@/components/songwriter/types/ui';

const PANEL_LAYOUT_STORAGE_KEY = 'songwriter_panel_layout_v2';
const REQUIRED_PANELS: ReadonlyArray<PanelId> = ['navigator', 'workspace', 'assistant'];

export function savePanelLayoutToLocalStorage(layout: PanelLayoutState): void {
  withLocalStorage(storage => {
    const serialized = JSON.stringify({
      panels: layout.panels,
      totalWidth: layout.totalWidth,
      layoutVersion: layout.layoutVersion,
      lastResizedAt: layout.lastResizedAt?.toISOString() || null,
    });

    storage.setItem(PANEL_LAYOUT_STORAGE_KEY, serialized);
  });
}

export function loadPanelLayoutFromLocalStorage(): PanelLayoutState | null {
  return (
    withLocalStorage(
      storage => {
        const serialized = storage.getItem(PANEL_LAYOUT_STORAGE_KEY);
        if (!serialized) {
          return null;
        }

      const parsed = JSON.parse(serialized);
      const layout: PanelLayoutState = {
        panels: parsed.panels,
        totalWidth: parsed.totalWidth,
        layoutVersion: parsed.layoutVersion,
        lastResizedAt: parsed.lastResizedAt ? new Date(parsed.lastResizedAt) : null,
      };

      return hasAllRequiredPanels(layout) ? layout : null;
    },
    () => null
  ) ?? null
  );
}

export function createDefaultPanelLayout(): PanelLayoutState {
  return {
    panels: [
      createDefaultNavigatorPanel(),
      createDefaultWorkspacePanel(),
      createDefaultAssistantPanel(),
    ],
    totalWidth: 1440,
    lastResizedAt: null,
    layoutVersion: 1,
  };
}

function createDefaultNavigatorPanel(): PanelConfiguration {
  return {
    panelId: 'navigator',
    widthPercentage: 22,
    minWidthPixels: 260,
    maxWidthPixels: 420,
    state: 'expanded',
    isResizable: true,
    order: 0,
  };
}

function createDefaultWorkspacePanel(): PanelConfiguration {
  return {
    panelId: 'workspace',
    widthPercentage: 50,
    minWidthPixels: 520,
    maxWidthPixels: null,
    state: 'expanded',
    isResizable: true,
    order: 1,
  };
}

function createDefaultAssistantPanel(): PanelConfiguration {
  return {
    panelId: 'assistant',
    widthPercentage: 28,
    minWidthPixels: 320,
    maxWidthPixels: 520,
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

function hasAllRequiredPanels(layout: PanelLayoutState): boolean {
  return REQUIRED_PANELS.every(requiredId =>
    layout.panels.some(panel => panel.panelId === requiredId)
  );
}
