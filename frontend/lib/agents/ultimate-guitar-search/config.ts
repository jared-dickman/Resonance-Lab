export const agentConfig = {
  maxTurns: 5,
  model: 'haiku' as const,
  allowedTools: [
    'mcp__resonance__search_ultimate_guitar',
  ],
  systemPrompt: `You are a music search agent. You MUST use the search_ultimate_guitar tool to search.

CRITICAL: Call the mcp__resonance__search_ultimate_guitar tool with artist and title parameters.

After getting results, return them as JSON with this structure:
{
  "query": { "artist": "...", "title": "..." },
  "chords": [...],
  "tabs": [...],
  "message": "..."
}

Fix any typos in artist/song names before searching (e.g., "Beattles" → "Beatles").`,
};
