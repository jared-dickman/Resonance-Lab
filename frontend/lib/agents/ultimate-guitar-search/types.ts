import type { SearchResponse, SearchResult } from '@/lib/types';

export interface CorrectedInput {
  artist: string;
  title: string;
  corrected: boolean;
  original: {
    artist: string;
    title: string;
  };
}

export interface VerificationResult {
  id: number;
  valid: boolean;
  reason?: string;
}

export interface AgentSearchResponse extends SearchResponse {
  message?: string;
  inputCorrection?: CorrectedInput;
}

export const BLOCKED_TYPES = ['Official', 'Pro', 'Guitar Pro'];
export const ALLOWED_TYPES = ['Chords', 'Tabs', 'Bass', 'Ukulele'];
