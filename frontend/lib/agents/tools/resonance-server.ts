import { createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import type { SearchResponse, SearchResult } from '@/lib/types';
import { BLOCKED_TYPES } from '@/lib/agents/ultimate-guitar-search/types';
import { serverErrorTracker } from '@/app/utils/error-tracker.server';

// Server-side env var (not NEXT_PUBLIC_ which is client-side and baked at build time)
const API_URL = process.env.API_BASE_URL;

export const resonanceServer = createSdkMcpServer({
  name: 'resonance',
  version: '1.0.0',
  tools: [
    tool(
      'search_ultimate_guitar',
      'Search Ultimate Guitar for tabs and chords by artist and song title',
      {
        artist: z.string().describe('Artist name'),
        title: z.string().describe('Song title'),
      },
      async ({ artist, title }) => {
        serverErrorTracker.addBreadcrumb('mcp-resonance', 'Starting UG search', { artist, title });

        try {
          const response = await fetch(`${API_URL}/api/search`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ artist, title }),
          });

          if (!response.ok) {
            await serverErrorTracker.captureNetworkError(response, {
              service: 'mcp-resonance',
              operation: 'search-ultimate-guitar',
              artist,
              title,
            });
            throw new Error(`Search failed with status ${response.status}`);
          }

          const data: SearchResponse = await response.json();

          // Filter out blocked types
          const filterResults = (results: SearchResult[]): SearchResult[] =>
            results.filter((result) => !BLOCKED_TYPES.includes(result.type));

          const filteredChords = filterResults(data.chords);
          const filteredTabs = filterResults(data.tabs);

          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(
                  {
                    query: data.query,
                    chords: filteredChords,
                    tabs: filteredTabs,
                    message: data.message,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          serverErrorTracker.captureApiError(error, {
            service: 'mcp-resonance',
            operation: 'search-ultimate-guitar',
            artist,
            title,
          });

          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred';
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(
                  {
                    error: errorMessage,
                    query: { artist, title },
                    chords: [],
                    tabs: [],
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    ),
  ],
});
