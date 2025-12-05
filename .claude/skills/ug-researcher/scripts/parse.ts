#!/usr/bin/env npx tsx
/**
 * Parse UG markdown file to JSON
 * Usage: npx tsx parse.ts <input.md> [output.json]
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseUGMarkdownPositioned, toSimpleSong } from '../src';

const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile) {
  console.log('Usage: npx tsx parse.ts <input.md> [output.json]');
  console.log('  --simple    Output simple Song format (no positions)');
  process.exit(1);
}

const useSimple = process.argv.includes('--simple');
const markdown = fs.readFileSync(inputFile, 'utf8');

// Extract URL from filename if possible
const basename = path.basename(inputFile, '.md');
const url = `https://tabs.ultimate-guitar.com/tab/${basename.replace('ug-', '').replace(/-/g, '/')}-chords-0`;

const positioned = parseUGMarkdownPositioned(markdown, url);
const output = useSimple ? toSimpleSong(positioned) : positioned;

const json = JSON.stringify(output, null, 2);

if (outputFile) {
  fs.writeFileSync(outputFile, json);
  console.log(`✅ Saved to: ${outputFile}`);
} else {
  console.log(json);
}
