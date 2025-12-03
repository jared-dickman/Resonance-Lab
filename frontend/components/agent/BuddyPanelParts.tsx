'use client';

import { useRef, useEffect, type FormEvent, type RefObject } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Minimize2, Maximize2, GripHorizontal, Home, Music, Users, PenLine, Guitar, BookOpen, Clock, Piano, SlidersHorizontal, Send, Layers, Radio, Headphones, Feather, AudioWaveform, Disc3 as Turntable } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RandomLoader } from '@/components/ui/loaders/RandomLoader';
import { cn } from '@/lib/utils';
import type { BuddyMessage, Suggestion } from '@/lib/types/buddy.types';
import type { SearchResult } from '@/lib/types';
import {
  ContextChip,
  SearchResultButton,
  StructuredBlock,
  EmptyState,
} from '@/components/agent/BuddySubComponents';
import {
  BUDDY_NAV_ROUTES,
  BUDDY_MAX_VISIBLE_RESULTS,
  BUDDY_INPUT_PLACEHOLDER,
  BUDDY_ICON_GLOW_ANIMATION,
  BUDDY_ICON_GLOW_TRANSITION,
  BUDDY_SCROLL_CONTAINER_CLASS,
  BUDDY_GRADIENT_ICON_BOX,
  BUDDY_GRADIENT_USER_MSG,
  BUDDY_GRADIENT_SEND_BTN,
} from '@/lib/constants/buddy.constants';

const NAV_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home, music: Music, users: Users, pen: PenLine, guitar: Guitar,
  book: BookOpen, clock: Clock, piano: Piano, sliders: SlidersHorizontal,
  layers: Layers, radio: Radio, headphones: Headphones, feather: Feather,
  waveform: AudioWaveform, turntable: Turntable,
};

interface BuddyHeaderProps {
  context: { page: string; artist?: string; song?: string };
  isStatic: boolean;
  isOnboarding: boolean;
  isMinimized: boolean;
  onMinimize: () => void;
  onClose: () => void;
  onSkip?: () => void;
}

const HEADER_BUTTON_CLASS = 'h-6 w-6 text-white/40 hover:text-white/80 hover:bg-white/10';
const RESULT_LABEL_CLASS = 'text-[9px] uppercase tracking-widest text-white/40 mb-1';

function ResultSection({ label, results, type, onSelect, disabled }: {
  label: string;
  results: SearchResult[];
  type: 'chord' | 'tab';
  onSelect: (result: SearchResult, type: 'chord' | 'tab') => void;
  disabled: boolean;
}) {
  if (results.length === 0) return null;
  return (
    <div>
      <div className={RESULT_LABEL_CLASS}>{label}</div>
      {results.slice(0, BUDDY_MAX_VISIBLE_RESULTS).map(result => (
        <SearchResultButton key={result.id} result={result} type={type} onClick={onSelect} disabled={disabled} />
      ))}
    </div>
  );
}

function BuddyHeaderControls({ isStatic, isOnboarding, isMinimized, onMinimize, onClose, onSkip }: Omit<BuddyHeaderProps, 'context'>) {
  if (isOnboarding) {
    return (
      <Button variant="outline" size="sm" className="h-6 px-2 text-xs text-white/40 hover:text-white/80 hover:bg-white/10" onClick={onSkip}>
        Skip
      </Button>
    );
  }

  if (isStatic) return null;

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className={HEADER_BUTTON_CLASS} onClick={(e) => { e.stopPropagation(); onMinimize(); }}>
        {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
      </Button>
      <Button variant="ghost" size="icon" className={HEADER_BUTTON_CLASS} onClick={(e) => { e.stopPropagation(); onClose(); }}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function BuddyHeader({ context, isStatic, isOnboarding, isMinimized, onMinimize, onClose, onSkip }: BuddyHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between px-4 py-3 border-b border-white/5 select-none', !isStatic && 'cursor-grab active:cursor-grabbing')}>
      <div className="flex items-center gap-2.5">
        {!isStatic && <GripHorizontal className="h-4 w-4 text-white/20" />}
        <motion.div
          animate={BUDDY_ICON_GLOW_ANIMATION}
          transition={BUDDY_ICON_GLOW_TRANSITION}
          className={cn('h-7 w-7', BUDDY_GRADIENT_ICON_BOX)}
        >
          <Bot className="h-4 w-4 text-blue-400" />
        </motion.div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-white/90">Buddy</span>
          {!isMinimized && <ContextChip page={context.page} artist={context.artist} song={context.song} />}
        </div>
      </div>
      <BuddyHeaderControls {...{ isStatic, isOnboarding, isMinimized, onMinimize, onClose, onSkip }} />
    </div>
  );
}

interface BuddyNavBarProps {
  onNavigate?: (path: string) => void;
}

export function BuddyNavBar({ onNavigate }: BuddyNavBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (path: string) => {
    router.push(path);
    onNavigate?.(path);
  };

  return (
    <nav className="relative border-b border-white/5 bg-white/[0.02]">
      <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-slate-900/95 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-slate-900/95 to-transparent z-10 pointer-events-none" />
      <div className="flex items-center gap-0.5 px-4 py-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {BUDDY_NAV_ROUTES.map(route => {
          const Icon = NAV_ICONS[route.icon];
          const isActive = pathname === route.path || pathname?.startsWith(route.path);
          return (
            <button
              key={route.path}
              onClick={() => handleClick(route.path)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-all whitespace-nowrap shrink-0',
                isActive ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              )}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              <span>{route.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

interface BuddyMessageListProps {
  messages: BuddyMessage[];
  isLoading: boolean;
  isThinking: boolean;
  thinkingPun: string;
  placeholder: string;
  isSaving: boolean;
  onSelectSuggestion: (suggestion: Suggestion) => void;
  onSelectResult: (result: SearchResult, type: 'chord' | 'tab') => void;
}

export function BuddyMessageList({ messages, isLoading, isThinking, thinkingPun, placeholder, isSaving, onSelectSuggestion, onSelectResult }: BuddyMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isEmptyState = messages.length === 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if the last message is an empty streaming assistant message
  const lastMessage = messages[messages.length - 1];
  const isStreamingEmpty = isLoading && lastMessage?.role === 'assistant' && !lastMessage?.content;

  return (
    <div className={BUDDY_SCROLL_CONTAINER_CLASS}>
      <AnimatePresence mode="wait">
        {isEmptyState && !isLoading && <EmptyState placeholder={placeholder} />}
      </AnimatePresence>

      {messages.map((message, i) => {
        const isLastEmptyStreaming = i === messages.length - 1 && isStreamingEmpty;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start', isLastEmptyStreaming && 'justify-center w-full')}
          >
            {/* Centered loader without background when streaming empty */}
            {isLastEmptyStreaming ? (
              <div className="py-6">
                <RandomLoader size="lg" />
              </div>
            ) : (
            <div className={cn(
              'max-w-[85%] rounded-xl px-3 py-2 text-xs',
              message.role === 'user'
                ? BUDDY_GRADIENT_USER_MSG
                : 'bg-white/5 border border-white/10 text-white/80'
            )}>
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>

              {message.structured && <StructuredBlock data={message.structured} />}

              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {message.suggestions.map((suggestion, idx) => (
                    <button
                      key={`${suggestion.artist}-${suggestion.title}-${idx}`}
                      onClick={() => onSelectSuggestion(suggestion)}
                      disabled={isLoading || isSaving}
                      className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10 hover:border-white/20 hover:bg-white/15 transition-all text-[10px] font-medium text-white/70 disabled:opacity-50"
                    >
                      {suggestion.title}
                    </button>
                  ))}
                </div>
              )}

              {message.results && (message.results.chords.length > 0 || message.results.tabs.length > 0) && (
                <div className="mt-2 space-y-2">
                  <ResultSection label="Chords" results={message.results.chords} type="chord" onSelect={onSelectResult} disabled={isSaving} />
                  <ResultSection label="Tabs" results={message.results.tabs} type="tab" onSelect={onSelectResult} disabled={isSaving} />
                </div>
              )}
            </div>
            )}
          </motion.div>
        );
      })}

      {/* Thinking indicator - shows when agent is processing between tool calls */}
      {isThinking && messages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-start"
        >
          <div className="py-2 px-3">
            <RandomLoader size="sm" />
          </div>
        </motion.div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

interface BuddyInputProps {
  input: string;
  isLoading: boolean;
  isSaving: boolean;
  isOnboarding: boolean;
  typingText?: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onInputChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export function BuddyInput({ input, isLoading, isSaving, isOnboarding, typingText, inputRef, onInputChange, onSubmit }: BuddyInputProps) {
  return (
    <form onSubmit={onSubmit} data-buddy-form className="px-4 py-3 border-t border-white/5">
      <div className="flex gap-2">
        {isOnboarding ? (
          <div className="flex-1 h-9 bg-white/5 border border-white/10 rounded-lg px-3 flex items-center text-xs text-white/80">
            {typingText}
            {typingText && <span className="ml-0.5 w-0.5 h-4 bg-blue-400 animate-pulse" />}
          </div>
        ) : (
          <Input
            ref={inputRef}
            value={input}
            onChange={e => onInputChange(e.target.value)}
            placeholder={BUDDY_INPUT_PLACEHOLDER}
            disabled={isLoading || isSaving}
            className="flex-1 h-9 bg-white/5 border-white/10 focus:border-blue-500/50 text-xs text-white placeholder:text-white/30 rounded-lg"
          />
        )}
        {!isOnboarding && (
          <Button
            type="submit"
            size="icon"
            className={cn('h-9 w-9 rounded-lg', BUDDY_GRADIENT_SEND_BTN)}
            disabled={isLoading || isSaving || !input.trim()}
          >
            {isLoading ? <RandomLoader size="sm" /> : <Send className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </form>
  );
}
