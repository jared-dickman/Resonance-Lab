import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    API_BASE_URL: z.string().url().optional().describe('Backend API base URL (server-side)'),
  },
  client: {
    NEXT_PUBLIC_API_BASE_URL: z.string().url().optional().describe('Backend API base URL (client-side)'),
    NEXT_PUBLIC_BUILD_TIME: z.string().optional().describe('Build timestamp (set at build time)'),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_BUILD_TIME: process.env.NEXT_PUBLIC_BUILD_TIME,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
