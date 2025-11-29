'use client';

import { useRef, useEffect, type FormEvent, type RefObject } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Minimize2, Maximize2, GripHorizontal, Home, Music, Users, PenLine, Guitar, BookOpen, Clock, Piano, SlidersHorizontal, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { BuddyMessage, Suggestion } from '@/lib/types/buddy.types';
import type { SearchResult } from '@/lib/types';
import {
  ContextChip,
  SearchResultButton,
  StructuredBlock,
  EmptyState,
  ThinkingIndicator,
} from './BuddySubComponents';
import {
  BUDDY_NAV_ROUTES,
  BUDDY_MAX_VISIBLE_RESULTS,
  BUDDY_INPUT_PLACEHOLDER,
  BUDDY_ICON_GLOW_ANIMATION,
  BUDDY_ICON_GLOW_TRANSITION,
  BUDDY_SCROLL_CONTAINER_CLASS,
} from '@/lib/constants/buddy.constants';

const NAV_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home, music: Music, users: Users, pen: PenLine, guitar: Guitar,
  book: BookOpen, clock: Clock, piano: Piano, sliders: SlidersHorizontal,
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

export function BuddyHeader({ context, isStatic, isOnboarding, isMinimized, onMinimize, onClose, onSkip }: BuddyHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between px-4 py-3 border-b border-white/5 select-none', !isStatic && 'cursor-grab active:cursor-grabbing')}>
      <div className="flex items-center gap-2.5">
        {!isStatic && <GripHorizontal className="h-4 w-4 text-white/20" />}
        <motion.div
          animate={BUDDY_ICON_GLOW_ANIMATION}
          transition={BUDDY_ICON_GLOW_TRANSITION}
          className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center border border-white/10"
        >
          <Bot className="h-4 w-4 text-blue-400" />
        </motion.div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-white/90">Buddy</span>
          {!isMinimized && <ContextChip page={context.page} artist={context.artist} song={context.song} />}
        </div>
      </div>
      {isOnboarding ? (
        <Button variant="outline" size="sm" className="h-6 px-2 text-xs text-white/40 hover:text-white/80 hover:bg-white/10" onClick={onSkip}>
          Skip
        </Button>
      ) : (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-white/40 hover:text-white/80 hover:bg-white/10" onClick={(e) => { e.stopPropagation(); onMinimize(); }}>
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-white/40 hover:text-white/80 hover:bg-white/10" onClick={(e) => { e.stopPropagation(); onClose(); }}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
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
  thinkingPun: string;
  placeholder: string;
  isSaving: boolean;
  onSelectSuggestion: (suggestion: Suggestion) => void;
  onSelectResult: (result: SearchResult, type: 'chord' | 'tab') => void;
}

export function BuddyMessageList({ messages, isLoading, thinkingPun, placeholder, isSaving, onSelectSuggestion, onSelectResult }: BuddyMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isEmptyState = messages.length === 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={BUDDY_SCROLL_CONTAINER_CLASS}>
      <AnimatePresence mode="wait">
        {isEmptyState && <EmptyState placeholder={placeholder} />}
      </AnimatePresence>

      {messages.map((message, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
        >
          <div className={cn(
            'max-w-[85%] rounded-xl px-3 py-2 text-xs',
            message.role === 'user'
              ? 'bg-gradient-to-r from-blue-500/80 to-purple-500/80 text-white'
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
                {message.results.chords.length > 0 && (
                  <div>
                    <div className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Chords</div>
                    {message.results.chords.slice(0, BUDDY_MAX_VISIBLE_RESULTS).map(result => (
                      <SearchResultButton key={result.id} result={result} type="chord" onClick={onSelectResult} disabled={isSaving} />
                    ))}
                  </div>
                )}
                {message.results.tabs.length > 0 && (
                  <div>
                    <div className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Tabs</div>
                    {message.results.tabs.slice(0, BUDDY_MAX_VISIBLE_RESULTS).map(result => (
                      <SearchResultButton key={result.id} result={result} type="tab" onClick={onSelectResult} disabled={isSaving} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      ))}

      <AnimatePresence>
        {isLoading && <ThinkingIndicator pun={thinkingPun} />}
      </AnimatePresence>

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
            className="h-9 w-9 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0 rounded-lg"
            disabled={isLoading || isSaving || !input.trim()}
          >
            {isLoading ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </form>
  );
}
