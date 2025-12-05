#!/usr/bin/env npx tsx
/**
 * Validate parser output against expected JSON
 * Usage: npx tsx validate.ts <example-name>
 * Example: npx tsx validate.ts folsom-prison
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseUGMarkdownPositioned } from '../src';

const exampleName = process.argv[2];

if (!exampleName) {
  console.log('Usage: npx tsx validate.ts <example-name>');
  console.log('Available examples:');
  const examples = fs.readdirSync(path.join(__dirname, '../examples'))
    .filter(f => f.endsWith('.md'))
    .map(f => '  - ' + f.replace('.md', ''));
  console.log(examples.join('\n'));
  process.exit(1);
}

const examplesDir = path.join(__dirname, '../examples');
const mdFile = path.join(examplesDir, `${exampleName}.md`);
const expectedFile = path.join(examplesDir, `${exampleName}.expected.json`);

if (!fs.existsSync(mdFile)) {
  console.error(`❌ Not found: ${mdFile}`);
  process.exit(1);
}

const markdown = fs.readFileSync(mdFile, 'utf8');
const actual = parseUGMarkdownPositioned(markdown);

console.log(`🎸 Validating: ${exampleName}`);
console.log(`   Artist: ${actual.artist}`);
console.log(`   Title: ${actual.title}`);
console.log(`   Key: ${actual.key || 'N/A'}`);
console.log(`   Sections: ${actual.sections.length}`);

const allChords = actual.sections.flatMap(s =>
  s.lines.filter(l => l.chord).map(l => l.chord!.name)
);
const uniqueChords = [...new Set(allChords)];
console.log(`   Chords: ${uniqueChords.join(', ')}`);
console.log(`   Total chord instances: ${allChords.length}`);

if (fs.existsSync(expectedFile)) {
  const expected = JSON.parse(fs.readFileSync(expectedFile, 'utf8'));

  const errors: string[] = [];
  if (expected.artist && actual.artist !== expected.artist) {
    errors.push(`Artist: expected "${expected.artist}", got "${actual.artist}"`);
  }
  if (expected.title && actual.title !== expected.title) {
    errors.push(`Title: expected "${expected.title}", got "${actual.title}"`);
  }
  if (expected.key && actual.key !== expected.key) {
    errors.push(`Key: expected "${expected.key}", got "${actual.key}"`);
  }
  if (expected.sectionCount && actual.sections.length !== expected.sectionCount) {
    errors.push(`Sections: expected ${expected.sectionCount}, got ${actual.sections.length}`);
  }
  if (expected.chords) {
    const missing = expected.chords.filter((c: string) => !uniqueChords.includes(c));
    if (missing.length > 0) {
      errors.push(`Missing chords: ${missing.join(', ')}`);
    }
  }

  if (errors.length === 0) {
    console.log('\n✅ All validations passed!');
  } else {
    console.log('\n❌ Validation errors:');
    errors.forEach(e => console.log(`   - ${e}`));
    process.exit(1);
  }
} else {
  console.log(`\n⚠️  No expected file found: ${expectedFile}`);
  console.log('   Creating one now...');

  const expectedData = {
    artist: actual.artist,
    title: actual.title,
    key: actual.key,
    sectionCount: actual.sections.length,
    chords: uniqueChords,
    chordCount: allChords.length
  };
  fs.writeFileSync(expectedFile, JSON.stringify(expectedData, null, 2));
  console.log(`   ✅ Created: ${expectedFile}`);
}
