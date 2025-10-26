/**
 * Songwriter Client Component
 * Main orchestrator for songwriting interface
 * REFACTORED: Clean code with single responsibility functions
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ChatInterface from '@/components/songwriter/ChatInterface';
import LyricsEditor from '@/components/songwriter/LyricsEditor';
import ChordProgressionBuilder from '@/components/songwriter/ChordProgressionBuilder';
import DraftManager from '@/components/songwriter/DraftManager';
import { SongwriterHeader } from '@/components/songwriter/SongwriterHeader';
import { QuickStart } from '@/components/ui/quick-start';
import {
  createEmptySongState,
  updateSongTitle,
  updateLyricsText,
} from '@/components/songwriter/state/songStateManager';
import { useMobileDetection } from '@/lib/hooks/useMobileDetection';
import { convertStateToDraft } from '@/lib/utils/songwriter/draftTransformer';
import { flattenSongSections } from '@/lib/utils/songwriter/lyricsFormatter';
import { QUICK_TIPS } from '@/lib/constants/help-content.constants';
import type { CompleteSongState } from '@/components/songwriter/types/song';
import type { FocusArea } from '@/components/songwriter/types/ui';
import type { ConversationHistory } from '@/components/songwriter/types/chat';

export default function SongwriterClient(): React.JSX.Element {
  const [songState, setSongState] = useState<CompleteSongState>(createEmptySongState());
  const [showDraftManager, setShowDraftManager] = useState<boolean>(false);
  const [selectedChord, setSelectedChord] = useState<string | null>(null);
  const [showQuickStart, setShowQuickStart] = useState<boolean>(true);
  const [showChordsSidebar, setShowChordsSidebar] = useState<boolean>(true);
  const [_focusArea, _setFocusArea] = useState<FocusArea>('lyrics');
  const [_conversationHistory, _setConversationHistory] = useState<ConversationHistory>({
    messages: [],
    sessionStartTime: new Date(),
    totalMessages: 0,
    userMessageCount: 0,
    assistantMessageCount: 0,
  });

  const isMobile = useMobileDetection();

  function handleTitleChange(newTitle: string): void {
    setSongState(updateSongTitle(songState, newTitle));
  }

  function handleLyricsChange(newLyrics: string): void {
    setSongState(updateLyricsText(songState, newLyrics));
  }

  function appendLyricsSuggestion(suggestion: string): void {
    const currentLyrics = flattenSongSections(songState.lyrics);
    const updatedLyrics = `${currentLyrics}\n${suggestion}`;
    handleLyricsChange(updatedLyrics);
  }

  function toggleDraftManager(): void {
    setShowDraftManager(!showDraftManager);
  }

  function handleSaveDraft(): void {
    // TODO: Implement draft saving functionality
  }

  function handleChordsChange(_chords: { name: string; timing: number }[]): void {
    // TODO: Implement chords change handling
  }

  function handleLoadDraft(draft: { title: string; lyrics: string }): void {
    handleTitleChange(draft.title);
    handleLyricsChange(draft.lyrics);
  }

  const currentDraft = convertStateToDraft(songState);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SongwriterHeader
        onToggleDrafts={toggleDraftManager}
        onSaveDraft={handleSaveDraft}
        showDraftManager={showDraftManager}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {showQuickStart && (
          <div className="p-4 border-b bg-muted/10">
            <QuickStart
              tips={QUICK_TIPS.songwriter}
              onDismiss={() => setShowQuickStart(false)}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className={cn(
            'mx-auto px-6 py-8 transition-all duration-300',
            showChordsSidebar ? 'max-w-4xl' : 'max-w-5xl'
          )}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="shadow-lg border-2">
                <LyricsEditor
                  title={songState.metadata.title}
                  lyrics={flattenSongSections(songState.lyrics)}
                  onLyricsChange={handleLyricsChange}
                  onTitleChange={handleTitleChange}
                  selectedChord={selectedChord}
                />
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Chords & AI */}
      <AnimatePresence>
        {showChordsSidebar && (
          <motion.div
            className={cn(
              'fixed right-0 top-[180px] bottom-0 w-96 border-l bg-muted/30 z-20',
              isMobile && 'top-[220px]'
            )}
            initial={{ x: 384, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 384, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChordsSidebar(false)}
              className="absolute top-4 -left-3 z-10 h-8 w-8 rounded-full p-0 bg-background border-2 shadow-md hover:shadow-lg transition-shadow"
              title="Collapse Tools"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            <div className="h-full flex flex-col overflow-hidden">
              {/* AI Assistant Section */}
              <div className="border-b bg-background/50">
                <div className="p-4">
                  <h2 className="font-semibold">AI Assistant</h2>
                  <p className="text-xs text-muted-foreground mt-1">Get songwriting help and suggestions</p>
                </div>
                <div className="h-64 border-t">
                  <ChatInterface
                    onLyricsSuggestion={appendLyricsSuggestion}
                    onChordSuggestion={setSelectedChord}
                    currentDraft={currentDraft}
                  />
                </div>
              </div>

              {/* Chords Section */}
              <div className="flex-1 overflow-hidden">
                <div className="p-4 border-b bg-background/50">
                  <h2 className="font-semibold">Chord Progression</h2>
                  <p className="text-xs text-muted-foreground mt-1">Build your harmonic structure</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <ChordProgressionBuilder
                    chords={[]}
                    onChordsChange={handleChordsChange}
                    selectedChord={selectedChord}
                    onChordSelect={setSelectedChord}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Sidebar Toggle when Hidden */}
      {!showChordsSidebar && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowChordsSidebar(true)}
          className="fixed right-4 top-24 z-10 shadow-md hover:shadow-lg transition-shadow"
          title="Expand Tools"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Tools
        </Button>
      )}

      <AnimatePresence>
        {showDraftManager && (
          <DraftManager
            currentDraft={currentDraft}
            onClose={() => setShowDraftManager(false)}
            onLoadDraft={handleLoadDraft}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
