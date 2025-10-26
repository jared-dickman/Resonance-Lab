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
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold uppercase tracking-wide">Session Insights</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Keep track of progress and creative momentum.
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <InsightStat label="Completion" value={formatPercentage(metrics.completion)} />
                <InsightStat label="Edits" value={metrics.editCount.toString()} />
                <InsightStat label="Focus Time" value={formatDuration(metrics.totalTimeSpentSeconds)} />
                <InsightStat label="Chords" value={metrics.chordCount.toString()} />
                <InsightStat label="Created" value={formatRelativeTime(metrics.createdAt)} />
                <InsightStat label="Updated" value={formatRelativeTime(metrics.lastUpdated)} />
              </div>
              <div className="rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <strong>Instrumentation notes:</strong>{' '}
                {metrics.instrumentationNotes
                  ? metrics.instrumentationNotes
                  : 'Add arrangement notes to guide future production.'}
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}

interface WorkspaceColumnProps {
  lyrics: string;
  title: string;
  selectedChord: string | null;
  chordProgression: ReadonlyArray<WorkspaceChord>;
  onTitleChange: (title: string) => void;
  onLyricsChange: (lyrics: string) => void;
  onChordsChange: (chords: WorkspaceChord[]) => void;
  onChordSelect: (chord: string) => void;
}

function WorkspaceColumn({
  lyrics,
  title,
  selectedChord,
  chordProgression,
  onTitleChange,
  onLyricsChange,
  onChordsChange,
  onChordSelect,
}: WorkspaceColumnProps): React.JSX.Element {
  return (
    <div className="flex h-full flex-col bg-background" tabIndex={-1}>
      <PanelGroup direction="vertical" className="h-full">
        <Panel defaultSize={70} minSize={55} className="relative">
          <div className="flex h-full flex-col">
            <ScrollArea className="flex-1 p-4">
              <Card className="border-2 shadow-sm">
                <LyricsEditor
                  title={title}
                  lyrics={lyrics}
                  onLyricsChange={onLyricsChange}
                  onTitleChange={onTitleChange}
                  selectedChord={selectedChord}
                />
              </Card>
            </ScrollArea>
          </div>
        </Panel>
        <VerticalResizeHandle />
        <Panel defaultSize={30} minSize={20} className="relative">
          <div className="flex h-full flex-col border-t bg-background">
            <Card className="h-full rounded-none border-0">
              <ChordProgressionBuilder
                chords={chordProgression}
                onChordsChange={onChordsChange}
                selectedChord={selectedChord}
                onChordSelect={onChordSelect}
              />
            </Card>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

interface AssistantColumnProps {
  draft: SongDraft;
  selectedChord: string | null;
  onLyricsSuggestion: (lyrics: string) => void;
  onChordSuggestion: (chord: string) => void;
  onApplyConfiguration: () => void;
}

function AssistantColumn({
  draft,
  selectedChord,
  onLyricsSuggestion,
  onChordSuggestion,
  onApplyConfiguration,
}: AssistantColumnProps): React.JSX.Element {
  return (
    <div className="flex h-full flex-col border-l bg-background" tabIndex={-1}>
      <PanelGroup direction="vertical" className="h-full">
        <Panel defaultSize={65} minSize={50} className="relative">
          <div className="flex h-full flex-col">
            <Card className="h-full rounded-none border-0">
              <ChatInterface
                onLyricsSuggestion={onLyricsSuggestion}
                onChordSuggestion={onChordSuggestion}
                currentDraft={draft}
              />
            </Card>
          </div>
        </Panel>
        <VerticalResizeHandle />
        <Panel defaultSize={35} minSize={25} className="relative">
          <SongConfigurationPreview
            draft={draft}
            selectedChord={selectedChord}
            onApply={onApplyConfiguration}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}

interface SongConfigurationPreviewProps {
  draft: SongDraft;
  selectedChord: string | null;
  onApply: () => void;
}

function SongConfigurationPreview({
  draft,
  selectedChord,
  onApply,
}: SongConfigurationPreviewProps): React.JSX.Element {
  const formattedJson = useMemo(() => JSON.stringify(draft, null, 2), [draft]);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    if (copyStatus === 'copied' || copyStatus === 'error') {
      const timeout = setTimeout(() => setCopyStatus('idle'), 2000);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [copyStatus]);

  const handleCopy = useCallback(async (): Promise<void> => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(formattedJson);
        setCopyStatus('copied');
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch (error) {
      console.error('Unable to copy song configuration', error);
      setCopyStatus('error');
    }
  }, [formattedJson]);

  const copyLabel =
    copyStatus === 'copied' ? 'Copied' : copyStatus === 'error' ? 'Retry' : 'Copy';

  const CopyIcon = copyStatus === 'copied' ? ClipboardCheck : Clipboard;

  return (
    <Card className="h-full rounded-none border-0 border-t bg-background/95">
      <CardHeader className="gap-3 border-b pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Braces className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Song Configuration Preview
            </span>
          </div>
          <div className="flex items-center gap-2">
            {selectedChord && (
              <Badge variant="outline" className="text-xs">
                Chord Focus: {selectedChord}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              AI Mock
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            The assistant responds with updated JSON that syncs directly into your song.
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant={copyStatus === 'error' ? 'destructive' : 'outline'}
              size="sm"
              onClick={handleCopy}
              className="gap-1"
            >
              <CopyIcon className="h-3 w-3" />
              {copyLabel}
            </Button>
            <SimpleTooltip content="Integration coming soon">
              <Button variant="default" size="sm" className="gap-1" disabled onClick={onApply}>
                <Sparkles className="h-3 w-3" />
                Apply
              </Button>
            </SimpleTooltip>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-full p-0">
        <ScrollArea className="h-full">
          <pre className="px-4 py-3 text-xs font-mono leading-relaxed">
            {formattedJson}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface WorkspaceSummaryBarProps {
  title: string;
  metrics: WorkspaceMetrics;
  panelVisibility: PanelVisibilityMap;
  onTogglePanel: (panelId: PanelId) => void;
}

function WorkspaceSummaryBar({
  title,
  metrics,
  panelVisibility,
  onTogglePanel,
}: WorkspaceSummaryBarProps): React.JSX.Element {
  return (
    <div className="border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Now Editing</p>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold leading-none">{title}</h2>
            <Badge variant="outline" className="text-xs">
              Updated {formatRelativeTime(metrics.lastUpdated)}
            </Badge>
          </div>
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-4">
          <SummaryMetric label="Completion" value={formatPercentage(metrics.completion)} />
          <SummaryMetric label="Sections" value={metrics.sectionCount.toString()} />
          <SummaryMetric label="Words" value={metrics.wordCount.toString()} />
          <SummaryMetric label="Chords" value={metrics.chordCount.toString()} />
          <SummaryMetric
            label="Tempo"
            value={metrics.tempo ? `${metrics.tempo} BPM` : '—'}
          />
          <SummaryMetric label="Key" value={formatKey(metrics.key, metrics.mode)} />
          <div className="flex items-center gap-2 border-l border-border pl-3">
            <PanelToggleButton
              label="Navigator"
              isActive={panelVisibility.navigator}
              onClick={() => onTogglePanel('navigator')}
            />
            <PanelToggleButton
              label="Assistant"
              isActive={panelVisibility.assistant}
              onClick={() => onTogglePanel('assistant')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="flex flex-col items-start">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

interface PanelToggleButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function PanelToggleButton({ label, isActive, onClick }: PanelToggleButtonProps): React.JSX.Element {
  return (
    <SimpleTooltip content={`${isActive ? 'Hide' : 'Show'} ${label}`}>
      <Button
        type="button"
        variant={isActive ? 'default' : 'outline'}
        size="sm"
        onClick={onClick}
        className={cn('text-xs', isActive ? 'shadow-sm' : '')}
      >
        {label}
      </Button>
    </SimpleTooltip>
  );
}

function MetadataRow({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function InsightStat({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div>
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function EmptyState({ message }: { message: string }): React.JSX.Element {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center">
      <Sparkles className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  );
}

function HorizontalResizeHandle(): React.JSX.Element {
  return (
    <PanelResizeHandle className="group relative w-px bg-border transition-colors hover:bg-primary">
      <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
        <div className="flex h-12 w-4 items-center justify-center rounded-sm bg-border opacity-0 transition-opacity group-hover:bg-primary group-hover:opacity-100">
          <GripVertical className="h-3 w-3 text-muted-foreground group-hover:text-primary-foreground" />
        </div>
      </div>
    </PanelResizeHandle>
  );
}

function VerticalResizeHandle(): React.JSX.Element {
  return (
    <PanelResizeHandle className="group relative h-px bg-border transition-colors hover:bg-primary">
      <div className="absolute inset-x-0 -top-1 -bottom-1 flex items-center justify-center">
        <div className="flex h-4 w-12 rotate-90 items-center justify-center rounded-sm bg-border opacity-0 transition-opacity group-hover:bg-primary group-hover:opacity-100">
          <GripVertical className="h-3 w-3 text-muted-foreground group-hover:text-primary-foreground" />
        </div>
      </div>
    </PanelResizeHandle>
  );
}

function initializePanelLayout(): PanelLayoutState {
  const saved = loadPanelLayoutFromLocalStorage();
  if (saved && containsRequiredPanels(saved)) {
    return saved;
  }
  return createDefaultPanelLayout();
}

function containsRequiredPanels(layout: PanelLayoutState): boolean {
  return REQUIRED_PANEL_IDS.every(id =>
    layout.panels.some(panel => panel.panelId === id)
  );
}

function findPanelConfig(layout: PanelLayoutState, panelId: PanelId): PanelConfiguration | null {
  return layout.panels.find(panel => panel.panelId === panelId) ?? null;
}

function mapSizesToLayout(layout: PanelLayoutState, sizes: ReadonlyArray<number>): PanelLayoutState {
  const visiblePanels = getVisiblePanelsInOrder(layout);
  if (visiblePanels.length !== sizes.length) {
    return {
      ...layout,
      lastResizedAt: new Date(),
      layoutVersion: layout.layoutVersion + 1,
    };
  }

  const updatedPanels = layout.panels.map(panel => {
    const index = visiblePanels.findIndex(visible => visible.panelId === panel.panelId);
    if (index === -1) {
      return panel;
    }

    const size = sizes[index];
    return typeof size === 'number' ? { ...panel, widthPercentage: size } : panel;
  });

  return {
    ...layout,
    panels: updatedPanels,
    lastResizedAt: new Date(),
    layoutVersion: layout.layoutVersion + 1,
  };
}

function getVisiblePanelsInOrder(layout: PanelLayoutState): PanelConfiguration[] {
  return [...layout.panels]
    .filter(panel => panel.state === 'expanded')
    .sort((a, b) => a.order - b.order);
}

function buildWorkspaceMetrics(
  state: CompleteSongState,
  lyricsText: string,
  chordProgression: ReadonlyArray<WorkspaceChord>
): WorkspaceMetrics {
  return {
    completion: sanitizePercentage(state.metadata.completionPercentage),
    sectionCount: state.lyrics.length,
    wordCount: countWords(lyricsText),
    chordCount: chordProgression.length,
    tempo: state.musicalElements.tempo,
    key: state.musicalElements.key,
    mode: state.musicalElements.keyMode,
    timeSignature: state.musicalElements.timeSignature,
    genre: state.metadata.genre,
    releaseIntent: state.metadata.releaseIntent,
    targetAudience: state.metadata.targetAudience,
    productionStyle: state.musicalElements.productionStyle,
    instrumentationNotes: state.musicalElements.instrumentationNotes,
    editCount: state.editHistory.length,
    totalTimeSpentSeconds: state.timeAnalytics.totalTimeSpentSeconds,
    createdAt: coerceDate(state.metadata.createdAt),
    lastUpdated: coerceDate(state.metadata.updatedAt),
  };
}

function buildSectionSummaries(sections: ReadonlyArray<SectionLyrics>): SectionSummary[] {
  return sections.map(section => ({
    id: `${section.sectionType}-${section.sectionIndex}`,
    label: formatSectionLabel(section.sectionType, section.sectionIndex),
    lines: section.lines.length,
    emotionalTone: section.emotionalTone,
    rhymeScheme: section.rhymeScheme,
  }));
}

const SECTION_LABELS: Record<SectionType, string> = {
  intro: 'Intro',
  verse: 'Verse',
  prechorus: 'Pre-Chorus',
  chorus: 'Chorus',
  bridge: 'Bridge',
  outro: 'Outro',
  interlude: 'Interlude',
  breakdown: 'Breakdown',
  hook: 'Hook',
  refrain: 'Refrain',
};

function formatSectionLabel(sectionType: SectionType, index: number): string {
  const base = SECTION_LABELS[sectionType] ?? formatDisplayValue(sectionType);
  const requiresIndex = !['intro', 'outro', 'interlude', 'breakdown', 'hook', 'refrain'].includes(sectionType);
  return requiresIndex ? `${base} ${index + 1}` : base;
}

function sanitizePercentage(value: number | null | undefined): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, value ?? 0));
}

function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '0:00';
  const seconds = Math.floor(totalSeconds);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatRelativeTime(value: Date | string | null | undefined): string {
  const date = coerceDate(value);
  if (!date) return '—';
  const diff = Date.now() - date.getTime();
  if (diff < 0) {
    return date.toLocaleString();
  }
  if (diff < 60_000) return 'moments ago';
  if (diff < 3_600_000) {
    const minutes = Math.round(diff / 60_000);
    return `${minutes} min ago`;
  }
  if (diff < 86_400_000) {
    const hours = Math.round(diff / 3_600_000);
    return `${hours} hr ago`;
  }
  return date.toLocaleDateString();
}

function coerceDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

function formatDisplayValue(value: string | null | undefined): string {
  if (!value) return '—';
  return value
    .split(/[_-]/)
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function formatKey(key: string | null | undefined, mode: string | null | undefined): string {
  if (!key) return '—';
  const modeLabel = mode ? formatDisplayValue(mode) : 'Major';
  return `${key} · ${modeLabel}`;
}
