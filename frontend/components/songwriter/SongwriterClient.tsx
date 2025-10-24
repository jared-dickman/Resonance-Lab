'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Card } from '@/components/ui/card';
import { Wand2, Save, History, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ChatInterface from './ChatInterface';
import LyricsEditor from './LyricsEditor';
import ChordProgressionBuilder from './ChordProgressionBuilder';
import DraftManager from './DraftManager';
import { createEmptySongState, updateSongTitle, updateLyricsText } from './state/songStateManager';
import { createLocalStorageAdapter } from './persistence/localStorageAdapter';
import type { CompleteSongState } from './types/song';
import type { PanelLayoutState, GlobalUIState, FocusArea } from './types/ui';
import type { ConversationHistory } from './types/chat';

const PANEL_LAYOUT_KEY = 'songwriter-panel-layout';
const DEFAULT_PANEL_SIZES = [25, 40, 35];
const MIN_PANEL_SIZE = 15;

export default function SongwriterClient(): JSX.Element {
  const [songState, setSongState] = useState<CompleteSongState>(createEmptySongState());
  const [showDraftManager, setShowDraftManager] = useState<boolean>(false);
  const [selectedChord, setSelectedChord] = useState<string | null>(null);
  const [panelSizes, setPanelSizes] = useState<number[]>(DEFAULT_PANEL_SIZES);
  const [focusArea, setFocusArea] = useState<FocusArea>('lyrics');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory>({
    messages: [],
    totalMessages: 0,
    conversationStartTime: new Date(),
    lastMessageTime: new Date(),
    userMessageCount: 0,
    assistantMessageCount: 0,
    appliedSuggestionsCount: 0,
  });

  const storage = createLocalStorageAdapter();

  const loadPanelLayoutFromStorage = useCallback(async (): Promise<void> => {
    const saved = await storage.load<number[]>(PANEL_LAYOUT_KEY);
    if (saved && Array.isArray(saved) && saved.length === 3) {
      setPanelSizes(saved);
    }
  }, [storage]);

  function checkMobileView(): void {
    setIsMobile(window.innerWidth < 1024);
  }

  useEffect(() => {
    loadPanelLayoutFromStorage();
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, [loadPanelLayoutFromStorage]);

  async function savePanelLayoutToStorage(sizes: number[]): Promise<void> {
    await storage.save(PANEL_LAYOUT_KEY, sizes);
  }

  function handlePanelResize(sizes: number[]): void {
    setPanelSizes(sizes);
    savePanelLayoutToStorage(sizes);
  }

  function handleTitleChange(newTitle: string): void {
    const updatedState = updateSongTitle(songState, newTitle);
    setSongState(updatedState);
  }

  function handleLyricsChange(newLyrics: string): void {
    const updatedState = updateLyricsText(songState, newLyrics);
    setSongState(updatedState);
  }

  function handleSaveDraft(): void {
    const draftId = `draft_${Date.now()}`;
    // TODO: Implement draft saving functionality
  }

  function handleChordsChange(chords: { name: string; timing: number }[]): void {
    // TODO: Implement chords change handling
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="border-b bg-background/80 backdrop-blur-lg sticky top-0 z-50"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-4 max-w-full overflow-x-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDraftManager(!showDraftManager)}
                className="gap-2"
              >
                <History className="w-4 h-4" />
                Drafts
              </Button>
              <Button variant="default" size="sm" onClick={handleSaveDraft} className="gap-2">
                <Save className="w-4 h-4" />
                Save Draft
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 max-w-full overflow-x-hidden">
        <PanelGroup
          direction={isMobile ? 'vertical' : 'horizontal'}
          onLayout={handlePanelResize}
          className={isMobile ? 'min-h-[calc(100vh-180px)]' : 'h-[calc(100vh-180px)]'}
        >
          <Panel
            defaultSize={panelSizes[0]}
            minSize={MIN_PANEL_SIZE}
            className={isMobile ? 'pb-3' : 'pr-3'}
          >
            <motion.div
              className="h-full"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card className="h-full border-primary/20">
                <ChatInterface
                  onLyricsSuggestion={lyrics =>
                    handleLyricsChange(
                      songState.lyrics.map(s => s.lines.map(l => l.text).join('\n')).join('\n\n') +
                        '\n' +
                        lyrics
                    )
                  }
                  onChordSuggestion={chord => setSelectedChord(chord)}
                  currentDraft={{
                    id: 'current',
                    title: songState.metadata.title,
                    lyrics: songState.lyrics
                      .map(s => s.lines.map(l => l.text).join('\n'))
                      .join('\n\n'),
                    chords: [],
                    structure: [],
                    createdAt: songState.metadata.createdAt,
                    updatedAt: songState.metadata.updatedAt,
                    version: songState.metadata.version,
                  }}
                />
              </Card>
            </motion.div>
          </Panel>

          <PanelResizeHandle
            className={
              isMobile
                ? 'h-2 flex items-center justify-center hover:bg-primary/10 transition-colors group'
                : 'w-2 flex items-center justify-center hover:bg-primary/10 transition-colors group'
            }
          >
            <div
              className={
                isMobile
                  ? 'h-1 w-12 bg-border group-hover:bg-primary/50 rounded-full transition-colors flex items-center justify-center'
                  : 'w-1 h-12 bg-border group-hover:bg-primary/50 rounded-full transition-colors flex items-center justify-center'
              }
            >
              <GripVertical
                className={
                  isMobile
                    ? 'w-3 h-3 text-muted-foreground group-hover:text-primary rotate-90'
                    : 'w-3 h-3 text-muted-foreground group-hover:text-primary'
                }
              />
            </div>
          </PanelResizeHandle>

          <Panel
            defaultSize={panelSizes[1]}
            minSize={MIN_PANEL_SIZE}
            className={isMobile ? 'py-3' : 'px-3'}
          >
            <motion.div
              className="h-full"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card className="h-full border-primary/20">
                <LyricsEditor
                  title={songState.metadata.title}
                  lyrics={songState.lyrics
                    .map(s => s.lines.map(l => l.text).join('\n'))
                    .join('\n\n')}
                  onLyricsChange={handleLyricsChange}
                  onTitleChange={handleTitleChange}
                  selectedChord={selectedChord}
                />
              </Card>
            </motion.div>
          </Panel>

          <PanelResizeHandle
            className={
              isMobile
                ? 'h-2 flex items-center justify-center hover:bg-primary/10 transition-colors group'
                : 'w-2 flex items-center justify-center hover:bg-primary/10 transition-colors group'
            }
          >
            <div
              className={
                isMobile
                  ? 'h-1 w-12 bg-border group-hover:bg-primary/50 rounded-full transition-colors flex items-center justify-center'
                  : 'w-1 h-12 bg-border group-hover:bg-primary/50 rounded-full transition-colors flex items-center justify-center'
              }
            >
              <GripVertical
                className={
                  isMobile
                    ? 'w-3 h-3 text-muted-foreground group-hover:text-primary rotate-90'
                    : 'w-3 h-3 text-muted-foreground group-hover:text-primary'
                }
              />
            </div>
          </PanelResizeHandle>

          <Panel
            defaultSize={panelSizes[2]}
            minSize={MIN_PANEL_SIZE}
            className={isMobile ? 'pt-3' : 'pl-3'}
          >
            <motion.div
              className="h-full"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
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
              currentDraft={{
                id: 'current',
                title: songState.metadata.title,
                lyrics: songState.lyrics.map(s => s.lines.map(l => l.text).join('\n')).join('\n\n'),
                chords: [],
                structure: [],
                createdAt: songState.metadata.createdAt,
                updatedAt: songState.metadata.updatedAt,
                version: songState.metadata.version,
              }}
              onClose={() => setShowDraftManager(false)}
              onLoadDraft={draft => {
                handleTitleChange(draft.title);
                handleLyricsChange(draft.lyrics);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
