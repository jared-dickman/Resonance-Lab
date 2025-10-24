"use client";

import { Song } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Activity, GitBranch, BarChart3 } from "lucide-react";

interface ChordJourneyProps {
  song: Song;
  currentChord: string | null;
  onChordClick?: (chord: string, sectionIndex: number, lineIndex: number) => void;
  className?: string;
}

interface ChordNode {
  chord: string;
  count: number;
  positions: { section: number; line: number; sectionName: string }[];
  color: string;
}

interface ChordTransition {
  from: string;
  to: string;
  count: number;
}

const getChordColor = (chord: string): string => {
  const normalized = chord.toLowerCase();

  // Major chords - warm colors
  if (!normalized.includes("m") && !normalized.includes("7")) {
    const hue = (chord.charCodeAt(0) * 30) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  }

  // Minor chords - cool colors
  if (normalized.includes("m") && !normalized.includes("7")) {
    const hue = ((chord.charCodeAt(0) * 30) % 360) + 180;
    return `hsl(${hue}, 60%, 55%)`;
  }

  // Seventh chords - purple/pink range
  if (normalized.includes("7")) {
    const hue = 280 + ((chord.charCodeAt(0) * 20) % 60);
    return `hsl(${hue}, 65%, 58%)`;
  }

  return `hsl(${(chord.charCodeAt(0) * 30) % 360}, 60%, 60%)`;
};

export function ChordJourneyVisualization({
  song,
  currentChord,
  onChordClick,
  className = "",
}: ChordJourneyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chordNodes, setChordNodes] = useState<Map<string, ChordNode>>(new Map());
  const [transitions, setTransitions] = useState<ChordTransition[]>([]);
  const [viewMode, setViewMode] = useState<"timeline" | "network" | "heatmap">("timeline");
  const [hoveredChord, setHoveredChord] = useState<string | null>(null);

  // Analyze song structure
  useEffect(() => {
    const nodes = new Map<string, ChordNode>();
    const transitionMap = new Map<string, number>();
    const chordSequence: string[] = [];

    song.sections.forEach((section, sectionIndex) => {
      section.lines.forEach((line, lineIndex) => {
        if (line.chord?.name) {
          const chord = line.chord.name;
          chordSequence.push(chord);

          // Build chord nodes
          if (!nodes.has(chord)) {
            nodes.set(chord, {
              chord,
              count: 0,
              positions: [],
              color: getChordColor(chord),
            });
          }
          const node = nodes.get(chord)!;
          node.count++;
          node.positions.push({ section: sectionIndex, line: lineIndex, sectionName: section.name });
        }
      });
    });

    // Build transitions
    for (let i = 0; i < chordSequence.length - 1; i++) {
      const from = chordSequence[i];
      const to = chordSequence[i + 1];
      if (from !== to) {
        const key = `${from}->${to}`;
        transitionMap.set(key, (transitionMap.get(key) || 0) + 1);
      }
    }

    const transitionArray = Array.from(transitionMap.entries()).map(([key, count]) => {
      const [from, to] = key.split("->");
      return { from, to, count };
    });

    setChordNodes(nodes);
    setTransitions(transitionArray.sort((a, b) => b.count - a.count));
  }, [song]);

  // Draw visualization
  useEffect(() => {
    if (!canvasRef.current || chordNodes.size === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, width, height);

    if (viewMode === "timeline") {
      drawTimeline(ctx, width, height);
    } else if (viewMode === "network") {
      drawNetwork(ctx, width, height);
    } else {
      drawHeatmap(ctx, width, height);
    }
  }, [chordNodes, transitions, viewMode, currentChord, hoveredChord, song]);

  const drawTimeline = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const allChords: { chord: string; section: number; line: number; sectionName: string }[] = [];

    song.sections.forEach((section, sectionIndex) => {
      section.lines.forEach((line, lineIndex) => {
        if (line.chord?.name) {
          allChords.push({
            chord: line.chord.name,
            section: sectionIndex,
            line: lineIndex,
            sectionName: section.name,
          });
        }
      });
    });

    if (allChords.length === 0) return;

    const blockWidth = width / allChords.length;
    const blockHeight = height - 60;

    // Draw flowing river
    allChords.forEach((item, index) => {
      const x = index * blockWidth;
      const node = chordNodes.get(item.chord);
      if (!node) return;

      const isActive = item.chord === currentChord;
      const isHovered = item.chord === hoveredChord;

      // Create flowing gradient
      const gradient = ctx.createLinearGradient(x, 0, x, blockHeight);
      const color = node.color;
      const alpha = isActive ? 1 : isHovered ? 0.9 : 0.7;

      gradient.addColorStop(0, color.replace(")", `, ${alpha})`).replace("hsl", "hsla"));
      gradient.addColorStop(1, color.replace(")", `, ${alpha * 0.5})`).replace("hsl", "hsla"));

      ctx.fillStyle = gradient;

      // Draw flowing block with wave effect
      const waveOffset = Math.sin(index * 0.3) * 5;
      ctx.beginPath();
      ctx.roundRect(x + 1, waveOffset, Math.max(blockWidth - 2, 1), blockHeight - waveOffset, 2);
      ctx.fill();

      // Highlight active chord
      if (isActive) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    });

    // Draw section labels at bottom
    const sectionNames = new Set<string>();
    let lastSectionIndex = -1;
    allChords.forEach((item, index) => {
      if (item.section !== lastSectionIndex) {
        const x = index * blockWidth;
        ctx.fillStyle = "#888";
        ctx.font = "10px sans-serif";
        ctx.fillText(item.sectionName, x + 2, height - 5);
        lastSectionIndex = item.section;
      }
    });
  };

  const drawNetwork = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const nodes = Array.from(chordNodes.values());
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    // Position nodes in a circle
    const positions = new Map<string, { x: number; y: number }>();
    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * Math.PI * 2 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      positions.set(node.chord, { x, y });
    });

    // Draw transitions as curved lines
    transitions.slice(0, 20).forEach((transition) => {
      const from = positions.get(transition.from);
      const to = positions.get(transition.to);
      if (!from || !to) return;

      const maxCount = Math.max(...transitions.map((t) => t.count));
      const alpha = 0.3 + (transition.count / maxCount) * 0.5;
      const thickness = 1 + (transition.count / maxCount) * 4;

      ctx.strokeStyle = `rgba(100, 200, 255, ${alpha})`;
      ctx.lineWidth = thickness;
      ctx.beginPath();

      // Curved line
      const cpX = (from.x + to.x) / 2 + (from.y - to.y) * 0.2;
      const cpY = (from.y + to.y) / 2 + (to.x - from.x) * 0.2;
      ctx.moveTo(from.x, from.y);
      ctx.quadraticCurveTo(cpX, cpY, to.x, to.y);
      ctx.stroke();

      // Arrow
      const angle = Math.atan2(to.y - cpY, to.x - cpX);
      const arrowSize = 8;
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath();
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(
        to.x - arrowSize * Math.cos(angle - Math.PI / 6),
        to.y - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        to.x - arrowSize * Math.cos(angle + Math.PI / 6),
        to.y - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
    });

    // Draw nodes
    nodes.forEach((node) => {
      const pos = positions.get(node.chord);
      if (!pos) return;

      const isActive = node.chord === currentChord;
      const isHovered = node.chord === hoveredChord;
      const maxCount = Math.max(...nodes.map((n) => n.count));
      const nodeRadius = 15 + (node.count / maxCount) * 25;

      // Node circle
      const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, nodeRadius);
      gradient.addColorStop(0, node.color);
      gradient.addColorStop(1, node.color.replace(")", ", 0.5)").replace("hsl", "hsla"));

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Border
      if (isActive || isHovered) {
        ctx.strokeStyle = isActive ? "#fff" : "#aaa";
        ctx.lineWidth = isActive ? 3 : 2;
        ctx.stroke();

        if (isActive) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = node.color;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      // Label
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${12 + nodeRadius / 5}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.chord, pos.x, pos.y);
    });
  };

  const drawHeatmap = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const nodes = Array.from(chordNodes.values()).sort((a, b) => b.count - a.count);
    const maxCount = Math.max(...nodes.map((n) => n.count));

    const barHeight = (height - 40) / nodes.length;
    const maxBarWidth = width - 100;

    nodes.forEach((node, index) => {
      const y = index * barHeight + 20;
      const barWidth = (node.count / maxCount) * maxBarWidth;

      const isActive = node.chord === currentChord;
      const isHovered = node.chord === hoveredChord;

      // Bar with gradient
      const gradient = ctx.createLinearGradient(0, y, barWidth, y);
      const alpha = isActive ? 1 : isHovered ? 0.9 : 0.7;
      gradient.addColorStop(0, node.color.replace(")", `, ${alpha})`).replace("hsl", "hsla"));
      gradient.addColorStop(1, node.color.replace(")", `, ${alpha * 0.6})`).replace("hsl", "hsla"));

      ctx.fillStyle = gradient;
      ctx.fillRect(80, y, barWidth, barHeight - 4);

      // Border for active/hovered
      if (isActive || isHovered) {
        ctx.strokeStyle = isActive ? "#fff" : "#aaa";
        ctx.lineWidth = isActive ? 2 : 1;
        ctx.strokeRect(80, y, barWidth, barHeight - 4);
      }

      // Chord label
      ctx.fillStyle = isActive ? "#fff" : "#ccc";
      ctx.font = `bold ${Math.min(barHeight * 0.6, 16)}px sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(node.chord, 70, y + barHeight / 2);

      // Count
      ctx.fillStyle = "#888";
      ctx.font = `${Math.min(barHeight * 0.5, 12)}px sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText(`${node.count}×`, barWidth + 85, y + barHeight / 2);
    });
  };

  const stats = {
    totalChords: Array.from(chordNodes.values()).reduce((sum, node) => sum + node.count, 0),
    uniqueChords: chordNodes.size,
    mostCommon: Array.from(chordNodes.values()).sort((a, b) => b.count - a.count)[0],
    transitions: transitions.length,
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Chord Journey Map
            </CardTitle>
            <CardDescription>Interactive visualization of chord progressions</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "timeline" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("timeline")}
            >
              <Activity className="h-4 w-4 mr-1" />
              Flow
            </Button>
            <Button
              variant={viewMode === "network" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("network")}
            >
              <GitBranch className="h-4 w-4 mr-1" />
              Network
            </Button>
            <Button
              variant={viewMode === "heatmap" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("heatmap")}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Stats
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats badges */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <Badge variant="secondary">
            {stats.totalChords} chord changes
          </Badge>
          <Badge variant="secondary">
            {stats.uniqueChords} unique chords
          </Badge>
          {stats.mostCommon && (
            <Badge variant="secondary">
              Most used: {stats.mostCommon.chord} ({stats.mostCommon.count}×)
            </Badge>
          )}
          <Badge variant="secondary">
            {stats.transitions} transitions
          </Badge>
        </div>

        {/* Canvas */}
        <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-[400px] cursor-pointer"
            style={{ display: "block" }}
          />
        </div>

        {/* Legend */}
        <div className="mt-4 text-sm text-muted-foreground">
          <p className="mb-2">
            {viewMode === "timeline" && "Flow view shows chord progression over time. Hover to highlight."}
            {viewMode === "network" && "Network shows chord relationships. Lines indicate transitions between chords."}
            {viewMode === "heatmap" && "Stats view shows chord frequency ranked by usage."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
