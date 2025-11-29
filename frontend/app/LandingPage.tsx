'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { useReducedMotion } from '@/components/ui/ai/hooks/useReducedMotion';
import { useBuddyDemo } from '@/lib/hooks/useBuddyDemo';
import { BUDDY_CAPABILITIES, type DemoState } from '@/lib/constants/demo.constants';
import { BUDDY_FIRST_LOAD_VARIANTS, BUDDY_GLOW_VARIANTS } from '@/lib/constants/buddy.constants';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { pageRoutes } from '@/lib/routes';

const HERO_TEXT_VARIANTS = {
  hidden: { opacity: 0, filter: 'blur(12px)', y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    transition: { duration: 0.8, delay, ease: 'easeOut' as const },
  }),
};

function NebulaBackground({ reducedMotion }: { reducedMotion: boolean }) {
  if (reducedMotion) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-sapphire-950 via-background to-sapphire-900/30" />
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
      >
        {/* Large nebula clouds */}
        {[
          { x: '20%', y: '30%', size: 600, color: 'rgba(99, 102, 241, 0.08)', delay: 0 },
          { x: '70%', y: '20%', size: 500, color: 'rgba(139, 92, 246, 0.06)', delay: 2 },
          { x: '50%', y: '70%', size: 700, color: 'rgba(59, 130, 246, 0.07)', delay: 4 },
          { x: '80%', y: '60%', size: 400, color: 'rgba(168, 85, 247, 0.05)', delay: 6 },
        ].map((cloud, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: cloud.x,
              top: cloud.y,
              width: cloud.size,
              height: cloud.size,
              background: `radial-gradient(circle, ${cloud.color} 0%, transparent 70%)`,
              filter: 'blur(40px)',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: cloud.delay,
            }}
          />
        ))}
      </motion.div>
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
    </div>
  );
}

function DemoMessage({ type, children, visible }: { type: 'user' | 'buddy'; children: React.ReactNode; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={cn(
            'px-4 py-2.5 rounded-2xl max-w-[85%] text-sm',
            type === 'user'
              ? 'ml-auto bg-sapphire-500 text-white rounded-br-sm'
              : 'bg-muted text-foreground rounded-bl-sm'
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ThinkingIndicator({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2 text-muted-foreground text-sm"
        >
          <motion.div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 bg-sapphire-400 rounded-full"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </motion.div>
          <span>Finding your jam...</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BuddyShowcase() {
  const demo = useBuddyDemo();
  const reducedMotion = useReducedMotion();
  const { state, typedText, response1, response2, skip } = demo;

  const isTyping = state === 'typing';
  const showUserMessage = ['submitted', 'thinking_1', 'response_1', 'thinking_2', 'response_2', 'cta', 'complete'].includes(state);
  const showThinking1 = state === 'thinking_1';
  const showResponse1 = ['response_1', 'thinking_2', 'response_2', 'cta', 'complete'].includes(state);
  const showThinking2 = state === 'thinking_2';
  const showResponse2 = ['response_2', 'cta', 'complete'].includes(state);
  const showCta = state === 'cta' || state === 'complete';

  return (
    <motion.div
      variants={reducedMotion ? {} : BUDDY_FIRST_LOAD_VARIANTS}
      initial="closed"
      animate="open"
      className="relative w-full max-w-md mx-auto"
    >
      {/* Glow effect */}
      {!reducedMotion && (
        <motion.div
          variants={BUDDY_GLOW_VARIANTS}
          initial="hidden"
          animate="visible"
          className="absolute -inset-4 bg-sapphire-500/20 rounded-3xl blur-2xl"
        />
      )}

      {/* Panel */}
      <div className="relative bg-card/90 backdrop-blur-xl border border-sapphire-500/20 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-sapphire-500/10 bg-sapphire-500/5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sapphire-400" />
            <span className="font-medium text-sm">Buddy</span>
          </div>
          {state !== 'complete' && state !== 'idle' && (
            <button
              onClick={skip}
              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Skip demo"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="p-4 space-y-3 min-h-[180px]">
          {/* Typing indicator in input */}
          {isTyping && (
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-sapphire-500/10">
              <span className="text-sm text-muted-foreground">{typedText}</span>
              <motion.span
                className="w-0.5 h-4 bg-sapphire-400"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            </div>
          )}

          {/* User message */}
          <DemoMessage type="user" visible={showUserMessage}>
            {demo.currentSong.query}
          </DemoMessage>

          {/* Thinking 1 */}
          <ThinkingIndicator visible={showThinking1} />

          {/* Response 1 */}
          <DemoMessage type="buddy" visible={showResponse1}>
            {response1}
          </DemoMessage>

          {/* Thinking 2 */}
          <ThinkingIndicator visible={showThinking2} />

          {/* Response 2 */}
          <DemoMessage type="buddy" visible={showResponse2}>
            {response2}
          </DemoMessage>
        </div>

        {/* CTA */}
        <AnimatePresence>
          {showCta && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 pt-0"
            >
              <Link href={pageRoutes.songs}>
                <Button className="w-full group" size="lg">
                  Start Exploring
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function Capabilities({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.8 }}
      className="grid grid-cols-2 gap-3 sm:gap-4 max-w-lg mx-auto mt-8"
    >
      {BUDDY_CAPABILITIES.map((cap, i) => (
        <motion.div
          key={cap.title}
          initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7 + i * 0.1 }}
          className="p-3 sm:p-4 rounded-xl bg-card/50 border border-sapphire-500/10 hover:border-sapphire-500/30 transition-colors"
        >
          <span className="text-xl sm:text-2xl">{cap.icon}</span>
          <h3 className="font-medium text-sm mt-2">{cap.title}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{cap.desc}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function LandingPage() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col">
      <NebulaBackground reducedMotion={reducedMotion} />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        {/* Hero Text */}
        <div className="text-center mb-8">
          <motion.h1
            custom={0.2}
            variants={reducedMotion ? {} : HERO_TEXT_VARIANTS}
            initial="hidden"
            animate="visible"
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight"
          >
            Meet{' '}
            <motion.span
              custom={0.4}
              variants={reducedMotion ? {} : HERO_TEXT_VARIANTS}
              initial="hidden"
              animate="visible"
              className="text-sapphire-400"
            >
              Buddy
            </motion.span>
          </motion.h1>
          <motion.p
            custom={0.6}
            variants={reducedMotion ? {} : HERO_TEXT_VARIANTS}
            initial="hidden"
            animate="visible"
            className="text-muted-foreground mt-3 text-sm sm:text-base max-w-md mx-auto"
          >
            Your AI music companion. Find songs, learn theory, and level up your playing.
          </motion.p>
        </div>

        {/* Buddy Demo */}
        <BuddyShowcase />

        {/* Capabilities Grid */}
        <Capabilities reducedMotion={reducedMotion} />
      </div>
    </div>
  );
}
