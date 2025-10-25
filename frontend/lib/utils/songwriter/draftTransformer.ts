/**
 * Draft Transformation Utilities
 * Converts between CompleteSongState and SongDraft formats
 */

import type { CompleteSongState } from '@/components/songwriter/types/song';
import type { SongDraft } from '@/components/songwriter/types/legacy';
import { flattenSongSections } from './lyricsFormatter';

export function convertStateToDraft(songState: CompleteSongState): SongDraft {
  return {
    id: 'current',
    title: songState.metadata.title,
    lyrics: flattenSongSections(songState.lyrics),
    chords: [],
    structure: [],
    createdAt: songState.metadata.createdAt,
    updatedAt: songState.metadata.updatedAt,
    version: songState.metadata.version,
  };
}
