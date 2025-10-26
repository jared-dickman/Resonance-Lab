export type PanelId = 'navigator' | 'workspace' | 'assistant';

export type PanelState = 'expanded' | 'collapsed' | 'minimized';

export type EditorMode = 'editing' | 'viewing' | 'selecting' | 'readOnly';

export type FocusArea =
  | 'assistant'
  | 'workspace'
  | 'navigator'
  | 'chat'
  | 'lyrics'
  | 'chords'
  | 'general'
  | 'structure'
  | 'none';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PanelConfiguration {
  readonly panelId: PanelId;
  readonly widthPercentage: number;
  readonly minWidthPixels: number;
  readonly maxWidthPixels: number | null;
  readonly state: PanelState;
  readonly isResizable: boolean;
  readonly order: number;
}

export interface PanelLayoutState {
  readonly panels: ReadonlyArray<PanelConfiguration>;
  readonly totalWidth: number;
  readonly lastResizedAt: Date | null;
  readonly layoutVersion: number;
}

export interface EditorState {
  readonly mode: EditorMode;
  readonly cursorLine: number | null;
  readonly cursorColumn: number | null;
  readonly selectionStart: TextPosition | null;
  readonly selectionEnd: TextPosition | null;
  readonly hasUnsavedChanges: boolean;
  readonly lastSavedAt: Date | null;
  readonly isDirty: boolean;
}

export interface TextPosition {
  readonly line: number;
  readonly column: number;
}

export interface ScrollPosition {
  readonly scrollTop: number;
  readonly scrollLeft: number;
  readonly scrollHeight: number;
  readonly clientHeight: number;
  readonly isAtTop: boolean;
  readonly isAtBottom: boolean;
}

export interface ChatUIState {
  readonly isTyping: boolean;
  readonly isExpanded: boolean;
  readonly messageInputValue: string;
  readonly scrollPosition: ScrollPosition;
  readonly showQuickPrompts: boolean;
  readonly selectedQuickPromptId: string | null;
}

export interface LyricsUIState {
  readonly editorState: EditorState;
  readonly activeSection: number | null;
  readonly showSectionLabels: boolean;
  readonly showLineNumbers: boolean;
  readonly showSyllableCounts: boolean;
  readonly showRhymeHighlights: boolean;
  readonly fontSize: number;
  readonly lineHeight: number;
}

export interface ChordsUIState {
  readonly selectedChordIndex: number | null;
  readonly isPlaying: boolean;
  readonly playbackPosition: number;
  readonly showHarmonicAnalysis: boolean;
  readonly showVoicings: boolean;
  readonly displayMode: 'list' | 'grid' | 'timeline';
}

export interface GlobalUIState {
  readonly focusArea: FocusArea;
  readonly panelLayout: PanelLayoutState;
  readonly chatUI: ChatUIState;
  readonly lyricsUI: LyricsUIState;
  readonly chordsUI: ChordsUIState;
  readonly showDraftManager: boolean;
  readonly showSettings: boolean;
  readonly theme: 'light' | 'dark' | 'system';
  readonly loadingState: LoadingState;
  readonly errorMessage: string | null;
}

export interface KeyboardShortcut {
  readonly key: string;
  readonly modifiers: ReadonlyArray<'ctrl' | 'shift' | 'alt' | 'meta'>;
  readonly action: string;
  readonly description: string;
  readonly isEnabled: boolean;
}

export interface ToastNotification {
  readonly id: string;
  readonly message: string;
  readonly type: 'success' | 'error' | 'warning' | 'info';
  readonly duration: number;
  readonly timestamp: Date;
  readonly dismissible: boolean;
}

export interface ModalState {
  readonly isOpen: boolean;
  readonly modalType: 'draftManager' | 'settings' | 'export' | 'help' | 'confirmation' | null;
  readonly modalData: unknown;
}

export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly severity: 'error' | 'warning' | 'info';
}

export interface FormState<T> {
  readonly values: T;
  readonly errors: ReadonlyArray<ValidationError>;
  readonly touched: ReadonlySet<string>;
  readonly isSubmitting: boolean;
  readonly isValid: boolean;
}

export interface DragState {
  readonly isDragging: boolean;
  readonly draggedItemId: string | null;
  readonly draggedItemType: 'chord' | 'section' | 'line' | null;
  readonly dropTargetId: string | null;
  readonly canDrop: boolean;
}

export interface ResizeState {
  readonly isResizing: boolean;
  readonly resizingPanelId: PanelId | null;
  readonly startX: number | null;
  readonly startWidth: number | null;
}

export interface AutosaveState {
  readonly isAutosaveEnabled: boolean;
  readonly autosaveInterval: number;
  readonly lastAutosaveAt: Date | null;
  readonly nextAutosaveAt: Date | null;
  readonly autosaveInProgress: boolean;
}

export interface UndoRedoState {
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly undoStackSize: number;
  readonly redoStackSize: number;
  readonly maxStackSize: number;
}

export interface ProgressIndicator {
  readonly isVisible: boolean;
  readonly progressPercentage: number;
  readonly message: string;
  readonly isIndeterminate: boolean;
}

export interface AccessibilityState {
  readonly highContrastMode: boolean;
  readonly fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  readonly reducedMotion: boolean;
  readonly screenReaderMode: boolean;
  readonly keyboardNavigationEnabled: boolean;
}
