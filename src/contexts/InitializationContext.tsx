'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface InitializationContextType {
  isInitializationComplete: boolean;
  markInitializationComplete: () => void;
}

const InitializationContext = createContext<InitializationContextType | undefined>(undefined);

export function InitializationProvider({ children }: { children: React.ReactNode }) {
  const [isInitializationComplete, setIsInitializationComplete] = useState(false);

  const markInitializationComplete = useCallback(() => {
    setIsInitializationComplete(true);
  }, []);

  return (
    <InitializationContext.Provider value={{ isInitializationComplete, markInitializationComplete }}>
      {children}
    </InitializationContext.Provider>
  );
}

export function useInitialization() {
  const context = useContext(InitializationContext);
  if (!context) {
    throw new Error('useInitialization must be used within InitializationProvider');
  }
  return context;
}
