'use client';

import { Music, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import type { SearchResult } from '@/lib/types';
import {
  BUDDY_DEFAULT_RATING,
  BUDDY_RATING_PRECISION,
  BUDDY_EMPTY_STATE_SUBTITLE,
  STRUCTURED_DATA_TYPES,
} from '@/lib/constants/buddy.constants';

interface StructuredData {
  type: string;
  [key: string]: unknown;
}

const PAGE_HINTS: Record<string, string> = {
  library: 'try: add a song',
  jam: 'pick chords to jam',
  theory: 'explore the circle',
  composer: 'build progressions',
  metronome: 'set your tempo',
  songwriter: 'write lyrics',
  studio: 'practice mode',
  pedalboard: 'tweak your tone',
  landing: 'ask me anything',
};

export function ContextChip({ page, artist, song }: { page: string; artist?: string; song?: string }) {
  // Priority: song > artist > page hint
  const label = song ?? artist ?? PAGE_HINTS[page] ?? page;
  const showMusicIcon = Boolean(song ?? artist);

  return (
    <span className="text-[10px] text-white/50 font-mono lowercase tracking-wide">
      {showMusicIcon && <Music className="h-2.5 w-2.5 inline mr-1" />}
      {label}
    </span>
  );
}

export function SearchResultButton({
  result,
  type,
  onClick,
  disabled,
}: {
  result: SearchResult;
  type: 'chord' | 'tab';
  onClick: (result: SearchResult, type: 'chord' | 'tab') => void;
  disabled: boolean;
}) {
  const rating = result.rating ?? BUDDY_DEFAULT_RATING;
  const formattedRating = rating.toFixed(BUDDY_RATING_PRECISION);

  return (
    <button
      onClick={() => onClick(result, type)}
      disabled={disabled}
      className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all mb-1.5 disabled:opacity-50 group"
    >
      <div className="flex justify-between items-center">
        <span className="font-medium text-xs text-white/90 group-hover:text-white">{result.title}</span>
        <span className="text-[10px] text-white/40 tabular-nums">{formattedRating}★</span>
      </div>
      <span className="text-[10px] text-white/50">{result.artist}</span>
    </button>
  );
}

function InfluenceChainBlock({ chain }: { chain: Array<{ artist: string; relationship: string }> }) {
  return (
    <div className="mt-3 p-2.5 bg-white/5 rounded-lg border border-white/10">
      <div className="text-[9px] uppercase tracking-widest text-white/40 mb-2">Influence Chain</div>
      <div className="flex flex-wrap items-center gap-1 text-[10px]">
        {chain.map((item, i) => (
          <span key={item.artist} className="flex items-center gap-1">
            <Badge variant="secondary" className="bg-white/10 text-white/80 text-[10px] px-1.5 py-0">
              {item.artist}
            </Badge>
            {i < chain.length - 1 && <span className="text-white/30">→</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

function ArtistCardBlock({
  name,
  yearsActive,
  genres,
}: {
  name: string;
  yearsActive: string;
  genres?: string[];
}) {
  const hasGenres = genres && genres.length > 0;

  return (
    <div className="mt-3 p-2.5 bg-white/5 rounded-lg border border-white/10">
      <div className="font-semibold text-xs text-white/90">{name}</div>
      <div className="text-[10px] text-white/50 mt-0.5">{yearsActive}</div>
      {hasGenres && (
        <div className="flex flex-wrap gap-1 mt-2">
          {genres.map(genre => (
            <Badge key={genre} variant="outline" className="text-[9px] px-1.5 py-0 border-white/20 text-white/60">
              {genre}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export function StructuredBlock({ data }: { data: StructuredData }) {
  if (data.type === STRUCTURED_DATA_TYPES.INFLUENCE_CHAIN) {
    const chain = data.chain as Array<{ artist: string; relationship: string }>;
    return <InfluenceChainBlock chain={chain} />;
  }

  if (data.type === STRUCTURED_DATA_TYPES.ARTIST_CARD) {
    return (
      <ArtistCardBlock
        name={data.name as string}
        yearsActive={data.yearsActive as string}
        genres={data.genres as string[] | undefined}
      />
    );
  }

  return null;
}

export function EmptyState({ placeholder }: { placeholder: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col items-center justify-center text-center py-8"
    >
      <motion.div
        animate={{
          boxShadow: [
            '0 0 20px rgba(59, 130, 246, 0.3)',
            '0 0 40px rgba(147, 51, 234, 0.3)',
            '0 0 20px rgba(59, 130, 246, 0.3)',
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4 border border-white/10"
      >
        <Sparkles className="h-7 w-7 text-blue-400/80" />
      </motion.div>
      <motion.p
        key={placeholder}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm text-white/70 font-medium max-w-[200px]"
      >
        {placeholder}
      </motion.p>
      <p className="text-[10px] text-white/30 mt-2 max-w-[180px]">
        {BUDDY_EMPTY_STATE_SUBTITLE}
      </p>
    </motion.div>
  );
}

export function ThinkingIndicator({ pun }: { pun: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex justify-start"
    >
      <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="h-3 w-3 text-blue-400" />
          </motion.div>
          <span className="text-[11px] text-white/60">{pun}</span>
        </div>
      </div>
    </motion.div>
  );
}
