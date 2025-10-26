import { useEffect } from 'react';
import type { PanelId } from '../types/ui';

export interface KeyboardShortcutHandlers {
  onToggleChat?: () => void;
  onToggleLyrics?: () => void;
  onToggleChords?: () => void;
  onFocusChat?: () => void;
  onFocusLyrics?: () => void;
  onFocusChords?: () => void;
  onSave?: () => void;
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.metaKey || event.ctrlKey) {
        handleMetaKey(event, handlers);
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return (): void => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlers]);
}

function handleMetaKey(event: KeyboardEvent, handlers: KeyboardShortcutHandlers): void {
  const key = event.key.toLowerCase();

  const shortcuts: Record<string, (() => void) | undefined> = {
    '1': handlers.onFocusChat,
    '2': handlers.onFocusLyrics,
    '3': handlers.onFocusChords,
    's': handlers.onSave,
  };

  const handler = shortcuts[key];

  if (handler) {
    event.preventDefault();
    handler();
  }

  if (event.shiftKey) {
    handleShiftMetaKey(event, handlers);
  }
}

function handleShiftMetaKey(event: KeyboardEvent, handlers: KeyboardShortcutHandlers): void {
  const key = event.key.toLowerCase();

  const shiftShortcuts: Record<string, (() => void) | undefined> = {
    '1': handlers.onToggleChat,
    '2': handlers.onToggleLyrics,
    '3': handlers.onToggleChords,
  };

  const handler = shiftShortcuts[key];

  if (handler) {
    event.preventDefault();
    handler();
  }
}

export function createPanelShortcutHandlers(
  togglePanel: (panelId: PanelId) => void,
  focusPanel: (panelId: PanelId) => void,
  onSave?: () => void
): KeyboardShortcutHandlers {
  return {
    onToggleChat: (): void => togglePanel('chat'),
    onToggleLyrics: (): void => togglePanel('lyrics'),
    onToggleChords: (): void => togglePanel('chords'),
    onFocusChat: (): void => focusPanel('chat'),
    onFocusLyrics: (): void => focusPanel('lyrics'),
    onFocusChords: (): void => focusPanel('chords'),
    onSave,
  };
}
