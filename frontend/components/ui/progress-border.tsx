'use client';

import { cn } from '@/lib/utils';
import * as React from 'react';

interface ProgressBorderProps {
  progress: number; // 0-100
  variant?: 'accent' | 'success' | 'error' | 'generating';
  className?: string;
  children: React.ReactNode;
}

/**
 * Animated border that fills based on progress
 * Integrates seamlessly with card designs for elite visual feedback
 */
function ProgressBorder({
  progress,
  variant = 'accent',
  className,
  children,
}: ProgressBorderProps) {
  const variantStyles = {
    accent: 'from-[var(--wizard-accent)] via-[var(--wizard-accent)] to-[var(--wizard-accent)]',
    success: 'from-[var(--wizard-accent)] via-[var(--wizard-accent)] to-[var(--wizard-accent)]',
    error: 'from-destructive via-destructive to-destructive',
    generating:
      'from-[var(--wizard-accent)] via-[var(--wizard-accent)] to-[var(--wizard-accent)] animate-gradient-x',
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));
  const isLoading = clampedProgress > 0 && clampedProgress < 100;

  return (
    <div className={cn('relative', className)}>
      {/* Animated border container - only visible when loading */}
      <div
        className={cn(
          'absolute inset-0 rounded-lg overflow-hidden transition-opacity duration-300',
          isLoading ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          padding: '2px',
        }}
      >
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-r transition-all duration-700',
            variantStyles[variant]
          )}
          style={{
            clipPath: `polygon(
              0 0,
              ${clampedProgress}% 0,
              ${clampedProgress}% 100%,
              0 100%
            )`,
          }}
        />
        <div
          className="absolute inset-0 bg-border/30"
          style={{
            clipPath: `polygon(
              ${clampedProgress}% 0,
              100% 0,
              100% 100%,
              ${clampedProgress}% 100%
            )`,
          }}
        />
      </div>

      {/* Content container with inner background */}
      <div className="relative bg-card rounded-lg m-[2px]">{children}</div>
    </div>
  );
}

export { ProgressBorder };
export type { ProgressBorderProps };
