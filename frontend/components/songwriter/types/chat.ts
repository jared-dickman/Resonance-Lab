import type { CompleteSongState, SectionType, ChordInstance, LyricLine } from './song'

export type AgentIntentCategory = 'lyricSuggestion' | 'chordSuggestion' | 'structureSuggestion' | 'rhymeHelp' | 'themeExploration' | 'characterDevelopment' | 'editFeedback' | 'technicalQuestion' | 'generalConversation' | 'clarificationRequest'

export type ConfidenceLevel = 'veryLow' | 'low' | 'medium' | 'high' | 'veryHigh'

export type SuggestionType = 'lyrics' | 'chord' | 'structure' | 'theme' | 'edit' | 'question'

export interface UserQueryContext {
  readonly queryText: string
  readonly queryTimestamp: Date
  readonly queryIntent: AgentIntentCategory
  readonly targetSection: SectionType | null
  readonly targetLineNumbers: ReadonlyArray<number>
  readonly previousMessages: ReadonlyArray<ConversationMessage>
  readonly currentFocusArea: 'lyrics' | 'chords' | 'structure' | 'general' | 'chat' | 'none'
}

export interface CompleteSongContext {
  readonly songState: CompleteSongState
  readonly activeSection: SectionType | null
  readonly activeLine: number | null
  readonly cursorPosition: number | null
  readonly selectionRange: TextSelectionRange | null
  readonly recentEdits: ReadonlyArray<string>
  readonly sessionGoals: ReadonlyArray<string>
  readonly userConstraints: ReadonlyArray<string>
}

export interface TextSelectionRange {
  readonly startLine: number
  readonly startColumn: number
  readonly endLine: number
  readonly endColumn: number
  readonly selectedText: string
}

export interface LyricSuggestion {
  readonly suggestedLine: string
  readonly alternativeLines: ReadonlyArray<string>
  readonly syllableCount: number
  readonly matchesRhymeScheme: boolean
  readonly rhymesWith: ReadonlyArray<string>
  readonly explanation: string
  readonly confidence: ConfidenceLevel
  readonly thematicFit: number
  readonly originalityScore: number
}

export interface ChordSuggestion {
  readonly suggestedChord: ChordInstance
  readonly alternativeChords: ReadonlyArray<ChordInstance>
  readonly voiceLeadingQuality: number
  readonly harmonicllyAppropriate: boolean
  readonly createsDesiredTension: boolean
  readonly explanation: string
  readonly confidence: ConfidenceLevel
  readonly fitsGenre: boolean
}

export interface StructureSuggestion {
  readonly suggestedStructure: ReadonlyArray<SectionType>
  readonly reasoning: string
  readonly genreTypical: boolean
  readonly estimatedDuration: number
  readonly dynamicFlow: string
  readonly confidence: ConfidenceLevel
  readonly alternatives: ReadonlyArray<ReadonlyArray<SectionType>>
}

export interface ThematicFeedback {
  readonly consistencyScore: number
  readonly strengths: ReadonlyArray<string>
  readonly weaknesses: ReadonlyArray<string>
  readonly suggestedImprovements: ReadonlyArray<string>
  readonly metaphorEffectiveness: number
  readonly narrativeClarity: number
}

export interface EditSuggestion {
  readonly targetLine: number
  readonly originalText: string
  readonly suggestedText: string
  readonly reason: string
  readonly improvementType: 'clarity' | 'rhythm' | 'rhyme' | 'imagery' | 'theme' | 'grammar' | 'cliché'
  readonly confidence: ConfidenceLevel
  readonly optional: boolean
}

export interface AgentResponse {
  readonly primarySuggestion: AgentSuggestion
  readonly alternativeSuggestions: ReadonlyArray<AgentSuggestion>
  readonly reasoning: string
  readonly conversationalResponse: string
  readonly clarificationQuestions: ReadonlyArray<string>
  readonly confidence: ConfidenceLevel
  readonly processingTime: number
  readonly tokensUsed: number
}

export type AgentSuggestion =
  | { readonly type: 'lyrics'; readonly content: LyricSuggestion }
  | { readonly type: 'chord'; readonly content: ChordSuggestion }
  | { readonly type: 'structure'; readonly content: StructureSuggestion }
  | { readonly type: 'theme'; readonly content: ThematicFeedback }
  | { readonly type: 'edit'; readonly content: EditSuggestion }
  | { readonly type: 'question'; readonly content: string }

export interface ConversationMessage {
  readonly id: string
  readonly role: 'user' | 'assistant' | 'system'
  readonly timestamp: Date
  readonly textContent: string
  readonly suggestions: ReadonlyArray<AgentSuggestion>
  readonly wasApplied: boolean
  readonly appliedAt: Date | null
}

export interface ConversationHistory {
  readonly messages: ReadonlyArray<ConversationMessage>
  readonly totalMessages: number
  readonly conversationStartTime: Date
  readonly lastMessageTime: Date
  readonly userMessageCount: number
  readonly assistantMessageCount: number
  readonly appliedSuggestionsCount: number
}

export interface AgentRequest {
  readonly requestId: string
  readonly userQuery: UserQueryContext
  readonly songContext: CompleteSongContext
  readonly conversationHistory: ConversationHistory
  readonly requestTimestamp: Date
  readonly clientVersion: string
  readonly sessionId: string
}

export interface StreamingChunk {
  readonly chunkId: number
  readonly chunkType: 'text' | 'suggestion' | 'complete'
  readonly content: string
  readonly isComplete: boolean
}

export interface AgentError {
  readonly errorCode: string
  readonly errorMessage: string
  readonly errorDetails: string | null
  readonly retryable: boolean
  readonly timestamp: Date
}

export type AgentState =
  | { readonly status: 'idle' }
  | { readonly status: 'thinking' }
  | { readonly status: 'streaming'; readonly chunks: ReadonlyArray<StreamingChunk> }
  | { readonly status: 'complete'; readonly response: AgentResponse }
  | { readonly status: 'error'; readonly error: AgentError }

export interface QuickPrompt {
  readonly id: string
  readonly label: string
  readonly promptText: string
  readonly category: AgentIntentCategory
  readonly iconName: string
  readonly requiresSelection: boolean
}

export interface ConversationSessionMetrics {
  readonly sessionId: string
  readonly startTime: Date
  readonly endTime: Date | null
  readonly totalQueries: number
  readonly totalSuggestionsReceived: number
  readonly totalSuggestionsApplied: number
  readonly averageResponseTime: number
  readonly totalTokensUsed: number
  readonly satisfactionRating: number | null
}
