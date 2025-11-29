'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RandomLoader } from '@/components/ui/loaders/RandomLoader';
import { cn } from '@/lib/utils';

const DRAMATIC_DURATION = 0.666;
const MIN_DISPLAY_TIME = 1000;

interface DramaticLoaderProps {
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullPage?: boolean;
}

export function DramaticLoader({
  isLoading = true,
  size = 'lg',
  className,
  fullPage = false,
}: DramaticLoaderProps) {
  const [showLoader, setShowLoader] = useState(isLoading);
  const [mountTime] = useState(() => Date.now());

  useEffect(() => {
    if (isLoading) {
      setShowLoader(true);
      return;
    }
    const elapsed = Date.now() - mountTime;
    const remainingTime = Math.max(0, MIN_DISPLAY_TIME - elapsed);

    const timer = setTimeout(() => {
      setShowLoader(false);
    }, remainingTime);

    return () => clearTimeout(timer);
  }, [isLoading, mountTime]);

  return (
    <AnimatePresence mode="wait">
      {showLoader && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: DRAMATIC_DURATION,
            ease: 'easeInOut',
          }}
          className={cn(
            'flex items-center justify-center',
            fullPage && 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
            !fullPage && 'absolute inset-0',
            className
          )}
        >
          <RandomLoader size={size} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PageLoader() {
  return (
    <div className="relative min-h-[50vh] w-full">
      <DramaticLoader fullPage={false} size="lg" />
    </div>
  );
}

export function FullPageLoader() {
  return <DramaticLoader fullPage size="lg" />;
}
