/**
 * Song format for Jamium - matches existing frontend structure
 */
export interface Song {
  artist: string;         // Original artist/composer
  title: string;
  key?: string;           // Key from UG tab
  originalKey?: string;   // Verified original key (from web lookup)
  performer?: string;     // Performer of this version (if cover)
  capo?: number;
  sections: Section[];
  sourceUrl?: string;
}

export interface Section {
  name: string;
  lines: Line[];
}

export interface Line {
  chord: { name: string } | null;
  lyric: string;
  /** Lines with same lineGroup came from same source line (for rendering) */
  lineGroup?: number;
}
