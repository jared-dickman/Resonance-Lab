/* eslint-disable no-console */
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

export async function injectMswHandlers(mockDataPath: string): Promise<string> {
  const mockDataContent = await fs.readFile(mockDataPath, 'utf-8');
  const mockData: MockData = JSON.parse(mockDataContent);

  const timestamp = Date.now();
  const handlerFileName = `.temp-demo-${timestamp}.ts`;
  const handlerPath = path.join(
    process.cwd(),
    'app/testing/msw/handlers',
    handlerFileName
  );

  const handlerContent = `
import { http, HttpResponse, delay } from 'msw';
import { apiRoutes } from '@/app/config/apiRoutes';

const mockPillarData = ${JSON.stringify(mockData, null, 2)};

export const tempDemoHandlers = [
  http.post(apiRoutes.pillarGeneration, async () => {
    await delay(1500);
    return HttpResponse.json(mockPillarData);
  }),
];
`;

  await fs.writeFile(handlerPath, handlerContent);

  const indexPath = path.join(
    process.cwd(),
    'app/testing/msw/handlers/index.ts'
  );
  const indexContent = await fs.readFile(indexPath, 'utf-8');
  const updatedIndex = `${indexContent}\nexport * from './${handlerFileName.replace('.ts', '')}';\n`;
  await fs.writeFile(indexPath, updatedIndex);

  console.log(`✅ MSW handler injected: ${handlerPath}`);
  return handlerPath;
}

if (require.main === module) {
  const [mockDataPath] = process.argv.slice(2);
  if (!mockDataPath) {
    console.error('Usage: tsx inject-msw-handlers.ts <mockDataPath>');
    process.exit(1);
  }
  injectMswHandlers(mockDataPath).catch(console.error);
}
