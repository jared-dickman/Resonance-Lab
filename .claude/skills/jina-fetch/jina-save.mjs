#!/usr/bin/env node

/**
 * Direct MCP -> file writer
 * Ensures byte-perfect content from mcp__jina__read_url
 */

import { writeFileSync } from 'fs';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

const OUTPUT_DIR = '/Users/jrad/jina-output';

// Ensure output directory exists
mkdirSync(OUTPUT_DIR, { recursive: true });

// Parse stdin JSON (MCP tool output)
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  try {
    const mcpOutput = JSON.parse(input);

    // Extract exact content field
    const content = mcpOutput.content;
    const url = mcpOutput.url;

    if (!content) {
      console.error('Error: No content field in MCP output');
      process.exit(1);
    }

    if (!url) {
      console.error('Error: No url field in MCP output');
      process.exit(1);
    }

    // Extract domain from URL
    const domain = new URL(url).hostname.replace(/^www\./, '');

    // Simple domain filename
    const filename = `${domain}.md`;
    const filepath = `${OUTPUT_DIR}/${filename}`;

    // Write exact content (preserves all whitespace, newlines, formatting)
    writeFileSync(filepath, content, 'utf8');

    console.log(JSON.stringify({
      success: true,
      filepath,
      bytes: Buffer.byteLength(content, 'utf8')
    }));

  } catch (err) {
    console.error(JSON.stringify({
      success: false,
      error: err.message
    }));
    process.exit(1);
  }
});
