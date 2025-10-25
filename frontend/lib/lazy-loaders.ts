/**
 * Lazy loading utilities for heavy music data libraries
 * Implements code splitting to reduce initial bundle size
 */

/**
 * Lazy load piano chord data (500 lines, ~50KB)
 * Only loads when piano keyboard is actually used
 */
export const loadPianoChords = async () => {
  const { PIANO_CHORD_DATABASE } = await import('./pianoChords');
  return PIANO_CHORD_DATABASE;
};

/**
 * Lazy load guitar chord positions (436 lines, ~40KB)
 * Only loads when fretboard is actually used
 */
export const loadChordPositions = async () => {
  const { getChordVoicings } = await import('./chordPositions');
  return getChordVoicings;
};

/**
 * Lazy load jam progressions library (362 lines, ~30KB)
 * Only loads when Jam Assistant page is accessed
 */
export const loadJamProgressions = async () => {
  const module = await import('./jamProgressions');
  return {
    getProgressionsByVibe: module.getProgressionsByVibe,
    getNextChordSuggestions: module.getNextChordSuggestions,
    VIBE_INFO: module.VIBE_INFO,
    FUNCTION_COLORS: module.FUNCTION_COLORS,
  };
};

/**
 * Preload critical data on idle
 * Uses requestIdleCallback for non-blocking preload
 */
export const preloadCriticalData = () => {
  if (typeof window === 'undefined') return;

  const preload = () => {
    // Preload jam progressions after 2 seconds of idle
    loadJamProgressions();
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(preload, { timeout: 2000 });
  } else {
    setTimeout(preload, 2000);
  }
};
