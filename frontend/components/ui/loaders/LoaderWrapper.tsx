'use client';

import { cn } from '@/lib/utils';
import { LOADER_SIZE, type LoaderProps } from '@/components/ui/loaders/loader.constants';

interface LoaderWrapperProps extends LoaderProps {
  children: React.ReactNode;
}

/**
 * Shared wrapper for all loaders
 * Eliminates repeated role/aria-label/sizing boilerplate
 */
export function LoaderWrapper({ className, size = 'md', children }: LoaderWrapperProps) {
  const dim = LOADER_SIZE[size];

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      style={{ width: dim, height: dim }}
    >
      {children}
    </div>
  );
}
