'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Sparkles, Lightbulb, Music, PenTool, Bot } from 'lucide-react';
import type { SongDraft } from '@/components/songwriter/types/legacy';
import { cn } from '@/lib/utils';

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

const STUBBED_RESPONSES = {
  greeting: [
    "Hey there! I'm here to help you write an amazing song. What's inspiring you today?",
    "Welcome! Let's create something magical together. What kind of song are you working on?",
    "Ready to write? Tell me about the vibe or emotion you're going for!",
  ],
  lyricHelp: [
    'Here are some lyric ideas based on your theme:\n\n• "Dancing through the shadows, chasing golden light"\n• "Your voice echoes in the silence of my mind"\n• "We built castles out of moments that would never last"\n\nWould you like me to expand on any of these?',
    'Let me suggest some lines that capture that feeling:\n\n• "Time slips away like sand between our fingers"\n• "Every heartbeat sounds like thunder in the rain"\n• "I\'m searching for the words you\'ll never say"\n\nShould I explore a different angle?',
    'How about these opening lines:\n\n• "Midnight conversations with the stars above"\n• "I found freedom in the places I got lost"\n• "Your memory\'s a melody I can\'t forget"\n\nLet me know if you\'d like variations!',
  ],
  chordHelp: [
    'For that emotional vibe, try this progression:\n\n🎵 Am → F → C → G\n\nThis creates a bittersweet, introspective feeling. Want me to suggest variations?',
    "Here's a powerful progression that builds tension:\n\n🎵 C → Em → Am → F → G\n\nIt moves from stability to emotion and back. Should I adjust the complexity?",
    "This progression has a modern, uplifting feel:\n\n🎵 G → D → Em → C\n\nIt's the pop axis in G major - super catchy! Want alternatives?",
  ],
  structureHelp: [
    'Classic song structure suggestion:\n\n📋 Verse 1 → Pre-Chorus → Chorus\n📋 Verse 2 → Pre-Chorus → Chorus\n📋 Bridge → Final Chorus (x2)\n\nThis gives you space to tell a story and build momentum!',
    "Here's a modern structure with impact:\n\n📋 Intro (instrumental)\n📋 Verse 1 → Chorus\n📋 Verse 2 → Chorus\n📋 Bridge → Breakdown\n📋 Final Chorus (extended)\n\nThe early chorus hook grabs attention immediately!",
  ],
  rhymeHelp: [
    "Looking for rhymes? Here are some that match your line:\n\n🎯 Perfect rhymes: 'night/light/flight/sight'\n🎯 Near rhymes: 'time/climb/find/mind'\n🎯 Internal rhymes: 'dream/seem/beam/stream'\n\nWhich direction feels right?",
  ],
  encouragement: [
    "That's a strong start! The emotion really comes through. What section are you working on next?",
    'I love where this is going! Your imagery is vivid. Want to develop the chorus more?',
    'Great choice! That chord change adds exactly the tension you need. Keep going!',
  ],
};

const getResponseType = (message: string): keyof typeof STUBBED_RESPONSES => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('chord') || lowerMessage.includes('progression')) return 'chordHelp';
  if (lowerMessage.includes('rhyme') || lowerMessage.includes('rhyming')) return 'rhymeHelp';
  if (lowerMessage.includes('structure') || lowerMessage.includes('organize'))
    return 'structureHelp';
  if (
    lowerMessage.includes('lyric') ||
    lowerMessage.includes('line') ||
    lowerMessage.includes('verse')
  )
    return 'lyricHelp';
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey'))
    return 'greeting';

  // Default to encouragement for other messages
  return 'encouragement';
};

export default function ChatInterface({
  onLyricsSuggestion: _onLyricsSuggestion,
  onChordSuggestion: _onChordSuggestion,
  currentDraft: _currentDraft,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hey! I'm your AI songwriting partner. I can help you with:\n\n✨ Lyric ideas and rhyme suggestions\n🎵 Chord progressions and harmony\n📝 Song structure and arrangement\n💡 Creative brainstorming\n\nWhat would you like to work on first?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(
      () => {
        const responseType = getResponseType(input);
        const responses = STUBBED_RESPONSES[responseType];
        const response = responses[Math.floor(Math.random() * responses.length)];

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response ?? 'I can help you with that!',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
      },
      1000 + Math.random() * 1000
    );
  };

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
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          AI Songwriting Assistant
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 flex flex-col h-[calc(100%-80px)]">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map(message => (
                <motion.div
                  key={message.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
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
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-muted border border-border rounded-lg p-3">
                  <div className="flex gap-1">
                    <motion.div
                      className="w-2 h-2 bg-primary rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-primary rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-primary rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Quick Prompts */}
        <div className="border-t p-3 bg-muted/30">
          <div className="flex flex-wrap gap-2 mb-3">
            {quickPrompts.map((prompt, idx) => (
              <motion.div key={idx} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 gap-1.5"
                  onClick={() => setInput(prompt.prompt)}
                >
                  <prompt.icon className="w-3 h-3" />
                  {prompt.label}
                </Badge>
              </motion.div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask for lyrics, chords, or songwriting advice..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button size="icon" onClick={handleSend} disabled={!input.trim() || isTyping}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </>
  );
}
