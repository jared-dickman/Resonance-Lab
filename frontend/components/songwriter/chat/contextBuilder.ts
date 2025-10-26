import type {
  SessionGoals,
  CreativeConstraints,
  ConversationMessage,
  AgentRequest,
  UserQuery,
  AgentIntentCategory,
} from '../types/chat';
import type { CompleteSongState, SectionType } from '../types/song';
import type { FocusArea, TextPosition } from '../types/ui';
import {
  extractCompleteSongContextSnapshot,
  createDefaultCreativeConstraints,
} from './contextSnapshotBuilder';

export function buildComprehensiveAgentRequest(
  userQueryText: string,
  songState: CompleteSongState,
  conversationMessages: ReadonlyArray<ConversationMessage>,
  activeSection: SectionType | null,
  activeSectionIndex: number | null,
  activeLineNumber: number | null,
  cursorPosition: TextPosition | null,
  focusArea: FocusArea,
  sessionGoals: SessionGoals | null,
  creativeConstraints: CreativeConstraints | null
): AgentRequest {
  const detectedIntent = detectIntentFromQueryText(userQueryText);

  const contextSnapshot = extractCompleteSongContextSnapshot(
    songState,
    activeSection,
    activeSectionIndex,
    activeLineNumber,
    cursorPosition,
    null,
    conversationMessages,
    sessionGoals,
    creativeConstraints || createDefaultCreativeConstraints()
  );

  const userQuery: UserQuery = {
    queryText: userQueryText,
    queryTimestamp: new Date(),
    detectedIntent,
    contextSnapshot,
    previousMessages: conversationMessages,
    currentFocusArea: focusArea,
    userExpectation: deriveUserExpectation(userQueryText, detectedIntent),
  };

  return {
    requestId: generateUniqueRequestId(),
    userQuery,
    fullContext: contextSnapshot,
    requestTimestamp: new Date(),
    expectedResponseType: mapIntentToResponseType(detectedIntent),
    urgency: calculateUrgency(userQueryText),
  };
}

function detectIntentFromQueryText(queryText: string): AgentIntentCategory {
  const normalized = queryText.toLowerCase().trim();

  const intentPatterns: Array<{ pattern: RegExp; intent: AgentIntentCategory }> = [
    { pattern: /\brhyme[s]?\b|\brhyming\b/i, intent: 'rhymeHelp' },
    { pattern: /\bchord[s]?\b|\bprogression\b|\bharmony\b/i, intent: 'chordSuggestion' },
    { pattern: /\b(verse|chorus|line|lyric)[s]?\b/i, intent: 'lyricSuggestion' },
    { pattern: /\b(structure|bridge|section|arrange)/i, intent: 'structureSuggestion' },
    { pattern: /\b(theme|story|character|narrative)\b/i, intent: 'themeExploration' },
    { pattern: /\b(edit|improve|better|fix|change)\b/i, intent: 'editFeedback' },
  ];

  for (const { pattern, intent } of intentPatterns) {
    if (pattern.test(normalized)) {
      return intent;
    }
  }

  if (normalized.includes('?') && normalized.split(/\s+/).length < 10) {
    return 'technicalQuestion';
  }

  return 'generalConversation';
}

function deriveUserExpectation(_queryText: string, intent: AgentIntentCategory): string {
  const expectations: Record<AgentIntentCategory, string> = {
    rhymeHelp: 'Rhyme suggestions with syllable counts and contextual fit',
    chordSuggestion: 'Chord progression recommendations with harmonic analysis',
    lyricSuggestion: 'Lyric line suggestions that fit theme and meter',
    structureSuggestion: 'Song structure advice based on genre conventions',
    themeExploration: 'Thematic development guidance and consistency checks',
    editFeedback: 'Specific edit recommendations with reasoning',
    technicalQuestion: 'Clear technical explanation or guidance',
    generalConversation: 'Helpful songwriting discussion',
  };

  return expectations[intent];
}

function mapIntentToResponseType(
  intent: AgentIntentCategory
): 'rhyme' | 'chord' | 'lyricLine' | 'structure' | 'thematic' | 'edit' {
  const mapping: Record<
    AgentIntentCategory,
    'rhyme' | 'chord' | 'lyricLine' | 'structure' | 'thematic' | 'edit'
  > = {
    rhymeHelp: 'rhyme',
    chordSuggestion: 'chord',
    lyricSuggestion: 'lyricLine',
    structureSuggestion: 'structure',
    themeExploration: 'thematic',
    editFeedback: 'edit',
    technicalQuestion: 'lyricLine',
    generalConversation: 'lyricLine',
  };

  return mapping[intent];
}

function calculateUrgency(queryText: string): 'low' | 'normal' | 'high' {
  const normalized = queryText.toLowerCase();

  if (
    normalized.includes('urgent') ||
    normalized.includes('asap') ||
    normalized.includes('quickly')
  ) {
    return 'high';
  }

  if (normalized.includes('when you can') || normalized.includes('no rush')) {
    return 'low';
  }

  return 'normal';
}

function generateUniqueRequestId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `req_${timestamp}_${random}`;
}

export function serializeAgentRequestToJSON(request: AgentRequest): string {
  return JSON.stringify(
    request,
    (_key, value) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      if (value instanceof Map) {
        return Object.fromEntries(value);
      }
      if (value instanceof Set) {
        return Array.from(value);
      }
      return value;
    },
    2
  );
}

export function calculateAgentRequestSize(request: AgentRequest): {
  jsonSizeBytes: number;
  estimatedTokens: number;
  fieldCount: number;
} {
  const serialized = serializeAgentRequestToJSON(request);
  const jsonSizeBytes = new Blob([serialized]).size;
  const estimatedTokens = Math.ceil(serialized.length / 4);
  const fieldCount = (serialized.match(/:/g) || []).length;

  return {
    jsonSizeBytes,
    estimatedTokens,
    fieldCount,
  };
}
