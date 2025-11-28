import { NextResponse } from 'next/server';
import { env } from '@/app/config/env';

export async function GET() {
  const isConfigured = !!env.API_BASE_URL;
  const isDev = env.API_BASE_URL?.includes('dev.srv');

  return NextResponse.json({
    message: '🎸 Welcome to the Chord Lab',
    status: isConfigured ? 'connected' : 'disconnected',
    environment: isDev ? 'development' : 'production',
    backend: isConfigured ? '✅ Backend configured' : '❌ No backend',
    secret: 'The secret chord that David played',
  });
}
