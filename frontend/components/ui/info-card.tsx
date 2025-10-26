'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface InfoCardProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'info' | 'tip' | 'warning';
  dismissible?: boolean;
  defaultVisible?: boolean;
  className?: string;
}

const VARIANT_STYLES = {
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300',
  tip: 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300',
  warning: 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300',
};

const VARIANT_BADGES = {
  info: { label: 'Info', className: 'bg-blue-500/20 text-blue-700 dark:text-blue-300' },
  tip: { label: 'Tip', className: 'bg-green-500/20 text-green-700 dark:text-green-300' },
  warning: { label: 'Note', className: 'bg-amber-500/20 text-amber-700 dark:text-amber-300' },
};

export function InfoCard({
  title,
  children,
  variant = 'info',
  dismissible = true,
  defaultVisible = true,
  className,
}: InfoCardProps) {
  const [isVisible, setIsVisible] = React.useState(defaultVisible);

  if (!isVisible) return null;

  const badge = VARIANT_BADGES[variant];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'relative rounded-lg border p-4',
          VARIANT_STYLES[variant],
          className
        )}
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            {title && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={cn('text-xs', badge.className)}>
                  {badge.label}
                </Badge>
                <span className="font-semibold text-sm">{title}</span>
              </div>
            )}
            <div className="text-sm leading-relaxed">{children}</div>
          </div>
          {dismissible && (
            <button
              onClick={() => setIsVisible(false)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
