'use client';

import { createContext, useContext } from 'react';

/**
 * ErrorPageContext
 * 
 * Used to signal that we're currently rendering an error page (404, error boundary, etc.)
 * This prevents verification enforcers from redirecting away from error pages
 */
interface ErrorPageContextType {
  isErrorPage: boolean;
}

const ErrorPageContext = createContext<ErrorPageContextType>({ isErrorPage: false });

export function ErrorPageProvider({ children, isErrorPage = false }: { children: React.ReactNode; isErrorPage?: boolean }) {
  return (
    <ErrorPageContext.Provider value={{ isErrorPage }}>
      {children}
    </ErrorPageContext.Provider>
  );
}

export function useErrorPageContext() {
  return useContext(ErrorPageContext);
}
