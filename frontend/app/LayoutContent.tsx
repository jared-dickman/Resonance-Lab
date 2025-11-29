'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { initializeApp } from '@/lib/init';

import { Button } from '@/components/ui/button';
import { pageRoutes } from '@/lib/routes';

import { BuddyProvider, useBuddy } from '@/lib/contexts/BuddyContext';
import { CoreAgentBuddy } from '@/components/agent/CoreAgentBuddy';

function LayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isOpen, toggleBuddy } = useBuddy();

  const isLandingPage = pathname === '/';
  const isSongwriterPage = pathname === '/songwriter';

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
                <h1 className="text-xl font-bold tracking-tight logo-gradient">
                  Jamium
                </h1>
              </Link>
              <Breadcrumbs />
            </div>
            {/* Buddy toggle - hidden on landing page where onboarding takes over */}
            {!isLandingPage && (
              <Button
                variant={isOpen ? "default" : "ghost"}
                size="sm"
                className={`font-medium h-8 gap-2 shrink-0 ${
                  isOpen
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={toggleBuddy}
              >
                <Bot className="h-4 w-4" />
                <span className="hidden sm:inline">Buddy</span>
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
  return (
    <BuddyProvider>
      <LayoutInner>{children}</LayoutInner>
    </BuddyProvider>
  );
}
