/**
 * Panel Divider Component
 * Reusable resize handle with hover states
 * DRY principle: eliminates duplication from 100+ lines of inline JSX
 */

'use client';

import { PanelResizeHandle } from 'react-resizable-panels';
import { GripVertical } from 'lucide-react';

import { cn } from '@/lib/utils';

interface PanelDividerProps {
  isMobile: boolean;
}

export function PanelDivider({ isMobile }: PanelDividerProps): React.JSX.Element {
  const handleClasses = cn(
    'flex items-center justify-center hover:bg-primary/10 transition-colors group',
    isMobile ? 'h-2' : 'w-2'
  );

  const lineClasses = cn(
    'bg-border group-hover:bg-primary/50 rounded-full transition-colors flex items-center justify-center',
    isMobile ? 'h-1 w-12' : 'w-1 h-12'
  );

  const iconClasses = cn(
    'w-3 h-3 text-muted-foreground group-hover:text-primary',
    isMobile && 'rotate-90'
  );

  return (
    <PanelResizeHandle className={handleClasses}>
      <div className={lineClasses}>
        <GripVertical className={iconClasses} />
      </div>
    </PanelResizeHandle>
  );
}
