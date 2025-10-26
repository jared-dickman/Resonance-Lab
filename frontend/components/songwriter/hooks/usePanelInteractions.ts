import { useCallback } from 'react';
import type { PanelLayoutState, PanelId } from '../types/ui';
import { togglePanelState } from '../persistence/panelLayoutPersistence';

export interface PanelInteractionHandlers {
  togglePanel: (panelId: PanelId) => void;
  focusPanel: (panelId: PanelId) => void;
  isPanelExpanded: (panelId: PanelId) => boolean;
}

export function usePanelInteractions(
  panelLayout: PanelLayoutState,
  setPanelLayout: (layout: PanelLayoutState | ((prev: PanelLayoutState) => PanelLayoutState)) => void
): PanelInteractionHandlers {
  const togglePanel = useCallback(
    (panelId: PanelId): void => {
      setPanelLayout((prev) => togglePanelState(prev, panelId));
    },
    [setPanelLayout]
  );

  const focusPanel = useCallback(
    (panelId: PanelId): void => {
      const panelElement = document.getElementById(`${panelId}-panel`);
      panelElement?.focus();
    },
    []
  );

  const isPanelExpanded = useCallback(
    (panelId: PanelId): boolean => {
      const panel = panelLayout.panels.find((p) => p.panelId === panelId);
      return panel?.state === 'expanded';
    },
    [panelLayout]
  );

  return {
    togglePanel,
    focusPanel,
    isPanelExpanded,
  };
}
