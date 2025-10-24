import { z } from 'zod';

// SavedSong schema (list item)
export const savedSongSchema = z.object({
  artist: z.string(),
  artistSlug: z.string(),
  title: z.string(),
  songSlug: z.string(),
  key: z.string(),
  hasChords: z.boolean(),
  hasTab: z.boolean(),
  updatedAt: z.string(),
});

export type SavedSongResponse = z.infer<typeof savedSongSchema>;

// Song detail schema
export const songSectionLineSchema = z.object({
  chord: z
    .object({
      name: z.string(),
    })
    .optional(),
  lyric: z.string(),
});

export const songSectionSchema = z.object({
  name: z.string(),
  lines: z.array(songSectionLineSchema),
});

export const songSchema = z.object({
  artist: z.string(),
  title: z.string(),
  key: z.string().optional(),
  sections: z.array(songSectionSchema),
});

export type SongResponse = z.infer<typeof songSchema>;

// Song detail with additional metadata
export const songDetailSchema = z.object({
  summary: savedSongSchema,
  chordsHtml: z.string().optional(),
  tabHtml: z.string().optional(),
  songJson: songSchema.optional(),
});

export type SongDetailResponse = z.infer<typeof songDetailSchema>;

// Search result schema
export const searchResultSchema = z.object({
  id: z.number(),
  title: z.string(),
  artist: z.string(),
  rating: z.number(),
  votes: z.number(),
  score: z.number(),
  type: z.string(),
});

export type SearchResultResponse = z.infer<typeof searchResultSchema>;

// Search response schema
export const searchResponseSchema = z.object({
  query: z.object({
    artist: z.string(),
    title: z.string(),
  }),
  chords: z.array(searchResultSchema),
  tabs: z.array(searchResultSchema),
});

export type SearchResponseData = z.infer<typeof searchResponseSchema>;
