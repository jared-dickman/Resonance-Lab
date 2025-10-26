'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PanelLabelProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

/**
 * Consistent panel header with icon, title, and optional description
 * Used to clearly identify what each panel does
 */
export function PanelLabel({ icon, title, description, className }: PanelLabelProps) {
  return (
    <motion.div
      className={cn('flex items-start gap-3 mb-4', className)}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base leading-tight">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
        )}
      </div>
    </motion.div>
  );
}
