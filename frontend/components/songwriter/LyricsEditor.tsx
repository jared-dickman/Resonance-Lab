'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Type, AlignLeft, List, Sparkles } from 'lucide-react';
import { PanelLabel } from '@/components/ui/panel-label';

interface LyricsEditorProps {
  title: string;
  lyrics: string;
  onLyricsChange: (lyrics: string) => void;
  onTitleChange: (title: string) => void;
  selectedChord?: string | null;
}

function calculateWordAndLineCounts(text: string): { words: number; lines: number } {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines = text.split('\n').filter(line => line.trim());
  return { words: words.length, lines: lines.length };
}

function extractSections(lyrics: string): string[] {
  const sections: string[] = [];
  const lines = lyrics.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      sections.push(trimmed);
    }
  }

  return sections.length > 0 ? sections : ['No sections detected'];
}

function insertSectionAtCursor(lyrics: string, sectionName: string, cursorPos: number): string {
  const newSection = `\n[${sectionName}]\n`;
  const position = cursorPos || lyrics.length;
  return lyrics.substring(0, position) + newSection + lyrics.substring(position);
}

export default function LyricsEditor({
  title,
  lyrics,
  onLyricsChange,
  onTitleChange,
  selectedChord,
}: LyricsEditorProps) {
  const [localLyrics, setLocalLyrics] = useState(lyrics);
  const [wordCount, setWordCount] = useState(0);
  const [lineCount, setLineCount] = useState(0);
  const [_cursorPosition, setCursorPosition] = useState(0);

  useEffect(() => {
    setLocalLyrics(lyrics);
  }, [lyrics]);

  useEffect(() => {
    const counts = calculateWordAndLineCounts(localLyrics);
    setWordCount(counts.words);
    setLineCount(counts.lines);
  }, [localLyrics]);

  const handleLyricsChange = (value: string): void => {
    setLocalLyrics(value);
    onLyricsChange(value);
  };

  const insertSection = (sectionName: string): void => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const newLyrics = insertSectionAtCursor(localLyrics, sectionName, textarea.selectionStart);
      handleLyricsChange(newLyrics);
    }
  };

  const sections = extractSections(localLyrics);

  return (
    <>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <PanelLabel
            icon={<FileText className="w-5 h-5" />}
            title="Lyrics Editor"
            description="Write and organize your song with automatic structure detection"
          />
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs border-2">
              {lineCount} lines
            </Badge>
            <Badge variant="outline" className="text-xs border-2">
              {wordCount} words
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Title Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Type className="w-4 h-4 text-muted-foreground" />
            Song Title
          </label>
          <Input
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            placeholder="Enter your song title..."
            className="font-semibold text-lg"
          />
        </div>

        {/* Quick Section Inserters */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <List className="w-4 h-4 text-muted-foreground" />
            Quick Sections
          </label>
          <div className="flex flex-wrap gap-2">
            {['Verse', 'Chorus', 'Bridge', 'Pre-Chorus', 'Outro', 'Intro'].map(section => (
              <motion.div key={section} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => insertSection(section)}
                  className="text-xs border-2"
                >
                  + {section}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Detected Sections */}
        {sections[0] !== 'No sections detected' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Structure</label>
            <div className="flex flex-wrap gap-1.5">
              {sections.map((section, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {section}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Lyrics Textarea */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-muted-foreground" />
            Lyrics
          </label>
          <Textarea
            value={localLyrics}
            onChange={e => handleLyricsChange(e.target.value)}
            onSelect={e => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
            placeholder="[Verse 1]&#10;Start writing your lyrics here...&#10;Let the words flow naturally&#10;&#10;[Chorus]&#10;This is where your hook goes&#10;Make it memorable and catchy"
            className="min-h-[400px] font-mono text-sm leading-relaxed resize-none"
            spellCheck={false}
          />
        </div>

        {/* Selected Chord Indicator */}
        {selectedChord && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-sapphire-500/10 border border-sapphire-500/30 transition-all duration-200"
          >
            <Sparkles className="w-4 h-4 text-sapphire-500" />
            <span className="text-sm">
              Selected chord: <strong className="text-sapphire-500">{selectedChord}</strong>
            </span>
          </motion.div>
        )}

        {/* AI Writing Tips */}
        <div className="p-3 rounded-lg bg-muted/50 border-2 border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Pro tip:</strong> Use [Section Name] to organize your song structure. Try
            varying line lengths and rhyme schemes to keep things interesting. Ask the AI assistant
            for specific help with any section!
          </p>
        </div>
      </CardContent>
    </>
  );
}
