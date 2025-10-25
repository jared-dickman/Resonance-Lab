/**
 * Songwriter Client Component
 * Main orchestrator for songwriting interface
 * REFACTORED: Clean code with single responsibility functions
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { Card } from '@/components/ui/card';
import ChatInterface from '@/components/songwriter/ChatInterface';
import LyricsEditor from '@/components/songwriter/LyricsEditor';
import ChordProgressionBuilder from '@/components/songwriter/ChordProgressionBuilder';
import DraftManager from '@/components/songwriter/DraftManager';
import { SongwriterHeader } from '@/components/songwriter/SongwriterHeader';
import { PanelDivider } from '@/components/songwriter/PanelDivider';
import {
  createEmptySongState,
  updateSongTitle,
  updateLyricsText,
} from '@/components/songwriter/state/songStateManager';
import { usePanelLayout } from '@/lib/hooks/usePanelLayout';
import { useMobileDetection } from '@/lib/hooks/useMobileDetection';
import { convertStateToDraft } from '@/lib/utils/songwriter/draftTransformer';
import { flattenSongSections } from '@/lib/utils/songwriter/lyricsFormatter';
import { PANEL_CONFIG, ANIMATION_DELAY, ANIMATION_DURATION } from '@/lib/constants/songwriter.constants';
import type { CompleteSongState } from '@/components/songwriter/types/song';
import type { FocusArea } from '@/components/songwriter/types/ui';
import type { ConversationHistory } from '@/components/songwriter/types/chat';

export default function SongwriterClient(): React.JSX.Element {
  const [songState, setSongState] = useState<CompleteSongState>(createEmptySongState());
  const [showDraftManager, setShowDraftManager] = useState<boolean>(false);
  const [selectedChord, setSelectedChord] = useState<string | null>(null);
  const [_focusArea, _setFocusArea] = useState<FocusArea>('lyrics');
  const [_conversationHistory, _setConversationHistory] = useState<ConversationHistory>({
    messages: [],
  });

  const { panelSizes, handlePanelResize } = usePanelLayout();
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
    <motion.div
      className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: ANIMATION_DURATION.FADE_IN / 1000 }}
    >
      <SongwriterHeader
        onToggleDrafts={toggleDraftManager}
        onSaveDraft={handleSaveDraft}
        showDraftManager={showDraftManager}
      />

      <div className="container mx-auto px-4 py-6 max-w-full overflow-x-hidden">
        <PanelGroup
          direction={isMobile ? 'vertical' : 'horizontal'}
          onLayout={handlePanelResize}
          className={isMobile ? 'min-h-[calc(100vh-180px)]' : 'h-[calc(100vh-180px)]'}
        >
          <Panel
            defaultSize={panelSizes[0]}
            minSize={PANEL_CONFIG.MIN_SIZE}
            className={isMobile ? 'pb-3' : 'pr-3'}
          >
            <motion.div
              className="h-full"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: ANIMATION_DELAY.CHAT_PANEL / 1000, duration: ANIMATION_DURATION.SLIDE / 1000 }}
            >
              <Card className="h-full border-primary/20">
                <ChatInterface
                  onLyricsSuggestion={appendLyricsSuggestion}
                  onChordSuggestion={setSelectedChord}
                  currentDraft={currentDraft}
                />
              </Card>
            </motion.div>
          </Panel>

          <PanelDivider isMobile={isMobile} />

          <Panel
            defaultSize={panelSizes[1]}
            minSize={PANEL_CONFIG.MIN_SIZE}
            className={isMobile ? 'py-3' : 'px-3'}
          >
            <motion.div
              className="h-full"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: ANIMATION_DELAY.LYRICS_PANEL / 1000, duration: ANIMATION_DURATION.SLIDE / 1000 }}
            >
              <Card className="h-full border-primary/20">
                <LyricsEditor
                  title={songState.metadata.title}
                  lyrics={flattenSongSections(songState.lyrics)}
                  onLyricsChange={handleLyricsChange}
                  onTitleChange={handleTitleChange}
                  selectedChord={selectedChord}
                />
              </Card>
            </motion.div>
          </Panel>

          <PanelDivider isMobile={isMobile} />

          <Panel
            defaultSize={panelSizes[2]}
            minSize={PANEL_CONFIG.MIN_SIZE}
            className={isMobile ? 'pt-3' : 'pl-3'}
          >
            <motion.div
              className="h-full"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: ANIMATION_DELAY.CHORDS_PANEL / 1000, duration: ANIMATION_DURATION.SLIDE / 1000 }}
            >
              <Card className="h-full border-primary/20">
                <ChordProgressionBuilder
                  chords={[]}
                  onChordsChange={handleChordsChange}
                  selectedChord={selectedChord}
                  onChordSelect={setSelectedChord}
                />
              </Card>
            </motion.div>
          </Panel>
        </PanelGroup>

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
    </motion.div>
  );
}
