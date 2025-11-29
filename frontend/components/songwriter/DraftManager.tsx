'use client';

import { useState, useEffect } from 'react';

import { logger } from '@/lib/logger';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, FileText, Clock, Trash2, Download, GitBranch } from 'lucide-react';
import type { SongDraft } from '@/components/songwriter/types/legacy';

interface DraftManagerProps {
  currentDraft: SongDraft;
  onClose: () => void;
  onLoadDraft: (draft: SongDraft) => void;
}

export default function DraftManager({ currentDraft, onClose, onLoadDraft }: DraftManagerProps) {
  const [savedDrafts, setSavedDrafts] = useState<SongDraft[]>([]);

  useEffect(() => {
    // Load drafts from localStorage
    const stored = localStorage.getItem('songwriter-drafts');
    if (stored) {
      try {
        const drafts = JSON.parse(stored);
        setSavedDrafts(
          drafts.map((d: SongDraft) => ({
            ...d,
            createdAt: new Date(d.createdAt),
            updatedAt: new Date(d.updatedAt),
          }))
        );
      } catch (error) {
        logger.error('Failed to load drafts:', error);
      }
    }
  }, []);

  const saveDraft = () => {
    const existing = savedDrafts.find(d => d.id === currentDraft.id);
    let updated: SongDraft[];

    if (existing) {
      // Update existing
      updated = savedDrafts.map(d => (d.id === currentDraft.id ? currentDraft : d));
    } else {
      // Add new
      updated = [currentDraft, ...savedDrafts];
    }

    setSavedDrafts(updated);
    localStorage.setItem('songwriter-drafts', JSON.stringify(updated));
  };

  const deleteDraft = (id: string) => {
    const updated = savedDrafts.filter(d => d.id !== id);
    setSavedDrafts(updated);
    localStorage.setItem('songwriter-drafts', JSON.stringify(updated));
  };

  const loadDraft = (draft: SongDraft) => {
    onLoadDraft(draft);
    onClose();
  };

  const exportDraft = (draft: SongDraft) => {
    const dataStr = JSON.stringify(draft, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportName = `${draft.title.replace(/\s+/g, '-')}-v${draft.version}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
          <CardHeader className="border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Draft Manager
              </CardTitle>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4 flex-1 min-h-0 flex flex-col">
            {/* Current Draft */}
            <div className="mb-4 flex-shrink-0">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Current Draft
              </h3>
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{currentDraft.title}</h4>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          v{currentDraft.version}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {currentDraft.lyrics.split('\n').filter(Boolean).length} lines
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {currentDraft.chords.length} chords
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Last updated: {formatDate(currentDraft.updatedAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={saveDraft}>
                        Save
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => exportDraft(currentDraft)}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Saved Drafts */}
            <div className="flex-1 min-h-0 flex flex-col">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 flex-shrink-0">
                <Clock className="w-4 h-4" />
                Saved Drafts ({savedDrafts.length})
              </h3>

              {savedDrafts.length > 0 ? (
                <ScrollArea className="flex-1">
                  <div className="space-y-2 pr-4">
                    {savedDrafts.map(draft => (
                      <motion.div
                        key={draft.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <Card className="border hover:border-primary/50 transition-colors">
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{draft.title}</h4>
                                <div className="flex gap-1.5 mt-1.5">
                                  <Badge variant="secondary" className="text-xs">
                                    v{draft.version}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {draft.lyrics.split('\n').filter(Boolean).length} lines
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {draft.chords.length} chords
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1.5">
                                  {formatDate(draft.updatedAt)}
                                </p>
                              </div>
                              <div className="flex gap-1 ml-2 flex-shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => loadDraft(draft)}
                                >
                                  Load
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => exportDraft(draft)}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteDraft(draft.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 border-2 border-dashed border-border rounded-lg">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">No saved drafts yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Save your current work to see it here
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
