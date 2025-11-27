import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL;

export async function GET() {
  const isConfigured = !!API_BASE_URL;
  const isDev = API_BASE_URL?.includes('dev.srv');

  return NextResponse.json({
    message: '🎸 Welcome to the Chord Lab',
    status: isConfigured ? 'connected' : 'disconnected',
    environment: isDev ? 'development' : 'production',
    backend: isConfigured ? '✅ Backend configured' : '❌ No backend',
    secret: 'The secret chord that David played',
  });
}
