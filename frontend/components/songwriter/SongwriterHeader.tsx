/**
 * Songwriter Header Component
 * Clean separation of header UI from main component
 */

'use client';

import { motion } from 'framer-motion';
import { Wand2, Save, History } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ANIMATION_DURATION } from '@/lib/constants/songwriter.constants';

interface SongwriterHeaderProps {
  onToggleDrafts: () => void;
  onSaveDraft: () => void;
  showDraftManager: boolean;
}

export function SongwriterHeader({
  onToggleDrafts,
  onSaveDraft,
  showDraftManager,
}: SongwriterHeaderProps): React.JSX.Element {
  return (
    <motion.div
      className="border-b bg-background/80 backdrop-blur-lg sticky top-0 z-50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: ANIMATION_DURATION.SLIDE / 1000 }}
    >
      <div className="container mx-auto px-4 py-4 max-w-full overflow-x-hidden">
        <div className="flex items-center justify-between">
          <HeaderBranding />
          <HeaderActions
            onToggleDrafts={onToggleDrafts}
            onSaveDraft={onSaveDraft}
            showDraftManager={showDraftManager}
          />
        </div>
      </div>
    </motion.div>
  );
}

function HeaderBranding(): React.JSX.Element {
  return (
    <div className="flex items-center gap-3">
      <WandIcon />
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          Songwriter Assistant
          <Badge variant="secondary" className="text-xs">
            AI-Powered
          </Badge>
        </h1>
        <p className="text-sm text-muted-foreground">
          Craft lyrics, build progressions, and bring your song to life
        </p>
      </div>
    </div>
  );
}

function WandIcon(): React.JSX.Element {
  return (
    <motion.div
      animate={{
        rotate: [0, 10, -10, 0],
        scale: [1, 1.1, 1.1, 1],
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        repeatDelay: 4,
      }}
    >
      <Wand2 className="w-8 h-8 text-primary" />
    </motion.div>
  );
}

interface HeaderActionsProps {
  onToggleDrafts: () => void;
  onSaveDraft: () => void;
  showDraftManager: boolean;
}

function HeaderActions({ onToggleDrafts, onSaveDraft, showDraftManager }: HeaderActionsProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleDrafts}
        className="gap-2"
        aria-pressed={showDraftManager}
      >
        <History className="w-4 h-4" />
        Drafts
      </Button>
      <Button variant="default" size="sm" onClick={onSaveDraft} className="gap-2">
        <Save className="w-4 h-4" />
        Save Draft
      </Button>
    </div>
  );
}
