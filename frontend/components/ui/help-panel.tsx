'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface HelpSection {
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface HelpPanelProps {
  title: string;
  sections: HelpSection[];
  className?: string;
  defaultOpen?: boolean;
}

export function HelpPanel({ title, sections, className, defaultOpen = false }: HelpPanelProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const [expandedSections, setExpandedSections] = React.useState<Set<number>>(new Set());

  const toggleSection = (index: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className={cn('relative', className)}>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="gap-2"
          aria-label={isOpen ? 'Close help' : 'Open help'}
        >
          <HelpCircle className="w-4 h-4" />
          <span className="text-xs">Help</span>
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)]"
          >
            <Card className="shadow-lg border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                {sections.map((section, index) => (
                  <div key={index} className="border-b border-border/50 last:border-0 pb-2">
                    <button
                      onClick={() => toggleSection(index)}
                      className="w-full flex items-start justify-between gap-2 text-left hover:opacity-80 transition-opacity"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {section.icon && (
                          <span className="text-primary shrink-0">{section.icon}</span>
                        )}
                        <span className="font-medium text-sm">{section.title}</span>
                      </div>
                      {expandedSections.has(index) ? (
                        <ChevronUp className="w-4 h-4 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 shrink-0" />
                      )}
                    </button>
                    <AnimatePresence>
                      {expandedSections.has(index) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 text-sm text-muted-foreground pl-6">
                            {section.content}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
