import { NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '@/app/config/env';
import { logger } from '@/lib/logger';
import { serverErrorTracker } from '@/app/utils/error-tracker.server';

const LabResponseSchema = z.object({
  message: z.string(),
  status: z.enum(['connected', 'disconnected']),
  environment: z.enum(['development', 'production']),
  backend: z.string(),
}).strict();

export async function GET() {
  try {
    const isConfigured = !!env.API_BASE_URL;
    const isDev = env.API_BASE_URL?.includes('dev.srv');

    const response = {
      message: '🎸 Welcome to the Chord Lab',
      status: isConfigured ? 'connected' : 'disconnected',
      environment: isDev ? 'development' : 'production',
      backend: isConfigured ? '✅ Backend configured' : '❌ No backend',
    } as const;

    // Validate response schema
    const validated = LabResponseSchema.parse(response);

    logger.info('[lab] Health check', { status: validated.status });
    return NextResponse.json(validated);
  } catch (err) {
    serverErrorTracker.captureApiError(err, { service: 'lab', operation: 'health-check' });
    return NextResponse.json({ error: 'Service unavailable' }, { status: 500 });
  }
}
