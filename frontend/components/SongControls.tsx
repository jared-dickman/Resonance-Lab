
"use client";

import { ChangeEvent } from "react";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const KEY_SIGNATURES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

interface SongControlsProps {
  transpose: number;
  onTransposeChange: (nextValue: number) => void;
  currentKey: string;
  onKeyChange: (key: string) => void;
  bpm: number;
  onBpmChange: (nextValue: number) => void;
  isAutoScrollEnabled: boolean;
  onToggleAutoScroll: () => void;
  originalKey?: string;
}

export function SongControls({
  transpose,
  onTransposeChange,
  currentKey,
  onKeyChange,
  bpm,
  onBpmChange,
  isAutoScrollEnabled,
  onToggleAutoScroll,
  originalKey,
}: SongControlsProps) {
  const handleBpmChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value);
    if (Number.isFinite(nextValue)) {
      onBpmChange(Math.max(0, nextValue));
    }
  };

  const handleKeyChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onKeyChange(event.target.value);
  };

  return (
    <div className="my-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Transpose</span>
          <div className="flex items-center gap-1">
            <Button aria-label="Decrease transpose" onClick={() => onTransposeChange(transpose - 1)} size="icon">
              -
            </Button>
            <Badge className="px-3 py-1 text-base font-semibold">{transpose >= 0 ? `+${transpose}` : transpose}</Badge>
            <Button aria-label="Increase transpose" onClick={() => onTransposeChange(transpose + 1)} size="icon">
              +
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" htmlFor="key-selector">
            Key
          </label>
          <select
            id="key-selector"
            value={currentKey}
            onChange={handleKeyChange}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {KEY_SIGNATURES.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
          {originalKey && (
            <Badge variant="secondary" className="text-xs font-medium">
              Original: {originalKey}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" htmlFor="bpm-input">
            BPM
          </label>
          <Input
            id="bpm-input"
            type="number"
            min={0}
            value={Number.isFinite(bpm) ? bpm : ""}
            onChange={handleBpmChange}
            className="w-24"
          />
        </div>
      </div>

      <Button
        variant={isAutoScrollEnabled ? "default" : "outline"}
        onClick={onToggleAutoScroll}
        aria-pressed={isAutoScrollEnabled}
      >
        {isAutoScrollEnabled ? "Stop Auto-Scroll" : "Start Auto-Scroll"}
      </Button>
    </div>
  );
}
