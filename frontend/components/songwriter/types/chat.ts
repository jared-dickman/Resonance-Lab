// Chat-related types
export type ConversationMessage = any;

export type ConversationHistory = {
  messages: ReadonlyArray<ConversationMessage>;
};

export type AgentRequest = any;
export type StreamingChunk = any;
export type AgentError = any;
export type AgentState = any;
export type QuickPrompt = any;
export type ConversationSessionMetrics = any;

export type AgentIntentCategory =
  | 'rhymeHelp'
  | 'chordSuggestion'
  | 'lyricSuggestion'
  | 'structureSuggestion'
  | 'themeExploration'
  | 'editFeedback'
  | 'technicalQuestion'
  | 'generalConversation';

export type TextSelectionRange = {
  start: number;
  end: number;
};

export type UserQueryContext = {
  queryText: string;
  queryTimestamp: Date;
  queryIntent: AgentIntentCategory;
  targetSection: any;
  targetLineNumbers: any;
  previousMessages: ReadonlyArray<ConversationMessage>;
  currentFocusArea: any;
};

export type CompleteSongContext = {
  songState: any;
  activeSection: any;
  activeLine: any;
  cursorPosition: any;
  selectionRange: any;
  recentEdits: any;
  sessionGoals: any;
  userConstraints: any;
};

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type SuggestionType =
  | 'lyric'
  | 'chord'
  | 'structure'
  | 'thematic'
  | 'edit';

export type LyricSuggestion = {
  type: 'lyric';
  text: string;
  confidence: ConfidenceLevel;
};

export type ChordSuggestion = {
  type: 'chord';
  chords: string[];
  confidence: ConfidenceLevel;
};

export type StructureSuggestion = {
  type: 'structure';
  suggestion: string;
  confidence: ConfidenceLevel;
};

export type ThematicFeedback = {
  type: 'thematic';
  feedback: string;
  confidence: ConfidenceLevel;
};

export type EditSuggestion = {
  type: 'edit';
  original: string;
  suggested: string;
  reasoning: string;
  confidence: ConfidenceLevel;
};

export type AgentSuggestion =
  | LyricSuggestion
  | ChordSuggestion
  | StructureSuggestion
  | ThematicFeedback
  | EditSuggestion;

export type AgentResponse = {
  suggestions: AgentSuggestion[];
  message: string;
};
