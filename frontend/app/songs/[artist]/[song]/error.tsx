'use client';

import { useEffect } from 'react';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { pageRoutes } from '@/lib/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Song loading failed', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="space-y-6">
      <Link href={pageRoutes.home}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Home
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <CardTitle>Failed to Load Song</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {error.message || 'An unexpected error occurred while loading this song.'}
          </p>
          <div className="flex gap-2">
            <Button onClick={reset}>Try Again</Button>
            <Link href={pageRoutes.home}>
              <Button variant="outline">Go Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
