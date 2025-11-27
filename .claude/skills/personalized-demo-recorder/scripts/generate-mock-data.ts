import fs from 'fs/promises';
import path from 'path';

interface MockData {
  company: string;
  industry: string;
  pillar: {
    title: string;
    content: string;
  };
  clusters: Array<{
    title: string;
    content: string;
  }>;
}

export async function generateMockData(
  company: string,
  industry: string
): Promise<string> {
  const timestamp = Date.now();
  const outputDir = path.join(
    process.cwd(),
    '.claude/output/demo-artifacts',
    `${company}-${timestamp}`
  );

  await fs.mkdir(outputDir, { recursive: true });

  const mockData: MockData = {
    company,
    industry,
    pillar: {
      title: `Strategic content for ${industry}`,
      content: `Comprehensive pillar strategy designed for ${company} to dominate ${industry} thought leadership.`,
    },
    clusters: [
      {
        title: `${industry} Market Trends`,
        content: `Analysis of current market dynamics in ${industry}.`,
      },
      {
        title: `Innovation in ${industry}`,
        content: `Cutting-edge developments shaping ${industry}.`,
      },
      {
        title: `${company} Value Proposition`,
        content: `How ${company} delivers unique value in ${industry}.`,
      },
    ],
  };

  const outputPath = path.join(outputDir, 'mock-data.json');
  await fs.writeFile(outputPath, JSON.stringify(mockData, null, 2));

  console.log(`✅ Mock data generated: ${outputPath}`);
  return outputPath;
}

if (require.main === module) {
  const [company, industry] = process.argv.slice(2);
  if (!company || !industry) {
    console.error('Usage: tsx generate-mock-data.ts <company> <industry>');
    process.exit(1);
  }
  generateMockData(company, industry).catch(console.error);
}
