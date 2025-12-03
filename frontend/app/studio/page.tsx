'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Play, Pause, Music2, Flame, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSongs } from '@/app/features/songs/hooks';

const PRACTICE_MODES = [
  { id: 'full', label: 'Full Play', desc: 'Play through entire song' },
  { id: 'loop', label: 'Loop Section', desc: 'Master tricky parts' },
  { id: 'slow', label: 'Slow Practice', desc: 'Build muscle memory' },
] as const;

type PracticeMode = (typeof PRACTICE_MODES)[number]['id'];

export default function StudioPage() {
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('full');
  const [isPlaying, setIsPlaying] = useState(false);
  const [minutes, setMinutes] = useState(0);

  const { data: songs = [] } = useSongs();
  const song = songs.find(s => s.songSlug === selectedSong);

  // Timer
  useState(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => setMinutes(m => m + 1), 60000);
    return () => clearInterval(interval);
  });

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-4xl">
      {/* Hero */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-sapphire-800/40 to-sapphire-500/40 border border-sapphire-500/50 rounded-lg p-8">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="h-8 w-8 text-sapphire-400" />
            <h1 className="text-3xl font-bold text-white">Practice Studio</h1>
          </div>
          <p className="text-gray-300 mb-4">
            Focused practice sessions with your library. Pick a song, set your mode, and play.
          </p>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-sapphire-500/20 text-sapphire-400 rounded-full text-sm">
              <Flame className="inline h-3 w-3 mr-1" />
              Streak Tracking
            </span>
            <span className="px-3 py-1 bg-sapphire-500/20 text-sapphire-300 rounded-full text-sm">
              Focus Timer
            </span>
          </div>
        </div>
      </div>

      {/* Song Selection */}
      <div className="mb-6 bg-gray-800/50 border border-sapphire-500/10 rounded-lg p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Music2 className="h-5 w-5 text-sapphire-400" />
          Select Song
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
          {songs.slice(0, 12).map(s => (
            <button
              key={s.songSlug}
              onClick={() => setSelectedSong(s.songSlug)}
              className={cn(
                'p-3 rounded-lg text-left transition-all border-2',
                selectedSong === s.songSlug
                  ? 'border-sapphire-500 bg-sapphire-500/20'
                  : 'border-transparent bg-gray-700/30 hover:border-sapphire-500/30'
              )}
            >
              <div className="font-medium text-white text-sm truncate">{s.title}</div>
              <div className="text-xs text-gray-400 truncate">{s.artist}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Practice Mode */}
      <div className="mb-6 bg-gray-800/50 border border-sapphire-500/10 rounded-lg p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-sapphire-400" />
          Practice Mode
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {PRACTICE_MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => setPracticeMode(mode.id)}
              className={cn(
                'p-4 rounded-lg text-center transition-all border-2',
                practiceMode === mode.id
                  ? 'border-sapphire-500 bg-sapphire-500/20'
                  : 'border-transparent bg-gray-700/30 hover:border-sapphire-500/30'
              )}
            >
              <div className="font-medium text-white text-sm">{mode.label}</div>
              <div className="text-xs text-gray-400">{mode.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Session Display */}
      {selectedSong && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-sapphire-800/30 to-sapphire-500/30 border border-sapphire-500/40 rounded-lg p-8 text-center"
        >
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-white">{song?.title}</h3>
            <p className="text-gray-400">{song?.artist}</p>
          </div>

          <div className="text-5xl font-mono font-bold text-sapphire-400 mb-6">
            {String(Math.floor(minutes / 60)).padStart(2, '0')}:{String(minutes % 60).padStart(2, '0')}
          </div>

          <Button
            size="lg"
            onClick={() => setIsPlaying(!isPlaying)}
            className={cn(
              'px-12',
              isPlaying
                ? 'bg-orange-500 hover:bg-orange-600'
                : 'bg-sapphire-500 hover:bg-sapphire-600'
            )}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>

          <p className="mt-6 text-sm text-gray-400">
            {isPlaying ? 'Focus on your practice' : 'Press play to begin'}
          </p>
        </motion.div>
      )}

      {/* Empty State */}
      {!selectedSong && (
        <div className="bg-gray-800/30 border border-dashed border-sapphire-500/30 rounded-lg p-12 text-center">
          <Sparkles className="h-12 w-12 text-sapphire-400/50 mx-auto mb-4" />
          <p className="text-gray-400">Select a song above to start practicing</p>
        </div>
      )}
    </div>
  );
}
