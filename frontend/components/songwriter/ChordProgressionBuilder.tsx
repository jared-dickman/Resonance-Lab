'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Music2, Plus, Trash2, GripVertical, Sparkles, RotateCcw } from 'lucide-react';
import { PanelLabel } from '@/components/ui/panel-label';
import { SimpleTooltip } from '@/components/ui/simple-tooltip';

interface ChordProgressionBuilderProps {
  chords: { name: string; timing: number }[];
  onChordsChange: (chords: { name: string; timing: number }[]) => void;
  selectedChord?: string | null;
  onChordSelect: (chord: string) => void;
}

const COMMON_CHORDS = [
  // Major
  { name: 'C', color: 'hsl(210, 90%, 60%)' },
  { name: 'D', color: 'hsl(30, 90%, 60%)' },
  { name: 'E', color: 'hsl(60, 90%, 60%)' },
  { name: 'F', color: 'hsl(120, 70%, 50%)' },
  { name: 'G', color: 'hsl(180, 70%, 50%)' },
  { name: 'A', color: 'hsl(240, 70%, 60%)' },
  { name: 'B', color: 'hsl(300, 70%, 60%)' },
  // Minor
  { name: 'Am', color: 'hsl(210, 60%, 50%)' },
  { name: 'Dm', color: 'hsl(30, 60%, 50%)' },
  { name: 'Em', color: 'hsl(60, 60%, 50%)' },
  { name: 'Fm', color: 'hsl(120, 50%, 40%)' },
  { name: 'Gm', color: 'hsl(180, 50%, 40%)' },
  // Seventh
  { name: 'Cmaj7', color: 'hsl(210, 80%, 65%)' },
  { name: 'Dmaj7', color: 'hsl(30, 80%, 65%)' },
  { name: 'G7', color: 'hsl(180, 80%, 55%)' },
  { name: 'Am7', color: 'hsl(210, 60%, 55%)' },
];

const SUGGESTED_PROGRESSIONS = [
  { name: 'Pop Axis', chords: ['C', 'G', 'Am', 'F'] },
  { name: 'Jazz ii-V-I', chords: ['Dm7', 'G7', 'Cmaj7'] },
  { name: 'Blues', chords: ['C7', 'F7', 'G7'] },
  { name: 'Emotional', chords: ['Am', 'F', 'C', 'G'] },
  { name: 'Rock Classic', chords: ['A', 'G', 'D'] },
];

export default function ChordProgressionBuilder({
  chords,
  onChordsChange,
  selectedChord,
  onChordSelect,
}: ChordProgressionBuilderProps) {
  const [_isPlaying, _setIsPlaying] = useState(false);

  const addChord = (chordName: string) => {
    const newChord = { name: chordName, timing: chords.length * 4 };
    onChordsChange([...chords, newChord]);
    onChordSelect(chordName);
  };

  const removeChord = (index: number) => {
    const updated = chords.filter((_, i) => i !== index);
    onChordsChange(updated);
  };

  const clearAll = () => {
    onChordsChange([]);
  };

  const loadProgression = (progressionChords: string[]) => {
    const newChords = progressionChords.map((name, index) => ({
      name,
      timing: index * 4,
    }));
    onChordsChange(newChords);
  };

  const handleReorder = (newOrder: { name: string; timing: number }[]) => {
    // Update timings based on new order
    const reordered = newOrder.map((chord, index) => ({
      ...chord,
      timing: index * 4,
    }));
    onChordsChange(reordered);
  };

  return (
    <>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <PanelLabel
            icon={<Music2 className="w-5 h-5" />}
            title="Chord Progression"
            description="Build and arrange chords with visual diagrams and drag-to-reorder"
          />
          <div className="flex gap-2">
            <SimpleTooltip content="Clear all chords">
              <Button variant="ghost" size="sm" onClick={clearAll} disabled={chords.length === 0}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </SimpleTooltip>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 h-[calc(100%-80px)] flex flex-col">
        {/* Current Progression */}
        <div className="space-y-2 flex-shrink-0">
          <label className="text-sm font-medium flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            Your Progression ({chords.length} chords)
          </label>

          {chords.length > 0 ? (
            <Reorder.Group axis="y" values={chords} onReorder={handleReorder} className="space-y-2">
              <AnimatePresence mode="popLayout">
                {chords.map((chord, index) => (
                  <Reorder.Item
                    key={`${chord.name}-${index}`}
                    value={chord}
                    className="flex items-center gap-2 p-3 bg-muted/50 border-2 border-border rounded-lg cursor-grab active:cursor-grabbing"
                    whileHover={{ scale: 1.02 }}
                    whileDrag={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 flex items-center gap-2">
                      <Badge
                        variant={selectedChord === chord.name ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => onChordSelect(chord.name)}
                      >
                        {chord.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Beat {chord.timing / 4 + 1}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeChord(index)}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          ) : (
            <div className="p-6 border-2 border-dashed border-border rounded-lg text-center">
              <Music2 className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">
                No chords yet. Add some from the palette below!
              </p>
            </div>
          )}
        </div>

        {/* Suggested Progressions */}
        <div className="space-y-2 flex-shrink-0">
          <label className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-muted-foreground" />
            Quick Start
          </label>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROGRESSIONS.map(prog => (
              <motion.div key={prog.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadProgression(prog.chords)}
                  className="text-xs border-2"
                >
                  {prog.name}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Chord Palette */}
        <div className="flex-1 flex flex-col min-h-0">
          <label className="text-sm font-medium flex items-center gap-2 mb-2 flex-shrink-0">
            <Plus className="w-4 h-4 text-muted-foreground" />
            Chord Palette
          </label>
          <ScrollArea className="flex-1">
            <div className="grid grid-cols-3 gap-2 pr-2">
              {COMMON_CHORDS.map(chord => (
                <motion.div
                  key={chord.name}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    onClick={() => addChord(chord.name)}
                    className="w-full aspect-square rounded-lg border-2 border-border hover:border-primary transition-colors flex items-center justify-center font-bold text-sm relative overflow-hidden group"
                    style={{
                      background: `linear-gradient(135deg, ${chord.color} 0%, ${chord.color}99 100%)`,
                    }}
                  >
                    <span className="relative z-10 text-white drop-shadow-lg">{chord.name}</span>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </button>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Pro Tip */}
        <div className="p-3 rounded-lg bg-muted/50 border-2 border-border flex-shrink-0">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Pro tip:</strong> Drag to reorder chords. Try starting with a suggested
            progression, then customize it! Common patterns: I-V-vi-IV or ii-V-I.
          </p>
        </div>
      </CardContent>
    </>
  );
}
