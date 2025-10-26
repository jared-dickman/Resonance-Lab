import { useEffect } from 'react';
import type { PanelId } from '../types/ui';

export interface KeyboardShortcutHandlers {
  onToggleNavigator?: () => void;
  onToggleWorkspace?: () => void;
  onToggleAssistant?: () => void;
  onFocusNavigator?: () => void;
  onFocusWorkspace?: () => void;
  onFocusAssistant?: () => void;
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
    '1': handlers.onFocusNavigator,
    '2': handlers.onFocusWorkspace,
    '3': handlers.onFocusAssistant,
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
    '1': handlers.onToggleNavigator,
    '2': handlers.onToggleWorkspace,
    '3': handlers.onToggleAssistant,
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
    onToggleNavigator: (): void => togglePanel('navigator'),
    onToggleWorkspace: (): void => togglePanel('workspace'),
    onToggleAssistant: (): void => togglePanel('assistant'),
    onFocusNavigator: (): void => focusPanel('navigator'),
    onFocusWorkspace: (): void => focusPanel('workspace'),
    onFocusAssistant: (): void => focusPanel('assistant'),
    onSave,
  };
}
