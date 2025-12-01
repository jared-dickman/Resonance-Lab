'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CollapsibleSongSectionProps {
  sectionName: string;
  sectionIndex: number;
  children: React.ReactNode;
  songId: string;
  className?: string;
}

const SECTION_COLOR_MAP: Record<string, string> = {
  'intro': 'sapphire-300',
  'verse': 'sapphire-400',
  'pre-chorus': 'sapphire-450',
  'prechorus': 'sapphire-450',
  'chorus': 'sapphire-500',
  'bridge': 'purple-400',
  'outro': 'sapphire-300',
  'interlude': 'purple-300',
  'breakdown': 'purple-500',
  'hook': 'sapphire-600',
  'refrain': 'purple-400',
};

function getSectionColor(sectionName: string): string {
  const normalized = sectionName.toLowerCase().replace(/\s+/g, '-');
  return SECTION_COLOR_MAP[normalized] || 'sapphire-400';
}

function getStorageKey(songId: string, sectionName: string, sectionIndex: number): string {
  return `song-section-${songId}-${sectionName}-${sectionIndex}`;
}

export function CollapsibleSongSection({
  sectionName,
  sectionIndex,
  children,
  songId,
  className,
}: CollapsibleSongSectionProps) {
  const storageKey = getStorageKey(songId, sectionName, sectionIndex);

  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem(storageKey);
    return saved === null ? true : saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem(storageKey, String(isExpanded));
  }, [isExpanded, storageKey]);

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  const colorClass = getSectionColor(sectionName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'rounded-xl border overflow-hidden transition-all duration-200',
        `border-${colorClass}/20 bg-${colorClass}/5`,
        className
      )}
      style={{
        borderColor: `color-mix(in srgb, var(--${colorClass}) 20%, transparent)`,
        backgroundColor: `color-mix(in srgb, var(--${colorClass}) 5%, transparent)`,
      }}
    >
      {/* Header */}
      <button
        onClick={toggleExpanded}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 transition-all duration-200',
          'hover:bg-black/10 active:bg-black/15',
          'border-b border-white/5'
        )}
        aria-expanded={isExpanded}
      >
        <h3
          className="text-sm font-semibold uppercase tracking-wider"
          style={{
            color: `color-mix(in srgb, var(--${colorClass}) 90%, white)`,
          }}
        >
          {sectionName}
        </h3>
        <motion.div
          animate={{ rotate: isExpanded ? 0 : -90 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <ChevronDown
            className="h-5 w-5"
            style={{
              color: `color-mix(in srgb, var(--${colorClass}) 70%, white)`,
            }}
          />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0.0, 0.2, 1] }}
          >
            <div className="px-4 py-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
