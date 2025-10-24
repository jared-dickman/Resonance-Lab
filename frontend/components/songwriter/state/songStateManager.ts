import type { CompleteSongState, SongMetadata, MusicalElements, EditHistoryEntry, TimeAnalytics, SectionType, UserPreferences, SectionLyrics, ChordInstance, MusicalKey, KeyMode } from '../types/song'
import { analyzeSectionLyrics } from './lyricAnalyzer'

export function createEmptySongState(): CompleteSongState {
  return {
    metadata: createDefaultMetadata(),
    musicalElements: createDefaultMusicalElements(),
    structure: {
      sections: [],
      sectionOrder: [],
      totalSections: 0,
      hasIntro: false,
      hasOutro: false,
      chorusCount: 0,
      verseCount: 0,
      bridgeCount: false,
      estimatedDurationSeconds: 0,
    },
    lyrics: [],
    chordProgression: null,
    storyArc: null,
    metaphorThreads: [],
    characterDevelopment: null,
    stylisticChoices: {
      rhymeAnalysis: {
        rhymeDensity: 0,
        primaryScheme: 'none',
        schemeConsistency: 0,
        internalRhymes: 0,
        slantRhymes: 0,
        perfectRhymes: 0,
      },
      vocabularyAnalysis: {
        averageWordLength: 0,
        complexityScore: 0,
        uniqueWordCount: 0,
        totalWordCount: 0,
        readingLevel: 'basic',
        culturalReferences: [],
      },
      literaryDevices: [],
      poeticStyle: '',
    },
    editHistory: [],
    timeAnalytics: createInitialTimeAnalytics(),
    userPreferences: createDefaultUserPreferences(),
  }
}

function createDefaultMetadata(): SongMetadata {
  return {
    title: 'Untitled Song',
    artist: null,
    genre: 'pop',
    subgenre: null,
    targetAudience: 'general',
    releaseIntent: 'demo',
    completionPercentage: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
  }
}

function createDefaultMusicalElements(): MusicalElements {
  return {
    key: null,
    keyMode: null,
    tempo: null,
    timeSignature: '4/4',
    dynamicRange: 'moderate',
    instrumentationNotes: '',
    productionStyle: 'modern',
  }
}

function createInitialTimeAnalytics(): TimeAnalytics {
  const now = new Date()
  return {
    totalTimeSpentSeconds: 0,
    timePerSection: new Map(),
    sessionStartTime: now,
    lastActiveTime: now,
    editCount: 0,
    averageEditInterval: 0,
  }
}

function createDefaultUserPreferences(): UserPreferences {
  return {
    preferredRhymeScheme: null,
    avoidClichés: true,
    targetSyllablesPerLine: null,
    preferredPerspective: null,
    thematicConstraints: [],
    forbiddenWords: [],
    styleGuide: '',
  }
}

export function updateSongTitle(
  state: CompleteSongState,
  newTitle: string
): CompleteSongState {
  const editEntry = createEditHistoryEntry(
    'metadataChange',
    null,
    `Title changed from "${state.metadata.title}" to "${newTitle}"`,
    state.metadata.title,
    newTitle
  )

  return {
    ...state,
    metadata: {
      ...state.metadata,
      title: newTitle,
      updatedAt: new Date(),
    },
    editHistory: [...state.editHistory, editEntry],
  }
}

export function updateLyricsText(
  state: CompleteSongState,
  newLyricsText: string
): CompleteSongState {
  const sections = parseLyricsIntoSections(newLyricsText)

  const editEntry = createEditHistoryEntry(
    'lyricChange',
    null,
    `Lyrics updated`,
    '',
    newLyricsText
  )

  return {
    ...state,
    lyrics: sections,
    metadata: {
      ...state.metadata,
      updatedAt: new Date(),
      completionPercentage: calculateCompletionPercentage(state, sections.length),
    },
    editHistory: [...state.editHistory, editEntry],
    timeAnalytics: updateTimeAnalytics(state.timeAnalytics),
  }
}

function parseLyricsIntoSections(lyricsText: string): ReadonlyArray<SectionLyrics> {
  const lines = lyricsText.split('\n')
  const sections: SectionLyrics[] = []
  let currentSection: string[] = []
  let currentSectionType: SectionType = 'verse'
  let sectionIndex = 0

  for (const line of lines) {
    const sectionMatch = line.match(/^\[(\w+)\]/)

    if (sectionMatch) {
      if (currentSection.length > 0) {
        sections.push(
          analyzeSectionLyrics(currentSectionType, sectionIndex++, currentSection)
        )
        currentSection = []
      }

      const detectedType = detectSectionTypeFromLabel(sectionMatch[1])
      currentSectionType = detectedType
    } else if (line.trim().length > 0) {
      currentSection.push(line)
    }
  }

  if (currentSection.length > 0) {
    sections.push(
      analyzeSectionLyrics(currentSectionType, sectionIndex, currentSection)
    )
  }

  return sections
}

function detectSectionTypeFromLabel(label: string): SectionType {
  const normalized = label.toLowerCase()

  const mapping: Record<string, SectionType> = {
    'intro': 'intro',
    'verse': 'verse',
    'prechorus': 'prechorus',
    'pre-chorus': 'prechorus',
    'chorus': 'chorus',
    'bridge': 'bridge',
    'outro': 'outro',
    'interlude': 'interlude',
    'breakdown': 'breakdown',
    'hook': 'hook',
    'refrain': 'refrain',
  }

  return mapping[normalized] || 'verse'
}

function createEditHistoryEntry(
  editType: EditHistoryEntry['editType'],
  sectionAffected: SectionType | null,
  changeDescription: string,
  previousValue: string,
  newValue: string
): EditHistoryEntry {
  return {
    timestamp: new Date(),
    editType,
    sectionAffected,
    changeDescription,
    previousValue,
    newValue,
  }
}

function updateTimeAnalytics(analytics: TimeAnalytics): TimeAnalytics {
  const now = new Date()
  const timeSinceLastEdit = (now.getTime() - analytics.lastActiveTime.getTime()) / 1000

  return {
    ...analytics,
    lastActiveTime: now,
    editCount: analytics.editCount + 1,
    averageEditInterval: calculateAverageEditInterval(analytics, timeSinceLastEdit),
  }
}

function calculateAverageEditInterval(
  analytics: TimeAnalytics,
  newInterval: number
): number {
  if (analytics.editCount === 0) return newInterval

  const totalTime = analytics.averageEditInterval * analytics.editCount
  return (totalTime + newInterval) / (analytics.editCount + 1)
}

function calculateCompletionPercentage(
  state: CompleteSongState,
  lyricSectionCount: number
): number {
  let completion = 0

  if (state.metadata.title !== 'Untitled Song') completion += 10
  if (lyricSectionCount > 0) completion += 30
  if (lyricSectionCount >= 3) completion += 20
  if (state.chordProgression) completion += 20
  if (state.musicalElements.key) completion += 10
  if (state.musicalElements.tempo) completion += 10

  return Math.min(100, completion)
}

export function addChordToProgression(
  state: CompleteSongState,
  chord: ChordInstance
): CompleteSongState {
  const currentChords = state.chordProgression?.chords || []

  const editEntry = createEditHistoryEntry(
    'chordChange',
    null,
    `Added chord: ${chord.displayName}`,
    '',
    chord.displayName
  )

  return {
    ...state,
    chordProgression: state.chordProgression
      ? {
          ...state.chordProgression,
          chords: [...currentChords, chord],
        }
      : null,
    editHistory: [...state.editHistory, editEntry],
    metadata: {
      ...state.metadata,
      updatedAt: new Date(),
    },
  }
}

export function updateMusicalKey(
  state: CompleteSongState,
  key: MusicalKey,
  mode: KeyMode
): CompleteSongState {
  const editEntry = createEditHistoryEntry(
    'metadataChange',
    null,
    `Key changed to ${key} ${mode}`,
    state.musicalElements.key || '',
    `${key} ${mode}`
  )

  return {
    ...state,
    musicalElements: {
      ...state.musicalElements,
      key,
      keyMode: mode,
    },
    editHistory: [...state.editHistory, editEntry],
    metadata: {
      ...state.metadata,
      updatedAt: new Date(),
    },
  }
}

export function updateTempo(
  state: CompleteSongState,
  tempo: number
): CompleteSongState {
  const editEntry = createEditHistoryEntry(
    'metadataChange',
    null,
    `Tempo changed to ${tempo} BPM`,
    state.musicalElements.tempo?.toString() || '',
    tempo.toString()
  )

  return {
    ...state,
    musicalElements: {
      ...state.musicalElements,
      tempo,
    },
    editHistory: [...state.editHistory, editEntry],
    metadata: {
      ...state.metadata,
      updatedAt: new Date(),
    },
  }
}
