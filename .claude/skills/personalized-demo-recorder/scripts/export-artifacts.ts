import fs from 'fs/promises';
import path from 'path';

interface Metadata {
  company: string;
  industry: string;
  recordedAt: string;
  videoDuration: string;
  storyId: string;
  mockDataPath: string;
}

export async function exportArtifacts(
  videoPath: string,
  mockDataPath: string,
  tempHandlerPath: string,
  company: string,
  industry: string
): Promise<string> {
  const videoExists = await fs.stat(videoPath).then(() => true).catch(() => false);
  const mockDataExists = await fs.stat(mockDataPath).then(() => true).catch(() => false);

  if (!videoExists || !mockDataExists) {
    throw new Error('Missing required artifacts');
  }

  const outputDir = path.dirname(videoPath);

  const metadata: Metadata = {
    company,
    industry,
    recordedAt: new Date().toISOString(),
    videoDuration: 'N/A',
    storyId: 'wizard-pillar-generation-wizard--all-four-phases-to-completion',
    mockDataPath: './mock-data.json',
  };

  const metadataPath = path.join(outputDir, 'metadata.json');
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

  console.log('🧹 Cleaning up temp MSW handler...');
  await fs.unlink(tempHandlerPath);

  const indexPath = path.join(
    process.cwd(),
    'app/testing/msw/handlers/index.ts'
  );
  const indexContent = await fs.readFile(indexPath, 'utf-8');
  const handlerFileName = path.basename(tempHandlerPath, '.ts');
  const updatedIndex = indexContent
    .split('\n')
    .filter((line) => !line.includes(handlerFileName))
    .join('\n');
  await fs.writeFile(indexPath, updatedIndex);

  console.log(`✅ Bundle complete: ${outputDir}`);
  console.log(`   - ${company}-demo.webm`);
  console.log(`   - mock-data.json`);
  console.log(`   - metadata.json`);

  return outputDir;
}

if (require.main === module) {
  const [videoPath, mockDataPath, tempHandlerPath, company, industry] = process.argv.slice(2);
  if (!videoPath || !mockDataPath || !tempHandlerPath || !company || !industry) {
    console.error('Usage: tsx export-artifacts.ts <videoPath> <mockDataPath> <tempHandlerPath> <company> <industry>');
    process.exit(1);
  }
  exportArtifacts(videoPath, mockDataPath, tempHandlerPath, company, industry).catch(console.error);
}
