'use client';

import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useIntervalEffect } from '@/lib/hooks/useIntervalEffect';
import { Send, Bot, X, Minimize2, Maximize2, GripHorizontal, Home, Music, Users, PenLine, Guitar, BookOpen, Clock, Piano, SlidersHorizontal } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  ContextChip,
  SearchResultButton,
  StructuredBlock,
  EmptyState,
  ThinkingIndicator,
} from '@/components/agent/BuddySubComponents';
import { cn, selectRandomWithFallback } from '@/lib/utils';
import { useBuddy } from '@/lib/contexts/BuddyContext';
import type { SearchResult } from '@/lib/types';
import type { OnboardingState } from '@/lib/hooks/useOnboardingDemo';
import placeholders from '@/lib/data/placeholders.json';
import {
  BUDDY_PLACEHOLDER_INTERVAL_MS,
  BUDDY_MAX_VISIBLE_RESULTS,
  BUDDY_API_ENDPOINT,
  BUDDY_ERROR_MESSAGE,
  BUDDY_DEFAULT_THINKING,
  BUDDY_INPUT_PLACEHOLDER,
  BUDDY_DEFAULT_PLACEHOLDER,
  BUDDY_THINKING_PUNS,
  BUDDY_FIRST_LOAD_VARIANTS,
  BUDDY_PANEL_VARIANTS,
  BUDDY_GLOW_VARIANTS,
  BUDDY_MINIMIZED_VARIANTS,
  BUDDY_FIRST_LOAD_DELAY_MS,
  BUDDY_POSITION_STORAGE_KEY,
  BUDDY_DEFAULT_POSITION,
  BUDDY_AUTOFOCUS_DELAY_MS,
  BUDDY_ENTRANCE_DELAY_MS,
  BUDDY_NAV_ROUTES,
  BUDDY_PANEL_WIDTH,
  BUDDY_PANEL_HEIGHT,
} from '@/lib/constants/buddy.constants';

/** Icon map for nav routes - keeps component DRY */
const NAV_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  music: Music,
  users: Users,
  pen: PenLine,
  guitar: Guitar,
  book: BookOpen,
  clock: Clock,
  piano: Piano,
  sliders: SlidersHorizontal,
};

interface Suggestion {
  artist: string;
  title: string;
}

interface StructuredData {
  type: string;
  [key: string]: unknown;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  autoDownload?: boolean;
  suggestions?: Suggestion[];
  structured?: StructuredData;
  results?: {
    chords: SearchResult[];
    tabs: SearchResult[];
  };
}

interface CoreAgentBuddyProps {
  onSave?: (result: SearchResult, type: 'chord' | 'tab') => void;
  isSaving?: boolean;
  /** When provided, renders in static onboarding demo mode */
  onboarding?: OnboardingState;
}

const PANEL_WIDTH = BUDDY_PANEL_WIDTH;
const PANEL_HEIGHT = BUDDY_PANEL_HEIGHT;
const EDGE_PADDING = 20;

/** Clamp position within viewport bounds */
function clampPosition(x: number, y: number): { x: number; y: number } {
  if (typeof window === 'undefined') return { x, y };
  return {
    x: Math.max(EDGE_PADDING, Math.min(x, window.innerWidth - PANEL_WIDTH - EDGE_PADDING)),
    y: Math.max(EDGE_PADDING, Math.min(y, window.innerHeight - PANEL_HEIGHT - EDGE_PADDING)),
  };
}

/** Get centered position within viewport */
function getCenteredPosition(): { x: number; y: number } {
  if (typeof window === 'undefined') return { x: 100, y: 100 };
  return clampPosition(
    Math.round((window.innerWidth - PANEL_WIDTH) / 2),
    Math.round((window.innerHeight - PANEL_HEIGHT) / 2)
  );
}

/** Load saved position from localStorage */
function loadSavedPosition(): { x: number; y: number } {
  if (typeof window === 'undefined') return getCenteredPosition();
  try {
    const saved = localStorage.getItem(BUDDY_POSITION_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as { x: number; y: number };
      return clampPosition(parsed.x, parsed.y);
    }
  } catch {
    // Invalid JSON
  }
  return getCenteredPosition();
}

export function CoreAgentBuddy({ onSave, isSaving = false, onboarding }: CoreAgentBuddyProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { context, isOpen, setIsOpen } = useBuddy();
  const isOnboarding = !!onboarding;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingPun, setThinkingPun] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [position, setPosition] = useState(BUDDY_DEFAULT_POSITION);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: string; content: string }>
  >([]);

  // Delay entrance by 1s
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), BUDDY_ENTRANCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // Load saved position on mount
  useEffect(() => {
    setPosition(loadSavedPosition());
  }, []);

  const handleDragEnd = useCallback(() => {
    localStorage.setItem(BUDDY_POSITION_STORAGE_KEY, JSON.stringify(position));
  }, [position]);

  // Track first load completion
  const handleAnimationComplete = useCallback(() => {
    if (isFirstLoad) {
      setTimeout(() => setIsFirstLoad(false), BUDDY_FIRST_LOAD_DELAY_MS);
    }
  }, [isFirstLoad]);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(() =>
    selectRandomWithFallback(placeholders, BUDDY_DEFAULT_PLACEHOLDER)
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Derived state - use onboarding values when in demo mode
  const displayMessages = isOnboarding ? (onboarding.messages as Message[]) : messages;
  const displayLoading = isOnboarding ? onboarding.isLoading : isLoading;
  const displayInput = isOnboarding ? onboarding.typingText : input;

  const isEmptyState = displayMessages.length === 0;
  const shouldRotatePlaceholder = isEmptyState && isOpen && !isMinimized && !isOnboarding;

  // Always expand when opened and focus input
  useEffect(() => {
    if (isOpen) {
      setIsMinimized(false);
      setTimeout(() => inputRef.current?.focus(), BUDDY_AUTOFOCUS_DELAY_MS);
    }
  }, [isOpen]);

  // Also focus when minimized state changes (restore from minimized)
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), BUDDY_AUTOFOCUS_DELAY_MS);
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages]);

  useIntervalEffect(
    () => setCurrentPlaceholder(selectRandomWithFallback(placeholders, BUDDY_DEFAULT_PLACEHOLDER)),
    BUDDY_PLACEHOLDER_INTERVAL_MS,
    shouldRotatePlaceholder
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setThinkingPun(selectRandomWithFallback(BUDDY_THINKING_PUNS, BUDDY_DEFAULT_THINKING));
    setIsLoading(true);

    try {
      const newHistory = [...conversationHistory, { role: 'user', content: userMessage }];

      const response = await fetch(BUDDY_API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory, context }),
      });

      const data = (await response.json()) as {
        message: string;
        autoDownload?: boolean;
        suggestions?: Suggestion[];
        structured?: StructuredData;
        results?: { chords: SearchResult[]; tabs: SearchResult[] };
        navigateTo?: string;
      };

      setConversationHistory([...newHistory, { role: 'assistant', content: data.message }]);

      // Handle navigation if agent requested it
      if (data.navigateTo) {
        router.push(data.navigateTo);
      }

      const firstChord = data.results?.chords?.[0];
      const shouldAutoDownload = data.autoDownload && firstChord && onSave;
      if (shouldAutoDownload) {
        onSave(firstChord, 'chord');
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: data.message,
            suggestions: data.suggestions,
            structured: data.structured,
            results: data.results,
          },
        ]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: BUDDY_ERROR_MESSAGE }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectResult = (result: SearchResult, type: 'chord' | 'tab') => {
    onSave?.(result, type);
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    const query = `${suggestion.title} by ${suggestion.artist}`;
    setInput(query);
    setTimeout(() => {
      const form = document.querySelector('[data-buddy-form]');
      (form as HTMLFormElement)?.requestSubmit();
    }, 0);
  };

  // In onboarding mode, show immediately without isReady/isOpen checks
  const shouldShow = isOnboarding || (isReady && isOpen);

  return (
    <AnimatePresence>
      {shouldShow && (
        <>
          {/* Mobile: Full-screen sheet (hidden during onboarding) */}
          {!isOnboarding && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 md:hidden bg-slate-950"
          >
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 8px rgba(59, 130, 246, 0.5)',
                        '0 0 16px rgba(147, 51, 234, 0.5)',
                        '0 0 8px rgba(59, 130, 246, 0.5)',
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center border border-white/10"
                  >
                    <Bot className="h-5 w-5 text-blue-400" />
                  </motion.div>
                  <div>
                    <span className="font-semibold text-white">Buddy</span>
                    <ContextChip page={context.page} artist={context.artist} song={context.song} />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Mobile Nav */}
              <nav className="border-b border-white/5 bg-white/[0.02] overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                <div className="flex items-center gap-1 px-4 py-2">
                  {BUDDY_NAV_ROUTES.map(route => {
                    const Icon = NAV_ICONS[route.icon];
                    const isActive = pathname === route.path || pathname?.startsWith(route.path);
                    return (
                      <button
                        key={route.path}
                        onClick={() => { router.push(route.path); setIsOpen(false); }}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0',
                          isActive ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'
                        )}
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        <span>{route.label}</span>
                      </button>
                    );
                  })}
                </div>
              </nav>

              {/* Mobile Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                <AnimatePresence mode="wait">
                  {isEmptyState && <EmptyState placeholder={currentPlaceholder} />}
                </AnimatePresence>

                {messages.map((message, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-4 py-3 text-sm',
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                          : 'bg-white/5 border border-white/10 text-white/80'
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {message.structured && <StructuredBlock data={message.structured} />}
                    </div>
                  </motion.div>
                ))}

                <AnimatePresence>
                  {isLoading && <ThinkingIndicator pun={thinkingPun} />}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Mobile Input */}
              <form onSubmit={handleSubmit} className="px-4 py-4 border-t border-white/10 bg-slate-900/50">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={BUDDY_INPUT_PLACEHOLDER}
                    disabled={isLoading || isSaving}
                    className="flex-1 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl text-base"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl"
                    disabled={isLoading || isSaving || !input.trim()}
                  >
                    {isLoading ? <Spinner className="h-5 w-5" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
          )}

          {/* Desktop: Draggable floating panel (static in onboarding mode) */}
          <motion.div
            drag={!isOnboarding}
            dragMomentum={false}
            dragElastic={0}
            onDrag={isOnboarding ? undefined : (_, info) => setPosition(clampPosition(position.x + info.delta.x, position.y + info.delta.y))}
            onDragEnd={isOnboarding ? undefined : handleDragEnd}
            variants={isFirstLoad ? BUDDY_FIRST_LOAD_VARIANTS : BUDDY_PANEL_VARIANTS}
            initial="closed"
            animate="open"
            exit="closed"
            onAnimationComplete={handleAnimationComplete}
            className={cn('fixed z-50', isOnboarding ? 'block' : 'hidden md:block')}
            style={{ touchAction: 'none', left: isOnboarding ? '50%' : position.x, top: isOnboarding ? '50%' : position.y, transform: isOnboarding ? 'translate(-50%, -50%)' : undefined }}
          >
          {/* Ambient floating glow - subtle, always present */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-blue-500/8 via-transparent to-purple-500/8 blur-xl -z-20"
          />
          {/* First load entrance glow - fades out */}
          {isFirstLoad && (
            <motion.div
              variants={BUDDY_GLOW_VARIANTS}
              initial="hidden"
              animate="visible"
              className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-blue-400/15 via-indigo-500/10 to-purple-400/15 blur-2xl -z-20"
            />
          )}
          {/* Bottom shadow for floating effect */}
          <div className="absolute -bottom-3 left-4 right-4 h-6 bg-black/20 blur-xl rounded-full -z-30" />

          <motion.div
            variants={BUDDY_MINIMIZED_VARIANTS}
            animate={isMinimized ? 'minimized' : 'open'}
            className={cn(
              'rounded-2xl overflow-hidden',
              'bg-gradient-to-b from-slate-900/95 to-slate-950/95',
              'backdrop-blur-xl',
              'border border-white/10',
              'shadow-2xl shadow-black/50',
              isMinimized ? 'cursor-pointer' : '',
              isFirstLoad && 'ring-2 ring-blue-500/50 ring-offset-2 ring-offset-transparent'
            )}
            onClick={isMinimized ? () => setIsMinimized(false) : undefined}
          >
            {/* Glowing border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 opacity-50 blur-sm -z-10" />

            {/* Header - draggable (static in onboarding) */}
            <div className={cn('flex items-center justify-between px-4 py-3 border-b border-white/5 select-none', !isOnboarding && 'cursor-grab active:cursor-grabbing')}>
              <div className="flex items-center gap-2.5">
                {!isOnboarding && <GripHorizontal className="h-4 w-4 text-white/20" />}
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 8px rgba(59, 130, 246, 0.5)',
                      '0 0 16px rgba(147, 51, 234, 0.5)',
                      '0 0 8px rgba(59, 130, 246, 0.5)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center border border-white/10"
                >
                  <Bot className="h-4 w-4 text-blue-400" />
                </motion.div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-white/90">Buddy</span>
                  {!isMinimized && (
                    <ContextChip page={context.page} artist={context.artist} song={context.song} />
                  )}
                </div>
              </div>
              {isOnboarding ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-white/40 hover:text-white/80 hover:bg-white/10"
                  onClick={onboarding.skip}
                >
                  Skip
                </Button>
              ) : (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-white/40 hover:text-white/80 hover:bg-white/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMinimized(!isMinimized);
                    }}
                  >
                    {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-white/40 hover:text-white/80 hover:bg-white/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Content - hidden when minimized */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 560 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col"
                >
                  {/* Mini Nav Bar - Stripe/Linear inspired with horizontal scroll */}
                  <nav className="relative border-b border-white/5 bg-white/[0.02]">
                    {/* Scroll fade indicators */}
                    <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-slate-900/95 to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-slate-900/95 to-transparent z-10 pointer-events-none" />
                    <div className="flex items-center gap-0.5 px-4 py-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {BUDDY_NAV_ROUTES.map(route => {
                        const Icon = NAV_ICONS[route.icon];
                        const isActive = pathname === route.path || pathname?.startsWith(route.path);
                        return (
                          <button
                            key={route.path}
                            onClick={() => router.push(route.path)}
                            className={cn(
                              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-all whitespace-nowrap shrink-0',
                              isActive
                                ? 'bg-white/10 text-white shadow-sm'
                                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                            )}
                          >
                            {Icon && <Icon className="h-3.5 w-3.5" />}
                            <span>{route.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </nav>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <AnimatePresence mode="wait">
                      {isEmptyState && <EmptyState placeholder={currentPlaceholder} />}
                    </AnimatePresence>

                    {messages.map((message, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
                      >
                        <div
                          className={cn(
                            'max-w-[85%] rounded-xl px-3 py-2 text-xs',
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-blue-500/80 to-purple-500/80 text-white'
                              : 'bg-white/5 border border-white/10 text-white/80'
                          )}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>

                          {message.structured && <StructuredBlock data={message.structured} />}

                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {message.suggestions.map((suggestion, idx) => (
                                <button
                                  key={`${suggestion.artist}-${suggestion.title}-${idx}`}
                                  onClick={() => handleSelectSuggestion(suggestion)}
                                  disabled={isLoading || isSaving}
                                  className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10 hover:border-white/20 hover:bg-white/15 transition-all text-[10px] font-medium text-white/70 disabled:opacity-50"
                                >
                                  {suggestion.title}
                                </button>
                              ))}
                            </div>
                          )}

                          {message.results &&
                            (message.results.chords.length > 0 || message.results.tabs.length > 0) && (
                              <div className="mt-2 space-y-2">
                                {message.results.chords.length > 0 && (
                                  <div>
                                    <div className="text-[9px] uppercase tracking-widest text-white/40 mb-1">
                                      Chords
                                    </div>
                                    {message.results.chords.slice(0, BUDDY_MAX_VISIBLE_RESULTS).map(result => (
                                      <SearchResultButton
                                        key={result.id}
                                        result={result}
                                        type="chord"
                                        onClick={handleSelectResult}
                                        disabled={isSaving}
                                      />
                                    ))}
                                  </div>
                                )}
                                {message.results.tabs.length > 0 && (
                                  <div>
                                    <div className="text-[9px] uppercase tracking-widest text-white/40 mb-1">
                                      Tabs
                                    </div>
                                    {message.results.tabs.slice(0, BUDDY_MAX_VISIBLE_RESULTS).map(result => (
                                      <SearchResultButton
                                        key={result.id}
                                        result={result}
                                        type="tab"
                                        onClick={handleSelectResult}
                                        disabled={isSaving}
                                      />
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

                  {/* Input */}
                  <form onSubmit={handleSubmit} data-buddy-form className="px-4 py-3 border-t border-white/5">
                    <div className="flex gap-2">
                      <Input
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={BUDDY_INPUT_PLACEHOLDER}
                        disabled={isLoading || isSaving}
                        className="flex-1 h-9 bg-white/5 border-white/10 focus:border-blue-500/50 text-xs text-white placeholder:text-white/30 rounded-lg"
                      />
                      <Button
                        type="submit"
                        size="icon"
                        className="h-9 w-9 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0 rounded-lg"
                        disabled={isLoading || isSaving || !input.trim()}
                      >
                        {isLoading ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
