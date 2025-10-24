'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type JamChord, type ChordFunction } from '@/lib/jamProgressions';

interface ChordPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentChord: JamChord;
  onSelectChord: (chordName: string, chordFunction?: ChordFunction) => void;
  suggestedKey?: string;
}

// Common chord types
const CHORD_ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHORD_QUALITIES = [
  { name: '', label: 'Major', color: 'bg-blue-500/20 text-blue-400' },
  { name: 'm', label: 'Minor', color: 'bg-purple-500/20 text-purple-400' },
  { name: '7', label: 'Dom7', color: 'bg-orange-500/20 text-orange-400' },
  { name: 'maj7', label: 'Maj7', color: 'bg-cyan-500/20 text-cyan-400' },
  { name: 'm7', label: 'Min7', color: 'bg-violet-500/20 text-violet-400' },
  { name: 'sus4', label: 'Sus4', color: 'bg-green-500/20 text-green-400' },
  { name: 'sus2', label: 'Sus2', color: 'bg-emerald-500/20 text-emerald-400' },
  { name: 'dim', label: 'Dim', color: 'bg-red-500/20 text-red-400' },
  { name: 'aug', label: 'Aug', color: 'bg-yellow-500/20 text-yellow-400' },
  { name: '5', label: 'Power', color: 'bg-gray-500/20 text-gray-400' },
];

// Get chords in a specific key
const getChordsInKey = (key: string): string[] => {
  const keyIndex = CHORD_ROOTS.indexOf(key);
  if (keyIndex === -1) return [];

  // Major scale intervals: W-W-H-W-W-W-H (2-2-1-2-2-2-1 semitones)
  const intervals = [0, 2, 4, 5, 7, 9, 11];
  const qualities = ['', 'm', 'm', '', '', 'm', 'dim'];

  return intervals.map((interval, i) => {
    const rootIndex = (keyIndex + interval) % 12;
    return CHORD_ROOTS[rootIndex] + qualities[i];
  });
};

export default function ChordPicker({
  isOpen,
  onClose,
  currentChord,
  onSelectChord,
  suggestedKey = 'C',
}: ChordPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoot, setSelectedRoot] = useState<string | null>(null);

  const keyChords = useMemo(() => getChordsInKey(suggestedKey), [suggestedKey]);

  const handleChordSelect = (chordName: string) => {
    onSelectChord(chordName);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="max-w-2xl w-full mx-4"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={e => e.stopPropagation()}
        >
          <Card className="border-primary/20 shadow-2xl">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Music className="w-5 h-5 text-primary" />
                  <CardTitle>Select Chord</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Search Input */}
              <div>
                <Input
                  placeholder="Search or type chord name (e.g., Cmaj7, Am, F#m7b5)"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="text-lg"
                  autoFocus
                />
                {searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3"
                  >
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => handleChordSelect(searchQuery)}
                    >
                      Use &quot;{searchQuery}&quot;
                    </Button>
                  </motion.div>
                )}
              </div>

              {/* Chords in Key */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold">Chords in {suggestedKey}</h3>
                  <Badge variant="outline" className="text-xs">
                    Recommended
                  </Badge>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {keyChords.map((chord, index) => (
                    <motion.button
                      key={chord}
                      className={cn(
                        'p-3 rounded-lg border-2 font-semibold text-lg transition-colors',
                        currentChord.name === chord
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50 hover:bg-muted'
                      )}
                      onClick={() => handleChordSelect(chord)}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {chord}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Chord Builder */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Build Custom Chord</h3>

                {/* Root Note Selection */}
                <div className="space-y-3">
                  <label className="text-xs text-muted-foreground">Root Note</label>
                  <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                    {CHORD_ROOTS.map((root, index) => (
                      <motion.button
                        key={root}
                        className={cn(
                          'p-2 rounded-md border font-medium transition-colors',
                          selectedRoot === root
                            ? 'border-primary bg-primary/20 text-primary'
                            : 'border-border hover:border-primary/50'
                        )}
                        onClick={() => setSelectedRoot(root)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {root}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Chord Quality Selection */}
                {selectedRoot && (
                  <motion.div
                    className="space-y-3 mt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <label className="text-xs text-muted-foreground">Chord Quality</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {CHORD_QUALITIES.map((quality, index) => {
                        const chordName = selectedRoot + quality.name;
                        return (
                          <motion.button
                            key={quality.name}
                            className={cn(
                              'p-3 rounded-lg border-2 font-medium transition-colors',
                              quality.color,
                              'hover:scale-105 active:scale-95'
                            )}
                            onClick={() => handleChordSelect(chordName)}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.04 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <div className="text-xs opacity-70">{quality.label}</div>
                            <div className="text-sm font-semibold">{chordName}</div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
