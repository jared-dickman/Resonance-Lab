'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Type, AlignLeft, List, Sparkles } from 'lucide-react';

interface LyricsEditorProps {
  title: string;
  lyrics: string;
  onLyricsChange: (lyrics: string) => void;
  onTitleChange: (title: string) => void;
  selectedChord?: string | null;
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
  const [cursorPosition, setCursorPosition] = useState(0);

  useEffect(() => {
    setLocalLyrics(lyrics);
  }, [lyrics]);

  useEffect(() => {
    const words = localLyrics.trim().split(/\s+/).filter(Boolean);
    const lines = localLyrics.split('\n').filter((line) => line.trim());
    setWordCount(words.length);
    setLineCount(lines.length);
  }, [localLyrics]);

  const handleLyricsChange = (value: string) => {
    setLocalLyrics(value);
    onLyricsChange(value);
  };

  const detectSections = () => {
    const sections: string[] = [];
    const lines = localLyrics.split('\n');

    lines.forEach((line) => {
      const trimmed = line.trim().toLowerCase();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        sections.push(line.trim());
      }
    });

    return sections.length > 0 ? sections : ['No sections detected'];
  };

  const insertSection = (sectionName: string) => {
    const newSection = `\n[${sectionName}]\n`;
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const start = textarea.selectionStart || localLyrics.length;
      const newLyrics =
        localLyrics.substring(0, start) + newSection + localLyrics.substring(start);
      handleLyricsChange(newLyrics);
    }
  };

  const sections = detectSections();

  return (
    <>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Lyrics
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {lineCount} lines
            </Badge>
            <Badge variant="outline" className="text-xs">
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
            onChange={(e) => onTitleChange(e.target.value)}
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
            {['Verse', 'Chorus', 'Bridge', 'Pre-Chorus', 'Outro', 'Intro'].map((section) => (
              <motion.div key={section} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => insertSection(section)}
                  className="text-xs"
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
            onChange={(e) => handleLyricsChange(e.target.value)}
            onSelect={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
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
            className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm">
              Selected chord: <strong className="text-primary">{selectedChord}</strong>
            </span>
          </motion.div>
        )}

        {/* AI Writing Tips */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
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
