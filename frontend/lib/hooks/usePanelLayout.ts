/**
 * Panel Layout State Hook
 * Manages panel sizes with localStorage persistence
 * FIXES INFINITE LOOP: storage instance created once outside hook
 */

import { useState, useEffect, useCallback, useRef } from 'react';

import { PANEL_CONFIG, STORAGE_KEYS } from '@/lib/constants/songwriter.constants';
import { createLocalStorageAdapter } from '@/components/songwriter/persistence/localStorageAdapter';

export function usePanelLayout(): {
  panelSizes: number[];
  handlePanelResize: (sizes: number[]) => void;
} {
  const [panelSizes, setPanelSizes] = useState<number[]>([...PANEL_CONFIG.DEFAULT_SIZES]);
  const storageRef = useRef(createLocalStorageAdapter());

  const loadSavedLayout = useCallback(async (): Promise<void> => {
    const saved = await storageRef.current.load<number[]>(STORAGE_KEYS.PANEL_LAYOUT);
    const isValidLayout = saved && Array.isArray(saved) && saved.length === 3;

    if (isValidLayout) {
      setPanelSizes(saved);
    }
  }, []);

  useEffect(() => {
    loadSavedLayout();
  }, [loadSavedLayout]);

  const handlePanelResize = useCallback((sizes: number[]): void => {
    setPanelSizes(sizes);
    storageRef.current.save(STORAGE_KEYS.PANEL_LAYOUT, sizes);
  }, []);

  return { panelSizes, handlePanelResize };
}
