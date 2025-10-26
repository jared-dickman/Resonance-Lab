/**
 * Chat Interface Component
 * AI songwriting assistant with message handling
 * REFACTORED: Clean code with extracted utilities
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Sparkles, Lightbulb, Music, PenTool, MessageSquare } from 'lucide-react';

import type { SongDraft } from '@/components/songwriter/types/legacy';
import { cn } from '@/lib/utils';
import { PanelLabel } from '@/components/ui/panel-label';
import { InfoCard } from '@/components/ui/info-card';
import { SimpleTooltip } from '@/components/ui/simple-tooltip';
import { QUICK_TIPS } from '@/lib/constants/help-content.constants';
import {
  CHAT_RESPONSES,
  WELCOME_MESSAGE,
} from '@/lib/constants/chatResponses.constants';
import {
  selectResponseType,
  selectRandomResponse,
  calculateTypingDelay,
} from '@/lib/utils/songwriter/chatResponseSelector';
import { CHAT_CONFIG, ANIMATION_DURATION, ANIMATION_DELAY } from '@/lib/constants/songwriter.constants';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: {
    type: 'lyrics' | 'chord' | 'structure';
    content: string;
  }[];
}

interface ChatInterfaceProps {
  onLyricsSuggestion: (lyrics: string) => void;
  onChordSuggestion: (chord: string) => void;
  currentDraft: SongDraft;
}

function createWelcomeMessage(): Message {
  return {
    id: '1',
    role: 'assistant',
    content: WELCOME_MESSAGE,
    timestamp: new Date(),
  };
}

function createUserMessage(content: string): Message {
  return {
    id: crypto.randomUUID(),
    role: 'user',
    content,
    timestamp: new Date(),
  };
}

function createAssistantMessage(content: string): Message {
  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    content,
    timestamp: new Date(),
  };
}

function generateAIResponse(userInput: string): string {
  const responseType = selectResponseType(userInput);
  const responses = CHAT_RESPONSES[responseType];
  return selectRandomResponse(responses);
}

export default function ChatInterface({
  onLyricsSuggestion: _onLyricsSuggestion,
  onChordSuggestion: _onChordSuggestion,
  currentDraft: _currentDraft,
}: ChatInterfaceProps): React.JSX.Element {
  const [messages, setMessages] = useState<Message[]>([createWelcomeMessage()]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  async function handleSend(): Promise<void> {
    if (!input.trim()) return;

    const userMessage = createUserMessage(input);
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const delay = calculateTypingDelay(CHAT_CONFIG.TYPING_DELAY_MIN, CHAT_CONFIG.TYPING_DELAY_MAX);

    setTimeout(() => {
      const response = generateAIResponse(input);
      const assistantMessage = createAssistantMessage(response);
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, delay);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSend();
    }
  }

  const quickPrompts = [
    { icon: PenTool, label: 'Write a verse', prompt: 'Help me write a verse about' },
    {
      icon: Music,
      label: 'Suggest chords',
      prompt: 'What chord progression works for an emotional ballad?',
    },
    { icon: Lightbulb, label: 'Brainstorm themes', prompt: 'Give me some creative theme ideas' },
    { icon: Sparkles, label: 'Rhyme finder', prompt: 'Help me find rhymes for' },
  ];

  return (
    <>
      <CardHeader className="border-b">
        <PanelLabel
          icon={<MessageSquare className="w-5 h-5" />}
          title="AI Songwriting Assistant"
          description="Ask for lyrics, chord suggestions, rhymes, and creative direction"
        />
      </CardHeader>

      <CardContent className="p-0 flex flex-col h-[calc(100%-80px)]">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <InfoCard title="Quick Start" variant="tip" defaultVisible={messages.length <= 1}>
              <ul className="space-y-1 text-xs">
                {QUICK_TIPS.songwriter.map((tip, i) => (
                  <li key={i}>• {tip}</li>
                ))}
              </ul>
            </InfoCard>

            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </AnimatePresence>

            {isTyping && <TypingIndicator />}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-3 bg-muted/30">
          <QuickPrompts prompts={quickPrompts} onSelectPrompt={setInput} />

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for lyrics, chords, or songwriting advice..."
              className="flex-1"
              disabled={isTyping}
              maxLength={CHAT_CONFIG.MAX_MESSAGE_LENGTH}
            />
            <SimpleTooltip content="Send message (or press Enter)">
              <Button size="icon" onClick={handleSend} disabled={!input.trim() || isTyping}>
                <Send className="w-4 h-4" />
              </Button>
            </SimpleTooltip>
          </div>
        </div>
      </CardContent>
    </>
  );
}

function ChatMessage({ message }: { message: Message }): React.JSX.Element {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: ANIMATION_DURATION.FADE_OUT / 1000 }}
      className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[85%] rounded-lg p-3',
          message.role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted border border-border'
        )}
      >
        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
        <div className="text-xs opacity-60 mt-1">
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </motion.div>
  );
}

function TypingIndicator(): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="bg-muted border border-border rounded-lg p-3">
        <div className="flex gap-1">
          <TypingDot delay={ANIMATION_DELAY.TYPING_DOT_1} />
          <TypingDot delay={ANIMATION_DELAY.TYPING_DOT_2} />
          <TypingDot delay={ANIMATION_DELAY.TYPING_DOT_3} />
        </div>
      </div>
    </motion.div>
  );
}

function TypingDot({ delay }: { delay: number }): React.JSX.Element {
  return (
    <motion.div
      className="w-2 h-2 bg-primary rounded-full"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: ANIMATION_DURATION.TYPING_DOT / 1000, repeat: Infinity, delay: delay / 1000 }}
    />
  );
}

interface QuickPromptsProps {
  prompts: Array<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    prompt: string;
  }>;
  onSelectPrompt: (prompt: string) => void;
}

function QuickPrompts({ prompts, onSelectPrompt }: QuickPromptsProps): React.JSX.Element {
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {prompts.map((prompt, idx) => (
        <motion.div key={idx} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-primary/10 gap-1.5"
            onClick={() => onSelectPrompt(prompt.prompt)}
          >
            <prompt.icon className="w-3 h-3" />
            {prompt.label}
          </Badge>
        </motion.div>
      ))}
    </div>
  );
}
