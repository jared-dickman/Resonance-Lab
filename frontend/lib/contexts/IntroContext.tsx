'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface IntroContextType {
  introComplete: boolean;
  setIntroComplete: (complete: boolean) => void;
}

const IntroContext = createContext<IntroContextType | null>(null);

export function IntroProvider({ children }: { children: ReactNode }) {
  const [introComplete, setIntroCompleteState] = useState(false);

  const setIntroComplete = useCallback((complete: boolean) => {
    setIntroCompleteState(complete);
  }, []);

  return (
    <IntroContext.Provider value={{ introComplete, setIntroComplete }}>
      {children}
    </IntroContext.Provider>
  );
}

export function useIntro() {
  const context = useContext(IntroContext);
  if (!context) {
    throw new Error('useIntro must be used within IntroProvider');
  }
  return context;
}