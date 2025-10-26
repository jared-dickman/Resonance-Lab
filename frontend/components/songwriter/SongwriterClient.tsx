'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import {
  GripVertical,
  Compass,
  Target,
  LayoutTemplate,
  Braces,
  Sparkles,
  Clipboard,
  ClipboardCheck,
} from 'lucide-react';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SimpleTooltip } from '@/components/ui/simple-tooltip';
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
import type { CompleteSongState, SectionLyrics, SectionType } from '@/components/songwriter/types/song';
import type { PanelConfiguration, PanelId, PanelLayoutState } from '@/components/songwriter/types/ui';
import type { SongDraft } from '@/components/songwriter/types/legacy';
import { usePanelInteractions } from '@/components/songwriter/hooks/usePanelInteractions';
import {
  useKeyboardShortcuts,
  createPanelShortcutHandlers,
} from '@/components/songwriter/hooks/useKeyboardShortcuts';
import { cn } from '@/lib/utils';

type WorkspaceChord = { name: string; timing: number };

interface WorkspaceMetrics {
  completion: number;
  sectionCount: number;
  wordCount: number;
  chordCount: number;
  tempo: number | null;
  key: string | null;
  mode: string | null;
  timeSignature: string;
  genre: string;
  releaseIntent: string;
  targetAudience: string;
  productionStyle: string;
  instrumentationNotes: string;
  editCount: number;
  totalTimeSpentSeconds: number;
  createdAt: Date | null;
  lastUpdated: Date | null;
}

interface SectionSummary {
  id: string;
  label: string;
  lines: number;
  emotionalTone: string;
  rhymeScheme: string;
}

type PanelVisibilityMap = Record<PanelId, boolean>;

const REQUIRED_PANEL_IDS: ReadonlyArray<PanelId> = ['navigator', 'workspace', 'assistant'];

export default function SongwriterClient(): React.JSX.Element {
  const [songState, setSongState] = useState<CompleteSongState>(createEmptySongState());
  const [panelLayout, setPanelLayout] = useState<PanelLayoutState>(initializePanelLayout);
  const [selectedChord, setSelectedChord] = useState<string | null>(null);
  const [showDraftManager, setShowDraftManager] = useState<boolean>(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [chordProgression, setChordProgression] = useState<WorkspaceChord[]>([]);

  const { togglePanel, focusPanel, isPanelExpanded } = usePanelInteractions(panelLayout, setPanelLayout);

  const handleSaveDraft = useCallback((): void => {
    console.log('Draft saved');
  }, []);

  const keyboardHandlers = useMemo(
    () => createPanelShortcutHandlers(togglePanel, focusPanel, handleSaveDraft),
    [togglePanel, focusPanel, handleSaveDraft]
  );

  useKeyboardShortcuts(keyboardHandlers);

  useEffect(() => {
    savePanelLayoutToLocalStorage(panelLayout);
  }, [panelLayout]);

  const currentDraft = useMemo(() => convertStateToDraft(songState), [songState]);

  const lyricsText = useMemo(() => flattenSongSections(songState.lyrics), [songState.lyrics]);

  const sectionSummaries = useMemo(() => buildSectionSummaries(songState.lyrics), [songState.lyrics]);

  useEffect(() => {
    if (!activeSectionId && sectionSummaries.length > 0) {
      setActiveSectionId(sectionSummaries[0]?.id ?? null);
    }
  }, [sectionSummaries, activeSectionId]);

  const workspaceMetrics = useMemo(
    () => buildWorkspaceMetrics(songState, lyricsText, chordProgression),
    [songState, lyricsText, chordProgression]
  );

  const panelConfigs = useMemo(
    () => ({
      navigator: findPanelConfig(panelLayout, 'navigator'),
      workspace: findPanelConfig(panelLayout, 'workspace'),
      assistant: findPanelConfig(panelLayout, 'assistant'),
    }),
    [panelLayout]
  );

  const panelVisibility: PanelVisibilityMap = {
    navigator: isPanelExpanded('navigator'),
    workspace: isPanelExpanded('workspace'),
    assistant: isPanelExpanded('assistant'),
  };

  const handlePanelLayoutChange = useCallback((sizes: number[]): void => {
    setPanelLayout(prev => mapSizesToLayout(prev, sizes));
  }, []);

  const handleToggleDrafts = useCallback((): void => {
    setShowDraftManager(prev => !prev);
  }, []);

  const handleTitleChange = useCallback((newTitle: string): void => {
    setSongState(prev => updateSongTitle(prev, newTitle));
  }, []);

  const handleLyricsChange = useCallback((newLyrics: string): void => {
    setSongState(prev => updateLyricsText(prev, newLyrics));
  }, []);

  const appendLyricsSuggestion = useCallback((suggestion: string): void => {
    setSongState(prev => {
      const existingLyrics = flattenSongSections(prev.lyrics);
      const updatedLyrics = existingLyrics ? `${existingLyrics}\n${suggestion}` : suggestion;
      return updateLyricsText(prev, updatedLyrics);
    });
  }, []);

  const handleChordsChange = useCallback((chords: WorkspaceChord[]): void => {
    setChordProgression(chords);
  }, []);

  const handleSectionSelect = useCallback(
    (sectionId: string): void => {
      setActiveSectionId(sectionId);
      focusPanel('workspace');
    },
    [focusPanel]
  );

  const handleApplyConfiguration = useCallback((): void => {
    console.log('Apply AI configuration (mock)');
  }, []);

  const showNavigator = panelVisibility.navigator;
  const showWorkspace = panelVisibility.workspace;
  const showAssistant = panelVisibility.assistant;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SongwriterHeader
        onToggleDrafts={handleToggleDrafts}
        onSaveDraft={handleSaveDraft}
        showDraftManager={showDraftManager}
      />

      <main className="flex-1 overflow-hidden bg-muted/20">
        <div className="flex h-full flex-col">
          <WorkspaceSummaryBar
            title={songState.metadata.title}
            metrics={workspaceMetrics}
            panelVisibility={panelVisibility}
            onTogglePanel={togglePanel}
          />

          <div className="flex-1">
            <PanelGroup direction="horizontal" className="h-full" onLayout={handlePanelLayoutChange}>
              {showNavigator && (
                <>
                  <Panel
                    id="navigator-panel"
                    defaultSize={panelConfigs.navigator?.widthPercentage ?? 22}
                    minSize={18}
                    maxSize={35}
                    className="relative"
                  >
                    <NavigatorColumn
                      sections={sectionSummaries}
                      metrics={workspaceMetrics}
                      activeSectionId={activeSectionId}
                      onSectionSelect={handleSectionSelect}
                    />
                  </Panel>
                  {(showWorkspace || showAssistant) && <HorizontalResizeHandle />}
                </>
              )}

              {showWorkspace && (
                <>
                  <Panel
                    id="workspace-panel"
                    defaultSize={panelConfigs.workspace?.widthPercentage ?? 50}
                    minSize={40}
                    className="relative"
                  >
                    <WorkspaceColumn
                      lyrics={lyricsText}
                      title={songState.metadata.title}
                      selectedChord={selectedChord}
                      chordProgression={chordProgression}
                      onTitleChange={handleTitleChange}
                      onLyricsChange={handleLyricsChange}
                      onChordsChange={handleChordsChange}
                      onChordSelect={setSelectedChord}
                    />
                  </Panel>
                  {showAssistant && <HorizontalResizeHandle />}
                </>
              )}

              {showAssistant && (
                <Panel
                  id="assistant-panel"
                  defaultSize={panelConfigs.assistant?.widthPercentage ?? 28}
                  minSize={24}
                  maxSize={38}
                  className="relative"
                >
                  <AssistantColumn
                    draft={currentDraft}
                    selectedChord={selectedChord}
                    onLyricsSuggestion={appendLyricsSuggestion}
                    onChordSuggestion={setSelectedChord}
                    onApplyConfiguration={handleApplyConfiguration}
                  />
                </Panel>
              )}
            </PanelGroup>
          </div>
        </div>
      </main>
    </div>
  );
}

interface NavigatorColumnProps {
  sections: ReadonlyArray<SectionSummary>;
  metrics: WorkspaceMetrics;
  activeSectionId: string | null;
  onSectionSelect: (sectionId: string) => void;
}

function NavigatorColumn({
  sections,
  metrics,
  activeSectionId,
  onSectionSelect,
}: NavigatorColumnProps): React.JSX.Element {
  return (
    <div className="flex h-full flex-col border-r bg-background/95" tabIndex={-1}>
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-4 p-4">
          <Card className="border-2 bg-background">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold uppercase tracking-wide">Creative Brief</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Ground each session with clear musical intent.
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <MetadataRow label="Genre" value={formatDisplayValue(metrics.genre)} />
              <MetadataRow label="Audience" value={formatDisplayValue(metrics.targetAudience)} />
              <MetadataRow label="Release Plan" value={formatDisplayValue(metrics.releaseIntent)} />
              <MetadataRow label="Key" value={formatKey(metrics.key, metrics.mode)} />
              <MetadataRow
                label="Tempo"
                value={metrics.tempo ? `${metrics.tempo} BPM` : '—'}
              />
              <MetadataRow label="Time Signature" value={metrics.timeSignature} />
            </CardContent>
          </Card>

          <Card className="border-2 bg-background">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <LayoutTemplate className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold uppercase tracking-wide">Song Map</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Jump between sections and preserve the arc.
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {sections.length === 0 ? (
                <EmptyState message="Label sections like [Verse] to build your structure." />
              ) : (
                <div className="space-y-2">
                  {sections.map(section => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => onSectionSelect(section.id)}
                      className={cn(
                        'w-full rounded-lg border px-3 py-2 text-left transition-colors',
                        activeSectionId === section.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/60 hover:bg-primary/5'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{section.label}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {section.lines} lines
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Mood: {formatDisplayValue(section.emotionalTone)} · Rhyme: {section.rhymeScheme}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

 425	Intentional truncation? The patch is long. Need to ensure entire file is added.
*** End Patch
++ Output truncated (exceeds limit) +++
