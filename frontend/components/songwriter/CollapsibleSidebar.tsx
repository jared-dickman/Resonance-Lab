'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CollapsibleSidebarProps {
  children: React.ReactNode;
  title: string;
  defaultCollapsed?: boolean;
  className?: string;
}

/**
 * CollapsibleSidebar - Google Docs-inspired collapsible sidebar
 * Provides a clean, professional layout for secondary content
 */
export function CollapsibleSidebar({
  children,
  title,
  defaultCollapsed = false,
  className,
}: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  return (
    <div
      className={cn(
        'relative h-full border-r bg-muted/30 transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-12' : 'w-80',
        className
      )}
    >
      {/* Collapse Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          'absolute top-4 -right-3 z-10 h-6 w-6 rounded-full p-0',
          'bg-background border-2 shadow-sm hover:shadow-md',
          'transition-all duration-200'
        )}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-3 h-3" />
        </motion.div>
      </Button>

      <AnimatePresence mode="wait">
        {isCollapsed ? (
          /* Collapsed State - Icon Only */
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center pt-20 px-2 space-y-4"
          >
            <FileText className="w-5 h-5 text-muted-foreground" />
            <div className="h-px w-8 bg-border" />
          </motion.div>
        ) : (
          /* Expanded State - Full Content */
          <motion.div
            key="expanded"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full flex flex-col"
          >
            <div className="p-4 border-b bg-background/50">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {title}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
