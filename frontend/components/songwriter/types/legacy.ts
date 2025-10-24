export interface SongDraft {
  id: string;
  title: string;
  lyrics: string;
  chords: { name: string; timing: number }[];
  structure: { section: string; lines: number }[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
}
