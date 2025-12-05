#!/usr/bin/env npx tsx
/**
 * Verify original song key via web search
 * Usage: npx tsx verify-key.ts "Artist" "Song Title"
 *
 * Returns the original key if found, for comparison with UG tab key
 */

import { execSync } from 'child_process';

const artist = process.argv[2];
const title = process.argv[3];

if (!artist || !title) {
  console.log('Usage: npx tsx verify-key.ts "Artist" "Song Title"');
  process.exit(1);
}

const query = `${artist} ${title} original key`;
console.log(`🔍 Searching: "${query}"`);

try {
  // Use jina search
  const result = execSync(
    `curl -sL "https://s.jina.ai/${encodeURIComponent(query)}" -H "Accept: application/json" 2>/dev/null | head -2000`,
    { encoding: 'utf8' }
  );

  // Parse for key mentions
  const keyPattern = /(?:original\s+)?key\s*(?:of|is|:)?\s*([A-G][#b]?\s*(?:major|minor|m)?)/gi;
  const matches = result.match(keyPattern);

  if (matches && matches.length > 0) {
    // Extract just the key from matches
    const keys = matches.map(m => {
      const k = m.match(/([A-G][#b]?\s*(?:major|minor|m)?)/i);
      return k ? k[1]?.trim() : null;
    }).filter(Boolean);

    const uniqueKeys = [...new Set(keys)];
    console.log(`\n✅ Found keys: ${uniqueKeys.join(', ')}`);
    console.log(`   Most likely original: ${uniqueKeys[0]}`);
  } else {
    console.log('\n⚠️  Could not determine original key');
  }
} catch (error) {
  console.error('❌ Search failed:', error);
  process.exit(1);
}
