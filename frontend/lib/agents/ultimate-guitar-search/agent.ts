import { query } from '@anthropic-ai/claude-agent-sdk';
import type { SearchResponse, SearchResult } from '@/lib/types';
import { BLOCKED_TYPES, type AgentSearchResponse } from './types';

export class UltimateGuitarSearchAgent {
  private scraperApiUrl: string;

  constructor() {
    this.scraperApiUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api';
  }

  async searchSongs(artist: string, songTitle: string): Promise<AgentSearchResponse> {
    try {
      // Step 1: Use Claude to correct input
      const correctedInput = await this.correctInput(artist, songTitle);

      // Step 2: Fetch results from Go scraper
      const rawResults = await this.fetchFromScraper(
        correctedInput.artist,
        correctedInput.title
      );

      // Step 3: Filter incompatible types
      const filteredChords = this.filterIncompatibleTypes(rawResults.chords);
      const filteredTabs = this.filterIncompatibleTypes(rawResults.tabs);

      // Step 4: Verify results (can be async/parallel)
      const verifiedChords = await this.verifyResults(filteredChords);
      const verifiedTabs = await this.verifyResults(filteredTabs);

      // Step 5: Build response
      const response: AgentSearchResponse = {
        query: rawResults.query,
        chords: verifiedChords,
        tabs: verifiedTabs,
      };

      // Add message if no results
      if (verifiedChords.length === 0 && verifiedTabs.length === 0) {
        response.message = 'No valid results found for this search';
      }

      // Include correction info if input was corrected
      if (correctedInput.corrected) {
        response.inputCorrection = {
          artist: correctedInput.artist,
          title: correctedInput.title,
          corrected: true,
          original: { artist, title: songTitle },
        };
      }

      return response;
    } catch (error) {
      console.error('Ultimate Guitar Search Agent error:', error);
      return {
        query: { artist, title: songTitle },
        chords: [],
        tabs: [],
        message: 'Search service temporarily unavailable',
      };
    }
  }

  private async correctInput(
    artist: string,
    title: string
  ): Promise<{ artist: string; title: string; corrected: boolean }> {
    const prompt = `Correct any typos in this music search query. Use your knowledge of music artists and song titles.

Artist: "${artist}"
Song: "${title}"

Return ONLY a valid JSON object in this exact format (no markdown, no code blocks):
{
  "artist": "corrected artist name",
  "title": "corrected song title",
  "corrected": true/false
}

Only set corrected=true if you actually changed something. If the input looks correct, return it unchanged with corrected=false.`;

    let result = { artist, title, corrected: false };

    try {
      for await (const message of query({
        prompt,
        options: {
          maxTurns: 1,
          model: 'haiku' as const,
          allowedTools: [],
        },
      })) {
        if (message.type === 'result' && message.subtype === 'success') {
          try {
            // Remove markdown code blocks if present
            let cleanedResult = message.result.trim();
            cleanedResult = cleanedResult.replace(/^```json\n?/, '');
            cleanedResult = cleanedResult.replace(/\n?```$/, '');
            cleanedResult = cleanedResult.trim();

            const parsed = JSON.parse(cleanedResult);
            if (parsed.artist && parsed.title && typeof parsed.corrected === 'boolean') {
              result = parsed;
            }
          } catch (parseError) {
            console.warn('Failed to parse input correction:', parseError);
          }
        }
      }
    } catch (error) {
      console.warn('Input correction failed, using original input:', error);
    }

    return result;
  }

  private async fetchFromScraper(artist: string, title: string): Promise<SearchResponse> {
    const response = await fetch(`${this.scraperApiUrl}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artist, title }),
    });

    if (!response.ok) {
      throw new Error(`Scraper API error: ${response.statusText}`);
    }

    return response.json();
  }

  private filterIncompatibleTypes(results: SearchResult[]): SearchResult[] {
    return results.filter((result) => {
      const type = result.type?.toLowerCase() || '';
      return !BLOCKED_TYPES.some((blocked) => type.includes(blocked.toLowerCase()));
    });
  }

  private async verifyResults(results: SearchResult[]): Promise<SearchResult[]> {
    // For MVP: Return all filtered results
    // Future enhancement: Actually test each tab ID
    // This would require exposing GetTabByID in Go API
    return results;
  }
}
