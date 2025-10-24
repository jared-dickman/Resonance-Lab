import { z } from 'zod';

// Download song request
export const downloadRequestSchema = z.object({
  artist: z.string(),
  title: z.string(),
  chordId: z.number().optional(),
  tabId: z.number().optional(),
});

export type DownloadRequestInput = z.infer<typeof downloadRequestSchema>;

// Search request
export const searchRequestSchema = z.object({
  artist: z.string(),
  title: z.string(),
});

export type SearchRequestInput = z.infer<typeof searchRequestSchema>;
