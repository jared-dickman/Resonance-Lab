/**
 * Chat Response Selection Logic
 * Determines appropriate response type based on user message
 * Each predicate is a single, focused check
 */

import type { ChatResponseType } from '@/lib/constants/chatResponses.constants';
import { selectRandomWithFallback } from '@/lib/utils/array/random';

function includesChordKeywords(message: string): boolean {
  return message.includes('chord') || message.includes('progression');
}

function includesRhymeKeywords(message: string): boolean {
  return message.includes('rhyme') || message.includes('rhyming');
}

function includesStructureKeywords(message: string): boolean {
  return message.includes('structure') || message.includes('organize');
}

function includesLyricKeywords(message: string): boolean {
  const keywords = ['lyric', 'line', 'verse'];
  return keywords.some(keyword => message.includes(keyword));
}

function includesGreetingKeywords(message: string): boolean {
  const greetings = ['hello', 'hi', 'hey'];
  return greetings.some(greeting => message.includes(greeting));
}

export function selectResponseType(userMessage: string): ChatResponseType {
  const lowercaseMessage = userMessage.toLowerCase();

  if (includesChordKeywords(lowercaseMessage)) return 'chordHelp';
  if (includesRhymeKeywords(lowercaseMessage)) return 'rhymeHelp';
  if (includesStructureKeywords(lowercaseMessage)) return 'structureHelp';
  if (includesLyricKeywords(lowercaseMessage)) return 'lyricHelp';
  if (includesGreetingKeywords(lowercaseMessage)) return 'greeting';

  return 'encouragement';
}

export function selectRandomResponse(responses: readonly string[]): string {
  return selectRandomWithFallback(responses, 'I can help you with that!');
}

export function calculateTypingDelay(minMs: number, maxMs: number): number {
  return minMs + Math.random() * (maxMs - minMs);
}
