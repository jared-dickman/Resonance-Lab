export type SectionType = 'intro' | 'verse' | 'prechorus' | 'chorus' | 'bridge' | 'outro' | 'interlude' | 'breakdown' | 'hook' | 'refrain'

export type RhymeScheme = 'AABB' | 'ABAB' | 'ABCB' | 'AAAA' | 'ABBA' | 'ABABCC' | 'AABCCB' | 'free' | 'none'

export type ChordQuality = 'major' | 'minor' | 'diminished' | 'augmented' | 'dominant7' | 'major7' | 'minor7' | 'diminished7' | 'halfDiminished7' | 'augmented7' | 'sus2' | 'sus4' | 'add9' | 'add11' | 'major9' | 'minor9' | 'major11' | 'minor11' | 'major13' | 'minor13' | '6' | 'minor6' | 'power'

export type ChordVoicing = 'root' | 'firstInversion' | 'secondInversion' | 'thirdInversion' | 'openVoicing' | 'closedVoicing' | 'drop2' | 'drop3'

export type HarmonicFunction = 'tonic' | 'subdominant' | 'dominant' | 'submediant' | 'mediant' | 'supertonic' | 'leadingTone' | 'secondary' | 'borrowed' | 'passing' | 'chromatic'

export type TimeSignature = '4/4' | '3/4' | '6/8' | '2/4' | '5/4' | '7/8' | '9/8' | '12/8' | '7/4' | '5/8' | '11/8'

export type MusicalKey = 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B'

export type KeyMode = 'major' | 'minor' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'aeolian' | 'locrian'

export type Genre = 'pop' | 'rock' | 'indie' | 'folk' | 'country' | 'blues' | 'jazz' | 'soul' | 'rnb' | 'hiphop' | 'electronic' | 'punk' | 'metal' | 'alternative' | 'singer-songwriter' | 'other'

export type Subgenre = 'synth-pop' | 'indie-rock' | 'folk-rock' | 'alt-country' | 'neo-soul' | 'trap' | 'house' | 'techno' | 'shoegaze' | 'emo' | 'grunge' | 'progressive' | 'acoustic' | 'experimental' | 'other'

export type TargetAudience = 'general' | 'youth' | 'adult' | 'mature' | 'niche' | 'crossover'

export type ReleaseIntent = 'demo' | 'single' | 'album' | 'ep' | 'soundtrack' | 'commercial' | 'personal' | 'portfolio'

export type DynamicRange = 'quiet' | 'soft' | 'moderate' | 'loud' | 'variable' | 'extreme'

export type ProductionStyle = 'lofi' | 'polished' | 'raw' | 'ambient' | 'layered' | 'minimal' | 'maximal' | 'vintage' | 'modern'

export type EmotionalTone = 'joyful' | 'melancholic' | 'angry' | 'peaceful' | 'anxious' | 'hopeful' | 'nostalgic' | 'romantic' | 'defiant' | 'bittersweet' | 'triumphant' | 'introspective' | 'energetic' | 'somber' | 'playful'

export type NarrativePerspective = 'first-person' | 'second-person' | 'third-person' | 'omniscient' | 'shifting'

export type VerbTense = 'past' | 'present' | 'future' | 'mixed'

export type LiteraryDevice = 'metaphor' | 'simile' | 'personification' | 'alliteration' | 'assonance' | 'consonance' | 'imagery' | 'symbolism' | 'hyperbole' | 'repetition' | 'anaphora' | 'epistrophe' | 'onomatopoeia' | 'oxymoron' | 'paradox' | 'allusion'

export interface SyllableStress {
  readonly syllableIndex: number
  readonly isStressed: boolean
  readonly syllableText: string
}

export interface LyricLine {
  readonly text: string
  readonly syllableCount: number
  readonly stressPattern: ReadonlyArray<SyllableStress>
  readonly rhymeSchemePosition: string
  readonly endsWithRhyme: boolean
  readonly rhymesWith: ReadonlyArray<number>
  readonly lineNumber: number
}

export interface SectionLyrics {
  readonly sectionType: SectionType
  readonly sectionIndex: number
  readonly lines: ReadonlyArray<LyricLine>
  readonly theme: string
  readonly narrativePerspective: NarrativePerspective
  readonly verbTense: VerbTense
  readonly emotionalTone: EmotionalTone
  readonly narrativeBeat: string
  readonly rhymeScheme: RhymeScheme
}

export interface ChordInstance {
  readonly root: MusicalKey
  readonly quality: ChordQuality
  readonly voicing: ChordVoicing
  readonly bass: MusicalKey | null
  readonly displayName: string
  readonly harmonicFunction: HarmonicFunction
  readonly durationBeats: number
  readonly positionInMeasure: number
  readonly tensionLevel: number
}

export interface ChordProgression {
  readonly chords: ReadonlyArray<ChordInstance>
  readonly key: MusicalKey
  readonly keyMode: KeyMode
  readonly timeSignature: TimeSignature
  readonly totalMeasures: number
  readonly resolves: boolean
  readonly averageTension: number
}

export interface SongStructure {
  readonly sections: ReadonlyArray<SectionType>
  readonly sectionOrder: ReadonlyArray<number>
  readonly totalSections: number
  readonly hasIntro: boolean
  readonly hasOutro: boolean
  readonly chorusCount: number
  readonly verseCount: number
  readonly bridgeCount: boolean
  readonly estimatedDurationSeconds: number
}

export interface MetaphorThread {
  readonly centralMetaphor: string
  readonly relatedImages: ReadonlyArray<string>
  readonly linesUsed: ReadonlyArray<number>
  readonly consistency: number
}

export interface CharacterDevelopment {
  readonly protagonist: string
  readonly arc: string
  readonly transformation: string
  readonly appearanceInSections: ReadonlyArray<number>
}

export interface StoryArc {
  readonly setup: string
  readonly conflict: string
  readonly climax: string
  readonly resolution: string
  readonly completeness: number
}

export interface VocabularyAnalysis {
  readonly averageWordLength: number
  readonly complexityScore: number
  readonly uniqueWordCount: number
  readonly totalWordCount: number
  readonly readingLevel: string
  readonly culturalReferences: ReadonlyArray<string>
}

export interface RhymeAnalysis {
  readonly rhymeDensity: number
  readonly primaryScheme: RhymeScheme
  readonly schemeConsistency: number
  readonly internalRhymes: number
  readonly slantRhymes: number
  readonly perfectRhymes: number
}

export interface StylisticChoices {
  readonly rhymeAnalysis: RhymeAnalysis
  readonly vocabularyAnalysis: VocabularyAnalysis
  readonly literaryDevices: ReadonlyArray<LiteraryDevice>
  readonly poeticStyle: string
}

export interface SongMetadata {
  readonly title: string
  readonly artist: string | null
  readonly genre: Genre
  readonly subgenre: Subgenre | null
  readonly targetAudience: TargetAudience
  readonly releaseIntent: ReleaseIntent
  readonly completionPercentage: number
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly version: number
}

export interface MusicalElements {
  readonly key: MusicalKey | null
  readonly keyMode: KeyMode | null
  readonly tempo: number | null
  readonly timeSignature: TimeSignature
  readonly dynamicRange: DynamicRange
  readonly instrumentationNotes: string
  readonly productionStyle: ProductionStyle
}

export interface EditHistoryEntry {
  readonly timestamp: Date
  readonly editType: 'lyricChange' | 'chordChange' | 'structureChange' | 'metadataChange'
  readonly sectionAffected: SectionType | null
  readonly changeDescription: string
  readonly previousValue: string
  readonly newValue: string
}

export interface TimeAnalytics {
  readonly totalTimeSpentSeconds: number
  readonly timePerSection: ReadonlyMap<SectionType, number>
  readonly sessionStartTime: Date
  readonly lastActiveTime: Date
  readonly editCount: number
  readonly averageEditInterval: number
}

export interface CompleteSongState {
  readonly metadata: SongMetadata
  readonly musicalElements: MusicalElements
  readonly structure: SongStructure
  readonly lyrics: ReadonlyArray<SectionLyrics>
  readonly chordProgression: ChordProgression | null
  readonly storyArc: StoryArc | null
  readonly metaphorThreads: ReadonlyArray<MetaphorThread>
  readonly characterDevelopment: CharacterDevelopment | null
  readonly stylisticChoices: StylisticChoices
  readonly editHistory: ReadonlyArray<EditHistoryEntry>
  readonly timeAnalytics: TimeAnalytics
  readonly userPreferences: UserPreferences
}

export interface UserPreferences {
  readonly preferredRhymeScheme: RhymeScheme | null
  readonly avoidClichés: boolean
  readonly targetSyllablesPerLine: number | null
  readonly preferredPerspective: NarrativePerspective | null
  readonly thematicConstraints: ReadonlyArray<string>
  readonly forbiddenWords: ReadonlyArray<string>
  readonly styleGuide: string
}

export interface DraftSnapshot {
  readonly snapshotId: string
  readonly songState: CompleteSongState
  readonly snapshotTime: Date
  readonly snapshotLabel: string
  readonly isAutosave: boolean
}
