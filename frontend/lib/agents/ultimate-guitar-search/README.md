# Ultimate Guitar Search Agent

An intelligent search agent that enhances Ultimate Guitar song searches by automatically correcting user input, filtering problematic song types, and ensuring compatibility with the user's library.

## Purpose

This agent addresses two critical issues in the current implementation:

1. **Type Incompatibility**: Song results with types `Official`, `Pro`, or `Guitar Pro` fail when added to the library, displaying "song not found" errors
2. **User Input Quality**: Mistyped artist names and song titles yield poor or no results

## Architecture

The agent sits between the frontend and the Go scraper API, providing:

- **Intelligent Input Correction**: Automatically fixes typos in artist/song names using Claude's language understanding
- **Smart Filtering**: Removes incompatible song types before returning results
- **Result Verification**: Tests each result to ensure library compatibility (placeholder for future enhancement)
- **Graceful Degradation**: Silent filtering with helpful messaging when no results remain

## How It Works

1. **Input Correction**: Uses Claude (Haiku model) to correct common typos in artist and song names
   - Example: "The Beattles" → "The Beatles"
   - Example: "Stairway to Heavan" → "Stairway to Heaven"

2. **Type Filtering**: Removes results with incompatible types:
   - Blocked: `Official`, `Pro`, `Guitar Pro`
   - Allowed: `Chords`, `Tabs`, `Bass`, `Ukulele`

3. **Result Verification**: (Future enhancement) Will test each tab ID to ensure it can be successfully fetched

## Configuration

### Environment Variables

Add to your `.env.local`:

```bash
# Anthropic API Key for Claude
ANTHROPIC_API_KEY=sk-ant-...

# Backend API URL (already configured)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### Agent Configuration

The agent is configured in `config.ts` with:
- **Model**: Haiku (for fast, cost-effective input correction)
- **Max Turns**: 3 (limited to prevent excessive API calls)
- **System Prompt**: Custom instructions for music search expertise

## Usage

The agent is automatically used by the `searchLibrary()` function in `/lib/api.ts`:

```typescript
import { searchLibrary } from '@/lib/api';

// Usage
const results = await searchLibrary('The Beatles', 'Help');
```

The agent is transparent to the rest of the application - it implements the same `SearchResponse` interface.

## Response Format

The agent returns an enhanced `SearchResponse`:

```typescript
interface SearchResponse {
  query: {
    artist: string;
    title: string;
  };
  chords: SearchResult[];
  tabs: SearchResult[];
  message?: string;           // NEW: "No valid results found" when empty
}
```

## Files

- `agent.ts`: Main agent class with search orchestration
- `types.ts`: TypeScript type definitions
- `config.ts`: Agent configuration
- `index.ts`: Public exports

## Future Enhancements

1. **Result Verification**: Actually test each tab ID via Go scraper's `GetTabByID()` endpoint
2. **Caching**: Cache corrected input mappings to reduce API calls
3. **Analytics**: Track search quality metrics and correction accuracy
4. **Learning**: Improve corrections based on user selection patterns
5. **Fuzzy Matching**: Add similarity scoring for ambiguous searches

## Performance

- **Target Response Time**: <3 seconds for typical queries
- **Model Used**: Claude Haiku for cost-effective, fast corrections
- **Optimization**: Single correction call per search, parallel filtering

## Error Handling

The agent gracefully handles errors:

- **Claude API Failures**: Falls back to original user input
- **Scraper API Failures**: Returns empty results with error message
- **Parse Errors**: Uses original input if correction parsing fails
- **Network Issues**: Returns appropriate error message to user

## Testing

To test the agent:

1. Ensure Go scraper is running at `localhost:8080`
2. Set `ANTHROPIC_API_KEY` in `.env.local`
3. Use the search feature in the frontend
4. Try searches with common typos (e.g., "Led Zeplin", "The Beattles")
5. Verify that `Official`, `Pro`, and `Guitar Pro` results are filtered out

## Troubleshooting

**No results returned**:
- Check that Go scraper is running
- Verify `NEXT_PUBLIC_API_BASE_URL` is correct

**Input not being corrected**:
- Check `ANTHROPIC_API_KEY` is set
- Check browser console for errors

**Types still showing Official/Pro**:
- Verify filtering logic in `agent.ts:filterIncompatibleTypes()`
- Check that result types match expected format
