'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuickStartProps {
  tips: string[];
  className?: string;
  onDismiss?: () => void;
}

/**
 * QuickStart component for first-time user guidance
 * Shows helpful tips in a dismissible card
 */
export function QuickStart({ tips, className, onDismiss }: QuickStartProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={cn('relative', className)}
        >
          <Card className="bg-primary/10 border-2 border-primary/30 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <div className="p-2 rounded-full bg-primary/20">
                    <Lightbulb className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-sm">Quick Start</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDismiss}
                      className="h-6 w-6 p-0 hover:bg-primary/20"
                      aria-label="Dismiss quick start"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary shrink-0 mt-0.5">•</span>
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
