'use client';

import { useEffect, useRef, useState } from 'react';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import type { Song } from '@/lib/types';
import { adjustBpm } from '@/lib/utils/validation/bpm';
import type {
  LoopRange} from '@/lib/utils/song/loopBoundaries';
import {
  calculateLoopBoundaries,
  shouldLoopRestart
} from '@/lib/utils/song/loopBoundaries';
import { ChevronDown, ChevronUp, Minus, Pause, Play, Plus, Repeat, RotateCcw } from 'lucide-react';

interface LoopPracticeModeProps {
  song: Song;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  isAutoScrollEnabled: boolean;
  onToggleAutoScroll: () => void;
  lyricsContainerRef: React.RefObject<HTMLDivElement>;
  className?: string;
}


export function LoopPracticeMode({
  song,
  bpm,
  onBpmChange,
  isAutoScrollEnabled,
  onToggleAutoScroll,
  lyricsContainerRef,
  className = '',
}: LoopPracticeModeProps): JSX.Element | null {
  const [isLoopEnabled, setIsLoopEnabled] = useState(false);
  const [loopRange, setLoopRange] = useState<LoopRange | null>(null);
  const [loopCount, setLoopCount] = useState(0);
  const [practiceBpm, setPracticeBpm] = useState(bpm);
  const lastScrollTopRef = useRef(0);
  const loopStartPositionRef = useRef(0);

  useEffect(() => {
    if (!loopRange && song.sections.length > 0) {
      const firstSection = song.sections[0];
      if (firstSection) {
        setLoopRange({
          startSection: 0,
          startLine: 0,
          endSection: 0,
          endLine: Math.min(firstSection.lines.length - 1, 7),
        });
      }
    }
  }, [song, loopRange]);

  useEffect(() => {
    if (!isLoopEnabled) {
      setPracticeBpm(bpm);
    }
  }, [bpm, isLoopEnabled]);

  useEffect(() => {
    if (!isLoopEnabled || !isAutoScrollEnabled || !lyricsContainerRef.current || !loopRange) return;

    const container = lyricsContainerRef.current;

    const boundaries = calculateLoopBoundaries(container, loopRange);
    if (boundaries) {
      loopStartPositionRef.current = boundaries.startTop;
    }

    const checkScroll = (): void => {
      if (!loopRange || !container || !boundaries) return;

      const currentScrollTop = container.scrollTop;
      const scrollBottom = currentScrollTop + container.clientHeight;

      if (shouldLoopRestart(scrollBottom, boundaries.endBottom)) {
        container.scrollTop = boundaries.startTop;
        setLoopCount(prev => prev + 1);
      }

      lastScrollTopRef.current = currentScrollTop;
    };

    const interval = setInterval(checkScroll, 100);
    return () => clearInterval(interval);
  }, [isLoopEnabled, isAutoScrollEnabled, loopRange, lyricsContainerRef]);

  const handleToggleLoop = () => {
    const newIsLoopEnabled = !isLoopEnabled;
    setIsLoopEnabled(newIsLoopEnabled);

    if (newIsLoopEnabled && lyricsContainerRef.current && loopRange) {
      setLoopCount(0);

      // Calculate and scroll to the loop start position
      const container = lyricsContainerRef.current;
      const sections = container.querySelectorAll('[class*="section"]');
      const startSection = sections[loopRange.startSection] as HTMLElement;

      if (startSection) {
        const startTop = startSection.offsetTop - container.offsetTop;
        loopStartPositionRef.current = startTop;
        container.scrollTop = startTop;
      }
    }
  };

  const handleResetLoop = () => {
    setLoopCount(0);
    if (lyricsContainerRef.current) {
      lyricsContainerRef.current.scrollTop = loopStartPositionRef.current;
    }
  };

  const handleExpandLoop = (): void => {
    if (!loopRange) return;

    setLoopRange(prev => {
      if (!prev) return null;

      if (prev.endSection < song.sections.length - 1) {
        const nextSection = song.sections[prev.endSection + 1];
        if (nextSection) {
          return {
            ...prev,
            endSection: prev.endSection + 1,
            endLine: Math.min(nextSection.lines.length - 1, 7),
          };
        }
      } else {
        const currentSection = song.sections[prev.endSection];
        if (currentSection && prev.endLine < currentSection.lines.length - 1) {
          return {
            ...prev,
            endLine: prev.endLine + 4,
          };
        }
      }

      return prev;
    });
  };

  const handleContractLoop = (): void => {
    if (!loopRange) return;

    setLoopRange(prev => {
      if (!prev) return null;

      if (prev.endLine > prev.startLine + 3) {
        return {
          ...prev,
          endLine: Math.max(prev.startLine + 3, prev.endLine - 4),
        };
      } else if (prev.endSection > prev.startSection) {
        const prevSection = song.sections[prev.endSection - 1];
        if (prevSection) {
          return {
            ...prev,
            endSection: prev.endSection - 1,
            endLine: Math.min(prevSection.lines.length - 1, 7),
          };
        }
      }

      return prev;
    });
  };

  const handleBpmChange = (value: number[]): void => {
    const newBpm = value[0];
    if (newBpm !== undefined) {
      setPracticeBpm(newBpm);
      onBpmChange(newBpm);
    }
  };

  const handleQuickBpm = (delta: number): void => {
    const newBpm = adjustBpm(practiceBpm, delta);
    setPracticeBpm(newBpm);
    onBpmChange(newBpm);
  };

  if (!loopRange) return null;

  const loopRangeSummary = `${song.sections[loopRange.startSection]?.name || 'Section 1'} (lines ${loopRange.startLine + 1}-${loopRange.endLine + 1})`;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5 text-blue-500" />
              Loop Practice Mode
            </CardTitle>
            <CardDescription>Master difficult sections by looping and slowing down</CardDescription>
          </div>
          <Button
            variant={isLoopEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={handleToggleLoop}
            className={isLoopEnabled ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            <Repeat className={`h-4 w-4 mr-1 ${isLoopEnabled ? 'animate-spin' : ''}`} />
            {isLoopEnabled ? 'Loop Active' : 'Enable Loop'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Loop Range Display */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-sm">
            {loopRangeSummary}
          </Badge>
          {isLoopEnabled && (
            <Badge variant="default" className="bg-green-600">
              {loopCount} loops completed
            </Badge>
          )}
        </div>

        {/* Loop Range Controls */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleContractLoop}
            title="Shorten loop range"
          >
            <Minus className="h-4 w-4 mr-1" />
            Shorter
          </Button>
          <Button variant="outline" size="sm" onClick={handleExpandLoop} title="Extend loop range">
            <Plus className="h-4 w-4 mr-1" />
            Longer
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetLoop} title="Reset to loop start">
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>

        {/* BPM Practice Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Practice Tempo</label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleQuickBpm(-10)}>
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Badge variant="outline" className="min-w-[60px] justify-center">
                {practiceBpm} BPM
              </Badge>
              <Button variant="outline" size="sm" onClick={() => handleQuickBpm(10)}>
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Slider
            value={[practiceBpm]}
            onValueChange={handleBpmChange}
            min={40}
            max={200}
            step={5}
            className="w-full"
          />
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBpmChange([Math.floor(bpm * 0.5)])}
            >
              50%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBpmChange([Math.floor(bpm * 0.75)])}
            >
              75%
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBpmChange([bpm])}>
              100%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBpmChange([Math.floor(bpm * 1.25)])}
            >
              125%
            </Button>
          </div>
        </div>

        {/* Auto-scroll Control */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">
            {isLoopEnabled ? 'Loop will restart at the end' : 'Enable loop to practice sections'}
          </span>
          <Button
            variant={isAutoScrollEnabled ? 'destructive' : 'default'}
            size="sm"
            onClick={onToggleAutoScroll}
            disabled={!isLoopEnabled}
          >
            {isAutoScrollEnabled ? (
              <Pause className="h-4 w-4 mr-1" />
            ) : (
              <Play className="h-4 w-4 mr-1" />
            )}
            {isAutoScrollEnabled ? 'Pause' : 'Start Practice'}
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p>
            💡 <strong>Tip:</strong> Start at 50-75% speed to learn chord changes accurately
          </p>
          <p>
            🎯 <strong>Goal:</strong> Increase speed gradually as you master the section
          </p>
          <p>🔁 Loop counter helps track your practice repetitions</p>
        </div>
      </CardContent>
    </Card>
  );
}
