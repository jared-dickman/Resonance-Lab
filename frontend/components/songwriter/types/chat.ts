import type {
  CompleteSongState,
  SectionType,
  ChordInstance,
  EditHistoryEntry,
} from '@/components/songwriter/types/song';
import type { FocusArea, TextPosition } from '@/components/songwriter/types/ui';

export type AgentIntentCategory =
  | 'rhymeHelp'
  | 'chordSuggestion'
  | 'lyricSuggestion'
  | 'structureSuggestion'
  | 'themeExploration'
  | 'editFeedback'
  | 'technicalQuestion'
  | 'generalConversation';

export type MessageRole = 'user' | 'assistant' | 'system';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ConversationMessage {
  readonly id: string;
  readonly role: MessageRole;
  readonly content: string;
  readonly timestamp: Date;
  readonly intent: AgentIntentCategory | null;
  readonly contextSnapshot: CompleteSongContextSnapshot | null;
}

export interface ConversationHistory {
  readonly messages: ReadonlyArray<ConversationMessage>;
  readonly sessionStartTime: Date;
  readonly totalMessages: number;
  readonly userMessageCount: number;
  readonly assistantMessageCount: number;
}

export interface ConversationSummary {
  readonly topicsDiscussed: ReadonlyArray<string>;
  readonly primaryIntent: AgentIntentCategory;
  readonly keyDecisionsMade: ReadonlyArray<string>;
  readonly unresolvedQuestions: ReadonlyArray<string>;
  readonly userGoalsIdentified: ReadonlyArray<string>;
}

export interface SessionGoals {
  readonly primaryGoal: string;
  readonly secondaryGoals: ReadonlyArray<string>;
  readonly targetSectionTypes: ReadonlyArray<SectionType>;
  readonly desiredOutcome: string;
  readonly timeConstraint: number | null;
  readonly progressIndicators: ReadonlyArray<string>;
}

export interface CreativeConstraints {
  readonly thematicBoundaries: ReadonlyArray<string>;
  readonly tonalPreferences: ReadonlyArray<string>;
  readonly forbiddenTopics: ReadonlyArray<string>;
  readonly requiredElements: ReadonlyArray<string>;
  readonly styleResemble: ReadonlyArray<string>;
  readonly avoidComparisons: ReadonlyArray<string>;
}

export interface TextSelectionRange {
  readonly startLine: number;
  readonly startColumn: number;
  readonly endLine: number;
  readonly endColumn: number;
  readonly selectedText: string;
}

export interface CursorContext {
  readonly position: TextPosition;
  readonly lineText: string;
  readonly wordAtCursor: string | null;
  readonly sectionType: SectionType | null;
  readonly sectionIndex: number | null;
}

export interface RecentEditSummary {
  readonly lastFiveEdits: ReadonlyArray<EditHistoryEntry>;
  readonly mostEditedSection: SectionType | null;
  readonly editFrequencyLast15Minutes: number;
  readonly averageEditSize: number;
  readonly editMomentum: 'increasing' | 'decreasing' | 'stable';
}

export interface CompleteSongContextSnapshot {
  readonly songState: CompleteSongState;
  readonly activeSection: SectionType | null;
  readonly activeSectionIndex: number | null;
  readonly activeLineNumber: number | null;
  readonly cursorContext: CursorContext | null;
  readonly selectionRange: TextSelectionRange | null;
  readonly recentEditSummary: RecentEditSummary;
  readonly sessionGoals: SessionGoals | null;
  readonly creativeConstraints: CreativeConstraints;
  readonly conversationSummary: ConversationSummary | null;
  readonly snapshotTimestamp: Date;
}

export interface UserQuery {
  readonly queryText: string;
  readonly queryTimestamp: Date;
  readonly detectedIntent: AgentIntentCategory;
  readonly contextSnapshot: CompleteSongContextSnapshot;
  readonly previousMessages: ReadonlyArray<ConversationMessage>;
  readonly currentFocusArea: FocusArea;
  readonly userExpectation: string;
}

export interface RhymeCandidate {
  readonly word: string;
  readonly rhymeType: 'perfect' | 'slant' | 'assonance' | 'consonance';
  readonly syllableCount: number;
  readonly commonality: number;
  readonly exampleUsage: string;
  readonly partOfSpeech: string;
}

export interface RhymeSuggestionDetail {
  readonly targetWord: string;
  readonly candidates: ReadonlyArray<RhymeCandidate>;
  readonly totalCandidates: number;
  readonly contextualFit: ReadonlyArray<string>;
}

export interface ChordProgressionSuggestion {
  readonly progression: ReadonlyArray<ChordInstance>;
  readonly romanNumeralNotation: string;
  readonly genreFit: ReadonlyArray<string>;
  readonly emotionalImpact: string;
  readonly voiceLeadingQuality: number;
  readonly alternativeVoicings: ReadonlyArray<ReadonlyArray<ChordInstance>>;
}

export interface LyricLineSuggestion {
  readonly suggestedLine: string;
  readonly syllableCount: number;
  readonly rhymesWithLine: number | null;
  readonly thematicAlignment: number;
  readonly poeticQuality: number;
  readonly alternatives: ReadonlyArray<string>;
  readonly explanation: string;
}

export interface StructureRecommendation {
  readonly recommendedStructure: ReadonlyArray<SectionType>;
  readonly reasoning: string;
  readonly genreConventions: ReadonlyArray<string>;
  readonly estimatedDuration: number;
  readonly transitionSuggestions: ReadonlyArray<string>;
}

export interface ThematicAnalysis {
  readonly currentThemes: ReadonlyArray<string>;
  readonly themeConsistency: number;
  readonly narrativeCoherence: number;
  readonly suggestedThematicDepth: ReadonlyArray<string>;
  readonly potentialConflicts: ReadonlyArray<string>;
  readonly strengthAreas: ReadonlyArray<string>;
}

export interface EditRecommendation {
  readonly targetLineNumber: number;
  readonly originalText: string;
  readonly suggestedText: string;
  readonly reasoning: string;
  readonly impactOnRhymeScheme: string;
  readonly impactOnMeter: string;
  readonly confidenceScore: number;
}

export type SuggestionType = 'rhyme' | 'chord' | 'lyricLine' | 'structure' | 'thematic' | 'edit';

export interface RhymeSuggestion {
  readonly type: 'rhyme';
  readonly detail: RhymeSuggestionDetail;
  readonly confidence: ConfidenceLevel;
}

export interface ChordSuggestion {
  readonly type: 'chord';
  readonly detail: ChordProgressionSuggestion;
  readonly confidence: ConfidenceLevel;
}

export interface LyricSuggestion {
  readonly type: 'lyricLine';
  readonly detail: LyricLineSuggestion;
  readonly confidence: ConfidenceLevel;
}

export interface StructureSuggestion {
  readonly type: 'structure';
  readonly detail: StructureRecommendation;
  readonly confidence: ConfidenceLevel;
}

export interface ThematicSuggestion {
  readonly type: 'thematic';
  readonly detail: ThematicAnalysis;
  readonly confidence: ConfidenceLevel;
}

export interface EditSuggestion {
  readonly type: 'edit';
  readonly detail: EditRecommendation;
  readonly confidence: ConfidenceLevel;
}

export type AgentSuggestion =
  | RhymeSuggestion
  | ChordSuggestion
  | LyricSuggestion
  | StructureSuggestion
  | ThematicSuggestion
  | EditSuggestion;

export interface ReasoningStep {
  readonly stepNumber: number;
  readonly description: string;
  readonly considerationFactors: ReadonlyArray<string>;
  readonly decisionMade: string;
}

export interface AgentResponse {
  readonly message: string;
  readonly primarySuggestion: AgentSuggestion;
  readonly alternativeSuggestions: ReadonlyArray<AgentSuggestion>;
  readonly reasoning: ReadonlyArray<ReasoningStep>;
  readonly contextUsed: ReadonlyArray<string>;
  readonly confidence: ConfidenceLevel;
  readonly actionableNext: ReadonlyArray<string>;
  readonly responseTimestamp: Date;
}

export interface AgentRequest {
  readonly requestId: string;
  readonly userQuery: UserQuery;
  readonly fullContext: CompleteSongContextSnapshot;
  readonly requestTimestamp: Date;
  readonly expectedResponseType: SuggestionType;
  readonly urgency: 'low' | 'normal' | 'high';
}

export interface StreamingChunk {
  readonly chunkId: string;
  readonly requestId: string;
  readonly content: string;
  readonly chunkIndex: number;
  readonly isComplete: boolean;
  readonly timestamp: Date;
}

export interface AgentError {
  readonly errorCode: string;
  readonly errorMessage: string;
  readonly recoverySuggestions: ReadonlyArray<string>;
  readonly timestamp: Date;
  readonly requestId: string | null;
}

export interface AgentState {
  readonly isProcessing: boolean;
  readonly currentRequestId: string | null;
  readonly queuedRequests: ReadonlyArray<string>;
  readonly lastResponseTime: Date | null;
  readonly errorState: AgentError | null;
  readonly healthStatus: 'healthy' | 'degraded' | 'offline';
}

export interface QuickPrompt {
  readonly promptId: string;
  readonly promptText: string;
  readonly displayLabel: string;
  readonly icon: string;
  readonly category: AgentIntentCategory;
  readonly expectedResponseType: SuggestionType;
  readonly contextRequired: boolean;
}

export interface ConversationSessionMetrics {
  readonly sessionDuration: number;
  readonly totalQueries: number;
  readonly averageResponseTime: number;
  readonly suggestionAcceptanceRate: number;
  readonly mostCommonIntent: AgentIntentCategory;
  readonly userSatisfactionIndicators: ReadonlyArray<string>;
  readonly productivityScore: number;
}
