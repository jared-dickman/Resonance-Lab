'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { GripVertical } from 'lucide-react';

import { Card } from '@/components/ui/card';
import ChatInterface from '@/components/songwriter/ChatInterface';
import LyricsEditor from '@/components/songwriter/LyricsEditor';
import ChordProgressionBuilder from '@/components/songwriter/ChordProgressionBuilder';
import { SongwriterHeader } from '@/components/songwriter/SongwriterHeader';
import {
  createEmptySongState,
  updateSongTitle,
  updateLyricsText,
} from '@/components/songwriter/state/songStateManager';
import { convertStateToDraft } from '@/lib/utils/songwriter/draftTransformer';
import { flattenSongSections } from '@/lib/utils/songwriter/lyricsFormatter';
import {
  loadPanelLayoutFromLocalStorage,
  savePanelLayoutToLocalStorage,
  createDefaultPanelLayout,
} from '@/components/songwriter/persistence/panelLayoutPersistence';
import type { CompleteSongState } from '@/components/songwriter/types/song';
import type { PanelLayoutState } from '@/components/songwriter/types/ui';
import { usePanelInteractions } from '@/components/songwriter/hooks/usePanelInteractions';
import {
  useKeyboardShortcuts,
  createPanelShortcutHandlers,
} from '@/components/songwriter/hooks/useKeyboardShortcuts';

export default function SongwriterClient(): React.JSX.Element {
  const [songState, setSongState] = useState<CompleteSongState>(createEmptySongState());
  const [panelLayout, setPanelLayout] = useState<PanelLayoutState>(() => {
    const saved = loadPanelLayoutFromLocalStorage();
    return saved || createDefaultPanelLayout();
  });
  const [selectedChord, setSelectedChord] = useState<string | null>(null);
  const [showDraftManager, setShowDraftManager] = useState<boolean>(false);

  const { togglePanel, focusPanel } = usePanelInteractions(
    panelLayout,
    setPanelLayout
  );

  const handleSaveDraft = useCallback((): void => {
    console.log('Draft saved');
  }, []);

  const shortcutHandlers = createPanelShortcutHandlers(
    togglePanel,
    focusPanel,
    handleSaveDraft
  );

  useKeyboardShortcuts(shortcutHandlers);

  useEffect(() => {
    savePanelLayoutToLocalStorage(panelLayout);
  }, [panelLayout]);

  const handleTitleChange = useCallback(
    (newTitle: string): void => {
      setSongState((prev) => updateSongTitle(prev, newTitle));
    },
    []
  );

  const handleLyricsChange = useCallback(
    (newLyrics: string): void => {
      setSongState((prev) => updateLyricsText(prev, newLyrics));
    },
    []
  );

  const appendLyricsSuggestion = useCallback(
    (suggestion: string): void => {
      const currentLyrics = flattenSongSections(songState.lyrics);
      const updatedLyrics = currentLyrics ? `${currentLyrics}\n${suggestion}` : suggestion;
      handleLyricsChange(updatedLyrics);
    },
    [songState.lyrics, handleLyricsChange]
  );

  const handleChordsChange = useCallback(
    (_chords: { name: string; timing: number }[]): void => {
      // TODO: Implement
    },
    []
  );

  const handlePanelResize = useCallback((): void => {
    setPanelLayout((prev) => ({
      ...prev,
      lastResizedAt: new Date(),
      layoutVersion: prev.layoutVersion + 1,
    }));
  }, []);

  const currentDraft = convertStateToDraft(songState);
  const chatPanel = panelLayout.panels.find((p) => p.panelId === 'chat');
  const lyricsPanel = panelLayout.panels.find((p) => p.panelId === 'lyrics');
  const chordsPanel = panelLayout.panels.find((p) => p.panelId === 'chords');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SongwriterHeader
        onToggleDrafts={() => setShowDraftManager(!showDraftManager)}
        onSaveDraft={() => {}}
        showDraftManager={showDraftManager}
      />

      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" onLayout={handlePanelResize}>
          {chatPanel && chatPanel.state === 'expanded' && (
            <>
              <Panel
                id="chat-panel"
                defaultSize={chatPanel.widthPercentage}
                minSize={20}
                maxSize={40}
                className="relative"
              >
                <div className="h-full border-r bg-background">
                  <div className="p-4 border-b">
                    <h2 className="font-semibold text-lg">AI Assistant</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Songwriting help and suggestions
                    </p>
                  </div>
                  <div className="h-[calc(100%-80px)]">
                    <Card className="h-full rounded-none border-0">
                      <ChatInterface
                        onLyricsSuggestion={appendLyricsSuggestion}
                        onChordSuggestion={setSelectedChord}
                        currentDraft={currentDraft}
                      />
                    </Card>
                  </div>
                </div>
              </Panel>
              <ResizeHandle />
            </>
          )}

          {lyricsPanel && lyricsPanel.state === 'expanded' && (
            <>
              <Panel
                id="lyrics-panel"
                defaultSize={lyricsPanel.widthPercentage}
                minSize={30}
                className="relative"
              >
                <div className="h-full bg-background">
                  <div className="p-4 border-b">
                    <h2 className="font-semibold text-lg">Lyrics</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Write and edit your song lyrics
                    </p>
                  </div>
                  <div className="h-[calc(100%-80px)] overflow-y-auto p-6">
                    <Card className="shadow-lg">
                      <LyricsEditor
                        title={songState.metadata.title}
                        lyrics={flattenSongSections(songState.lyrics)}
                        onLyricsChange={handleLyricsChange}
                        onTitleChange={handleTitleChange}
                        selectedChord={selectedChord}
                      />
                    </Card>
                  </div>
                </div>
              </Panel>
              <ResizeHandle />
            </>
          )}

          {chordsPanel && chordsPanel.state === 'expanded' && (
            <Panel
              id="chords-panel"
              defaultSize={chordsPanel.widthPercentage}
              minSize={20}
              maxSize={40}
              className="relative"
            >
              <div className="h-full border-l bg-background">
                <div className="p-4 border-b">
                  <h2 className="font-semibold text-lg">Chord Progression</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Build your harmonic structure
                  </p>
                </div>
                <div className="h-[calc(100%-80px)] overflow-y-auto p-4">
                  <ChordProgressionBuilder
                    chords={[]}
                    onChordsChange={handleChordsChange}
                    selectedChord={selectedChord}
                    onChordSelect={setSelectedChord}
                  />
                </div>
              </div>
            </Panel>
          )}
        </PanelGroup>
      </div>
    </div>
  );
}

function ResizeHandle(): React.JSX.Element {
  return (
    <PanelResizeHandle className="group relative w-px bg-border hover:bg-primary transition-colors">
      <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
        <div className="w-4 h-12 rounded-sm bg-border group-hover:bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-3 h-3 text-muted-foreground group-hover:text-primary-foreground" />
        </div>
      </div>
    </PanelResizeHandle>
  );
}
