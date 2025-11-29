import type {
  SectionLyrics,
  SectionType,
  SongStructure,
  Genre,
} from '@/components/songwriter/types/song';

export function estimateSectionDurationSeconds(section: SectionLyrics, tempo: number): number {
  const totalSyllables = section.lines.reduce((sum, line) => sum + line.syllableCount, 0);

  const beatsPerSecond = tempo / 60;

  const syllablesPerBeat = 2;

  const estimatedBeats = totalSyllables / syllablesPerBeat;

  return estimatedBeats / beatsPerSecond;
}

export function validateStructureCompleteness(structure: SongStructure): number {
  const requiredElements = {
    hasIntro: 0.1,
    hasOutro: 0.1,
    hasVerse: 0.3,
    hasChorus: 0.3,
    hasBridge: 0.2,
  };

  let completeness = 0;

  if (structure.hasIntro) {
    completeness += requiredElements.hasIntro;
  }

  if (structure.hasOutro) {
    completeness += requiredElements.hasOutro;
  }

  if (structure.verseCount >= 2) {
    completeness += requiredElements.hasVerse;
  } else if (structure.verseCount === 1) {
    completeness += requiredElements.hasVerse * 0.5;
  }

  if (structure.chorusCount >= 2) {
    completeness += requiredElements.hasChorus;
  } else if (structure.chorusCount === 1) {
    completeness += requiredElements.hasChorus * 0.5;
  }

  if (structure.bridgeCount) {
    completeness += requiredElements.hasBridge;
  }

  return completeness;
}

export function suggestNextSection(currentStructure: SongStructure, genre: Genre): SectionType {
  const sections = currentStructure.sections;

  if (sections.length === 0) {
    return shouldStartWithIntro(genre) ? 'intro' : 'verse';
  }

  const lastSection = sections[sections.length - 1];

  if (lastSection === 'intro') {
    return 'verse';
  }

  if (lastSection === 'verse') {
    if (currentStructure.chorusCount === 0) {
      return 'chorus';
    }

    if (shouldUsePrechorus(genre) && !hasPrechorus(sections)) {
      return 'prechorus';
    }

    return 'chorus';
  }

  if (lastSection === 'prechorus') {
    return 'chorus';
  }

  if (lastSection === 'chorus') {
    if (currentStructure.verseCount < 2) {
      return 'verse';
    }

    if (!currentStructure.bridgeCount && sections.length >= 6) {
      return 'bridge';
    }

    if (currentStructure.chorusCount >= 2) {
      return 'outro';
    }

    return 'verse';
  }

  if (lastSection === 'bridge') {
    return 'chorus';
  }

  return 'outro';
}

function shouldStartWithIntro(genre: Genre): boolean {
  const introGenres: Genre[] = ['rock', 'indie', 'electronic', 'metal'];

  return introGenres.includes(genre);
}

function shouldUsePrechorus(genre: Genre): boolean {
  const prechorusGenres: Genre[] = ['pop', 'rock', 'indie', 'alternative'];

  return prechorusGenres.includes(genre);
}

function hasPrechorus(sections: ReadonlyArray<SectionType>): boolean {
  return sections.includes('prechorus');
}
