import { query } from '@anthropic-ai/claude-agent-sdk';
import { resonanceServer } from '../tools/resonance-server';
import type { AgentSearchResponse } from './types';
import { agentConfig } from './config';

interface ResultMessage {
  type: string;
  subtype: string;
  result?: string;
  structured_output?: AgentSearchResponse;
  errors?: string[];
}

function buildSearchPrompt(artist: string, title: string): string {
  return `Search Ultimate Guitar for "${title}" by "${artist}".

Use the search_ultimate_guitar tool to find tabs and chords. Return the results.`;
}

/**
 * Search Ultimate Guitar using Claude Agent SDK
 */
export async function searchSongs(
  artist: string,
  songTitle: string
): Promise<AgentSearchResponse> {
  try {
    const results = query({
      prompt: buildSearchPrompt(artist, songTitle),
      options: {
        model: agentConfig.model,
        maxTurns: agentConfig.maxTurns,
        mcpServers: {
          resonance: resonanceServer,
        },
        allowedTools: agentConfig.allowedTools,
        systemPrompt: agentConfig.systemPrompt,
      },
    });

    let finalResult: ResultMessage | null = null;

    // Iterate through all messages from the agent
    for await (const message of results) {
      console.log('[agent] Message type:', message.type, 'subtype:', 'subtype' in message ? message.subtype : 'N/A');
      if (message.type === 'result') {
        finalResult = message as ResultMessage;
        console.log('[agent] Final result subtype:', finalResult.subtype);
        console.log('[agent] Final result:', JSON.stringify(finalResult).substring(0, 1000));
        break;
      }
    }

    // Handle success with structured output
    if (finalResult?.subtype === 'success' && finalResult.structured_output) {
      return finalResult.structured_output as AgentSearchResponse;
    }

    // Handle success with text result
    if (finalResult?.subtype === 'success' && finalResult.result) {
      try {
        // Try to extract JSON from the result (may be wrapped in markdown)
        const jsonMatch = finalResult.result.match(/```json\s*([\s\S]*?)\s*```/);
        const jsonStr = jsonMatch?.[1] ?? finalResult.result;
        return JSON.parse(jsonStr) as AgentSearchResponse;
      } catch {
        console.error('[agent] Failed to parse result:', finalResult.result?.substring(0, 500));
        return {
          query: { artist, title: songTitle },
          chords: [],
          tabs: [],
          message: 'Unable to parse search results',
        };
      }
    }

    // Handle errors
    if (finalResult && finalResult.subtype !== 'success') {
      const errors = finalResult.errors?.join(', ') || 'Unknown error';
      return {
        query: { artist, title: songTitle },
        chords: [],
        tabs: [],
        message: `Search failed: ${errors}`,
      };
    }

    // No result received
    return {
      query: { artist, title: songTitle },
      chords: [],
      tabs: [],
      message: 'No response from search agent',
    };
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
