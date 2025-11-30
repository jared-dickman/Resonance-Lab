'use client';

import { useState, useEffect, useCallback } from 'react';
import { withLocalStorage } from '@/lib/utils/dom/safeBrowserStorage';
import type { ChordProgression } from '@/lib/jamProgressions';

const STORAGE_KEY = 'jamium_saved_jams';

export interface SavedJam extends ChordProgression {
  savedAt: string;
}

export function useSavedJams() {
  const [savedJams, setSavedJams] = useState<SavedJam[]>([]);

  useEffect(() => {
    const stored = withLocalStorage(
      storage => JSON.parse(storage.getItem(STORAGE_KEY) || '[]'),
      []
    );
    setSavedJams(stored as SavedJam[]);
  }, []);

  const saveJam = useCallback((progression: ChordProgression, name?: string) => {
    const jam: SavedJam = {
      ...progression,
      id: `jam_${Date.now()}`,
      name: name || progression.name || 'My Jam',
      savedAt: new Date().toISOString(),
    };

    setSavedJams(prev => {
      const updated = [jam, ...prev];
      withLocalStorage(storage => storage.setItem(STORAGE_KEY, JSON.stringify(updated)));
      return updated;
    });

    return jam;
  }, []);

  const deleteJam = useCallback((id: string) => {
    setSavedJams(prev => {
      const updated = prev.filter(j => j.id !== id);
      withLocalStorage(storage => storage.setItem(STORAGE_KEY, JSON.stringify(updated)));
      return updated;
    });
  }, []);

  return { savedJams, saveJam, deleteJam };
}
