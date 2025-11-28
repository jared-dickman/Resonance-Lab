/* eslint-disable no-console */
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function recordDemoVideo(
  company: string,
  outputDir: string
): Promise<string> {
  const browser = await chromium.launch({
    headless: false,
  });

  const context = await browser.newContext({
    recordVideo: {
      dir: outputDir,
      size: { width: 1920, height: 1080 },
    },
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  console.log('🌐 Navigating to Storybook story...');

  await page.goto(
    'http://localhost:6006/iframe.html?id=wizard-pillar-generation-wizard--all-four-phases-to-completion&viewMode=story',
    { waitUntil: 'networkidle' }
  );

  console.log('⏳ Waiting for story to load...');
  await page.locator('[data-testid="pillar-title-card"]').waitFor({ timeout: 15000 });

  console.log('📹 Recording started, waiting for completion...');

  await page.locator('text=/your pillar strategy is ready!/i').waitFor({
    state: 'visible',
    timeout: 50000,
  });

  console.log('✅ Completion detected! Adding 2s padding...');
  await page.waitForTimeout(2000);

  console.log('🎬 Stopping recording...');

  const videoPath = await page.video()?.path();
  await page.close();
  await context.close();
  await browser.close();

  if (!videoPath) {
    throw new Error('Video path not found');
  }

  const finalPath = path.join(outputDir, `${company}-demo.webm`);
  await fs.rename(videoPath, finalPath);

  console.log(`✅ Video saved: ${finalPath}`);
  console.log('🎥 Opening in QuickTime Player...');

  await execAsync(`open -a "QuickTime Player" "${finalPath}"`);

  return finalPath;
}

if (require.main === module) {
  const [company, outputDir] = process.argv.slice(2);
  if (!company || !outputDir) {
    console.error('Usage: tsx record-demo-video.ts <company> <outputDir>');
    process.exit(1);
  }
  recordDemoVideo(company, outputDir).catch(console.error);
}
