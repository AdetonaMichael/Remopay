'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Home, RotateCw } from 'lucide-react';
import { ErrorPageProvider } from '@/contexts/ErrorPageContext';

function ErrorContent({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  // Detect connection errors and redirect to offline page
  useEffect(() => {
    const isConnectionError = 
      error?.message?.includes('Connection failed') ||
      error?.message?.includes('connection') ||
      error?.message?.includes('Network') ||
      error?.message?.includes('Failed to fetch');

    if (isConnectionError) {
      router.push('/offline');
    }
  }, [error, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-md w-full">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl opacity-50 animate-pulse" />
            <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-red-500/50 shadow-2xl shadow-red-500/20">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Oops! Something Went Wrong
          </h1>
          
          <p className="text-slate-300 text-base leading-relaxed">
            We encountered an unexpected error while processing your request. Our team has been notified.
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-left">
              <p className="text-xs font-semibold text-red-300 mb-2">Error Details:</p>
              <p className="text-xs font-mono text-slate-300 break-all mb-2">{error.message}</p>
              {error.digest && (
                <p className="text-xs text-slate-400">
                  <span className="text-slate-500 font-medium">Digest:</span> {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Helpful Info */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm font-semibold text-blue-300 mb-3">What you can try:</p>
            <ul className="text-sm text-slate-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span>Refresh the page</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span>Clear your browser cache</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span>Try again in a few moments</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => reset()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-semibold transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50"
          >
            <RotateCw className="h-5 w-5" />
            Try Again
          </button>
          
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/';
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
          >
            <Home className="h-5 w-5" />
            Home
          </button>
        </div>

        {/* Support Link */}
        <p className="text-center text-xs text-slate-400 mt-8">
          Experiencing persistent issues?{' '}
          <a 
            href="mailto:support@remopay.com" 
            className="text-red-400 font-semibold hover:text-red-300 transition-colors"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPageProvider isErrorPage={true}>
      <ErrorContent error={error} reset={reset} />
    </ErrorPageProvider>
  );
}
