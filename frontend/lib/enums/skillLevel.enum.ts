export enum SkillLevel {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Expert = 'expert',
}

export const SKILL_LEVEL_DESCRIPTIONS: Record<SkillLevel, string> = {
  [SkillLevel.Beginner]: 'Focus on simple, open chord progressions',
  [SkillLevel.Intermediate]: 'Mix of standard and extended chords',
  [SkillLevel.Expert]: 'All progressions including jazz & complex voicings',
};
