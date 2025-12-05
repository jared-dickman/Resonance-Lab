/**
 * Re-export riff-ripper functions for use in frontend code
 * This provides clean imports via @/lib/agents/riff-ripper
 */

// Note: Using relative import here is intentional - this is the ONLY file
// that should import from .claude, everything else uses @/lib/agents/riff-ripper
// eslint-disable-next-line no-restricted-imports
export {
  searchTabs,
  ripSong,
  fetchTab,
  type RiffRipperResult,
  type RiffRipperInput,
} from '../../../.claude/agents/riff-ripper';
