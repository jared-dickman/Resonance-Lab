"use client";

import { Song } from "@/lib/types";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Repeat, Play, Pause, Plus, Minus, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { Slider } from "./ui/slider";

interface LoopPracticeModeProps {
  song: Song;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  isAutoScrollEnabled: boolean;
  onToggleAutoScroll: () => void;
  lyricsContainerRef: React.RefObject<HTMLDivElement>;
  className?: string;
}

interface LoopRange {
  startSection: number;
  startLine: number;
  endSection: number;
  endLine: number;
}

export function LoopPracticeMode({
  song,
  bpm,
  onBpmChange,
  isAutoScrollEnabled,
  onToggleAutoScroll,
  lyricsContainerRef,
  className = "",
}: LoopPracticeModeProps) {
  const [isLoopEnabled, setIsLoopEnabled] = useState(false);
  const [loopRange, setLoopRange] = useState<LoopRange | null>(null);
  const [loopCount, setLoopCount] = useState(0);
  const [practiceBpm, setPracticeBpm] = useState(bpm);
  const lastScrollTopRef = useRef(0);
  const loopStartPositionRef = useRef(0);

  // Calculate total lines for validation
  const totalLines = song.sections.reduce((acc, section, sectionIndex) => {
    return acc + section.lines.length;
  }, 0);

  // Initialize default loop range (first verse or first section)
  useEffect(() => {
    if (!loopRange && song.sections.length > 0) {
      const firstSection = song.sections[0];
      setLoopRange({
        startSection: 0,
        startLine: 0,
        endSection: 0,
        endLine: Math.min(firstSection.lines.length - 1, 7), // First 8 lines or whole section
      });
    }
  }, [song, loopRange]);

  // Sync practice BPM with main BPM
  useEffect(() => {
    if (!isLoopEnabled) {
      setPracticeBpm(bpm);
    }
  }, [bpm, isLoopEnabled]);

  // Monitor scroll position and trigger loop
  useEffect(() => {
    if (!isLoopEnabled || !isAutoScrollEnabled || !lyricsContainerRef.current || !loopRange) return;

    const container = lyricsContainerRef.current;

    // Calculate loop boundaries based on section elements
    const calculateLoopBoundaries = () => {
      const sections = container.querySelectorAll('[class*="section"]');
      if (sections.length === 0) return null;

      const startSection = sections[loopRange.startSection] as HTMLElement;
      const endSection = sections[loopRange.endSection] as HTMLElement;

      if (!startSection || !endSection) return null;

      // Get the position of the start section relative to container
      const startTop = startSection.offsetTop - container.offsetTop;

      // Get the position of the end section's bottom relative to container
      const endBottom = endSection.offsetTop - container.offsetTop + endSection.offsetHeight;

      return { startTop, endBottom };
    };

    const boundaries = calculateLoopBoundaries();
    if (boundaries) {
      loopStartPositionRef.current = boundaries.startTop;
    }

    const checkScroll = () => {
      if (!loopRange || !container || !boundaries) return;

      const currentScrollTop = container.scrollTop;
      const scrollBottom = currentScrollTop + container.clientHeight;

      // Check if we've scrolled past the end of the loop range
      // Add some buffer (50px) to detect when we're past the end
      if (scrollBottom >= boundaries.endBottom + 50) {
        // Loop back to start
        container.scrollTop = boundaries.startTop;
        setLoopCount((prev) => prev + 1);
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

  const handleExpandLoop = () => {
    if (!loopRange) return;

    setLoopRange((prev) => {
      if (!prev) return null;

      // Try to expand down first
      if (prev.endSection < song.sections.length - 1) {
        return {
          ...prev,
          endSection: prev.endSection + 1,
          endLine: Math.min(song.sections[prev.endSection + 1].lines.length - 1, 7),
        };
      } else if (prev.endLine < song.sections[prev.endSection].lines.length - 1) {
        return {
          ...prev,
          endLine: prev.endLine + 4,
        };
      }

      return prev;
    });
  };

  const handleContractLoop = () => {
    if (!loopRange) return;

    setLoopRange((prev) => {
      if (!prev) return null;

      // Try to contract from bottom
      if (prev.endLine > prev.startLine + 3) {
        return {
          ...prev,
          endLine: Math.max(prev.startLine + 3, prev.endLine - 4),
        };
      } else if (prev.endSection > prev.startSection) {
        return {
          ...prev,
          endSection: prev.endSection - 1,
          endLine: Math.min(song.sections[prev.endSection - 1].lines.length - 1, 7),
        };
      }

      return prev;
    });
  };

  const handleBpmChange = (value: number[]) => {
    const newBpm = value[0];
    setPracticeBpm(newBpm);
    onBpmChange(newBpm);
  };

  const handleQuickBpm = (delta: number) => {
    const newBpm = Math.max(40, Math.min(200, practiceBpm + delta));
    setPracticeBpm(newBpm);
    onBpmChange(newBpm);
  };

  if (!loopRange) return null;

  const loopRangeSummary = `${song.sections[loopRange.startSection]?.name || "Section 1"} (lines ${loopRange.startLine + 1}-${loopRange.endLine + 1})`;

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
            variant={isLoopEnabled ? "default" : "outline"}
            size="sm"
            onClick={handleToggleLoop}
            className={isLoopEnabled ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            <Repeat className={`h-4 w-4 mr-1 ${isLoopEnabled ? "animate-spin" : ""}`} />
            {isLoopEnabled ? "Loop Active" : "Enable Loop"}
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
          <Button variant="outline" size="sm" onClick={handleContractLoop} title="Shorten loop range">
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
            <Button variant="outline" size="sm" onClick={() => handleBpmChange([Math.floor(bpm * 0.5)])}>
              50%
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBpmChange([Math.floor(bpm * 0.75)])}>
              75%
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBpmChange([bpm])}>
              100%
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBpmChange([Math.floor(bpm * 1.25)])}>
              125%
            </Button>
          </div>
        </div>

        {/* Auto-scroll Control */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">
            {isLoopEnabled ? "Loop will restart at the end" : "Enable loop to practice sections"}
          </span>
          <Button
            variant={isAutoScrollEnabled ? "destructive" : "default"}
            size="sm"
            onClick={onToggleAutoScroll}
            disabled={!isLoopEnabled}
          >
            {isAutoScrollEnabled ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
            {isAutoScrollEnabled ? "Pause" : "Start Practice"}
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p>💡 <strong>Tip:</strong> Start at 50-75% speed to learn chord changes accurately</p>
          <p>🎯 <strong>Goal:</strong> Increase speed gradually as you master the section</p>
          <p>🔁 Loop counter helps track your practice repetitions</p>
        </div>
      </CardContent>
    </Card>
  );
}
