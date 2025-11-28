import type {
  CompleteSongContextSnapshot,
  SessionGoals,
  CreativeConstraints,
  ConversationMessage,
  CursorContext,
  RecentEditSummary,
  ConversationSummary,
  TextSelectionRange,
  AgentIntentCategory,
} from '@/components/songwriter/types/chat';
import type {
  CompleteSongState,
  SectionType,
  EditHistoryEntry,
} from '@/components/songwriter/types/song';
import type { TextPosition } from '@/components/songwriter/types/ui';

export function extractCompleteSongContextSnapshot(
  songState: CompleteSongState,
  activeSection: SectionType | null,
  activeSectionIndex: number | null,
  activeLineNumber: number | null,
  cursorPosition: TextPosition | null,
  selectionRange: TextSelectionRange | null,
  conversationMessages: ReadonlyArray<ConversationMessage>,
  sessionGoals: SessionGoals | null,
  creativeConstraints: CreativeConstraints
): CompleteSongContextSnapshot {
  const cursorContext = buildCursorContext(
    songState,
    activeSection,
    activeSectionIndex,
    activeLineNumber,
    cursorPosition
  );

  const recentEditSummary = buildRecentEditSummary(songState.editHistory);

  const conversationSummary = buildConversationSummary(conversationMessages);

  return {
    songState,
    activeSection,
    activeSectionIndex,
    activeLineNumber,
    cursorContext,
    selectionRange,
    recentEditSummary,
    sessionGoals,
    creativeConstraints,
    conversationSummary,
    snapshotTimestamp: new Date(),
  };
}

export function createDefaultCreativeConstraints(): CreativeConstraints {
  return {
    thematicBoundaries: [],
    tonalPreferences: [],
    forbiddenTopics: [],
    requiredElements: [],
    styleResemble: [],
    avoidComparisons: [],
  };
}

export function serializeContextToJSON(context: CompleteSongContextSnapshot): string {
  return JSON.stringify(
    context,
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

export function estimateContextTokenCount(context: CompleteSongContextSnapshot): number {
  const serialized = serializeContextToJSON(context);
  return Math.ceil(serialized.length / 4);
}

function buildCursorContext(
  songState: CompleteSongState,
  activeSection: SectionType | null,
  activeSectionIndex: number | null,
  activeLineNumber: number | null,
  cursorPosition: TextPosition | null
): CursorContext | null {
  if (!cursorPosition || activeSectionIndex === null || activeLineNumber === null) {
    return null;
  }

  const sectionLyrics = songState.lyrics[activeSectionIndex];
  if (!sectionLyrics) {
    return null;
  }

  const line = sectionLyrics.lines[activeLineNumber];
  if (!line) {
    return null;
  }

  const lineText = line.text;
  const wordAtCursor = extractWordAtPosition(lineText, cursorPosition.column);

  return {
    position: cursorPosition,
    lineText,
    wordAtCursor,
    sectionType: activeSection,
    sectionIndex: activeSectionIndex,
  };
}

function extractWordAtPosition(text: string, column: number): string | null {
  if (column < 0 || column > text.length) {
    return null;
  }

  const beforeCursor = text.slice(0, column);
  const afterCursor = text.slice(column);

  const wordBefore = beforeCursor.match(/\w+$/)?.[0] || '';
  const wordAfter = afterCursor.match(/^\w+/)?.[0] || '';

  const fullWord = wordBefore + wordAfter;

  return fullWord.length > 0 ? fullWord : null;
}

function buildRecentEditSummary(
  editHistory: ReadonlyArray<EditHistoryEntry>
): RecentEditSummary {
  const lastFiveEdits = editHistory.slice(-5);

  const mostEditedSection = calculateMostEditedSection(editHistory);

  const editFrequencyLast15Minutes = calculateEditFrequency(editHistory, 15);

  const averageEditSize = calculateAverageEditSize(editHistory);

  const editMomentum = calculateEditMomentum(editHistory);

  return {
    lastFiveEdits,
    mostEditedSection,
    editFrequencyLast15Minutes,
    averageEditSize,
    editMomentum,
  };
}

function calculateMostEditedSection(
  editHistory: ReadonlyArray<EditHistoryEntry>
): SectionType | null {
  const sectionCounts = new Map<SectionType, number>();

  for (const edit of editHistory) {
    if (edit.sectionAffected) {
      const current = sectionCounts.get(edit.sectionAffected) || 0;
      sectionCounts.set(edit.sectionAffected, current + 1);
    }
  }

  if (sectionCounts.size === 0) {
    return null;
  }

  let maxSection: SectionType | null = null;
  let maxCount = 0;

  for (const [section, count] of sectionCounts) {
    if (count > maxCount) {
      maxCount = count;
      maxSection = section;
    }
  }

  return maxSection;
}

function calculateEditFrequency(
  editHistory: ReadonlyArray<EditHistoryEntry>,
  windowMinutes: number
): number {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);

  return editHistory.filter((edit) => edit.timestamp >= windowStart).length;
}

function calculateAverageEditSize(editHistory: ReadonlyArray<EditHistoryEntry>): number {
  if (editHistory.length === 0) {
    return 0;
  }

  const totalSize = editHistory.reduce((sum, edit) => {
    const prevLength = edit.previousValue.length;
    const newLength = edit.newValue.length;
    return sum + Math.abs(newLength - prevLength);
  }, 0);

  return totalSize / editHistory.length;
}

function calculateEditMomentum(
  editHistory: ReadonlyArray<EditHistoryEntry>
): 'increasing' | 'decreasing' | 'stable' {
  if (editHistory.length < 6) {
    return 'stable';
  }

  const recent = editHistory.slice(-3);
  const previous = editHistory.slice(-6, -3);

  const recentCount = recent.length;
  const previousCount = previous.length;

  if (recentCount > previousCount * 1.3) {
    return 'increasing';
  }

  if (recentCount < previousCount * 0.7) {
    return 'decreasing';
  }

  return 'stable';
}

function buildConversationSummary(
  conversationMessages: ReadonlyArray<ConversationMessage>
): ConversationSummary | null {
  if (conversationMessages.length === 0) {
    return null;
  }

  const topicsDiscussed = extractTopicsDiscussed(conversationMessages);

  const primaryIntent = determinePrimaryIntent(conversationMessages);

  const keyDecisionsMade = extractKeyDecisions(conversationMessages);

  const unresolvedQuestions = extractUnresolvedQuestions(conversationMessages);

  const userGoalsIdentified = extractUserGoals(conversationMessages);

  return {
    topicsDiscussed,
    primaryIntent,
    keyDecisionsMade,
    unresolvedQuestions,
    userGoalsIdentified,
  };
}

function extractTopicsDiscussed(
  messages: ReadonlyArray<ConversationMessage>
): ReadonlyArray<string> {
  const topics = new Set<string>();

  const topicKeywords: Record<string, string> = {
    rhyme: 'rhyming',
    chord: 'harmony',
    structure: 'song structure',
    theme: 'thematic elements',
    lyric: 'lyric writing',
    meter: 'meter and rhythm',
    metaphor: 'figurative language',
    verse: 'verse structure',
    chorus: 'chorus development',
    bridge: 'bridge composition',
  };

  for (const message of messages) {
    const content = message.content.toLowerCase();

    for (const [keyword, topic] of Object.entries(topicKeywords)) {
      if (content.includes(keyword)) {
        topics.add(topic);
      }
    }
  }

  return Array.from(topics);
}

function determinePrimaryIntent(
  messages: ReadonlyArray<ConversationMessage>
): AgentIntentCategory {
  const intentCounts = new Map<AgentIntentCategory, number>();

  for (const message of messages) {
    if (message.intent) {
      const current = intentCounts.get(message.intent) || 0;
      intentCounts.set(message.intent, current + 1);
    }
  }

  if (intentCounts.size === 0) {
    return 'generalConversation';
  }

  let maxIntent: AgentIntentCategory = 'generalConversation';
  let maxCount = 0;

  for (const [intent, count] of intentCounts) {
    if (count > maxCount) {
      maxCount = count;
      maxIntent = intent;
    }
  }

  return maxIntent;
}

function extractKeyDecisions(
  messages: ReadonlyArray<ConversationMessage>
): ReadonlyArray<string> {
  const decisions: string[] = [];

  const decisionPatterns = [
    /i['']?ll use/i,
    /i['']?ll go with/i,
    /decided to/i,
    /chose to/i,
    /settled on/i,
  ];

  for (const message of messages) {
    if (message.role === 'user') {
      for (const pattern of decisionPatterns) {
        if (pattern.test(message.content)) {
          decisions.push(message.content);
          break;
        }
      }
    }
  }

  return decisions;
}

function extractUnresolvedQuestions(
  messages: ReadonlyArray<ConversationMessage>
): ReadonlyArray<string> {
  const questions: string[] = [];

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];

    if (!message) continue;

    if (message.role === 'user' && message.content.includes('?')) {
      const hasResponse = messages
        .slice(i + 1)
        .some((m) => m?.role === 'assistant');

      if (!hasResponse) {
        questions.push(message.content);
      }
    }
  }

  return questions;
}

function extractUserGoals(
  messages: ReadonlyArray<ConversationMessage>
): ReadonlyArray<string> {
  const goals: string[] = [];

  const goalPatterns = [
    /i want to/i,
    /i['']?m trying to/i,
    /my goal is/i,
    /i need to/i,
    /i['']?d like to/i,
  ];

  for (const message of messages) {
    if (message.role === 'user') {
      for (const pattern of goalPatterns) {
        if (pattern.test(message.content)) {
          goals.push(message.content);
          break;
        }
      }
    }
  }

  return goals;
}
