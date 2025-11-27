'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Send, Sparkles, Zap, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { SearchResult } from '@/lib/types';

const THINKING_PUNS = [
  "Tuning up the search engines...",
  "Shredding through the database...",
  "Finding your jam...",
  "Dropping into the groove...",
  "Strumming through results...",
  "Picking the best tabs...",
  "Riffing on your request...",
  "Plugging into Ultimate Guitar...",
  "Cranking up the research amp...",
  "Noodling through the archives...",
  "Harmonizing with the servers...",
  "Bending some strings...",
  "Checking the setlist...",
  "Warming up the fretboard...",
  "Dialing in the tone...",
  "Running scales on your query...",
  "Hitting the right notes...",
  "Fingerpicking through files...",
  "Sliding into the search...",
  "Tapping into the data...",
  "Palm muting the noise...",
  "Sweeping through arpeggios...",
  "Pulling off a hammer-on...",
  "Vibrato-ing through results...",
  "Dropping the bass... search...",
  "Capo-ing up to the right key...",
  "Reading between the bar lines...",
  "Counting in... 1, 2, 3, 4...",
  "Loading the pedalboard...",
  "Wah-wah-ing through tabs...",
  "Distorting reality for results...",
  "Clean tone searching...",
  "Overdrive engaged...",
  "Chorus effect on the query...",
  "Delay pedal processing...",
  "Reverb-erating through servers...",
  "Flanger-ing the database...",
  "Phaser set to stun...",
  "Tremolo picking data...",
  "Power chord processing...",
  "Barre chord barricading...",
  "Open chord opening files...",
  "Seventh chord sophistication...",
  "Major key searching...",
  "Minor key melancholy loading...",
  "Pentatonic pattern matching...",
  "Blues scale browsing...",
  "Modal interchange loading...",
  "Dorian mode: engaged...",
  "Mixolydian mixup incoming...",
  "Phrygian phrasing...",
  "Lydian lifting off...",
  "Locrian... actually never mind...",
  "Circle of fifths calculating...",
  "Relative minor relating...",
  "Tritone tension building...",
  "Perfect fifth perfecting...",
  "Octave jumping...",
  "Unison loading...",
  "Checking the bridge...",
  "Adjusting the truss rod...",
  "Intonating the results...",
  "Setting the action...",
  "Locking the tuners...",
  "Winding new strings...",
  "Breaking in the picks...",
  "Rosewood reasoning...",
  "Maple neck navigating...",
  "Mahogany crunching...",
  "Alder body building...",
  "Ash-tonishing results coming...",
  "Basswood base loading...",
  "Single coil searching...",
  "Humbucker hunting...",
  "P90 processing...",
  "Active pickup activating...",
  "Piezo piecing together...",
  "Acoustic algorithm...",
  "Electric excitement...",
  "Classical computing...",
  "Flamenco flourishing...",
  "Jazz hands... I mean, jazz chords...",
  "Blues brother buffering...",
  "Rock and roll retrieving...",
  "Metal melting servers...",
  "Punk rock punching through...",
  "Indie indexing...",
  "Folk finding...",
  "Country crossfading...",
  "Reggae rhythm riding...",
  "Funk funking around...",
  "Soul searching (literally)...",
  "R&B retrieving beautifully...",
  "Gospel glory loading...",
  "Grunge grinding gears...",
  "Shoegaze staring at results...",
  "Post-rock posting results...",
  "Math rock calculating...",
  "Prog rock progressing...",
  "Djent djenting...",
  "Surf rock surfing the web...",
  "Psychedelic swirling...",
  "Britpop britting...",
  "Garage band garaging...",
  "Stadium rock scaling up...",
  "Unplugged and loading...",
  "MTV era nostalgia searching...",
  "Woodstock vibes loading...",
  "Abbey Road crossing...",
  "Sunset Strip searching...",
  "CBGB crawling...",
  "Nashville tuning up...",
  "Memphis soul searching...",
  "Chicago blues buffering...",
  "Delta slide sliding...",
  "Laurel Canyon lounging...",
  "Seattle grunge grinding...",
  "Austin weird-ing out...",
  "Liverpool lads loading...",
  "LA rock rocking...",
  "NYC punk punking...",
  "Detroit rock city-ing...",
  "Backstage pass processing...",
  "Green room loading...",
  "Sound check... check... check...",
  "Mic drop incoming...",
  "Stage dive searching...",
  "Crowd surf computing...",
  "Encore encoding...",
  "Opening act opening...",
  "Headliner heading your way...",
  "Festival finding...",
  "Setlist shuffling...",
  "Roadie retrieving...",
  "Tour bus touring...",
  "Guitar tech teching...",
  "Drum roll please...",
  "Bass drop dropping...",
  "Keyboard warrior-ing...",
  "Vocalist vocalizing...",
  "Harmony harmonizing...",
  "Melody making...",
  "Rhythm rolling...",
  "Tempo tapping...",
  "Time signature signing...",
  "Key change changing...",
  "Bridge building...",
  "Verse versing...",
  "Chorus chorusing...",
  "Outro outing...",
  "Intro introducing...",
  "Hook hooking...",
  "Breakdown breaking down...",
  "Solo solo-ing...",
  "Lick licking... wait...",
  "Riff raff-ing...",
  "Groove grooving...",
  "Pocket pocketing...",
  "Feel feeling it...",
  "Vibe vibing...",
  "Tone chasing...",
  "Gear acquiring...",
  "GAS attacking...",
  "NPD browsing... (new pedal day)...",
  "NGD loading... (new guitar day)...",
];

interface Suggestion {
  artist: string;
  title: string;
  key?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  autoDownload?: boolean;
  suggestions?: Suggestion[];
  results?: {
    chords: SearchResult[];
    tabs: SearchResult[];
  };
}

interface AgentChatProps {
  onSave: (result: SearchResult, type: 'chord' | 'tab') => void;
  isSaving: boolean;
}

export function AgentChat({ onSave, isSaving }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingPun, setThinkingPun] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setThinkingPun(THINKING_PUNS[Math.floor(Math.random() * THINKING_PUNS.length)] ?? 'Searching...');
    setIsLoading(true);

    try {
      const newHistory = [...conversationHistory, { role: 'user', content: userMessage }];

      const response = await fetch('/api/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory }),
      });

      const data = await response.json() as {
        message: string;
        autoDownload?: boolean;
        suggestions?: Suggestion[];
        results?: { chords: SearchResult[]; tabs: SearchResult[] };
      };

      setConversationHistory([...newHistory, { role: 'assistant', content: data.message }]);

      // Auto-download top chord if agent signals clear match
      if (data.autoDownload && data.results?.chords?.[0]) {
        onSave(data.results.chords[0], 'chord');
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message,
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message,
          suggestions: data.suggestions,
          results: data.results,
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectResult = (result: SearchResult, type: 'chord' | 'tab') => {
    onSave(result, type);
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    const query = `${suggestion.title} by ${suggestion.artist}`;
    setInput(query);
    // Auto-submit
    setTimeout(() => {
      const form = document.querySelector('form');
      form?.requestSubmit();
    }, 0);
  };

  return (
    <div className="flex flex-col h-[400px]">
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 p-3 bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg mb-3 relative">
        <AnimatePresence mode="wait">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center text-muted-foreground text-sm py-8"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Bot className="h-12 w-12 mx-auto mb-3 text-primary/60" />
              </motion.div>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center justify-center gap-2 mb-2"
              >
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <span className="font-medium text-foreground/80">Your Guitar Sidekick</span>
                <Zap className="h-4 w-4 text-yellow-500" />
              </motion.div>
              <p className="text-xs opacity-70">What are we learning today?</p>
              <p className="text-xs mt-1 opacity-50">e.g. &quot;I wanna play Something by the Beatles&quot;</p>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.map((message, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2, delay: i * 0.05 }}
            className={cn(
              "flex",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-[85%] rounded-lg px-3 py-2 text-sm shadow-sm",
              message.role === 'user'
                ? "bg-primary text-primary-foreground"
                : "bg-background border border-border/50"
            )}>
              <p className="whitespace-pre-wrap">{message.content}</p>

              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, idx) => (
                    <button
                      key={`${suggestion.artist}-${suggestion.title}-${idx}`}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      disabled={isLoading || isSaving}
                      className="px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 hover:bg-primary/20 transition-colors text-xs font-medium disabled:opacity-50"
                    >
                      {suggestion.title} {suggestion.key && <span className="opacity-60">({suggestion.key})</span>}
                    </button>
                  ))}
                </div>
              )}

              {message.results && (message.results.chords.length > 0 || message.results.tabs.length > 0) && (
                <div className="mt-3 space-y-2">
                  {message.results.chords.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1 opacity-70">Chords:</p>
                      {message.results.chords.slice(0, 3).map(result => (
                        <button
                          key={result.id}
                          onClick={() => handleSelectResult(result, 'chord')}
                          disabled={isSaving}
                          className="w-full text-left p-2 rounded border hover:bg-accent/50 transition-colors mb-1 disabled:opacity-50"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-xs">{result.title}</span>
                            <span className="text-xs text-muted-foreground">
                              ⭐ {result.rating.toFixed(1)} ({result.votes})
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">{result.artist}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {message.results.tabs.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1 opacity-70">Tabs:</p>
                      {message.results.tabs.slice(0, 3).map(result => (
                        <button
                          key={result.id}
                          onClick={() => handleSelectResult(result, 'tab')}
                          disabled={isSaving}
                          className="w-full text-left p-2 rounded border hover:bg-accent/50 transition-colors mb-1 disabled:opacity-50"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-xs">{result.title}</span>
                            <span className="text-xs text-muted-foreground">
                              ⭐ {result.rating.toFixed(1)} ({result.votes})
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">{result.artist}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-start"
            >
              <div className="bg-background border border-primary/20 rounded-lg px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="h-4 w-4 text-primary" />
                  </motion.div>
                  <span className="text-xs text-muted-foreground">{thinkingPun}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Find a song..."
          disabled={isLoading || isSaving}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={isLoading || isSaving || !input.trim()}>
          {isLoading ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
