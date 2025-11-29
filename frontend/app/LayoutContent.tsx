'use client';

import { useEffect, useRef, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { initializeApp } from '@/lib/init';

import { Button } from '@/components/ui/button';
import { pageRoutes } from '@/lib/routes';

import { BuddyProvider, useBuddy } from '@/lib/contexts/BuddyContext';
import { IntroProvider, useIntro } from '@/lib/contexts/IntroContext';
import { CoreAgentBuddy } from '@/components/agent/CoreAgentBuddy';

// Context to share header logo ref with CinematicIntro
const HeaderLogoRefContext = createContext<React.RefObject<HTMLHeadingElement | null> | null>(null);
export const useHeaderLogoRef = () => useContext(HeaderLogoRefContext);

function LayoutInner({ children, headerLogoRef }: { children: React.ReactNode; headerLogoRef: React.RefObject<HTMLHeadingElement | null> }) {
  const pathname = usePathname();
  const { isOpen, toggleBuddy } = useBuddy();
  const { introComplete } = useIntro();

  const isLandingPage = pathname === '/';
  const isSongwriterPage = pathname === '/songwriter';
  const showIntro = isLandingPage && !introComplete;

  useEffect(() => {
    initializeApp();
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Unified header - logo, breadcrumbs, buddy toggle in single row */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between h-12 w-full pl-2 pr-4">
            {/* Logo + Breadcrumbs inline */}
            <div className="flex items-center min-w-0">
              <Link
                href={pageRoutes.home}
                className="flex items-center shrink-0 transition-opacity hover:opacity-80"
              >
                <h1
                  ref={headerLogoRef}
                  className={`text-xl font-bold tracking-tight logo-gradient transition-opacity duration-200 ${showIntro ? 'opacity-0' : 'opacity-100'}`}
                >
                  Jamium
                </h1>
              </Link>
              {!isLandingPage && <Breadcrumbs />}
            </div>
            {/* Buddy toggle - hidden on landing page where onboarding takes over */}
            {!isLandingPage && (
              <Button
                variant="outline"
                size="sm"
                className="font-medium h-8 gap-2 shrink-0 relative overflow-hidden border-accent/50 hover:border-accent"
                onClick={toggleBuddy}
              >
                {/* Animated gradient fill - sweeps right-to-left on open, follows Buddy out on close */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-[length:200%_100%]"
                  initial={false}
                  animate={{
                    clipPath: isOpen ? 'inset(0 0 0 0)' : 'inset(0 0 0 100%)',
                    backgroundPosition: isOpen ? '100% 0' : '0% 0',
                  }}
                  transition={{
                    clipPath: isOpen
                      ? { type: 'spring', stiffness: 180, damping: 20 }  // Open: slow reveal (matches panel)
                      : { type: 'spring', stiffness: 450, damping: 32 }, // Close: fast snap (matches panel)
                    backgroundPosition: { duration: 0.4, ease: 'easeOut' },
                  }}
                />
                <Bot className={`h-4 w-4 relative z-10 transition-colors duration-300 ${isOpen ? 'text-white' : ''}`} />
                <span className={`hidden sm:inline relative z-10 transition-colors duration-300 ${isOpen ? 'text-white' : ''}`}>Buddy</span>
              </Button>
            )}
          </div>
        </header>
        <main className={isSongwriterPage ? "w-full flex-1" : "w-full px-2 pt-2 flex-1"}>
          {children}
        </main>
      </div>

      {/* Core Agent Buddy - hidden on landing page where onboarding owns it */}
      {!isLandingPage && <CoreAgentBuddy />}
    </div>
  );
}

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const headerLogoRef = useRef<HTMLHeadingElement | null>(null);

  return (
    <IntroProvider>
      <BuddyProvider>
        <HeaderLogoRefContext.Provider value={headerLogoRef}>
          <LayoutInner headerLogoRef={headerLogoRef}>{children}</LayoutInner>
        </HeaderLogoRefContext.Provider>
      </BuddyProvider>
    </IntroProvider>
  );
}
