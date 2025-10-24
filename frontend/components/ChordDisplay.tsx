'use client';

import { Fretboard } from '@/components/Fretboard';
import type { ChordVoicing } from '@/lib/chordPositions';
import { getChordVoicings } from '@/lib/chordPositions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music } from 'lucide-react';
import { useChordVoicings } from '@/lib/hooks/useChordVoicings';
import { cn } from '@/lib/utils';

interface ChordDisplayProps {
  chordName: string | null;
  className?: string;
}

export function ChordDisplay({ chordName, className = '' }: ChordDisplayProps) {
  const {
    voicings,
    currentIndex: currentVoicingIndex,
    setCurrentIndex: setCurrentVoicingIndex,
  } = useChordVoicings<ChordVoicing>({
    chordName,
    getVoicings: getChordVoicings,
  });

  if (!chordName) {
    return (
      <Card className={cn(className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Interactive Fretboard
          </CardTitle>
          <CardDescription>Select a song to see chord diagrams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <div className="text-center">
              <Music className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Chords will appear here when you view a song</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (voicings.length === 0) {
    return (
      <Card className={cn(className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Interactive Fretboard
          </CardTitle>
          <CardDescription>Chord: {chordName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <div className="text-center">
              <p>No chord diagram available for</p>
              <Badge variant="outline" className="mt-2">
                {chordName}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Interactive Fretboard
        </CardTitle>
        <CardDescription>Click the fretboard to hear the chord</CardDescription>
      </CardHeader>
      <CardContent>
        <Fretboard
          voicings={voicings}
          currentVoicingIndex={currentVoicingIndex}
          onVoicingChange={setCurrentVoicingIndex}
          showFingerNumbers={true}
        />
      </CardContent>
    </Card>
  );
}
