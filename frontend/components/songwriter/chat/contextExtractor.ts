import type {
  CompleteSongState,
  SectionType,
  EditHistoryEntry,
  UserPreferences,
} from '../types/song';
import type {
  CompleteSongContext,
  UserQueryContext,
  AgentRequest,
  ConversationHistory,
  AgentIntentCategory,
  ConversationMessage,
  TextSelectionRange,
} from '../types/chat';
import type { GlobalUIState } from '../types/ui';

export function extractUserQueryContext(
  queryText: string,
  previousMessages: ReadonlyArray<ConversationMessage>,
  uiState: GlobalUIState
): UserQueryContext {
  return {
    queryText,
    queryTimestamp: new Date(),
    queryIntent: detectQueryIntent(queryText),
    targetSection: detectTargetSection(queryText, uiState),
    targetLineNumbers: extractLineNumbers(queryText),
    previousMessages,
    currentFocusArea: uiState.focusArea,
  };
}

export function extractCompleteSongContext(
  songState: CompleteSongState,
  uiState: GlobalUIState
): CompleteSongContext {
  return {
    songState,
    activeSection: determineActiveSection(uiState),
    activeLine: uiState.lyricsUI.editorState.cursorLine,
    cursorPosition: uiState.lyricsUI.editorState.cursorColumn,
    selectionRange: buildSelectionRange(uiState),
    recentEdits: extractRecentEdits(songState.editHistory),
    sessionGoals: extractSessionGoals(songState),
    userConstraints: buildUserConstraints(songState.userPreferences),
  };
}

export function buildAgentRequest(
  queryText: string,
  songState: CompleteSongState,
  conversationHistory: ConversationHistory,
  uiState: GlobalUIState,
  sessionId: string
): AgentRequest {
  const userQuery = extractUserQueryContext(queryText, conversationHistory.messages, uiState);

  const songContext = extractCompleteSongContext(songState, uiState);

  return {
    requestId: generateRequestId(),
    userQuery,
    songContext,
    conversationHistory,
    requestTimestamp: new Date(),
    clientVersion: '1.0.0',
    sessionId,
  };
}

function detectQueryIntent(queryText: string): AgentIntentCategory {
  const lowerQuery = queryText.toLowerCase();

  if (lowerQuery.includes('rhyme') || lowerQuery.includes('word that rhymes')) {
    return 'rhymeHelp';
  }

  if (lowerQuery.includes('chord') || lowerQuery.includes('progression')) {
    return 'chordSuggestion';
  }

  if (
    lowerQuery.includes('verse') ||
    lowerQuery.includes('chorus') ||
    lowerQuery.includes('line')
  ) {
    return 'lyricSuggestion';
  }

  if (
    lowerQuery.includes('structure') ||
    lowerQuery.includes('bridge') ||
    lowerQuery.includes('section')
  ) {
    return 'structureSuggestion';
  }

  if (
    lowerQuery.includes('theme') ||
    lowerQuery.includes('story') ||
    lowerQuery.includes('character')
  ) {
    return 'themeExploration';
  }

  if (
    lowerQuery.includes('edit') ||
    lowerQuery.includes('improve') ||
    lowerQuery.includes('better')
  ) {
    return 'editFeedback';
  }

  if (lowerQuery.includes('?') && lowerQuery.split(' ').length < 10) {
    return 'technicalQuestion';
  }

  return 'generalConversation';
}

function detectTargetSection(queryText: string, uiState: GlobalUIState): SectionType | null {
  const lowerQuery = queryText.toLowerCase();

  const sectionKeywords: Record<string, SectionType> = {
    intro: 'intro',
    verse: 'verse',
    prechorus: 'prechorus',
    'pre-chorus': 'prechorus',
    chorus: 'chorus',
    bridge: 'bridge',
    outro: 'outro',
    interlude: 'interlude',
    breakdown: 'breakdown',
    hook: 'hook',
    refrain: 'refrain',
  };

  for (const [keyword, section] of Object.entries(sectionKeywords)) {
    if (lowerQuery.includes(keyword)) {
      return section;
    }
  }

  return determineActiveSection(uiState);
}

function extractLineNumbers(queryText: string): ReadonlyArray<number> {
  const lineNumberPattern = /line\s+(\d+)/gi;
  const matches = Array.from(queryText.matchAll(lineNumberPattern));
  return matches.map(match => parseInt(match[1], 10));
}

function determineActiveSection(uiState: GlobalUIState): SectionType | null {
  return null;
}

function buildSelectionRange(uiState: GlobalUIState): TextSelectionRange | null {
  const { selectionStart, selectionEnd } = uiState.lyricsUI.editorState;

  if (!selectionStart || !selectionEnd) {
    return null;
  }

  return {
    startLine: selectionStart.line,
    startColumn: selectionStart.column,
    endLine: selectionEnd.line,
    endColumn: selectionEnd.column,
    selectedText: '',
  };
}

function extractRecentEdits(editHistory: ReadonlyArray<EditHistoryEntry>): ReadonlyArray<string> {
  return editHistory.slice(-5).map(entry => `${entry.editType}: ${entry.changeDescription}`);
}

function extractSessionGoals(songState: CompleteSongState): ReadonlyArray<string> {
  const goals: string[] = [];

  if (songState.metadata.completionPercentage < 25) {
    goals.push('Complete initial song structure');
  }

  if (songState.lyrics.length === 0) {
    goals.push('Write first lyrics');
  }

  if (!songState.chordProgression) {
    goals.push('Define chord progression');
  }

  return goals;
}

function buildUserConstraints(userPreferences: UserPreferences): ReadonlyArray<string> {
  const constraints: string[] = [];

  if (userPreferences.avoidClichés) {
    constraints.push('Avoid clichéd phrases');
  }

  if (userPreferences.targetSyllablesPerLine) {
    constraints.push(`Target ${userPreferences.targetSyllablesPerLine} syllables per line`);
  }

  if (userPreferences.forbiddenWords.length > 0) {
    constraints.push(`Forbidden words: ${userPreferences.forbiddenWords.join(', ')}`);
  }

  return constraints;
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}
