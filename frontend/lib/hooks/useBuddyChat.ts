'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { BuddyMessage, BuddyApiResponse, Suggestion } from '@/lib/types/buddy.types';
import type { SearchResult } from '@/lib/types';
import { selectRandomWithFallback } from '@/lib/utils';
import {
  BUDDY_API_ENDPOINT,
  BUDDY_ERROR_MESSAGE,
  BUDDY_DEFAULT_THINKING,
  BUDDY_THINKING_PUNS,
} from '@/lib/constants/buddy.constants';

interface UseBuddyChatOptions {
  context: { page: string; artist?: string; song?: string };
  onSave?: (result: SearchResult, type: 'chord' | 'tab') => void;
}

export function useBuddyChat({ context, onSave }: UseBuddyChatOptions) {
  const router = useRouter();
  const [messages, setMessages] = useState<BuddyMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingPun, setThinkingPun] = useState('');
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: string; content: string }>
  >([]);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

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

      const data = (await response.json()) as BuddyApiResponse;

      setConversationHistory([...newHistory, { role: 'assistant', content: data.message }]);

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
  }, [isLoading, conversationHistory, context, router, onSave]);

  const selectSuggestion = useCallback((suggestion: Suggestion) => {
    const query = `${suggestion.title} by ${suggestion.artist}`;
    sendMessage(query);
  }, [sendMessage]);

  const selectResult = useCallback((result: SearchResult, type: 'chord' | 'tab') => {
    onSave?.(result, type);
  }, [onSave]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    thinkingPun,
    sendMessage,
    selectSuggestion,
    selectResult,
  };
}
